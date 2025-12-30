const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: [200, 'Institution name cannot exceed 200 characters'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    courses: [
      {
        name: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        fees: {
          type: Number,
          required: true,
        },
        intakeDates: [
          {
            type: String,
            required: true,
          },
        ],
        requirements: {
          type: String,
        },
      },
    ],
    website: {
      type: String,
    },
    contactEmail: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    contactPhone: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
institutionSchema.index({ name: 1 });
institutionSchema.index({ country: 1 });
institutionSchema.index({ city: 1 });
institutionSchema.index({ isActive: 1 });
institutionSchema.index({ name: 'text', description: 'text', country: 'text' }); // Text search

module.exports = mongoose.model('Institution', institutionSchema);

