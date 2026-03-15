import { uploadToR2 } from '../services/r2Service.js';

/**
 * POST /api/sketches/:sketchId/assets
 * Accepts multipart/form-data with optional fields:
 *   - thumbnail (PNG file)
 *   - snapshot  (JSON file)
 */
export const uploadSketchAssets = async (req, res) => {
  try {
    const { sketchId } = req.params;
    const result = {};

    if (req.files?.thumbnail) {
      const file = req.files.thumbnail;
      const key = `sketches/${sketchId}/thumbnail.png`;
      const url = await uploadToR2(key, file.data, 'image/png');
      result.thumbnailUrl = url;
    }

    if (req.files?.snapshot) {
      const file = req.files.snapshot;
      const key = `sketches/${sketchId}/snapshot.json`;
      const url = await uploadToR2(key, file.data, 'application/json');
      result.snapshotUrl = url;
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[R2] Upload failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
