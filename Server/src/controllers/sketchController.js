import { sketchCache, sketchListKey, sketchKey } from '../config/sketchCache.js';
import Sketch from '../models/Sketch.js';
import mongoose from 'mongoose';


// Invalidate all list caches for a user + specific sketch cache
const bustSketchCache = (userId, sketchId = null) => {
  // Delete all paginated list entries for this user
  const keys = sketchCache.keys();
  const userListKeys = keys.filter(k => k.startsWith(`sketches:list:${userId}`));
  userListKeys.forEach(k => sketchCache.del(k));
  
  // Delete specific sketch if provided
  if (sketchId) {
    sketchCache.del(sketchKey(userId, sketchId.toString()));
  }
  
  console.log(`[Sketch] Cache busted for user ${userId}, keys removed: ${userListKeys.length + (sketchId ? 1 : 0)}`);
};

/**
 * Create a new sketch
 * POST /api/sketches
 */
function normalizeConversationHistory(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
    .map((h) => ({
      role: h.role,
      content: String(h.content),
      timestamp: h.timestamp ? new Date(h.timestamp) : new Date(),
    }));
}

function normalizeTags(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((t) => t && typeof t === 'string')
    .map((t) => String(t).trim().toLowerCase())
    .filter((t) => t.length > 0);
}

export async function createSketch(req, res) {
  try {
    const { title, code, tldrawSnapshot, thumbnail, conversationHistory, visibility, tags } = req.body;
    const userId = req.userId;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Code is required',
      });
    }

    const tagsArr = normalizeTags(tags);
    if (tagsArr.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'At least one tag is required',
      });
    }

    const sketch = await Sketch.create({
      userId,
      title: title?.trim() || 'Untitled Sketch',
      code,
      tldrawSnapshot: tldrawSnapshot || null,
      thumbnail: thumbnail || null,
      conversationHistory: normalizeConversationHistory(conversationHistory),
      visibility: visibility === 'public' ? 'public' : 'private',
      tags: tagsArr,
    });
// new sketch → invalidate list
    bustSketchCache(userId);
    return res.status(201).json({
      success: true,
      data: {
        sketch: {
          id: sketch._id.toString(),
          title: sketch.title,
          code: sketch.code,
          tldrawSnapshot: sketch.tldrawSnapshot ?? null,
          thumbnail: sketch.thumbnail ?? null,
          conversationHistory: (sketch.conversationHistory || []).map((h) => ({
            role: h.role,
            content: h.content,
            timestamp: h.timestamp instanceof Date ? h.timestamp.toISOString() : h.timestamp,
          })),
          createdAt: sketch.createdAt,
          updatedAt: sketch.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('[Sketch] Create error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create sketch',
      message: error.message,
    });
  }
}

/**
 * List user's sketches (paginated)
 * GET /api/sketches?page=1&limit=20
 */
export async function listSketches(req, res) {
  try {
    const userId = req.userId;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    // Cache key includes page+limit so different pages are cached separately
    const cacheKey = `${sketchListKey(userId)}:page${page}:limit${limit}`;
    
    // Check cache first
    const cached = sketchCache.get(cacheKey);
    if (cached) {
      console.log(`[Sketch] Cache hit — list for user ${userId} page ${page}`);
      return res.json(cached);
    }

    console.log(`[Sketch] Cache miss — fetching list for user ${userId} from DB`);

    const [sketches, total] = await Promise.all([
      Sketch.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title code thumbnail tldrawSnapshot createdAt updatedAt')
        .lean(),
      Sketch.countDocuments({ userId }),
    ]);

    const response = {
      success: true,
      data: {
        sketches: sketches.map((s) => ({
          id: s._id.toString(),
          title: s.title,
          code: s.code,
          thumbnail: s.thumbnail,
          tldrawSnapshot: s.tldrawSnapshot,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        })),
        total,
        page,
        limit,
      },
    };

    // Store in cache
    sketchCache.set(cacheKey, response);

    return res.json(response);
  } catch (error) {
    console.error('[Sketch] List error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to list sketches',
      message: error.message,
    });
  }
}
/**
 * Get a single sketch
 * GET /api/sketches/:id
 */
export async function getSketch(req, res) {
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

    // Check cache
    const cacheKey = sketchKey(userId,id);
    const cached = sketchCache.get(cacheKey);
    if (cached) {
      console.log(`[Sketch] Cache hit — single sketch ${id}`);
      return res.json(cached);
    }

    console.log(`[Sketch] Cache miss — fetching sketch ${id} from DB`);

    const sketch = await Sketch.findOne({ _id: id, userId }).lean();
    if (!sketch) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Sketch not found',
      });
    }

    const response = {
      success: true,
      data: {
        sketch: {
          id: sketch._id.toString(),
          title: sketch.title,
          code: sketch.code,
          tldrawSnapshot: sketch.tldrawSnapshot ?? null,
          thumbnail: sketch.thumbnail ?? null,
          visibility: sketch.visibility || 'private',
          tags: sketch.tags || [],
          conversationHistory: (sketch.conversationHistory || []).map((h) => ({
            role: h.role,
            content: h.content,
            timestamp: h.timestamp instanceof Date ? h.timestamp.toISOString() : h.timestamp,
          })),
          createdAt: sketch.createdAt,
          updatedAt: sketch.updatedAt,
        },
      },
    };

    sketchCache.set(cacheKey, response);
    return res.json(response);
  } catch (error) {
    console.error('[Sketch] Get error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get sketch',
      message: error.message,
    });
  }
}

/**
 * Update a sketch
 * PUT /api/sketches/:id
 */
export async function updateSketch(req, res) {
  try {
    const { id } = req.params;
    const { title, code, tldrawSnapshot, thumbnail, conversationHistory, visibility, tags } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Invalid sketch ID',
      });
    }

    const update = {};
    if (title !== undefined) update.title = title?.trim() || 'Untitled Sketch';
    if (code !== undefined) update.code = code;
    if (tldrawSnapshot !== undefined) update.tldrawSnapshot = tldrawSnapshot;
    if (thumbnail !== undefined) update.thumbnail = thumbnail;
    if (conversationHistory !== undefined) update.conversationHistory = normalizeConversationHistory(conversationHistory);
    if (visibility !== undefined) update.visibility = visibility === 'public' ? 'public' : 'private';
    if (tags !== undefined) {
      const tagsArr = normalizeTags(tags);
      if (tagsArr.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'At least one tag is required',
        });
      }
      update.tags = tagsArr;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Provide at least one field to update (title or code)',
      });
    }

    const sketch = await Sketch.findOneAndUpdate(
      { _id: id, userId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!sketch) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Sketch not found',
      });
    }
    bustSketchCache(userId, id);
    return res.json({
      success: true,
      data: {
        sketch: {
          id: sketch._id.toString(),
          title: sketch.title,
          code: sketch.code,
          tldrawSnapshot: sketch.tldrawSnapshot ?? null,
          thumbnail: sketch.thumbnail ?? null,
          conversationHistory: (sketch.conversationHistory || []).map((h) => ({
            role: h.role,
            content: h.content,
            timestamp: h.timestamp instanceof Date ? h.timestamp.toISOString() : h.timestamp,
          })),
          createdAt: sketch.createdAt,
          updatedAt: sketch.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('[Sketch] Update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update sketch',
      message: error.message,
    });
  }
}

/**
 * Delete a sketch
 * DELETE /api/sketches/:id
 */
export async function deleteSketch(req, res) {
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

    const result = await Sketch.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Sketch not found',
      });
    }
    bustSketchCache(userId, id);
    return res.json({
      success: true,
      message: 'Sketch deleted',
    });
  } catch (error) {
    console.error('[Sketch] Delete error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete sketch',
      message: error.message,
    });
  }
}

/**
 * Get sketch snapshot (proxies R2 fetch to avoid CORS)
 * GET /api/sketches/:sketchId/snapshot
 */
export async function getSketchSnapshot(req, res) {
  try {
    const { sketchId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(sketchId)) {
      return res.status(400).json({ error: 'Invalid sketch ID' });
    }

    const sketch = await Sketch.findOne({ _id: sketchId, userId });
    if (!sketch) return res.status(404).json({ error: 'Sketch not found' });

    const snapshotUrl = sketch.tldrawSnapshot;
    if (!snapshotUrl) return res.status(404).json({ error: 'No snapshot found' });

    if (snapshotUrl.startsWith('http')) {
      const r2Response = await fetch(snapshotUrl);
      if (!r2Response.ok) throw new Error(`R2 fetch failed: ${r2Response.status}`);
      const json = await r2Response.json();
      return res.json(json);
    }

    return res.json(JSON.parse(snapshotUrl));
  } catch (err) {
    console.error('[Sketch] getSnapshot failed:', err);
    res.status(500).json({ error: err.message });
  }
}
