const ChatConversation = require('../models/ChatConversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { STATUS_CODE, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/statusCode');

/**
 * Get all conversations for student
 */
exports.getConversations = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'admin') {
      query.admin = req.user._id;
    }

    const conversations = await ChatConversation.find(query)
      .populate('student', 'name email profileImage')
      .populate('admin', 'name email profileImage')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .limit(50);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages for a conversation
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify conversation access
    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.CONVERSATION_NOT_FOUND,
      });
    }

    // Check access
    if (
      req.user.role === 'student' &&
      conversation.student.toString() !== req.user._id.toString()
    ) {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN_ACCESS,
      });
    }

    if (
      req.user.role === 'admin' &&
      conversation.admin &&
      conversation.admin.toString() !== req.user._id.toString()
    ) {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN_ACCESS,
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email profileImage role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: { messages: messages.reverse() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send message
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;

    let conversation;

    if (conversationId) {
      // Existing conversation
      conversation = await ChatConversation.findById(conversationId);
      if (!conversation) {
        return res.status(STATUS_CODE.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.CONVERSATION_NOT_FOUND,
        });
      }

      // Verify access
      if (
        req.user.role === 'student' &&
        conversation.student.toString() !== req.user._id.toString()
      ) {
        return res.status(STATUS_CODE.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.FORBIDDEN_ACCESS,
        });
      }
    } else {
      // New conversation (student only)
      if (req.user.role !== 'student') {
        return res.status(STATUS_CODE.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.FORBIDDEN_ACCESS,
        });
      }

      // Find or create conversation
      conversation = await ChatConversation.findOne({
        student: req.user._id,
        isActive: true,
      });

      if (!conversation) {
        conversation = await ChatConversation.create({
          student: req.user._id,
        });
      }
    }

    // Create message
    const newMessage = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      message,
    });

    await newMessage.populate('sender', 'name email profileImage role');

    // Update conversation
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageAt = new Date();
    if (req.user.role === 'admin' && !conversation.admin) {
      conversation.admin = req.user._id;
    }
    await conversation.save();

    // Emit socket event (will be handled in socket service)
    req.io?.to(conversation._id.toString()).emit('newMessage', {
      message: newMessage,
      conversation: conversation,
    });

    res.status(STATUS_CODE.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.MESSAGE_SENT,
      data: { message: newMessage, conversation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get admin conversations
 */
exports.getAdminConversations = async (req, res, next) => {
  try {
    const conversations = await ChatConversation.find({
      isActive: true,
    })
      .populate('student', 'name email profileImage')
      .populate('admin', 'name email profileImage')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

