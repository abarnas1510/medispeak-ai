# Deploying MediSpeak AI to Render

This full-stack application (React 19 + Vite frontend + Express Node.js backend) is pre-configured for Render.

---

## Option 1: Automatic Blueprint Deployment (Recommended)

1. Push this repository to **GitHub** or **GitLab**.
2. Go to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically read `render.yaml`:
   - **Service Name**: `medispeak-ai`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Add your **Environment Variable**:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API Key)*
7. Click **Apply**. Render will build and deploy the app.

---

## Option 2: Manual Web Service Deployment

If you prefer to configure manually on Render:

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your Git repository.
3. Fill in the following settings:

| Setting | Value |
| :--- | :--- |
| **Name** | `medispeak-ai` |
| **Region** | Any (e.g. *Singapore*, *Oregon*, or *Frankfurt*) |
| **Branch** | `main` |
| **Root Directory** | *(leave blank)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

4. Scroll down to **Environment Variables** and add:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Paste your Gemini API key)*
   *(Note: Render automatically injects `PORT`, which the backend binds to dynamically).*

5. Click **Create Web Service**.

---

## Verification After Deployment

Once deployed, visit your Render URL (e.g., `https://medispeak-ai.onrender.com`):
- Frontend will load instantly from `dist/`.
- Medical translations will use Gemini 3.8 Flash via `/api/simplify`, with offline dictionary fallback.
- Health check endpoint is available at: `/api/health`.
