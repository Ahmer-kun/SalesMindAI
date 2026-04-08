/**
 * aiRoutes.js
 * Path: server/routes/aiRoutes.js
 *
 * All /api/ai endpoints — all protected by JWT.
 * Stricter rate limiting to prevent API cost abuse.
 */

const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { protect } = require("../middleware/authMiddleware");
const {
  generateOutreachMessage,
  generateFollowUpMessage,
  scoreLeadHandler,
  getAIHistory,
} = require("../controllers/aiController");

// Stricter rate limit for AI endpoints — prevents runaway API costs
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 30,                   // max 30 AI calls per hour per IP
  message: {
    success: false,
    message: "AI request limit reached. Please wait before generating more messages.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All AI routes require authentication + AI rate limit
router.use(protect);
router.use(aiLimiter);

// POST /api/ai/outreach   → Generate personalized outreach email
router.post("/outreach", generateOutreachMessage);

// POST /api/ai/followup   → Generate follow-up message
router.post("/followup", generateFollowUpMessage);

// POST /api/ai/score      → Score a lead (0-100)
router.post("/score", scoreLeadHandler);

// GET  /api/ai/history/:leadId → Get AI message history for a lead
router.get("/history/:leadId", getAIHistory);

module.exports = router;