const Event = require('../models/Event');
const EventBooking = require('../models/EventBooking');
const { STATUS_CODE, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/statusCode');

/**
 * Get all events
 */
exports.getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      date,
      location,
      search,
    } = req.query;

    const query = { isActive: true };

    // Filter by date (upcoming events)
    if (date === 'upcoming') {
      query.date = { $gte: new Date() };
    } else if (date) {
      query.date = new Date(date);
    }

    // Filter by location
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-createdBy');

    const total = await Event.countDocuments(query);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        events,
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
 * Get single event
 */
exports.getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).select('-createdBy');

    if (!event || !event.isActive) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.EVENT_NOT_FOUND,
      });
    }

    // Get booking count
    const bookingCount = await EventBooking.countDocuments({
      event: id,
      status: 'confirmed',
    });

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        event: {
          ...event.toObject(),
          bookingCount,
          isFull: event.maxParticipants ? bookingCount >= event.maxParticipants : false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create event (Admin only)
 */
exports.createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const event = await Event.create(eventData);

    res.status(STATUS_CODE.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.EVENT_CREATED,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event (Admin only)
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.EVENT_NOT_FOUND,
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.EVENT_UPDATED,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event (Admin only)
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!event) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.EVENT_NOT_FOUND,
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.EVENT_DELETED,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Book event
 */
exports.bookEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if event exists and is active
    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.EVENT_NOT_FOUND,
      });
    }

    // Check if event date has passed
    if (new Date(event.date) < new Date()) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.EVENT_EXPIRED,
      });
    }

    // Check if already booked
    const existingBooking = await EventBooking.findOne({
      event: id,
      student: req.user._id,
    });

    if (existingBooking && existingBooking.status === 'confirmed') {
      return res.status(STATUS_CODE.CONFLICT).json({
        success: false,
        message: ERROR_MESSAGES.EVENT_ALREADY_BOOKED,
      });
    }

    // Check if event is full
    if (event.maxParticipants) {
      const bookingCount = await EventBooking.countDocuments({
        event: id,
        status: 'confirmed',
      });

      if (bookingCount >= event.maxParticipants) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.EVENT_FULL,
        });
      }
    }

    // Create or update booking
    let booking;
    if (existingBooking) {
      existingBooking.status = 'confirmed';
      existingBooking.notes = notes;
      await existingBooking.save();
      booking = existingBooking;
    } else {
      booking = await EventBooking.create({
        event: id,
        student: req.user._id,
        notes,
      });
    }

    await booking.populate('event', 'title date location');

    res.status(STATUS_CODE.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.EVENT_BOOKED,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my bookings
 */
exports.getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await EventBooking.find({ student: req.user._id })
      .populate('event', 'title date location image description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EventBooking.countDocuments({ student: req.user._id });

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        bookings,
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

