const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorizeStudent } = require('../middleware/auth');
const { validate, updateProfileSchema, updateEducationSchema } = require('../utils/validators');
const { uploadDocument, uploadImage } = require('../config/cloudinary');

// All routes require authentication
router.use(authenticate);
router.use(authorizeStudent);

router.get('/profile', studentController.getProfile);
router.put('/profile', validate(updateProfileSchema), studentController.updateProfile);
router.post('/upload-documents', uploadDocument.single('file'), studentController.uploadDocument);
router.get('/documents', studentController.getDocuments);
router.delete('/documents/:id', studentController.deleteDocument);
router.put('/update-education', validate(updateEducationSchema), studentController.updateEducation);

module.exports = router;

