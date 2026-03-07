import Sketch from '../models/Sketch.js';
import mongoose from 'mongoose';

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

export async function createSketch(req, res) {
  try {
    const { title, code, tldrawSnapshot, thumbnail, conversationHistory } = req.body;
    const userId = req.userId;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Code is required',
      });
    }

    const sketch = await Sketch.create({
      userId,
      title: title?.trim() || 'Untitled Sketch',
      code,
      tldrawSnapshot: tldrawSnapshot || null,
      thumbnail: thumbnail || null,
      conversationHistory: normalizeConversationHistory(conversationHistory),
    });

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

    const [sketches, total] = await Promise.all([
      Sketch.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title code thumbnail tldrawSnapshot createdAt updatedAt')
        .lean(),
      Sketch.countDocuments({ userId }),
    ]);

    const data = sketches.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      code: s.code,
      thumbnail: s.thumbnail,
      tldrawSnapshot: s.tldrawSnapshot,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

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

    const sketch = await Sketch.findOne({ _id: id, userId }).lean();

    if (!sketch) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Sketch not found',
      });
    }

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
    const { title, code, tldrawSnapshot, thumbnail } = req.body;
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
