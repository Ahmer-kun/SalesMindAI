/**
 * analyticsRoutes.js
 * Path: server/routes/analyticsRoutes.js
 */

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAnalytics } = require("../controllers/analyticsController");

router.use(protect);

// GET /api/analytics — full dashboard data
router.get("/", getAnalytics);

module.exports = router;
