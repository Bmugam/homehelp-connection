// backend/src/middleware/validation.js
const { body, param, validationResult } = require('express-validator');

const bookingValidationRules = [
  body('providerId').isInt().withMessage('Provider ID must be an integer'),
  body('serviceId').isInt().withMessage('Service ID must be an integer'),
  body('date').isISO8601().withMessage('Invalid date format (YYYY-MM-DD)'),
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('location').notEmpty().withMessage('Location is required'),
  body('notes').optional().isString()
];

const bookingUpdateValidationRules = [
  param('id').isInt().withMessage('Booking ID must be an integer'),
  body('date').optional().isISO8601(),
  body('time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']),
  body('notes').optional().isString()
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  validateBooking: [...bookingValidationRules, validate],
  validateBookingUpdate: [...bookingUpdateValidationRules, validate]
};