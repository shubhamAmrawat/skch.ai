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

    // With multer.fields(), each entry is usually an array of files.
    const thumbnailFile =
      Array.isArray(req.files?.thumbnail) ? req.files.thumbnail[0] : req.files?.thumbnail;
    const snapshotFile =
      Array.isArray(req.files?.snapshot) ? req.files.snapshot[0] : req.files?.snapshot;

    // When the client sends no files, don't report success.
    if (!thumbnailFile && !snapshotFile) {
      return res.status(400).json({
        success: false,
        error: 'No assets provided',
        message: 'Expected multipart fields: thumbnail (PNG) and/or snapshot (JSON)',
      });
    }

    if (thumbnailFile) {
      // multer.memoryStorage provides `buffer`; other upload systems may use `data`
      const buffer = thumbnailFile.buffer ?? thumbnailFile.data;
      if (!buffer) {
        throw new Error('Thumbnail file buffer missing');
      }

      const key = `sketches/${sketchId}/thumbnail.png`;
      const url = await uploadToR2(key, buffer, 'image/png');
      result.thumbnailUrl = url;
    }

    if (snapshotFile) {
      const buffer = snapshotFile.buffer ?? snapshotFile.data;
      if (!buffer) {
        throw new Error('Snapshot file buffer missing');
      }

      const key = `sketches/${sketchId}/snapshot.json`;
      const url = await uploadToR2(key, buffer, 'application/json');
      result.snapshotUrl = url;
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[R2] Upload failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
