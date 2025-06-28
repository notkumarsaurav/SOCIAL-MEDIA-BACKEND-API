const Joi = require("joi");

/**
 * Validation schemas for API endpoints
 */

// User registration
const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(1).max(100).required(),
});

// User login
const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// Create post
const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
  media_url: Joi.string().uri().optional(),
  comments_enabled: Joi.boolean().default(true),
});

// Update post
const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(1000).optional(),
  media_url: Joi.string().uri().optional(),
  comments_enabled: Joi.boolean().optional(),
});

// ✅ Create comment
const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});

// ✅ Update comment
const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});

/**
 * Middleware to validate request body against schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateCommentSchema,
  validateRequest,
};
