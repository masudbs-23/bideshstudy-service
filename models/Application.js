const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution is required'],
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
    },
    intakeDate: {
      type: String,
      required: [true, 'Intake date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'accepted', 'rejected'],
      default: 'pending',
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    adminNotes: {
      type: String,
      maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'under_review', 'accepted', 'rejected'],
        },
        notes: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
applicationSchema.index({ student: 1 });
applicationSchema.index({ institution: 1 });
applicationSchema.index({ status: 1 });
// Prevent duplicate applications
applicationSchema.index({ student: 1, institution: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

