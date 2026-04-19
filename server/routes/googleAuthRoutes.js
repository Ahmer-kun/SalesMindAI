const express  = require("express");
const router   = express.Router();
const passport = require("../middleware/passportConfig");
const { setRefreshTokenCookie } = require("../utils/tokenUtils");

// step 1: redirects to Google consent screen
router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

// step 2: gooogle calls back here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  (req, res) => {
    const { user, jwtAccess, jwtRefresh, isNewUser } = req.user;

    // set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, jwtRefresh);

    // Send token + flags to frontend via redirect
    const params = new URLSearchParams({
      token:     jwtAccess,
      isNewUser: isNewUser ? "true" : "false",
    });

    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?${params}`);
  }
);

module.exports = router;