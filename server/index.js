require("dotenv").config();
const express      = require("express");
const helmet       = require("helmet");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit    = require("express-rate-limit");
const xssClean     = require("xss-clean");
const connectDB    = require("./utils/connectDB");

const {
  mongoSanitize, preventHPP, detectSuspiciousPayload,
  guardRequestSize, additionalSecurityHeaders, logAuthAttempt,
} = require("./middleware/securityMiddleware");

const authRoutes          = require("./routes/authRoutes");
const leadRoutes          = require("./routes/leadRoutes");
const aiRoutes            = require("./routes/aiRoutes");
const analyticsRoutes     = require("./routes/analyticsRoutes");
const userRoutes          = require("./routes/userRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:", "https://lh3.googleusercontent.com"],
      connectSrc: ["'self'"],
      fontSrc:    ["'self'"],
      objectSrc:  ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

app.use(additionalSecurityHeaders);
app.use(cors({
  origin: (origin, cb) => {
    const allowed = [process.env.CLIENT_URL || "http://localhost:5173"];
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(guardRequestSize(10));
app.use(preventHPP);
app.use(xssClean());
app.use(mongoSanitize);
app.use(detectSuspiciousPayload);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true, legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: "Too many login attempts. Please wait 15 minutes." },
  skipSuccessfulRequests: true,
});

app.use(globalLimiter);

app.use("/api/auth",     authLimiter, logAuthAttempt, authRoutes);
app.use("/api/leads",    leadRoutes);
app.use("/api/ai",       aiRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/user",     userRoutes);
app.use("/api/password", passwordResetRoutes);

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "SalesMind AI server is running 🚀", timestamp: new Date() })
);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));

app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";
  console.error(`[ERROR] ${err.message}`);
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: isDev ? err.message : "Something went wrong. Please try again.",
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SalesMind AI — port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  console.log(`   Security: Helmet ✓  CORS ✓  Rate limiting ✓  XSS ✓  NoSQL sanitize ✓\n`);
});