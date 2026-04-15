/**
 * Auth routes only. Forgot/reset password is in passwordResetRoutes.js
 * Frontend uses /api/password/* for forgot/reset — do NOT duplicate here.
 */

const express = require("express");
const router  = express.Router();
const {
  signup, login, verifyMFA,
  refresh, logout, getMe,
  verifyEmail, resendVerification,
  toggleMFA,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { signupSchema, loginSchema, validate } = require("../utils/validators");
const Joi = require("joi");

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, message: error.details.map((d) => d.message).join(", ") });
  }
  req.body = value;
  next();
};

const mfaVerifySchema = Joi.object({
  userId: Joi.string().required(),
  otp:    Joi.string().length(6).required().messages({ "string.length": "OTP must be 6 digits" }),
});

// ─── Public ───────────────────────────────────────────────────────────────────
router.post("/signup",     validate(signupSchema), signup);
router.post("/login",      validate(loginSchema),  login);
router.post("/refresh",    refresh);
router.post("/logout",     logout);
router.get("/verify-email", verifyEmail);                             // ?token=xxx
router.post("/verify-mfa", validateBody(mfaVerifySchema), verifyMFA);

// ─── Protected ────────────────────────────────────────────────────────────────
router.get("/me",                   protect, getMe);
router.post("/resend-verification", protect, resendVerification);
router.post("/toggle-mfa",          protect, toggleMFA);

module.exports = router;
