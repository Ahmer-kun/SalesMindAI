/**
 * authController.js
 * Handles all authentication logic:
 *  - signup: create account
 *  - login: verify credentials, issue tokens
 *  - refresh: exchange refresh token for new access token
 *  - logout: clear tokens
 *  - getMe: return current user info
 */

const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../utils/tokenUtils");

// ─── SIGNUP ──────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create user (password is hashed by pre-save hook in model)
    const user = await User.create({ name, email, password });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save hashed refresh token to DB for validation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("[signup error]", error.message);
    return res.status(500).json({ success: false, message: "Server error during signup." });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password (select: false by default, so we must explicitly include it)
    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user) {
      // Generic error to prevent email enumeration
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account has been deactivated." });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("[login error]", error.message);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token. Please log in.",
      });
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(token);

    // Find user and validate stored token matches
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token. Please log in again.",
      });
    }

    // Issue new access token
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate refresh token (best practice)
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.status(403).json({
      success: false,
      message: "Session expired. Please log in again.",
    });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Invalidate the refresh token in DB
      await User.findOneAndUpdate(
        { refreshToken: token },
        { $set: { refreshToken: null } }
      );
    }

    clearRefreshTokenCookie(res);
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("[logout error]", error.message);
    return res.status(500).json({ success: false, message: "Server error during logout." });
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not fetch user." });
  }
};

module.exports = { signup, login, refresh, logout, getMe };
