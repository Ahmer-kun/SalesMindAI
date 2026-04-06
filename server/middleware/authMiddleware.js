/**
 * authMiddleware.js
 * Protects routes by verifying JWT access token from Authorization header.
 * Attaches the authenticated user's ID to req.user for downstream use.
 */

const { verifyAccessToken } = require("../utils/tokenUtils");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // Extract token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token signature and expiry
    const decoded = verifyAccessToken(token);

    // Check the user still exists in DB (handles deleted accounts)
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or account deactivated.",
      });
    }

    // Attach safe user info to request
    req.user = user.toSafeObject();
    next();
  } catch (error) {
    // Distinguish token errors for better UX
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please refresh your session.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
    });
  }
};

module.exports = { protect };
