const User = require('../models/User');
const Document = require('../models/Document');
const { STATUS_CODE, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/statusCode');
const { cloudinary } = require('../config/cloudinary');

/**
 * Get student profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('documents')
      .select('-password -refreshToken');

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update student profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.isVerified;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PROFILE_UPDATED,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload document
 */
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const { type, name, description } = req.body;

    if (!type || !name) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      });
    }

    // Create document record
    const document = await Document.create({
      user: req.user._id,
      type,
      name,
      url: req.file.path,
      cloudinaryId: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
      description,
    });

    // If it's a profile image, update user profile
    if (type === 'profile_image') {
      await User.findByIdAndUpdate(req.user._id, {
        profileImage: req.file.path,
      });
    }

    res.status(STATUS_CODE.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.DOCUMENT_UPLOADED,
      data: { document },
    });
  } catch (error) {
    // Delete uploaded file if document creation fails
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
      }
    }
    next(error);
  }
};

/**
 * Get all documents
 */
exports.getDocuments = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { user: req.user._id };
    if (type) {
      query.type = type;
    }

    const documents = await Document.find(query).sort({ createdAt: -1 });

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: { documents },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 */
exports.deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.DOCUMENT_NOT_FOUND,
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(document.cloudinaryId);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
    }

    // Delete from database
    await document.deleteOne();

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DOCUMENT_DELETED,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update education details
 */
exports.updateEducation = async (req, res, next) => {
  try {
    const { education } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { education },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PROFILE_UPDATED,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};


