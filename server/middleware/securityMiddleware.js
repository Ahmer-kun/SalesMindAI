/**
 * securityMiddleware.js
 * Path: server/middleware/securityMiddleware.js
 *
 * Additional security hardening beyond Phase 1 basics.
 * Covers: NoSQL injection, HTTP parameter pollution,
 * suspicious payload detection, and security headers.
 */

// ─── NoSQL Injection Sanitizer ────────────────────────────────────────────────
// Strips $ and . from req.body, req.params, req.query
// Prevents attacks like: { "email": { "$gt": "" } }
const sanitizeMongoInput = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  for (const key of Object.keys(obj)) {
    // Remove keys that start with $ (MongoDB operators)
    if (key.startsWith("$")) {
      delete obj[key];
      continue;
    }
    // Remove keys containing dots (nested path injection)
    if (key.includes(".")) {
      delete obj[key];
      continue;
    }
    // Recurse into nested objects
    if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeMongoInput(obj[key]);
    }
    // Stringify any remaining object values in string-expected fields
    if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = JSON.stringify(obj[key]);
    }
  }
  return obj;
};

const mongoSanitize = (req, res, next) => {
  if (req.body)   sanitizeMongoInput(req.body);
  if (req.params) sanitizeMongoInput(req.params);
  if (req.query)  sanitizeMongoInput(req.query);
  next();
};

// ─── HTTP Parameter Pollution Prevention ─────────────────────────────────────
// If a param is sent multiple times (e.g. ?status=Hot&status=Cold),
// keep only the last value to prevent logic bypass attacks.
const preventHPP = (req, res, next) => {
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (Array.isArray(req.query[key])) {
        // Keep last value only
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }
  next();
};

// ─── Suspicious Payload Detector ──────────────────────────────────────────────
// Blocks requests containing obvious injection patterns in the body.
// Acts as a last-resort catch before data hits controllers.
const SUSPICIOUS_PATTERNS = [
  /<script[\s\S]*?>/i,            // XSS script tags
  /javascript:/i,                 // javascript: protocol
  /on\w+\s*=/i,                   // inline event handlers (onclick=, onerror=)
  /\$where/i,                     // MongoDB $where operator
  /\$function/i,                  // MongoDB $function operator
  /\{\s*"\$gt"/i,                 // MongoDB gt injection
  /\{\s*"\$ne"/i,                 // MongoDB ne injection
  /\{\s*"\$regex"/i,              // MongoDB regex injection
];

const detectSuspiciousPayload = (req, res, next) => {
  const body = JSON.stringify(req.body || {});

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(body)) {
      console.warn(`[SECURITY] Suspicious payload blocked from ${req.ip} on ${req.path}`);
      return res.status(400).json({
        success: false,
        message: "Request contains invalid characters.",
      });
    }
  }
  next();
};

// ─── Request Size Guard ───────────────────────────────────────────────────────
// Extra check beyond express.json({ limit }) — catches edge cases
// where Content-Length header is spoofed.
const guardRequestSize = (maxKb = 10) => (req, res, next) => {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > maxKb * 1024) {
    return res.status(413).json({
      success: false,
      message: `Request body too large. Maximum allowed is ${maxKb}KB.`,
    });
  }
  next();
};

// ─── Security Headers (supplement to Helmet) ─────────────────────────────────
// Adds a few extra headers that Helmet doesn't set by default.
const additionalSecurityHeaders = (req, res, next) => {
  // Prevent browsers from sniffing away from the declared content-type
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Restrict referrer info
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Remove server fingerprint
  res.removeHeader("X-Powered-By");
  // Permissions policy — restrict dangerous browser features
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=(), payment=()"
  );
  next();
};

// ─── IP Logger (for suspicious activity tracking) ────────────────────────────
// Logs auth attempts with IP for monitoring.
// In production you'd pipe this to a logging service.
const logAuthAttempt = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  console.log(`[AUTH] ${req.method} ${req.path} from ${ip} at ${new Date().toISOString()}`);
  next();
};

module.exports = {
  mongoSanitize,
  preventHPP,
  detectSuspiciousPayload,
  guardRequestSize,
  additionalSecurityHeaders,
  logAuthAttempt,
};
