// // // routes/uploadRoutes.js
// // const express = require('express');
// // const upload = require('../middleware/upload');
// // const router = express.Router();

// // router.post('/image', upload.single('image'), (req, res) => {
// //   try {
// //     if (!req.file) {
// //       return res.status(400).json({ error: 'No file uploaded' });
// //     }

// //     res.json({
// //       message: 'Image uploaded successfully',
// //       imageUrl: req.file.path,
// //       publicId: req.file.filename
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: 'Upload failed' });
// //   }
// // });

// // // Delete image route
// // router.delete('/image/:publicId', async (req, res) => {
// //   try {
// //     const result = await cloudinary.uploader.destroy(req.params.publicId);
// //     res.json({ message: 'Image deleted successfully', result });
// //   } catch (error) {
// //     res.status(500).json({ error: 'Delete failed' });
// //   }
// // });

// // module.exports = router;


// backend/src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Private
 */
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images to Cloudinary
 * @access  Private
 */
router.post('/images', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedImages = req.files.map(file => ({
      imageUrl: file.path,
      publicId: file.filename
    }));

    res.json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * @route   DELETE /api/upload/image/:publicId
 * @desc    Delete image from Cloudinary
 * @access  Private
 */
router.delete('/image/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully', result });
    } else {
      res.status(400).json({ error: 'Failed to delete image', result });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;