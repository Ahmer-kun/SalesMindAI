# SalesMind AI

> AI-powered Sales Assistant for SMEs — MERN Stack + OpenAI/HuggingFace

---

## What it does

- **Lead Management** — Add, edit, delete and filter leads with Hot/Warm/Cold status + pagination
- **AI Outreach Generator** — Personalized first-touch sales emails written by AI
- **AI Follow-up Generator** — Smart follow-ups based on conversation history
- **Lead Scoring** — AI scores every lead 0–100 with reasoning, strengths and concerns
- **AI Message History** — View all AI-generated messages per lead
- **Dashboard & Analytics** — Pipeline charts, lead trends, AI usage stats
- **Authentication** — JWT + HTTP-only cookies, Google OAuth, MFA via email, email verification
- **Account Settings** — Update profile, username, change password, toggle MFA, delete account

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt + Passport.js (Google OAuth) |
| AI | OpenAI API / HuggingFace (Groq provider) |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet, CORS, rate limiting, XSS clean, NoSQL sanitize |

---

## Project Structure

```
salesmind-ai/
├── server/
│   ├── controllers/     authController, leadController, aiController,
│   │                    analyticsController, userController, passwordResetController
│   ├── middleware/      authMiddleware, securityMiddleware, passportConfig
│   ├── models/          User, Lead
│   ├── routes/          authRoutes, leadRoutes, aiRoutes, analyticsRoutes,
│   │                    userRoutes, passwordResetRoutes, googleAuthRoutes
│   ├── services/        aiService
│   ├── utils/           connectDB, tokenUtils, validators, leadValidators, emailService
│   └── index.js
│
├── client/src/
│   ├── components/      LeadCard, LeadForm, LeadSelector, GeneratedMessage,
│   │                    ScoreDisplay, MiniChart, AIHistoryModal,
│   │                    layout/AppLayout, ui/ (Input, Button, Alert, Logo,
│   │                    StatusBadge, Modal)
│   ├── context/         AuthContext, ToastContext
│   ├── hooks/           useLeads, useAI, useAnalytics
│   ├── pages/           Login, Signup, Dashboard, Leads, AITools, Analytics,
│   │                    Settings, ForgotPassword, ResetPassword, MFA,
│   │                    VerifyEmail, GoogleAuthSuccess, CompleteProfile
│   └── services/        api, authService, leadService, aiService,
│                        analyticsService, userService
│
├── SECURITY.md
├── DEPLOYMENT.md
└── README.md
```

---

## Local Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env   # fill in all values
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5000

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/salesmind
JWT_ACCESS_SECRET=64_char_random_hex
JWT_REFRESH_SECRET=different_64_char_random_hex
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## Authentication Flows

**Email + Password:** Signup → verify email → login → (MFA if enabled) → dashboard

**Google OAuth (new user):** Click Google → consent → complete profile (set username) → dashboard

**Google OAuth (existing user):** Click Google → consent → dashboard

**MFA:** Login → OTP sent to email → enter 6-digit code → dashboard

**Forgot Password:** Login → "Forgot password?" → email → reset link → new password → login

---

## API Summary

| Prefix | Description |
|---|---|
| `/api/auth` | Signup, login, logout, refresh, verify email, MFA, Google OAuth |
| `/api/password` | Forgot password, validate token, reset password |
| `/api/leads` | CRUD + pagination + status + search/filter |
| `/api/ai` | Outreach, follow-up, scoring, message history |
| `/api/analytics` | Dashboard stats, pipeline, trends |
| `/api/user` | Profile, password, delete account, complete profile |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel + Render + MongoDB Atlas (all free tiers).

## Security

See [SECURITY.md](./SECURITY.md) — full audit checklist.