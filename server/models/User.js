/**
 * User.js
 * Path: server/models/User.js
 *
 * UPDATED IN PART 2 PHASE 7:
 * - password is now optional (Google OAuth users have no password)
 * - Added username field
 * - Added authProvider field to track how user signed up
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    username: {
      type: String,
      trim: true,
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"],
      default: "",
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
      // NOT required — Google OAuth users have no password
    },

    refreshToken: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // How the user signed up
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // Email verification
    isEmailVerified:    { type: Boolean, default: false },
    emailVerifyToken:   { type: String,  select: false },
    emailVerifyExpires: { type: Date,    select: false },

    // Password reset
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },

    // MFA
    mfaEnabled:    { type: Boolean, default: false },
    mfaOtp:        { type: String,  select: false },
    mfaOtpExpires: { type: Date,    select: false },

    // Google OAuth
    googleId: { type: String, sparse: true },
    avatar:   { type: String, default: "" },

    // Flag for OAuth users who haven't set username yet
    profileComplete: {
      type: Boolean,
      default: true, // false only for new Google OAuth users
    },
  },
  { timestamps: true }
);

// Hash password before save — only if password exists and was modified
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false; // Google users have no password
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id:             this._id,
    name:            this.name,
    username:        this.username,
    email:           this.email,
    role:            this.role,
    isEmailVerified: this.isEmailVerified,
    mfaEnabled:      this.mfaEnabled,
    avatar:          this.avatar,
    authProvider:    this.authProvider,
    profileComplete: this.profileComplete,
    createdAt:       this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);