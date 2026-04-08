/**
 * index.js
 * Path: server/index.js
 *
 * SalesMind AI — Express server entry point.
 * Updated through Phase 4: auth + leads + AI + analytics routes.
 */

require("dotenv").config();
const express     = require("express");
const helmet      = require("helmet");
const cors        = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit   = require("express-rate-limit");
const xssClean    = require("xss-clean");
const connectDB   = require("./utils/connectDB");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes      = require("./routes/authRoutes");
const leadRoutes      = require("./routes/leadRoutes");
const aiRoutes        = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes"); // Phase 4

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:       process.env.CLIENT_URL || "http://localhost:5173",
  credentials:  true,
  methods:      ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(xssClean());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Please wait 15 minutes." },
});

app.use(globalLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",      authLimiter, authRoutes);
app.use("/api/leads",     leadRoutes);
app.use("/api/ai",        aiRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "SalesMind AI server is running 🚀", timestamp: new Date() })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found." })
);

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SalesMind AI — port ${PORT} (${process.env.NODE_ENV || "development"})\n`);
});

// /**
//  * SalesMind AI - Server Entry Point
//  * Initializes Express, middleware, routes, and DB connection
//  */

// require("dotenv").config();
// const express = require("express");
// const helmet = require("helmet");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const rateLimit = require("express-rate-limit");
// const xssClean = require("xss-clean");
// const connectDB = require("./utils/connectDB");

// const authRoutes = require("./routes/authRoutes");
// const leadRoutes = require("./routes/leadRoutes");
// const aiRoutes   = require("./routes/aiRoutes");   // ← NEW in Phase 3

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ─── Connect to MongoDB ───────────────────────────────────────────────────────
// connectDB();

// // ─── Security Middleware ──────────────────────────────────────────────────────

// // Helmet: sets secure HTTP headers
// app.use(helmet());

// // CORS: only allow requests from our frontend
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     credentials: true, // allow cookies
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // XSS sanitization: strips malicious HTML/JS from request bodies
// app.use(xssClean());

// // Rate limiting: prevent brute-force attacks
// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,                  // max 100 requests per window
//   message: { success: false, message: "Too many requests. Please try again later." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Stricter limiter for auth endpoints
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10, // only 10 auth attempts per 15 min
//   message: { success: false, message: "Too many login attempts. Please wait 15 minutes." },
// });

// app.use(globalLimiter);

// // ─── Standard Middleware ──────────────────────────────────────────────────────
// app.use(express.json({ limit: "10kb" }));         // parse JSON, limit body size
// app.use(express.urlencoded({ extended: true }));   // parse form data
// app.use(cookieParser());                           // parse cookies

// // ─── Routes ──────────────────────────────────────────────────────────────────
// app.use("/api/auth", authLimiter, authRoutes);
// app.use("/api/leads", leadRoutes);
// app.use("/api/ai",    aiRoutes);    // ← NEW in Phase 3

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.json({ success: true, message: "SalesMind AI server is running 🚀", timestamp: new Date() });
// });

// // ─── 404 Handler ─────────────────────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: "Route not found." });
// });

// // ─── Global Error Handler ─────────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//   console.error(`[ERROR] ${err.message}`);
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || "Internal server error.",
//   });
// });

// // ─── Start Server ─────────────────────────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log(`\n🚀 SalesMind AI server running on port ${PORT}`);
//   console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
//   console.log(`   Client URL:  ${process.env.CLIENT_URL || "http://localhost:5173"}\n`);
// });