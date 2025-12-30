const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      match: [/^[0-9]{10,15}$/, 'Please provide a valid mobile number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    city: {
      type: String,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    country: {
      type: String,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },
    zipCode: {
      type: String,
      maxlength: [20, 'Zip code cannot exceed 20 characters'],
    },
    education: {
      ssc: {
        school: String,
        board: String,
        year: Number,
        gpa: Number,
      },
      hsc: {
        school: String,
        board: String,
        year: Number,
        gpa: Number,
      },
      bsc: {
        university: String,
        degree: String,
        year: Number,
        cgpa: Number,
      },
      msc: {
        university: String,
        degree: String,
        year: Number,
        cgpa: Number,
      },
      ielts: {
        overall: Number,
        listening: Number,
        reading: Number,
        writing: Number,
        speaking: Number,
        testDate: Date,
      },
      toefl: {
        total: Number,
        testDate: Date,
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

