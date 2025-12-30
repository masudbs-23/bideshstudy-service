const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatConversationSchema.index({ student: 1 });
chatConversationSchema.index({ admin: 1 });
chatConversationSchema.index({ lastMessageAt: -1 });
chatConversationSchema.index({ student: 1, isActive: 1 });

module.exports = mongoose.model('ChatConversation', chatConversationSchema);


