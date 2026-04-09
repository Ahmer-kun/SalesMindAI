/**
 * - Stricter field patterns
 * - Phone number format validation
 * - Strip unknown fields
 * - Note length enforcement
 */

const Joi = require("joi");

const leadSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      "any.required": "Lead name is required",
      "string.max":   "Name cannot exceed 100 characters",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .max(254)
    .required()
    .messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),

  company: Joi.string().trim().max(100).allow("").default(""),

  phone: Joi.string()
    .trim()
    .max(30)
    .pattern(/^[+\d\s\-().]*$/)       // only valid phone characters
    .allow("")
    .default("")
    .messages({
      "string.pattern.base": "Phone number contains invalid characters",
    }),

  status: Joi.string().valid("Hot", "Warm", "Cold").default("Cold"),

  notes: Joi.string()
    .trim()
    .max(2000)
    .allow("")
    .default(""),

}).options({ stripUnknown: true });

// for updates | all fields optional
const leadUpdateSchema = Joi.object({
  name:    Joi.string().trim().min(1).max(100),
  email:   Joi.string().email({ tlds: { allow: false } }).lowercase().max(254),
  company: Joi.string().trim().max(100).allow(""),
  phone:   Joi.string().trim().max(30).pattern(/^[+\d\s\-().]*$/).allow(""),
  status:  Joi.string().valid("Hot", "Warm", "Cold"),
  notes:   Joi.string().trim().max(2000).allow(""),
}).options({ stripUnknown: true });

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ success: false, message: messages });
  }
  req.body = value;
  next();
};

module.exports = { leadSchema, leadUpdateSchema, validate };