# Deployment Guide (Free Tier)

This project can be deployed for free using **Vercel** (Frontend) and **Render** (Backend).

## 1. Backend Deployment (Render)
We will deploy the Python FastAPI backend first to get the URL.

1.  Create an account on [Render.com](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Select the `Link-Email-Authenticator` repo.
5.  **Settings**:
    -   **Name**: `link-email-auth-backend`
    -   **Runtime**: Python 3
    -   **Root Directory**: `backend` (Important! Check under "Advanced")
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6.  Click **Create Web Service**.
7.  Wait for deployment. Copy the URL (e.g., `https://link-email-auth-backend.onrender.com`).

> **Note**: The free tier spins down after inactivity. The first request might take 50s.

## 2. Frontend Deployment (Vercel)
Now deploy the React frontend.

1.  Create an account on [Vercel.com](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import the `Link-Email-Authenticator` repo.
4.  **Configure Project**:
    -   **Framework Preset**: Vite
    -   **Root Directory**: `frontend` (Click Edit to select).
    -   **Environment Variables**:
        -   Name: `VITE_API_BASE_URL`
        -   Value: `https://link-email-auth-backend.onrender.com` (The URL from Step 1).
5.  Click **Deploy**.
6.  Your app is live!

---

## Alternative: Docker Deployment
If you prefer Docker, you can deploy the `backend` Dockerfile directly on Render.

1.  Select **Runtime**: Docker.
2.  Render will look for the `Dockerfile` in the `backend` directory.
