# Deployment Instructions

This guide provides step-by-step instructions for deploying the **IDURAR ERP CRM** application. The primary supported deployment method is **Railway.app** via GitHub Actions for automated CI/CD.

---

## 🚀 Railway Deployment (Recommended)

Automated deployment to Staging and Production environments is configured using GitHub Actions.

### 1. Prerequisites

1.  **Railway Account**: Sign up at [Railway.app](https://railway.app/).
2.  **GitHub Repository**: Ensure you have admin access to this repository.
3.  **Railway CLI** (Optional): Useful for local debugging (`npm i -g @railway/cli`).

### 2. Railway Project Setup

You need to set up a project in Railway to host your services.

1.  **Create a New Project** in Railway.
2.  **Create Environments**:
    *   Renamed default environment to `Staging`.
    *   Create a new environment named `Production`.

### 3. Service Configuration

You must create two services in your Railway project: one for the **Backend** and one for the **Frontend**.

#### A. Backend Service
1.  **Create Service**: Select "GitHub Repo" and choose this repository.
2.  **Settings**:
    *   **Root Directory**: `/backend` (**Important**: This directs Railway to the Node.js app).
    *   **Name**: `backend` (Staging) / `backend-production` (Production).
3.  **Variables** (Environment Variables):
    *   `PORT`: `8888`
    *   `DATABASE`: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>` (Your MongoDB connection string).
    *   `JWT_SECRET`: `your_secure_random_secret`.
    *   `NODE_ENV`: `production`.

#### B. Frontend Service
1.  **Create Service**: Select "GitHub Repo" and choose this repository again.
2.  **Settings**:
    *   **Root Directory**: `/frontend` (**Important**: This directs Railway to the Vite React app).
    *   **Name**: `frontend` (Staging) / `frontend-production` (Production).
3.  **Variables**:
    *   `PORT`: `80` (Nginx listens on port 80).
    *   `VITE_BACKEND_SERVER`: The URL of your **Backend Service** (e.g., `https://backend-production.up.railway.app/`). **MUST end with a trailing slash `/`**.
4.  **Networking**:
    *   Go to "Settings" -> "Domains" and generate/add a domain (e.g., `idurar-frontend.up.railway.app`).

### 4. GitHub Actions Configuration

To enable the automated pipeline `cicd-pipeline.yml`, you must add secrets to your GitHub repository.

1.  Go to **Settings** -> **Secrets and variables** -> **Actions** in your GitHub repo.
2.  Add the following **Repository Secrets**:
    *   `RAILWAY_TOKEN_STAGING`: A Railway API token for the *Staging* environment. (Get this from Railway Project Settings -> Tokens).
    *   `RAILWAY_TOKEN_PRODUCTION`: A Railway API token for the *Production* environment.

### 5. Deployment Workflow

The CI/CD pipeline (`.github/workflows/cicd-pipeline.yml`) operates as follows:

1.  **Push to `main` branch**:
    *   Runs Unit Tests (verify code integrity).
    *   Runs Integration Tests (verify API interactions).
    *   **Automatically deploys** to the **Staging** environment.

2.  **Deployment to Production**:
    *   Triggered after Staging deployment succeeds.
    *   Requires **Manual Approval** if utilizing GitHub Environments protections (Recommended).
    *   Deploys to the **Production** environment.

---

## 🐳 Docker Local Deployment

You can run the application locally using Docker Compose.

1.  **Build and Run**:
    ```bash
    docker-compose up --build
    ```
2.  **Access**:
    *   Frontend: `http://localhost:3000`
    *   Backend: `http://localhost:8888`

---

## 📝 Manual Deployment (Legacy)

If you are deploying manually to a VPS (Ubuntu/Debian):

1.  **Backend**:
    ```bash
    cd backend
    npm install
    npm run build
    pm2 start src/server.js --name "idurar-backend"
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run build
    # Serve the 'dist' folder using Nginx/Apache
    ```
