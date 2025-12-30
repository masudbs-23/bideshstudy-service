const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validate, sendMessageSchema } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

router.get('/conversations', chatController.getConversations);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/send', validate(sendMessageSchema), chatController.sendMessage);

// Admin routes
router.get('/admin/conversations', authorizeAdmin, chatController.getAdminConversations);

module.exports = router;

