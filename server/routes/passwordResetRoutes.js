/**
 * passwordResetRoutes.js
 * Path: server/routes/passwordResetRoutes.js
 */

const express  = require("express");
const router   = express.Router();
const rateLimit = require("express-rate-limit");
const Joi      = require("joi");
const {
  forgotPassword,
  validateResetToken,
  resetPassword,
} = require("../controllers/passwordResetController");

// Strict rate limit — prevent email spam
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many reset requests. Please wait 15 minutes." },
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, message: error.details.map((d) => d.message).join(", ") });
  }
  req.body = value;
  next();
};

const forgotSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
});

const resetSchema = Joi.object({
  newPassword: Joi.string()
    .min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min":          "Password must be at least 8 characters",
      "string.pattern.base": "Must include uppercase, lowercase, and a number",
      "any.required":        "New password is required",
    }),
});

// POST /api/password/forgot          → send reset email
router.post("/forgot", resetLimiter, validate(forgotSchema), forgotPassword);

// GET  /api/password/validate/:token → check if token is valid
router.get("/validate/:token", validateResetToken);

// POST /api/password/reset/:token    → set new password
router.post("/reset/:token", validate(resetSchema), resetPassword);

module.exports = router;
