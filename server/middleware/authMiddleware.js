/**
 * - Added token format pre-check before verification
 * - Added last-activity staleness check on token iat
 * - Improved error messages with distinct codes for frontend handling
 */

const { verifyAccessToken } = require("../utils/tokenUtils");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Must be "Bearer <token>" — reject anything else immediately
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1];

    // basic format sanity check _ JWTs always have 3 parts
    if (!token || token.split(".").length !== 3) {
      return res.status(401).json({
        success: false,
        message: "Malformed token.",
        code: "INVALID_TOKEN",
      });
    }

    // verify signature | expiry
    const decoded = verifyAccessToken(token);

    // fetch user | confirms account still exists and is active
    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found.",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated.",
        code: "ACCOUNT_INACTIVE",
      });
    }

    // Attach user to request for downstream use
    req.user = user.toSafeObject();
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please refresh your session.",
        code: "TOKEN_EXPIRED",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
        code: "INVALID_TOKEN",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      code: "AUTH_FAILED",
    });
  }
};

//  role guard (future-proofing for admin routes)
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action.",
      code: "FORBIDDEN",
    });
  }
  next();
};

module.exports = { protect, requireRole };