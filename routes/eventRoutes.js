const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { validate, createEventSchema, updateEventSchema } = require('../utils/validators');

// Public routes
router.get('/', optionalAuth, eventController.getEvents);
router.get('/:id', optionalAuth, eventController.getEvent);

// Student routes
router.post('/:id/book', authenticate, eventController.bookEvent);
router.get('/my-bookings', authenticate, eventController.getMyBookings);

// Admin routes
router.post('/', authenticate, authorizeAdmin, validate(createEventSchema), eventController.createEvent);
router.put('/:id', authenticate, authorizeAdmin, validate(updateEventSchema), eventController.updateEvent);
router.delete('/:id', authenticate, authorizeAdmin, eventController.deleteEvent);

module.exports = router;

