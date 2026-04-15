/**
 * leadRoutes.js
 * Path: server/routes/leadRoutes.js
 * All /api/leads endpoints — all are protected.
 */

const express = require("express");
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
} = require("../controllers/leadController");

const { protect } = require("../middleware/authMiddleware");
const { leadSchema, leadUpdateSchema, validate } = require("../utils/leadValidators");

// All lead routes require authentication
router.use(protect);

// GET    /api/leads         → List all leads (with optional filters)
// POST   /api/leads         → Create a new lead
router
  .route("/")
  .get(getLeads)
  .post(validate(leadSchema), createLead);

// GET    /api/leads/:id     → Get a single lead
// PUT    /api/leads/:id     → Full update
// DELETE /api/leads/:id     → Delete
router
  .route("/:id")
  .get(getLead)
  .put(validate(leadUpdateSchema), updateLead)
  .delete(deleteLead);

// PATCH  /api/leads/:id/status → Quick status change
router.patch("/:id/status", updateLeadStatus);

module.exports = router;
