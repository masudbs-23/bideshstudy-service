const Application = require('../models/Application');
const Institution = require('../models/Institution');
const { STATUS_CODE, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/statusCode');
const { sendEmail } = require('../config/email');

/**
 * Apply to institution
 */
exports.apply = async (req, res, next) => {
  try {
    const { institutionId, courseName, intakeDate, documents, notes } = req.body;

    // Check if institution exists
    const institution = await Institution.findById(institutionId);
    if (!institution || !institution.isActive) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.INSTITUTION_NOT_FOUND,
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      student: req.user._id,
      institution: institutionId,
    });

    if (existingApplication) {
      return res.status(STATUS_CODE.CONFLICT).json({
        success: false,
        message: ERROR_MESSAGES.APPLICATION_ALREADY_EXISTS,
      });
    }

    // Create application
    const application = await Application.create({
      student: req.user._id,
      institution: institutionId,
      courseName,
      intakeDate,
      documents: documents || [],
      notes,
      statusHistory: [
        {
          status: 'pending',
          updatedBy: req.user._id,
        },
      ],
    });

    await application.populate('institution', 'name country city');

    res.status(STATUS_CODE.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.APPLICATION_SUBMITTED,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my applications
 */
exports.getMyApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { student: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .populate('institution', 'name country city images')
      .populate('documents', 'name type url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single application
 */
exports.getApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('institution')
      .populate('documents')
      .populate('student', 'name email mobile')
      .populate('statusHistory.updatedBy', 'name email');

    if (!application) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.APPLICATION_NOT_FOUND,
      });
    }

    // Check if user has access
    if (
      req.user.role !== 'admin' &&
      application.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN_ACCESS,
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status (Admin only)
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(id)
      .populate('student', 'name email')
      .populate('institution', 'name');

    if (!application) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.APPLICATION_NOT_FOUND,
      });
    }

    // Update status
    application.status = status;
    if (notes) {
      application.adminNotes = notes;
    }

    // Add to status history
    application.statusHistory.push({
      status,
      notes,
      updatedBy: req.user._id,
    });

    await application.save();

    // Send email notification
    try {
      await sendEmail(
        application.student.email,
        'applicationStatusUpdate',
        [status, application.institution.name, application.student.name]
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.APPLICATION_UPDATED,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications (Admin only)
 */
exports.getAllApplications = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      institutionId,
      studentId,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (institutionId) query.institution = institutionId;
    if (studentId) query.student = studentId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .populate('student', 'name email mobile')
      .populate('institution', 'name country city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

