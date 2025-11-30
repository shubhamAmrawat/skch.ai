import express from 'express';
import { uploadAvatar, removeAvatar } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadAvatar as uploadMiddleware } from '../config/cloudinary.js';

const router = express.Router();

// Wrapper to handle multer upload with proper error catching
const handleUpload = (req, res, next) => {
  uploadMiddleware.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('[Upload] Multer error:', err);

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large',
          message: 'Image must be less than 5MB.',
        });
      }

      if (err.message) {
        return res.status(400).json({
          success: false,
          error: 'Upload error',
          message: err.message,
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Upload failed',
        message: 'An error occurred during upload.',
      });
    }
    next();
  });
};

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post(
  '/avatar',
  authenticate,
  handleUpload,
  uploadAvatar
);

/**
 * @route   DELETE /api/upload/avatar
 * @desc    Remove user avatar
 * @access  Private
 */
router.delete('/avatar', authenticate, removeAvatar);

export default router;

