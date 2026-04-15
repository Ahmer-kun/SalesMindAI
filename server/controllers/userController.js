/**
 * Handles user account management:
 *  - updateProfile: change name and/or email
 *  - changePassword: verify old password, set new one
 *  - deleteAccount: permanently remove account and all data
 */

const User = require("../models/User");
const Lead = require("../models/Lead");
const bcrypt = require("bcryptjs");

// ─── UPDATE PROFILE (name + email) ───────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    const updates = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (email && email.trim()) {
      // Check email not taken by another user
      const existing = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "This email is already in use by another account.",
        });
      }
      updates.email = email.toLowerCase().trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes provided.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("[updateProfile]", error.message);
    return res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Fetch user with password
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Ensure new password is different
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password.",
      });
    }

    // Set new password — pre-save hook handles hashing
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("[changePassword]", error.message);
    return res.status(500).json({ success: false, message: "Failed to change password." });
  }
};

// ─── DELETE ACCOUNT ───────────────────────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    // Require password confirmation before deletion
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Account not deleted.",
      });
    }

    // Delete all user's leads first
    await Lead.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Clear refresh token cookie
    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: "Account and all data permanently deleted.",
    });
  } catch (error) {
    console.error("[deleteAccount]", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete account." });
  }
};

module.exports = { updateProfile, changePassword, deleteAccount };
