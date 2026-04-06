/**
 * authRoutes.js
 * Defines all /api/auth endpoints.
 * Validation middleware runs before controller logic.
 */

const express = require("express");
const router = express.Router();
const { signup, login, refresh, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { signupSchema, loginSchema, validate } = require("../utils/validators");

// POST /api/auth/signup  → Register a new user
router.post("/signup", validate(signupSchema), signup);

// POST /api/auth/login   → Authenticate user, return tokens
router.post("/login", validate(loginSchema), login);

// POST /api/auth/refresh → Exchange refresh cookie for new access token
router.post("/refresh", refresh);

// POST /api/auth/logout  → Clear tokens and end session
router.post("/logout", logout);

// GET  /api/auth/me      → Get current user info (protected)
router.get("/me", protect, getMe);

module.exports = router;
