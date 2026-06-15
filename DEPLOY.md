# 🚀 Deploying Notminelap Industries — 24/7 Guide

## Architecture
One single Render service runs the Express server, which:
- Hosts the Node.js API at `/api/...`
- Serves the built React frontend from `/dist/`
- Auto-seeds the admin account on startup

Data is stored in **MongoDB Atlas** (free, persistent forever).

---

## Step 1 — Create a Free MongoDB Atlas Database

1. Go to → **https://cloud.mongodb.com** and sign up (free)
2. Create a **Free Cluster** (M0, any region — Singapore is closest to India)
3. When prompted, add a **database user** (username + password — save these!)
4. Under **Network Access**, click **Add IP Address** → choose **Allow Access from Anywhere** (0.0.0.0/0)
5. Click **Connect** → **Drivers** → select **Node.js**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
   ```
7. Change `/?` to `/notminelap-industries?` to specify the database name:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/notminelap-industries?retryWrites=true&w=majority
   ```
   ✅ Keep this string ready.

---

## Step 2 — Deploy to Render

1. Go to → **https://render.com** and sign up (free)
2. Click **New** → **Web Service**
3. Connect your GitHub account and select the `perfect-ergonomics` repo
4. Render will auto-detect `render.yaml` — click **Apply**
5. Before deploying, go to **Environment** and add:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | *(paste your Atlas connection string)* |
   | `JWT_SECRET` | *(any random string)* |
   | `ADMIN_USERNAME` | `notminelap` |
   | `ADMIN_PASSWORD` | `9334246278@` |
6. Click **Deploy** — the server auto-seeds the admin account on startup

---

## Local Development

```powershell
npm run dev
```
Runs both the Vite dev server and the Node.js server concurrently.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | Secret for JWT token signing |
| `ADMIN_USERNAME` | No | Admin username (default: notminelap) |
| `ADMIN_PASSWORD` | No | Admin password |
| `RAZORPAY_KEY_ID` | No | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | No | Razorpay API secret |
| `PORT` | No | Server port (Render sets this automatically) |
