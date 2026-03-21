import Sketch from '../models/Sketch.js';
import mongoose from 'mongoose';
import { sketchCache } from '../config/sketchCache.js';

/**
 * List public sketches (paginated, searchable, sortable)
 * GET /api/sketches/public?page=1&limit=20&q=search&tags=tag1,tag2&sort=recent|popular|trending
 */
export async function listPublicSketches(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim();
    const tagsParam = req.query.tags || '';
    const sort = req.query.sort || 'recent';

    const filter = { visibility: 'public' };

    // Search by title or tags
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $in: [q.toLowerCase()] } },
      ];
    }

    // Filter by tags (comma-separated)
    if (tagsParam) {
      const tags = tagsParam
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
      if (tags.length > 0) {
        filter.tags = { $in: tags };
      }
    }

    // For popular/trending we need aggregation (sort by array length)
    const useAggregation = sort === 'popular' || sort === 'trending';

    let sketches;
    let total;

    if (useAggregation) {
      const sortStage =
        sort === 'popular'
          ? { $sort: { likesCount: -1, createdAt: -1 } }
          : { $sort: { likesCount: -1, views: -1, createdAt: -1 } };

      const [aggResult, countResult] = await Promise.all([
        Sketch.aggregate([
          { $match: filter },
          { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
          sortStage,
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userDoc',
            },
          },
          { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
        ]),
        Sketch.countDocuments(filter),
      ]);

      sketches = aggResult.map((s) => ({
        ...s,
        userId: s.userDoc
          ? { _id: s.userDoc._id, name: s.userDoc.name, avatar: s.userDoc.avatar }
          : null,
      }));
      total = countResult;
    } else {
      const [sketchList, count] = await Promise.all([
        Sketch.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('title thumbnail tags likes views createdAt userId')
          .populate('userId', 'name avatar')
          .lean(),
        Sketch.countDocuments(filter),
      ]);
      sketches = sketchList;
      total = count;
    }

    const currentUserId = req.userId ? req.userId.toString() : null;
    const data = sketches.map((s) => {
      const authorDoc = s.userId;
      return {
        id: s._id.toString(),
        title: s.title,
        thumbnail: s.thumbnail,
        tags: s.tags || [],
        likesCount: s.likesCount ?? (s.likes || []).length,
        likedByMe: currentUserId && (s.likes || []).some((id) => (id?._id || id)?.toString() === currentUserId),
        views: s.views || 0,
        createdAt: s.createdAt,
        author: authorDoc
          ? {
              id: (authorDoc._id || authorDoc).toString(),
              name: authorDoc.name,
              avatar: authorDoc.avatar,
            }
          : null,
      };
    });

    return res.json({
      success: true,
      data: {
        sketches: data,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('[PublicSketch] List error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to list public sketches',
      message: error.message,
    });
  }
}

/**
 * Get a single public sketch (increments view count)
 * GET /api/sketches/public/:id
 */
export async function getPublicSketch(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.userId ? req.userId.toString() : null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Invalid sketch ID',
      });
    }

    const sketch = await Sketch.findOneAndUpdate(
      { _id: id, visibility: 'public' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('userId', 'name avatar')
      .lean();

    if (!sketch) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Sketch not found or not public',
      });
    }

    return res.json({
      success: true,
      data: {
        sketch: {
          id: sketch._id.toString(),
          title: sketch.title,
          code: sketch.code,
          thumbnail: sketch.thumbnail ?? null,
          tldrawSnapshot: sketch.tldrawSnapshot ?? null,
          tags: sketch.tags || [],
          likesCount: (sketch.likes || []).length,
          likedByMe: !!currentUserId && (sketch.likes || []).some((lid) => lid && lid.toString() === currentUserId),
          views: sketch.views || 0,
          conversationHistory: (sketch.conversationHistory || []).map((h) => ({
            role: h.role,
            content: h.content,
            timestamp: h.timestamp instanceof Date ? h.timestamp.toISOString() : h.timestamp,
          })),
          createdAt: sketch.createdAt,
          updatedAt: sketch.updatedAt,
          author: sketch.userId
            ? {
                id: sketch.userId._id?.toString(),
                name: sketch.userId.name,
                avatar: sketch.userId.avatar,
              }
            : null,
        },
      },
    });
  } catch (error) {
    console.error('[PublicSketch] Get error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get sketch',
      message: error.message,
    });
  }
}

/**
 * Toggle like on a public sketch
 * POST /api/sketches/public/:id/like
 * Requires authentication
 */
export async function likePublicSketch(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId?.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Invalid sketch ID',
      });
    }

    const sketch = await Sketch.findOne({ _id: id, visibility: 'public' });

    if (!sketch) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Sketch not found or not public',
      });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const hasLiked = (sketch.likes || []).some((lid) => lid.toString() === userId);

    if (hasLiked) {
      await Sketch.updateOne({ _id: id }, { $pull: { likes: userIdObj } });
    } else {
      await Sketch.updateOne({ _id: id }, { $addToSet: { likes: userIdObj } });
    }

    const updated = await Sketch.findById(id).select('likes').lean();
    const likesCount = (updated?.likes || []).length;
    const likedByMe = !hasLiked;

    // Invalidate owner's dashboard stats cache so totalLikes updates immediately.
    if (sketch.userId) {
      sketchCache.del(`sketches:stats:${sketch.userId.toString()}`);
    }

    return res.json({
      success: true,
      data: {
        likesCount,
        likedByMe,
      },
    });
  } catch (error) {
    console.error('[PublicSketch] Like error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update like',
      message: error.message,
    });
  }
}

/**
 * Fork a public sketch (create a copy for the current user)
 * POST /api/sketches/public/:id/fork
 * Requires authentication
 */
export async function forkPublicSketch(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Invalid sketch ID',
      });
    }

    const source = await Sketch.findOne({ _id: id, visibility: 'public' }).lean();

    if (!source) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Sketch not found or not public',
      });
    }

    const sourceOwnerId = (source.userId && typeof source.userId === 'object' && source.userId.toString)
      ? source.userId.toString()
      : (source.userId || '').toString();
    if (sourceOwnerId && userId.toString() === sourceOwnerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot fork own sketch',
        message: 'This is your own design. Open it from My Sketches instead.',
      });
    }

    const sourceTags = source.tags && source.tags.length > 0 ? source.tags : ['ui', 'design'];
    const fork = await Sketch.create({
      userId,
      title: `${source.title} (copy)`,
      code: source.code,
      tldrawSnapshot: source.tldrawSnapshot ?? null,
      thumbnail: source.thumbnail ?? null,
      conversationHistory: source.conversationHistory || [],
      visibility: 'private',
      tags: sourceTags,
    });

    return res.status(201).json({
      success: true,
      data: {
        sketch: {
          id: fork._id.toString(),
          title: fork.title,
          code: fork.code,
          tldrawSnapshot: fork.tldrawSnapshot ?? null,
          thumbnail: fork.thumbnail ?? null,
          conversationHistory: (fork.conversationHistory || []).map((h) => ({
            role: h.role,
            content: h.content,
            timestamp: h.timestamp instanceof Date ? h.timestamp.toISOString() : h.timestamp,
          })),
          createdAt: fork.createdAt,
          updatedAt: fork.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('[PublicSketch] Fork error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fork sketch',
      message: error.message,
    });
  }
}
