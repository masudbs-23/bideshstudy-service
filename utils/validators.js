const Joi = require('joi');

/**
 * Validation schemas using Joi
 */

// Auth validators
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('student', 'admin').default('student'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  password: Joi.string().min(8).required(),
});

// Student profile validators
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  mobile: Joi.string().pattern(/^[0-9]{10,15}$/),
  dateOfBirth: Joi.date(),
  address: Joi.string().max(500),
  city: Joi.string().max(100),
  country: Joi.string().max(100),
  zipCode: Joi.string().max(20),
});

const updateEducationSchema = Joi.object({
  education: Joi.object({
    ssc: Joi.object({
      school: Joi.string(),
      board: Joi.string(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
      gpa: Joi.number().min(0).max(5),
    }),
    hsc: Joi.object({
      school: Joi.string(),
      board: Joi.string(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
      gpa: Joi.number().min(0).max(5),
    }),
    bsc: Joi.object({
      university: Joi.string(),
      degree: Joi.string(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
      cgpa: Joi.number().min(0).max(4),
    }),
    msc: Joi.object({
      university: Joi.string(),
      degree: Joi.string(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
      cgpa: Joi.number().min(0).max(4),
    }),
    ielts: Joi.object({
      overall: Joi.number().min(0).max(9),
      listening: Joi.number().min(0).max(9),
      reading: Joi.number().min(0).max(9),
      writing: Joi.number().min(0).max(9),
      speaking: Joi.number().min(0).max(9),
      testDate: Joi.date(),
    }),
    toefl: Joi.object({
      total: Joi.number().min(0).max(120),
      testDate: Joi.date(),
    }),
  }),
});

// Institution validators
const createInstitutionSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().required(),
  country: Joi.string().required(),
  city: Joi.string().required(),
  courses: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      duration: Joi.string().required(),
      fees: Joi.number().required(),
      intakeDates: Joi.array().items(Joi.string()).required(),
      requirements: Joi.string(),
    })
  ).required(),
  images: Joi.array().items(Joi.string()),
  website: Joi.string().uri(),
  contactEmail: Joi.string().email(),
  contactPhone: Joi.string(),
});

const updateInstitutionSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string(),
  country: Joi.string(),
  city: Joi.string(),
  courses: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      duration: Joi.string(),
      fees: Joi.number(),
      intakeDates: Joi.array().items(Joi.string()),
      requirements: Joi.string(),
    })
  ),
  images: Joi.array().items(Joi.string()),
  website: Joi.string().uri(),
  contactEmail: Joi.string().email(),
  contactPhone: Joi.string(),
});

// Application validators
const createApplicationSchema = Joi.object({
  institutionId: Joi.string().required(),
  courseName: Joi.string().required(),
  intakeDate: Joi.string().required(),
  documents: Joi.array().items(Joi.string()),
  notes: Joi.string().max(1000),
});

const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'under_review', 'accepted', 'rejected').required(),
  notes: Joi.string().max(1000),
});

// Event validators
const createEventSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().required(),
  date: Joi.date().required(),
  location: Joi.string().required(),
  image: Joi.string(),
  maxParticipants: Joi.number().integer().min(1),
});

const updateEventSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string(),
  date: Joi.date(),
  location: Joi.string(),
  image: Joi.string(),
  maxParticipants: Joi.number().integer().min(1),
});

// Chat validators
const sendMessageSchema = Joi.object({
  conversationId: Joi.string(),
  message: Joi.string().min(1).max(5000).required(),
});

/**
 * Validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  updateEducationSchema,
  createInstitutionSchema,
  updateInstitutionSchema,
  createApplicationSchema,
  updateApplicationStatusSchema,
  createEventSchema,
  updateEventSchema,
  sendMessageSchema,
  validate,
};


