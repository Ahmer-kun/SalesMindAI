/**
 * aiController.js
 * Path: server/controllers/aiController.js
 *
 * Handles AI generation requests.
 * All routes are protected — user must be authenticated.
 * Leads are always verified to belong to the requesting user.
 */

const Lead = require("../models/Lead");
const { generateOutreach, generateFollowUp, scoreLead } = require("../services/aiService");

// ─── GENERATE OUTREACH MESSAGE ────────────────────────────────────────────────
const generateOutreachMessage = async (req, res) => {
  try {
    const { leadId, productDescription } = req.body;

    if (!leadId || !productDescription?.trim()) {
      return res.status(400).json({
        success: false,
        message: "leadId and productDescription are required.",
      });
    }

    // Verify lead belongs to this user
    const lead = await Lead.findOne({ _id: leadId, user: req.user._id });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    const message = await generateOutreach(lead, productDescription);

    // Save to lead's AI message history
    lead.aiMessages.push({ type: "outreach", content: message });
    await lead.save();

    return res.status(200).json({
      success: true,
      message,
      leadId: lead._id,
    });
  } catch (error) {
    console.error("[generateOutreach]", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate outreach message.",
    });
  }
};

// ─── GENERATE FOLLOW-UP MESSAGE ───────────────────────────────────────────────
const generateFollowUpMessage = async (req, res) => {
  try {
    const { leadId, previousMessage, followUpGoal } = req.body;

    if (!leadId || !previousMessage?.trim()) {
      return res.status(400).json({
        success: false,
        message: "leadId and previousMessage are required.",
      });
    }

    const lead = await Lead.findOne({ _id: leadId, user: req.user._id });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    const message = await generateFollowUp(lead, previousMessage, followUpGoal);

    // Save to AI message history
    lead.aiMessages.push({ type: "followup", content: message });
    await lead.save();

    return res.status(200).json({
      success: true,
      message,
      leadId: lead._id,
    });
  } catch (error) {
    console.error("[generateFollowUp]", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate follow-up message.",
    });
  }
};

// ─── SCORE A LEAD ─────────────────────────────────────────────────────────────
const scoreLeadHandler = async (req, res) => {
  try {
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ success: false, message: "leadId is required." });
    }

    const lead = await Lead.findOne({ _id: leadId, user: req.user._id });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    // Build conversation context from stored AI messages
    const conversation = lead.aiMessages
      .map((m) => `[${m.type}]: ${m.content}`)
      .join("\n\n");

    const result = await scoreLead(lead, conversation);

    // Persist score and update status based on AI recommendation
    lead.score = result.score;
    if (result.label) lead.status = result.label;
    await lead.save();

    return res.status(200).json({
      success: true,
      score: result.score,
      label: result.label,
      reasoning: result.reasoning,
      strengths: result.strengths || [],
      concerns: result.concerns || [],
      lead,
    });
  } catch (error) {
    console.error("[scoreLead]", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to score lead.",
    });
  }
};

// ─── GET AI MESSAGE HISTORY FOR A LEAD ───────────────────────────────────────
const getAIHistory = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.leadId, user: req.user._id });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    return res.status(200).json({
      success: true,
      leadName: lead.name,
      aiMessages: lead.aiMessages,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch AI history." });
  }
};

module.exports = {
  generateOutreachMessage,
  generateFollowUpMessage,
  scoreLeadHandler,
  getAIHistory,
};