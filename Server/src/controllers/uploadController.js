import User from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar to Cloudinary
 * @access  Private
 */
export const uploadAvatar = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please select an image to upload.',
      });
    }

    // Get the uploaded file URL from Cloudinary
    const avatarUrl = req.file.path;

    // Update user's avatar in database
    const user = await User.findById(req.userId);

    if (!user) {
      // Delete the uploaded image if user not found
      if (req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // If user has an existing Cloudinary avatar, delete it
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        // Extract public_id from URL
        const urlParts = user.avatar.split('/');
        const folderAndFile = urlParts.slice(-2).join('/'); // e.g., "sktch-ai/avatars/avatar_123_456"
        const publicId = folderAndFile.split('.')[0]; // Remove extension
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error('[Upload] Failed to delete old avatar:', deleteError);
        // Continue anyway - not critical
      }
    }

    // Update user avatar
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: avatarUrl,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('[Upload] Avatar upload error:', error);

    // Clean up uploaded file if there was an error
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error('[Upload] Failed to cleanup file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message || 'An error occurred while uploading your avatar.',
    });
  }
};

/**
 * @route   DELETE /api/upload/avatar
 * @desc    Remove user avatar
 * @access  Private
 */
export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // If user has a Cloudinary avatar, delete it
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        const urlParts = user.avatar.split('/');
        const folderAndFile = urlParts.slice(-2).join('/');
        const publicId = folderAndFile.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error('[Upload] Failed to delete avatar from Cloudinary:', deleteError);
      }
    }

    // Clear avatar from user
    user.avatar = null;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar removed successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: null,
        },
      },
    });
  } catch (error) {
    console.error('[Upload] Remove avatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Remove failed',
      message: 'An error occurred while removing your avatar.',
    });
  }
};

