const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorizeAdmin, authorizeStudent } = require('../middleware/auth');
const { validate, createApplicationSchema, updateApplicationStatusSchema } = require('../utils/validators');

// Student routes
router.post('/apply', authenticate, authorizeStudent, validate(createApplicationSchema), applicationController.apply);
router.get('/my-applications', authenticate, authorizeStudent, applicationController.getMyApplications);
router.get('/:id', authenticate, applicationController.getApplication);

// Admin routes
router.put('/:id/status', authenticate, authorizeAdmin, validate(updateApplicationStatusSchema), applicationController.updateApplicationStatus);
router.get('/', authenticate, authorizeAdmin, applicationController.getAllApplications);

module.exports = router;

