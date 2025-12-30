const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const applicationController = require('../controllers/applicationController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/applications', applicationController.getAllApplications);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;

