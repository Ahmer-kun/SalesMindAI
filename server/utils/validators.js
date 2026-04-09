/**
 * - Stricter password rules
 * - Email domain sanity check
 * - Strip unknown fields from all inputs
 * - Prevent excessively long field values used in DoS attempts
 */

const Joi = require("joi");

// Signup
const signupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/)      // only letters, spaces, hyphens, apostrophes
    .required()
    .messages({
      "string.min":     "Name must be at least 2 characters",
      "string.max":     "Name cannot exceed 100 characters",
      "string.pattern.base": "Name can only contain letters, spaces, hyphens and apostrophes",
      "any.required":   "Name is required",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } }) // don't validate TLD list — too restrictive
    .lowercase()
    .max(254)                          // RFC 5321 max email length
    .required()
    .messages({
      "string.email":   "Please provide a valid email address",
      "any.required":   "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min":          "Password must be at least 8 characters",
      "string.max":          "Password is too long",
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required":        "Password is required",
    }),
}).options({ stripUnknown: true }); // silently drop extra fields

// Login
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .max(254)
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .max(128)        // prevent huge strings slowing down bcrypt
    .required()
    .messages({
      "string.max":  "Invalid credentials",
      "any.required": "Password is required",
    }),
}).options({ stripUnknown: true });

// Middleware factory to validate request bodies against a Joi schema
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ success: false, message: messages });
  }

  req.body = value; // replace with sanitized + stripped version
  next();
};

module.exports = { signupSchema, loginSchema, validate };