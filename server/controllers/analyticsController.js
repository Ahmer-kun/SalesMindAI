/**
 * analyticsController.js
 * Path: server/controllers/analyticsController.js
 *
 * Computes all dashboard analytics from the user's lead data.
 * All queries are scoped to req.user._id — strict data isolation.
 */

const Lead = require("../models/Lead");

// ─── GET FULL ANALYTICS SUMMARY ───────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // ── 1. Status breakdown ──────────────────────────────────────────────────
    const statusCounts = await Lead.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byStatus = { Hot: 0, Warm: 0, Cold: 0 };
    statusCounts.forEach(({ _id, count }) => {
      if (byStatus[_id] !== undefined) byStatus[_id] = count;
    });
    const totalLeads = byStatus.Hot + byStatus.Warm + byStatus.Cold;

    // ── 2. Leads added per day — last 30 days ────────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const leadsByDay = await Lead.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in zero-count days so chart has a continuous line
    const dailyData = buildDailyTimeline(leadsByDay, 30);

    // ── 3. Score distribution ────────────────────────────────────────────────
    const scoredLeads = await Lead.find(
      { user: userId, score: { $ne: null } },
      { score: 1, name: 1, status: 1 }
    )
      .sort({ score: -1 })
      .limit(10)
      .lean();

    // ── 4. AI usage stats ────────────────────────────────────────────────────
    const aiStats = await Lead.aggregate([
      { $match: { user: userId } },
      {
        $project: {
          outreachCount: {
            $size: {
              $filter: {
                input: "$aiMessages",
                as: "m",
                cond: { $eq: ["$$m.type", "outreach"] },
              },
            },
          },
          followupCount: {
            $size: {
              $filter: {
                input: "$aiMessages",
                as: "m",
                cond: { $eq: ["$$m.type", "followup"] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOutreach: { $sum: "$outreachCount" },
          totalFollowup: { $sum: "$followupCount" },
        },
      },
    ]);

    const aiUsage = aiStats[0] || { totalOutreach: 0, totalFollowup: 0 };

    // ── 5. Recent activity (last 5 leads added) ──────────────────────────────
    const recentLeads = await Lead.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name company status score createdAt")
      .lean();

    // ── 6. Average score ─────────────────────────────────────────────────────
    const avgScoreResult = await Lead.aggregate([
      { $match: { user: userId, score: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$score" } } },
    ]);
    const avgScore = avgScoreResult[0]
      ? Math.round(avgScoreResult[0].avg)
      : null;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalLeads,
          byStatus,
          avgScore,
          aiUsage: {
            outreach: aiUsage.totalOutreach,
            followup: aiUsage.totalFollowup,
            total: aiUsage.totalOutreach + aiUsage.totalFollowup,
          },
        },
        dailyData,       // [{date, count}] last 30 days
        scoredLeads,     // top scored leads
        recentLeads,     // 5 most recently added
      },
    });
  } catch (error) {
    console.error("[getAnalytics]", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch analytics." });
  }
};

// ─── Helper: fill gaps in daily data with zeros ───────────────────────────────
const buildDailyTimeline = (rawData, days) => {
  const map = {};
  rawData.forEach(({ _id, count }) => {
    map[_id] = count;
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
    result.push({
      date: key,
      // Short label for chart axis: "Jan 5"
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: map[key] || 0,
    });
  }
  return result;
};

module.exports = { getAnalytics };
