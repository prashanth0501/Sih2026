# Deployment Guide: Cloudflare Pages (Frontend) & Render (Backend)

This guide provides step-by-step instructions to deploy the **Ignite — SIH 2026 Portal** live to production:
- **Frontend**: Cloudflare Pages (Free Tier)
- **Backend**: Render Web Service (Free Tier)
- **Database**: MongoDB Atlas (Free Tier)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Log in or create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **M0 Free Cluster**.
3. Under **Database Access**, create a Database User (e.g. `sih_admin`) with a strong password.
4. Under **Network Access**, add an IP access rule for `0.0.0.0/0` (allows Render backend to connect).
5. Copy your connection string from **Connect → Drivers → Python**:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## 🚀 Step 2: Deploy Backend to Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository `https://github.com/Partha-Shankar/Sih2026`.
4. Configure the service parameters:
   - **Name**: `ignite-sih-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `MONGODB_URI`: *Your MongoDB Atlas connection string from Step 1*
   - `MONGODB_DB_NAME`: `ignite_sih`
   - `JWT_SECRET`: *A secure random string (e.g. `openssl rand -hex 32`)*
   - `CORS_ORIGINS`: `["https://*.pages.dev", "http://localhost:5173"]` *(Or your custom Cloudflare domain once created)*
6. Click **Create Web Service**. Note down your deployed backend URL (e.g. `https://ignite-sih-api.onrender.com`).

---

## ⚡ Step 3: Deploy Frontend to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2. Click **Create Application** → **Pages** → **Connect to Git**.
3. Select your repository `Partha-Shankar/Sih2026`.
4. Configure the build settings:
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Under **Environment Variables (Advanced)** during setup, add:
   - `VITE_API_URL`: `https://ignite-sih-api.onrender.com/api/v1` *(Your Render backend URL + `/api/v1`)*
6. Click **Save and Deploy**.

> 💡 **SPA Routing**: The `frontend/public/_redirects` file (`/* /index.html 200`) ensures client-side routing works smoothly across all public and admin pages.

---

## 🔒 Post-Deployment Checklist

1. **Verify Backend Status**: Visit `https://your-render-url.onrender.com/docs` to test Swagger UI endpoints.
2. **Verify Frontend**: Navigate through your Cloudflare Pages domain (e.g. `https://sih2026.pages.dev`).
3. **Logins & Admin Gate**:
   - Test registration at `/register`.
   - Test coordinator login at `/login` with credentials.
   - Verify `/admin` gate & screening console.
