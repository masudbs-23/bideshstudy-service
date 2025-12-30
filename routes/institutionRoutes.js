const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { validate, createInstitutionSchema, updateInstitutionSchema } = require('../utils/validators');

// Public routes
router.get('/', optionalAuth, institutionController.getInstitutions);
router.get('/search', optionalAuth, institutionController.searchInstitutions);
router.get('/:id', optionalAuth, institutionController.getInstitution);

// Admin routes
router.post('/', authenticate, authorizeAdmin, validate(createInstitutionSchema), institutionController.createInstitution);
router.put('/:id', authenticate, authorizeAdmin, validate(updateInstitutionSchema), institutionController.updateInstitution);
router.delete('/:id', authenticate, authorizeAdmin, institutionController.deleteInstitution);

module.exports = router;


