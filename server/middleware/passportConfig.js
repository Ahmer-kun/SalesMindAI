const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User           = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenUtils");

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value;
        const name   = profile.displayName;
        const avatar = profile.photos?.[0]?.value || "";

        if (!email) {
          return done(new Error("No email returned from Google."), null);
        }

        let isNewUser = false;

        // 1. Find by googleId
        let user = await User.findOne({ googleId: profile.id });

        // 2. Find by email — existing local account, link Google to it
        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId        = profile.id;
            user.avatar          = user.avatar || avatar;
            user.isEmailVerified = true;
            // Don't change authProvider — they signed up locally
            await user.save({ validateBeforeSave: false });
          }
        }

        // 3. Brand new user via Google
        if (!user) {
          isNewUser = true;
          user = await User.create({
            name,
            email,
            googleId:        profile.id,
            avatar,
            authProvider:    "google",
            isEmailVerified: true,  // Google pre-verifies email
            profileComplete: false, // needs to set username
          });
        }

        const jwtAccess  = generateAccessToken(user._id);
        const jwtRefresh = generateRefreshToken(user._id);

        user.refreshToken = jwtRefresh;
        await user.save({ validateBeforeSave: false });

        return done(null, { user, jwtAccess, jwtRefresh, isNewUser });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;