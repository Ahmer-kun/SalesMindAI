/**
 * User Model
 * Defines the schema for user accounts.
 * Passwords are hashed before saving using bcryptjs.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
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
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never return password in queries by default
    },

    refreshToken: {
      type: String,
      select: false, // Never return refresh token in queries
    },

    // Future-proofing: role-based access
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // For future: account status management
    isActive: {
      type: Boolean,
      default: true,
    },

    // Email verification
    isEmailVerified:   { type: Boolean, default: false },
    emailVerifyToken:  { type: String, select: false },
    emailVerifyExpires:{ type: Date,   select: false },
 
    // Password reset
    passwordResetToken:  { type: String, select: false },
    passwordResetExpires:{ type: Date,   select: false },
 
    // MFA
    mfaEnabled:   { type: Boolean, default: false },
    mfaOtp:       { type: String,  select: false },
    mfaOtpExpires:{ type: Date,    select: false },
 
    // Google OAuth
    googleId: { type: String, sparse: true },
    avatar:   { type: String, default: "" },

  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Pre-save Hook: Hash password before storing ──────────────────────────────
userSchema.pre("save", async function (next) {
  // Only hash if password was modified (not on every save)
  if (!this.isModified("password")) return next();

  try {
    // Salt rounds: 12 is strong and still performant
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Instance Method: Compare entered password with stored hash ───────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ─── Instance Method: Return safe user object (no sensitive fields) ───────────
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    mfaEnabled: this.mfaEnabled,
    avatar: this.avatar,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
