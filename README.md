# SalesMind AI

> AI-powered Sales Assistant for SMEs — MERN Stack + OpenAI

---

## Phase 1: Authentication & Setup 

This phase includes:
- Full Express backend with JWT authentication (access + refresh tokens)
- HTTP-only cookie-based refresh tokens
- bcrypt password hashing (12 salt rounds)
- Helmet, CORS, rate limiting, XSS sanitization
- Joi input validation
- React frontend with Vite + Tailwind CSS
- Login / Signup pages with password strength meter
- Auth context with auto session restore
- Protected routes
- Token refresh interceptor in Axios

---

## Project Structure

```
salesmind-ai/
├── server/
│   ├── controllers/    authController.js
│   ├── middleware/     authMiddleware.js
│   ├── models/         User.js
│   ├── routes/         authRoutes.js
│   ├── utils/          connectDB.js, tokenUtils.js, validators.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
└── client/
    ├── src/
    │   ├── components/   ProtectedRoute.jsx, ui/index.jsx
    │   ├── context/      AuthContext.jsx
    │   ├── pages/        LoginPage.jsx, SignupPage.jsx, DashboardPage.jsx
    │   ├── services/     api.js, authService.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Setup Instructions

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Fill in your MongoDB URI and JWT secrets in .env
npm run dev
```

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on: http://localhost:5173  
Backend runs on: http://localhost:5000

---

## API Endpoints (Phase 1)

| Method | Endpoint           | Description                  | Auth |
|--------|--------------------|------------------------------|------|
| POST   | /api/auth/signup   | Register new user            | No   |
| POST   | /api/auth/login    | Login, get tokens            | No   |
| POST   | /api/auth/logout   | Clear session                | No   |
| POST   | /api/auth/refresh  | Refresh access token         | Cookie |
| GET    | /api/auth/me       | Get current user             | Yes  |
| GET    | /api/health        | Server health check          | No   |

---

## Security Checklist (Phase 1)

- [x] Helmet.js for HTTP security headers
- [x] CORS with strict origin whitelist
- [x] Rate limiting (100 req/15min global, 10 req/15min for auth)
- [x] XSS sanitization via xss-clean
- [x] Joi input validation on all auth endpoints
- [x] bcrypt with 12 salt rounds
- [x] JWT stored in HTTP-only cookies (refresh) + memory/Authorization header (access)
- [x] Refresh token rotation on every use
- [x] Refresh token invalidated on logout
- [x] Password never returned in API responses (select: false)
- [x] Secrets stored in .env (never hardcoded)
- [x] Request body size limited to 10kb

---

## Coming Next

- **Phase 2**: Lead Management — Add/Edit/Delete leads with status tags (Completed)
- **Phase 3**: AI Outreach & Follow-up Generator (under review)
- **Phase 4**: Lead Scoring (0–100) 
- **Phase 5**: Full Dashboard & Analytics
- **Phase 6**: Security hardening pass
- **Phase 7**: UI polish & responsive design
