const User = require('../models/User');
const Application = require('../models/Application');
const Institution = require('../models/Institution');
const Event = require('../models/Event');
const EventBooking = require('../models/EventBooking');
const ChatConversation = require('../models/ChatConversation');
const { STATUS_CODE } = require('../utils/statusCode');

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalInstitutions,
      totalEvents,
      upcomingEvents,
      totalBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'accepted' }),
      Application.countDocuments({ status: 'rejected' }),
      Institution.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true, date: { $gte: new Date() } }),
      EventBooking.countDocuments({ status: 'confirmed' }),
    ]);

    // Recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApplications = await Application.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Applications by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const applicationsByMonth = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalApplications,
          pendingApplications,
          acceptedApplications,
          rejectedApplications,
          totalInstitutions,
          totalEvents,
          upcomingEvents,
          totalBookings,
          recentApplications,
        },
        applicationsByStatus,
        applicationsByMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users
 */
exports.getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      isVerified,
    } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        users,
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
 * Update user status
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified, isActive } = req.body;

    const updateData = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    // Note: isActive field doesn't exist in User model, but can be added if needed

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: 'User status updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { ...dateFilter, role: 'student' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Application trends
    const applicationTrends = await Application.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top institutions by applications
    const topInstitutions = await Application.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$institution',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'institutions',
          localField: '_id',
          foreignField: '_id',
          as: 'institution',
        },
      },
      { $unwind: '$institution' },
      {
        $project: {
          institutionName: '$institution.name',
          country: '$institution.country',
          count: 1,
        },
      },
    ]);

    // Event booking trends
    const eventBookingTrends = await EventBooking.aggregate([
      { $match: { ...dateFilter, status: 'confirmed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        userGrowth,
        applicationTrends,
        topInstitutions,
        eventBookingTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

