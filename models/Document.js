const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: [
        'ssc_certificate',
        'hsc_certificate',
        'bsc_certificate',
        'msc_certificate',
        'passport',
        'ielts',
        'toefl',
        'profile_image',
        'other',
      ],
      required: [true, 'Document type is required'],
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      maxlength: [200, 'Document name cannot exceed 200 characters'],
    },
    url: {
      type: String,
      required: [true, 'Document URL is required'],
    },
    cloudinaryId: {
      type: String,
      required: [true, 'Cloudinary ID is required'],
    },
    size: {
      type: Number, // in bytes
    },
    mimeType: {
      type: String,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
documentSchema.index({ user: 1, type: 1 });
documentSchema.index({ user: 1 });

module.exports = mongoose.model('Document', documentSchema);

