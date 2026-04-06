/**
 * Lead.js — Mongoose Model
 * Path: server/models/Lead.js
 *
 * Defines the schema for a sales lead.
 * Each lead belongs to a user (multi-tenant isolation).
 */

const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    // Every lead is owned by one user — enforces data isolation
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for fast queries by user
    },

    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [30, "Phone number too long"],
      default: "",
    },

    status: {
      type: String,
      enum: ["Hot", "Warm", "Cold"],
      default: "Cold",
    },

    // Lead score set by AI (Phase 4) or manually
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },

    // Tracks AI-generated outreach/follow-up messages (Phase 3)
    aiMessages: [
      {
        type: { type: String, enum: ["outreach", "followup"] },
        content: String,
        generatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// Compound index: fast queries for "all leads by this user sorted by date"
leadSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Lead", leadSchema);
