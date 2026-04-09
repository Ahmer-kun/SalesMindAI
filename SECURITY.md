# SalesMind AI — Security Checklist

Complete security audit across all phases.

---

## Authentication & Sessions

- [x] Passwords hashed with bcrypt (12 salt rounds)
- [x] JWT access tokens — short-lived (15 minutes)
- [x] JWT refresh tokens — HTTP-only cookie, 7 days
- [x] Refresh token rotation on every use
- [x] Refresh token invalidated in DB on logout
- [x] Token format pre-validated before verification (3-part JWT check)
- [x] Account existence re-verified on every protected request
- [x] Account deactivation check on login
- [x] Generic error messages on login (no email enumeration)
- [x] `select: false` on password and refreshToken fields in User model
- [x] `requireRole()` middleware ready for future admin routes

---

## Transport & Headers

- [x] Helmet.js — sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- [x] HSTS — 1 year, includeSubDomains, preload
- [x] Content Security Policy — restrictive default-src: self
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy — disables camera, mic, geolocation, payment
- [x] X-Powered-By header removed
- [x] CORS — strict origin whitelist, not wildcard *
- [x] CORS preflight cached (maxAge: 600)

---

## Input Validation & Sanitization

- [x] Joi schema validation on all auth endpoints
- [x] Joi schema validation on all lead endpoints
- [x] `stripUnknown: true` — extra fields silently dropped
- [x] XSS clean — strips HTML/JS from all string fields
- [x] NoSQL injection sanitization — strips `$` and `.` from inputs
- [x] HTTP Parameter Pollution prevention — deduplicates repeated params
- [x] Suspicious payload pattern scanner — blocks `$where`, `$function`, script tags, event handlers
- [x] Request body size limited to 10KB (express + middleware guard)
- [x] Phone number format validation (regex)
- [x] Password max length enforced (prevents bcrypt DoS via huge strings)
- [x] Email max length enforced (RFC 5321: 254 chars)

---

## Rate Limiting

- [x] Global limiter: 100 requests per 15 minutes per IP
- [x] Auth limiter: 10 requests per 15 minutes (skipSuccessfulRequests: true)
- [x] AI limiter: 30 requests per hour per IP (protects API costs)

---

## Database Security

- [x] All lead queries scoped to `req.user._id` — cross-user data access impossible
- [x] `findOneAndUpdate` with user filter on update/delete — prevents IDOR
- [x] Mongoose `runValidators: true` on updates
- [x] No raw user input passed directly to MongoDB queries
- [x] Duplicate email check before user creation
- [x] Compound index on `{ user, createdAt }` — no full collection scans
- [x] MongoDB connection error handling — server exits on DB failure

---

## Secrets Management

- [x] All secrets in `.env` — never hardcoded
- [x] `.env` in `.gitignore`
- [x] `.env.example` committed (no real values)
- [x] Separate JWT secrets for access and refresh tokens
- [x] AI API key checked before use — clear error if missing

---

## Error Handling

- [x] Stack traces hidden in production (`NODE_ENV=production`)
- [x] Generic error messages in production (no internal info leaked)
- [x] Global Express error handler catches unhandled errors
- [x] 404 handler for unknown routes
- [x] Auth attempt logging (IP + timestamp)

---

## Production Checklist (before deploying)

- [ ] Set `NODE_ENV=production` on Render/Railway
- [ ] Set `CLIENT_URL` to your Vercel domain (exact URL, no trailing slash)
- [ ] Generate fresh JWT secrets (don't reuse dev secrets)
- [ ] Confirm MongoDB Atlas IP whitelist includes Render's IPs (or set 0.0.0.0/0 with strong auth)
- [ ] Enable MongoDB Atlas alerts for unusual activity
- [ ] Review Render logs after first deploy for any startup errors
- [ ] Test CORS by hitting the API from the Vercel domain
- [ ] Rotate secrets if they were ever committed to git accidentally

---

## Known Acceptable Risks (for MVP/free tier)

| Risk | Mitigation | Notes |
|---|---|---|
| Rate limiter uses in-memory store | Resets on server restart | Use Redis store for multi-instance production |
| No email verification on signup | Users are trusted | Add Nodemailer verification in v2 |
| Render free tier sleeps after 15min idle | First request takes ~30s to wake | Upgrade to paid tier for production |
| OpenAI key exposed if server is compromised | Keep key minimal scope, monitor usage | Rotate immediately if leaked |
