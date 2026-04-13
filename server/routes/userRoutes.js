/**
 * userRoutes.js
 * Path: server/routes/userRoutes.js
 *
 * All /api/user endpoints — all protected.
 */

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");

const Joi = require("joi");

// ─── Validation schemas ───────────────────────────────────────────────────────
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ success: false, message: messages });
  }
  req.body = value;
  next();
};

const profileSchema = Joi.object({
  name:  Joi.string().trim().min(2).max(100),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().max(254),
}).or("name", "email"); // at least one required

const passwordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min":          "New password must be at least 8 characters",
      "string.pattern.base": "Must include uppercase, lowercase, and a number",
      "any.required":        "New password is required",
    }),
});

const deleteSchema = Joi.object({
  password: Joi.string().required().messages({
    "any.required": "Password is required to delete account",
  }),
});

// All routes protected
router.use(protect);

// PUT  /api/user/profile  → update name and/or email
router.put("/profile", validate(profileSchema), updateProfile);

// PUT  /api/user/password → change password
router.put("/password", validate(passwordSchema), changePassword);

// DELETE /api/user        → permanently delete account + all data
router.delete("/", validate(deleteSchema), deleteAccount);

module.exports = router;
