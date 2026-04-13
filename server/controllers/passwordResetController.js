/**
 * passwordResetController.js
 * Path: server/controllers/passwordResetController.js
 *
 * Handles forgot password + reset password flow:
 *  1. forgotPassword — find user, generate token, send reset email
 *  2. resetPassword  — verify token, set new password
 *  3. validateToken  — check if a reset token is still valid (for frontend)
 */

const crypto = require("crypto");
const User   = require("../models/User");
const { sendPasswordResetEmail } = require("../utils/emailUtils");

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success — never reveal if email exists (prevents enumeration)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // Generate a secure random token
    const resetToken    = crypto.randomBytes(32).toString("hex");
    const hashedToken   = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save hashed token + expiry (1 hour)
    user.passwordResetToken   = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send email with the raw (unhashed) token
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (emailError) {
      // If email fails, clear the token and return error
      console.error("[forgotPassword] Email send failed:", emailError.message);
      user.passwordResetToken   = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("[forgotPassword]", error.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── VALIDATE RESET TOKEN ─────────────────────────────────────────────────────
// Frontend calls this when the user lands on the reset page to verify token is valid
const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired.",
      });
    }

    return res.status(200).json({ success: true, message: "Token is valid." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token }       = req.params;
    const { newPassword } = req.body;

    // Hash the incoming token and look it up
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Set new password — pre-save hook hashes it
    user.password             = newPassword;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    // Also invalidate any existing refresh tokens
    user.refreshToken         = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("[resetPassword]", error.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { forgotPassword, validateResetToken, resetPassword };
