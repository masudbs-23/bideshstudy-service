const ChatConversation = require('../models/ChatConversation');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Initialize Socket.io service
 */
const initializeSocket = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || !user.isVerified) {
        return next(new Error('Authentication error'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Join user's personal room
    socket.join(`user_${socket.user._id}`);

    // Join user's conversations
    socket.on('joinConversations', async () => {
      try {
        let conversations;
        if (socket.user.role === 'student') {
          conversations = await ChatConversation.find({ student: socket.user._id });
        } else if (socket.user.role === 'admin') {
          conversations = await ChatConversation.find({
            $or: [{ admin: socket.user._id }, { admin: null }],
          });
        }

        conversations.forEach((conv) => {
          socket.join(conv._id.toString());
        });
      } catch (error) {
        console.error('Error joining conversations:', error);
      }
    });

    // Join a specific conversation
    socket.on('joinConversation', async (conversationId) => {
      try {
        const conversation = await ChatConversation.findById(conversationId);

        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        // Verify access
        if (
          socket.user.role === 'student' &&
          conversation.student.toString() !== socket.user._id.toString()
        ) {
          return socket.emit('error', { message: 'Access denied' });
        }

        socket.join(conversationId);
        socket.emit('joinedConversation', { conversationId });
      } catch (error) {
        socket.emit('error', { message: 'Error joining conversation' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('userTyping', {
        userId: socket.user._id,
        userName: socket.user.name,
        conversationId: data.conversationId,
      });
    });

    socket.on('stopTyping', (data) => {
      socket.to(data.conversationId).emit('userStoppedTyping', {
        userId: socket.user._id,
        conversationId: data.conversationId,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

module.exports = { initializeSocket };


