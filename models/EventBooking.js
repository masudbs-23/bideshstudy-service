const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventBookingSchema.index({ event: 1 });
eventBookingSchema.index({ student: 1 });
eventBookingSchema.index({ event: 1, student: 1 }, { unique: true }); // Prevent duplicate bookings

module.exports = mongoose.model('EventBooking', eventBookingSchema);


