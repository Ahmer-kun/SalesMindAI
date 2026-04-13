/**
 * leadController.js
 * Path: server/controllers/leadController.js
 *
 * Handles all lead CRUD operations.
 * Every query is scoped to req.user._id — users can only see their own leads.
 */

const Lead = require("../models/Lead");

// ─── GET ALL LEADS ────────────────────────────────────────────────────────────
// Supports: ?status=Hot|Warm|Cold  ?search=name/email/company  ?sort=newest|oldest
const getLeads = async (req, res) => {
  try {
    const {
      status,
      search,
      sort  = "newest",
      page  = 1,
      limit = 12,
    } = req.query;
 
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip     = (pageNum - 1) * limitNum;
 
    const filter = { user: req.user._id };
 
    if (status && ["Hot", "Warm", "Cold"].includes(status)) {
      filter.status = status;
    }
 
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { company: regex }];
    }
 
    const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
 
    // Parallel: paginated leads + total count + all leads for summary
    const [totalCount, leads, allLeads] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.find(filter).sort(sortOrder).skip(skip).limit(limitNum).lean(),
      Lead.find({ user: req.user._id }).select("status").lean(),
    ]);
 
    const totalPages = Math.ceil(totalCount / limitNum);
 
    const summary = {
      total: allLeads.length,
      hot:   allLeads.filter((l) => l.status === "Hot").length,
      warm:  allLeads.filter((l) => l.status === "Warm").length,
      cold:  allLeads.filter((l) => l.status === "Cold").length,
    };
 
    return res.status(200).json({
      success: true,
      summary,
      leads,
      pagination: {
        total:       totalCount,
        page:        pageNum,
        limit:       limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("[getLeads]", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch leads." });
  }
};

// ─── GET SINGLE LEAD ──────────────────────────────────────────────────────────
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user._id });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    return res.status(200).json({ success: true, lead });
  } catch (error) {
    console.error("[getLead]", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch lead." });
  }
};

// ─── CREATE LEAD ──────────────────────────────────────────────────────────────
const createLead = async (req, res) => {
  try {
    const { name, email, company, phone, status, notes } = req.body;

    // Check for duplicate email within this user's leads
    const existing = await Lead.findOne({ user: req.user._id, email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A lead with this email already exists.",
      });
    }

    const lead = await Lead.create({
      user: req.user._id,
      name,
      email,
      company,
      phone,
      status,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully.",
      lead,
    });
  } catch (error) {
    console.error("[createLead]", error.message);
    return res.status(500).json({ success: false, message: "Failed to create lead." });
  }
};

// ─── UPDATE LEAD ──────────────────────────────────────────────────────────────
const updateLead = async (req, res) => {
  try {
    // findOneAndUpdate with user filter prevents updating other users' leads
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully.",
      lead,
    });
  } catch (error) {
    console.error("[updateLead]", error.message);
    return res.status(500).json({ success: false, message: "Failed to update lead." });
  }
};

// ─── DELETE LEAD ──────────────────────────────────────────────────────────────
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully.",
    });
  } catch (error) {
    console.error("[deleteLead]", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete lead." });
  }
};

// ─── UPDATE STATUS ONLY (quick patch) ────────────────────────────────────────
const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Hot", "Warm", "Cold"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { status } },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    return res.status(200).json({ success: true, message: "Status updated.", lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update status." });
  }
};

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead, updateLeadStatus };
