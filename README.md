# SalesMind AI

> AI-powered Sales Assistant for SMEs — MERN Stack + OpenAI/HuggingFace

---

## What it does

- **Lead Management** — Add, edit, delete and filter leads with Hot/Warm/Cold status
- **AI Outreach Generator** — Personalized first-touch sales emails written by AI
- **AI Follow-up Generator** — Smart follow-up messages based on conversation history
- **Lead Scoring** — AI scores every lead 0–100 with reasoning, strengths and concerns
- **Dashboard & Analytics** — Pipeline charts, lead trends, AI usage stats
- **Secure Auth** — JWT access tokens + HTTP-only refresh token cookies

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| AI | OpenAI API (HuggingFace fallback) |
| Security | Helmet, CORS, rate limiting, XSS clean, NoSQL sanitize |

---

## Project Structure

```
salesmind-ai/
├── server/
│   ├── controllers/     authController, leadController, aiController, analyticsController
│   ├── middleware/      authMiddleware, securityMiddleware
│   ├── models/          User, Lead
│   ├── routes/          authRoutes, leadRoutes, aiRoutes, analyticsRoutes
│   ├── services/        aiService (OpenAI + HuggingFace)
│   ├── utils/           connectDB, tokenUtils, validators, leadValidators
│   ├── index.js
│   └── .env.example
│
├── client/
│   ├── public/          favicon.svg
│   └── src/
│       ├── components/  LeadCard, LeadForm, LeadSelector, GeneratedMessage,
│       │                ScoreDisplay, MiniChart, layout/AppLayout,
│       │                ui/ (Input, Button, Alert, Logo, StatusBadge, Modal)
│       ├── context/     AuthContext, ToastContext
│       ├── hooks/       useLeads, useAI, useAnalytics
│       ├── pages/       Login, Signup, Dashboard, Leads, AITools, Analytics
│       └── services/    api, authService, leadService, aiService, analyticsService
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
cp .env.example .env
# Fill in MONGODB_URI, JWT secrets, and AI API key
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

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/refresh | Refresh access token |
| GET  | /api/auth/me | Get current user |

### Leads
| Method | Endpoint | Description |
|---|---|---|
| GET    | /api/leads | List leads (filter/search/sort) |
| POST   | /api/leads | Create lead |
| GET    | /api/leads/:id | Get single lead |
| PUT    | /api/leads/:id | Update lead |
| DELETE | /api/leads/:id | Delete lead |
| PATCH  | /api/leads/:id/status | Quick status update |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/ai/outreach | Generate outreach email |
| POST | /api/ai/followup | Generate follow-up |
| POST | /api/ai/score | Score a lead (0–100) |
| GET  | /api/ai/history/:leadId | AI message history |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/analytics | Full dashboard data |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions:
- **Frontend** → Vercel (free)
- **Backend** → Render (free)
- **Database** → MongoDB Atlas (free)

---

## Security

See [SECURITY.md](./SECURITY.md) for the full security audit checklist.

Highlights:
- bcrypt (12 salt rounds)
- JWT in HTTP-only cookies
- Helmet + HSTS + CSP
- NoSQL injection sanitization
- XSS clean
- Rate limiting (global + auth + AI)
- Input validation via Joi on all endpoints

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...
```