# How to Run the Project Locally

This guide provides step-by-step instructions for setting up and running the **Ignite — SIH 2026 Portal** on your local machine.

---

## 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: `v20.0.0` or higher (includes `npm`)
- **Python**: `3.11` or higher (Python 3.14 tested)
- **Git**: Installed and configured

> 💡 **Note**: No external database (e.g., PostgreSQL or MongoDB) installation is required to run the project locally. The backend utilizes an in-memory database store populated with seed data for instant setup.

---

## 🛠️ Step 1: Set Up & Run Backend

Open your terminal and navigate to the `backend/` directory:

```bash
cd backend
```

### 1. Create a Python Virtual Environment

- **Windows (PowerShell / Command Prompt)**:
  ```powershell
  python -m venv venv
  ```
- **macOS / Linux**:
  ```bash
  python3 -m venv venv
  ```

### 2. Activate the Virtual Environment

- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(If PowerShell blocks script execution, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*

- **Windows (Command Prompt)**:
  ```cmd
  .\venv\Scripts\activate.bat
  ```

- **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI Dev Server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

The backend server will start running at:
- **API Server Base URL**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Docs (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 💻 Step 2: Set Up & Run Frontend

Open a **new terminal window or tab** and navigate to the `frontend/` directory:

```bash
cd frontend
```

### 1. Install Node Packages

```bash
npm install
```

### 2. Start the Vite Development Server

```bash
npm run dev
```

The frontend application will start running at:
- **Web Application URL**: [http://localhost:5173](http://localhost:5173)

> ⚡ **Important**: Both the **backend (Port 8000)** and **frontend (Port 5173)** servers **must be running simultaneously**. Vite automatically proxies requests from `/api/*` to `http://localhost:8000`.

---

## 🔑 Demo & Testing Credentials

You can test the application with pre-seeded test accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Participant (Demo)** | `participant@nagarjuna.edu` | `participant123` | Student Dashboard & Submissions |
| **Coordinator** | `parthashankar21@gmail.com` | *See local `ADMIN_CREDENTIALS.md`* | Admin Console, Screening & Locks |
| **Coordinator** | `nirmithmjain@gmail.com` | *See local `ADMIN_CREDENTIALS.md`* | Admin Console, Screening & Locks |
| **SPOC** | `dr.bhargava@ncetmail.com` | *See local `ADMIN_CREDENTIALS.md`* | Admin Console & Final Approval |

> 📝 **Self-service Registration**: You can also register a new student participant account directly from the UI at [/register](http://localhost:5173/register).

---

## ⚙️ Environment Variables (Optional)

All local default configuration variables are pre-configured in `backend/app/core/config.py`. No `.env` file is strictly required for local testing.

If you wish to override defaults, create a `.env` file inside the `backend/` directory:

```env
JWT_SECRET=your_custom_development_secret_key
CORS_ORIGINS=["http://localhost:5173"]
```

---

## 🧪 Verification & Typechecking

To verify that the frontend codebase is clean without starting the dev server:

```bash
cd frontend
npx tsc --noEmit -p tsconfig.app.json
```

---

## ❓ Troubleshooting

1. **Port 8000 or 5173 is already in use**:
   - Check if another service or terminal session is running on those ports and stop it, or change the port flags in `uvicorn` / `vite.config.ts`.
2. **CORS / API Network Errors**:
   - Ensure the FastAPI backend server is running on `http://localhost:8000` before interacting with authenticated features in the frontend.
3. **Execution Policy error on Windows**:
   - Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in your PowerShell terminal.
