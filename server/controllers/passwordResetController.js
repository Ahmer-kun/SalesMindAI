const crypto = require("crypto");
const User   = require("../models/User");
const { sendPasswordResetEmail } = require("../utils/emailService");

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Never reveal if email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken   = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error("[forgotPassword] Email failed:", emailError.message);
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
const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      passwordResetToken:   token,
      passwordResetExpires: { $gt: Date.now() },
    });

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

    const user = await User.findOne({
      passwordResetToken:   token,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password             = newPassword;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
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
