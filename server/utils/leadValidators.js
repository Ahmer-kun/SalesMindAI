/**
 * leadValidators.js
 * Path: server/utils/leadValidators.js
 *
 * Joi schemas for lead create / update requests.
 */

const Joi = require("joi");

const leadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    "any.required": "Lead name is required",
    "string.max": "Name cannot exceed 100 characters",
  }),

  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please provide a valid email",
    "any.required": "Email is required",
  }),

  company: Joi.string().trim().max(100).allow("").default(""),

  phone: Joi.string().trim().max(30).allow("").default(""),

  status: Joi.string().valid("Hot", "Warm", "Cold").default("Cold"),

  notes: Joi.string().trim().max(2000).allow("").default(""),
});

// For updates, all fields are optional
const leadUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  email: Joi.string().email().lowercase(),
  company: Joi.string().trim().max(100).allow(""),
  phone: Joi.string().trim().max(30).allow(""),
  status: Joi.string().valid("Hot", "Warm", "Cold"),
  notes: Joi.string().trim().max(2000).allow(""),
});

/**
 * Middleware factory: validates req.body against a given schema
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ success: false, message: messages });
  }
  req.body = value; // Replace body with sanitized value
  next();
};

module.exports = { leadSchema, leadUpdateSchema, validate };
