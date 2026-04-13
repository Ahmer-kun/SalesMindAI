# SalesMind AI — Deployment Guide

Step-by-step instructions to deploy on the free tier stack:
**Frontend → Vercel | Backend → Render | Database → MongoDB Atlas**

---

## Step 1 — MongoDB Atlas (Database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **free M0 cluster** (choose any region close to your users)
3. Under **Database Access** → Add a new database user:
   - Username: `salesmind`
   - Password: generate a strong password (save it)
   - Role: **Read and write to any database**
4. Under **Network Access** → Add IP Address → `0.0.0.0/0` (allow all — fine for free tier)
5. Click **Connect** on your cluster → **Connect your application**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://salesmind:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password and add your DB name:
   ```
   mongodb+srv://salesmind:yourpassword@cluster0.xxxxx.mongodb.net/salesmind?retryWrites=true&w=majority
   ```
8. Save this — it goes into `MONGODB_URI` on Render

---

## Step 2 — Backend on Render

1. Go to [https://render.com](https://render.com) and sign up (free)
2. Click **New** → **Web Service**
3. Connect your GitHub repo and select it
4. Configure the service:

   | Setting | Value |
   |---|---|
   | **Name** | `salesmind-api` |
   | **Root Directory** | `server` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node index.js` |
   | **Instance Type** | Free |

5. Scroll to **Environment Variables** and add ALL of these:

   ```
   NODE_ENV            = production
   PORT                = 5000
   MONGODB_URI         = mongodb+srv://salesmind:...your full URI...
   JWT_ACCESS_SECRET   = <generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   JWT_REFRESH_SECRET  = <generate a different one>
   JWT_ACCESS_EXPIRES_IN  = 15m
   JWT_REFRESH_EXPIRES_IN = 7d
   CLIENT_URL          = https://your-app-name.vercel.app
   OPENAI_API_KEY      = sk-...  (or leave blank to use HuggingFace)
   HUGGINGFACE_API_KEY = hf_...  (free fallback)
   ```

   > ⚠️ Set `CLIENT_URL` to your Vercel URL **before** deploying frontend.
   > You can update it after and redeploy.

6. Click **Create Web Service** — Render will build and deploy
7. Copy your Render URL: `https://salesmind-api.onrender.com`

---

## Step 3 — Frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New** → **Project** → Import your repo
3. Configure:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `client` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

4. Add **Environment Variables**:

   ```
   VITE_API_URL = https://salesmind-api.onrender.com
   ```

5. Click **Deploy**
6. Copy your Vercel URL: `https://your-app-name.vercel.app`

---

## Step 4 — Connect Frontend to Backend

The Vite proxy only works in local dev. For production, update the Axios base URL.

**Edit `client/src/services/api.js`** — change the baseURL:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
```

Then redeploy the frontend on Vercel.

---

## Step 5 — Update CORS on Backend

Go back to **Render** → your service → **Environment** → update:

```
CLIENT_URL = https://your-actual-vercel-url.vercel.app
```

Click **Save Changes** — Render will auto-redeploy.

---

## Step 6 — Verify Everything Works

Test these in order:

```bash
# 1. Health check
curl https://salesmind-api.onrender.com/api/health

# 2. Signup
curl -X POST https://salesmind-api.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test1234"}'

# 3. Open your Vercel URL in a browser and log in
```

---

## Free Tier Limits & Notes

| Service | Free Limit | Notes |
|---|---|---|
| **MongoDB Atlas** | 512MB storage | Enough for thousands of leads |
| **Render** | 750 hrs/month | Sleeps after 15min idle — first request ~30s |
| **Vercel** | 100GB bandwidth | More than enough |
| **OpenAI** | $5 free credit | ~500-1000 AI messages |
| **HuggingFace** | Unlimited (free) | Slower, slightly lower quality |

### Render cold start fix
Add this to your frontend to wake Render on app load:

```js
// In client/src/App.jsx, add inside AuthProvider useEffect:
fetch(`${import.meta.env.VITE_API_URL}/api/health`).catch(() => {});
```

This pings the server when the user opens the app, so it's warm by the time they log in.

---

## Custom Domain (Optional, Free on Vercel)

1. In Vercel → your project → **Settings** → **Domains**
2. Add your domain (e.g. `app.salesmind.ai`)
3. Update your domain DNS with the CNAME Vercel gives you
4. Update `CLIENT_URL` on Render to match your custom domain

---

## Environment Variables Checklist

### Render (Backend)
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` — full Atlas connection string
- [ ] `JWT_ACCESS_SECRET` — 64-byte random hex
- [ ] `JWT_REFRESH_SECRET` — different 64-byte random hex
- [ ] `JWT_ACCESS_EXPIRES_IN=15m`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`
- [ ] `CLIENT_URL` — exact Vercel URL, no trailing slash
- [ ] `OPENAI_API_KEY` or `HUGGINGFACE_API_KEY`

### Vercel (Frontend)
- [ ] `VITE_API_URL` — your Render URL, no trailing slash
