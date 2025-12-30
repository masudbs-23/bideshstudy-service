const Institution = require('../models/Institution');
const { STATUS_CODE, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/statusCode');

/**
 * Get all institutions (with pagination, filtering, and search)
 */
exports.getInstitutions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      country,
      city,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { isActive: true };

    // Filter by country
    if (country) {
      query.country = new RegExp(country, 'i');
    }

    // Filter by city
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const institutions = await Institution.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-createdBy');

    const total = await Institution.countDocuments(query);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        institutions,
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
 * Get single institution by ID
 */
exports.getInstitution = async (req, res, next) => {
  try {
    const { id } = req.params;

    const institution = await Institution.findById(id).select('-createdBy');

    if (!institution || !institution.isActive) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.INSTITUTION_NOT_FOUND,
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: { institution },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create institution (Admin only)
 */
exports.createInstitution = async (req, res, next) => {
  try {
    const institutionData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const institution = await Institution.create(institutionData);

    res.status(STATUS_CODE.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.INSTITUTION_CREATED,
      data: { institution },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update institution (Admin only)
 */
exports.updateInstitution = async (req, res, next) => {
  try {
    const { id } = req.params;

    const institution = await Institution.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!institution) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.INSTITUTION_NOT_FOUND,
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.INSTITUTION_UPDATED,
      data: { institution },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete institution (Admin only)
 */
exports.deleteInstitution = async (req, res, next) => {
  try {
    const { id } = req.params;

    const institution = await Institution.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!institution) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.INSTITUTION_NOT_FOUND,
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.INSTITUTION_DELETED,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search institutions
 */
exports.searchInstitutions = async (req, res, next) => {
  try {
    const { q, country, city, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (q) {
      query.$text = { $search: q };
    }

    if (country) {
      query.country = new RegExp(country, 'i');
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const institutions = await Institution.find(query)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-createdBy');

    const total = await Institution.countDocuments(query);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        institutions,
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


