/**
 * Handles: signup, login, verifyMFA, refresh, logout, getMe,
 *          verifyEmail, resendVerification, toggleMFA
 * NOTE: forgotPassword + resetPassword are in passwordResetController.js
 */

const crypto = require("crypto");
const User   = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../utils/tokenUtils");
const { sendVerificationEmail, sendMFAEmail } = require("../utils/emailService");

const generateToken = () => crypto.randomBytes(32).toString("hex");
const generateOTP   = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const verifyToken = generateToken();

    const user = await User.create({
      name, email, password,
      emailVerifyToken: verifyToken,
      isEmailVerified:  false,
    });

    // Send verification email — non-blocking
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch (emailErr) {
      console.warn("[signup] Verification email failed:", emailErr.message);
    }

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Account created. Please check your email to verify your address.",
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("[signup]", error.message);
    return res.status(500).json({ success: false, message: "Server error during signup." });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password +refreshToken +mfaEnabled +mfaOtp +mfaOtpExpires");

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account has been deactivated." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // MFA check
    if (user.mfaEnabled) {
      const otp    = generateOTP();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      user.mfaOtp       = otp;
      user.mfaOtpExpires = expiry;
      await user.save({ validateBeforeSave: false });

      try {
        await sendMFAEmail(user.email, user.name, otp);
      } catch (emailErr) {
        console.warn("[login] MFA email failed:", emailErr.message);
      }

      return res.status(200).json({
        success:     true,
        mfaRequired: true,
        message:     "A 6-digit code has been sent to your email.",
        userId:      user._id,
      });
    }

    // No MFA — issue tokens directly
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("[login]", error.message);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// ─── VERIFY MFA OTP ───────────────────────────────────────────────────────────
const verifyMFA = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: "userId and otp are required." });
    }

    const user = await User.findById(userId).select("+mfaOtp +mfaOtpExpires +refreshToken");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (!user.mfaOtp || !user.mfaOtpExpires) {
      return res.status(400).json({ success: false, message: "No OTP found. Please log in again." });
    }
    if (new Date() > user.mfaOtpExpires) {
      return res.status(401).json({ success: false, message: "OTP has expired. Please log in again." });
    }
    if (user.mfaOtp !== otp.toString().trim()) {
      return res.status(401).json({ success: false, message: "Invalid OTP." });
    }

    // Clear OTP + issue tokens
    user.mfaOtp        = undefined;
    user.mfaOtpExpires = undefined;

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "MFA verified. Logged in successfully.",
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("[verifyMFA]", error.message);
    return res.status(500).json({ success: false, message: "Server error during MFA verification." });
  }
};

// ─── REFRESH ──────────────────────────────────────────────────────────────────
const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token. Please log in." });
    }

    const decoded = verifyRefreshToken(token);
    const user    = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({ success: false, message: "Invalid refresh token. Please log in again." });
    }

    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken     = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.status(403).json({ success: false, message: "Session expired. Please log in again." });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await User.findOneAndUpdate({ refreshToken: token }, { $set: { refreshToken: null } });
    }
    clearRefreshTokenCookie(res);
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("[logout]", error.message);
    return res.status(500).json({ success: false, message: "Server error during logout." });
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: "No token provided." });
    }

    // Must use findOne with select("+emailVerifyToken") to load the hidden field
    // then compare manually — because select:false fields ARE queryable in findOne
    const user = await User.findOne({ emailVerifyToken: token })
      .select("+emailVerifyToken +isEmailVerified");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified!",
      });
    }

    user.isEmailVerified  = true;
    user.emailVerifyToken = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You're all set.",
    });
  } catch (error) {
    console.error("[verifyEmail]", error.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── RESEND VERIFICATION ──────────────────────────────────────────────────────
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+emailVerifyToken");

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified." });
    }

    const verifyToken     = generateToken();
    user.emailVerifyToken = verifyToken;
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user.email, user.name, verifyToken);

    return res.status(200).json({ success: true, message: "Verification email sent." });
  } catch (error) {
    console.error("[resendVerification]", error.message);
    return res.status(500).json({ success: false, message: "Failed to resend verification email." });
  }
};

// ─── TOGGLE MFA ───────────────────────────────────────────────────────────────
const toggleMFA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.mfaEnabled = !user.mfaEnabled;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success:    true,
      message:    `MFA ${user.mfaEnabled ? "enabled" : "disabled"} successfully.`,
      mfaEnabled: user.mfaEnabled,
    });
  } catch (error) {
    console.error("[toggleMFA]", error.message);
    return res.status(500).json({ success: false, message: "Failed to toggle MFA." });
  }
};

module.exports = {
  signup, login, verifyMFA,
  refresh, logout, getMe,
  verifyEmail, resendVerification,
  toggleMFA,
};
