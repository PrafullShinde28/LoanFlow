# LOANFLOW — Smart Loan Application Management & Underwriting Engine

[![Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Language](https://img.shields.io/badge/Language-Pure%20JavaScript-yellow.svg)](https://developer.mozilla.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](https://www.mongodb.com/atlas)
[![UI](https://img.shields.io/badge/Design-Fintech%20SaaS-0F172A.svg)](https://tailwindcss.com/)

**LOANFLOW** is an end-to-end, multi-tenant capable Loan Application Lifecycle Management platform designed for retail and commercial lending institutions. It orchestrates the full operational journey:
$$\text{Customer Enquiry} \rightarrow \text{Application Origination} \rightarrow \text{Document Collection} \rightarrow \text{Document Verification} \rightarrow \text{Quantitative Eligibility Engine} \rightarrow \text{Officer Underwriting} \rightarrow \text{Manager Sanction} \rightarrow \text{Disbursement}$$

Built with **pure JavaScript ES6+ (no TypeScript)** on the modern MERN stack.

---

## 1. Key Business Features

- **Lead Intake & Qualification:** Automated sequence generation (`ENQ-2026-XXXX`), phone qualification, and 1-click lead conversion into a formal loan file.
- **Controlled 9-Stage State Machine:** Hard transition gates preventing arbitrary or skip-stage transitions.
- **Dual-Control Credit Governance:** Loan Officer appraisal dossier followed by independent Branch Manager executive approval.
- **Deterministic Financial Eligibility Engine:**
  - Reducing-balance monthly installment formula:
    $$\text{EMI} = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$
    Programmatic notation: `EMI = P * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1)`
  - Parameterized Debt-to-Income ($DTI$) policy check: configurable per loan product (`maxDtiPercent`, e.g., 50% for Personal Loan, 55% for Home Loan, 45% for Vehicle Loan).
- **Document Verification & Exception Handling:** Quarantined multi-file uploads (PDF, JPG, PNG up to 5MB), underwriter approval, rejection with mandatory actionable justification, and real-time customer re-upload workbench.
- **Sanction Letter Decree (`SANC-2026-XXXX`):** Customizable sanctioned amount, tenure, and APR.
- **Fund Disbursement Processing (`DISB-2026-XXXX`):** Disburses approved funds with transaction UTR tracking. Hard constraint: disbursement amount cannot exceed sanctioned ceiling.
- **Immutable Status History Timeline:** Vertical chronological audit log with actor ID, role, timestamp, and comments.
- **Multi-Role Portals:** Tailored workspaces and Recharts analytics dashboards for `CUSTOMER`, `LOAN_OFFICER`, `MANAGER`, and `ADMIN`.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18+ (Vite)
- **Language:** JavaScript ES6+ (`.js`, `.jsx` strictly — zero TypeScript)
- **Styling & UI Kit:** Tailwind CSS, shadcn/ui design patterns, Lucide React icons
- **State & Networking:** TanStack React Query, Axios with JWT request interceptors
- **Visualizations:** Recharts (Distribution & Bar Charts), Canvas-Confetti (Disbursement celebrations)

### Backend
- **Runtime:** Node.js (ES Modules `import/export`)
- **Web Framework:** Express.js
- **Database & ODM:** MongoDB Atlas via Mongoose
- **Security:** Helmet, CORS, Bcrypt.js (10 salt rounds), JWT authentication, Multer MIME-type filters
- **Logging:** Morgan

---

## 3. MongoDB Atlas Setup Guide

To connect LOANFLOW to your cloud database:

1. **Create an Account:** Visit [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in.
2. **Build a Cluster:** Deploy a free M0 Shared Cluster in your preferred region.
3. **Configure Database Access:**
   - Under **Security** $\rightarrow$ **Database Access**, click **Add New Database User**.
   - Choose **Password** authentication (e.g. `loanflow_user` / secure password).
   - Set privileges to **Read and write to any database**.
4. **Configure Network Access (IP Whitelist):**
   - Under **Security** $\rightarrow$ **Network Access**, click **Add IP Address**.
   - Add your current IP or allow access from anywhere (`0.0.0.0/0`) for development.
5. **Get Connection String:**
   - Click **Connect** on your cluster $\rightarrow$ **Drivers** (Node.js).
   - Copy the SRV URI: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/loanflow?retryWrites=true&w=majority`
6. **Set Environment Variable:**
   - Open `backend/.env` and paste your string:
     ```env
     MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/loanflow?retryWrites=true&w=majority
     ```
   *(The backend validates `MONGODB_URL` at boot time and will fail clearly with diagnostics if missing).*

---

## 4. Environment Variables

### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/loanflow?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_loanflow_production_key_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
UPLOAD_DIR=uploads
```

For production, set these values in the hosting provider's environment settings rather than committing a `.env` file. `CLIENT_URL` must be the exact frontend origin (for example, `https://your-app.vercel.app`); multiple origins can be comma-separated. Use a strong, unique `JWT_SECRET` and your live MongoDB Atlas URI.

## 5. Deploying to Vercel and Render

The included `frontend/vercel.json` supports client-side routes on Vercel. The root `render.yaml` configures the API service, its health check, and persistent document storage on Render.

### 1. Prepare MongoDB Atlas

1. Create a production database/user in MongoDB Atlas and allow network access from Render (Atlas' `0.0.0.0/0` rule is the simplest hosted setup, but restrict access further if your deployment supports fixed egress IPs).
2. Copy the application connection URI. Keep its password URL-encoded if it contains special characters.

### 2. Deploy the backend to Render

1. Push this project to a Git provider supported by Render.
2. In Render, create a **Blueprint** from the repository and approve the `render.yaml` configuration. Alternatively, create a Node web service with `backend` as its root directory, `npm install` as its build command, and `npm start` as its start command.
3. Set the `MONGODB_URL` and `CLIENT_URL` environment variables. For the initial deploy, `CLIENT_URL` can be set to the eventual Vercel URL; update it after deploying the frontend. Keep `JWT_SECRET` generated by the blueprint or set a unique random secret.
4. The service should report healthy at `https://<render-service>.onrender.com/api/health`.

The blueprint provisions a 1 GB persistent disk mounted at `/var/data` for uploaded documents. This uses a paid Render service plan; if deploying on a plan without disks, document uploads are ephemeral and can disappear on redeploy/restart. For that case, use external object storage before relying on uploads in production.

### 3. Deploy the frontend to Vercel

1. Import the repository in Vercel.
2. Set the **Root Directory** to `frontend`. Vercel detects Vite; use `npm run build` and `dist` if prompted.
3. Add the environment variable `VITE_API_URL` with the API base URL including `/api`, for example `https://<render-service>.onrender.com/api`.
4. Deploy, then copy the deployed frontend origin (without a trailing slash).

Vite environment variables are embedded at build time. If `VITE_API_URL` changes, redeploy the frontend.

### 4. Connect and verify

1. In Render, set `CLIENT_URL` to the exact Vercel origin, such as `https://your-app.vercel.app`. For multiple deployed frontend origins, separate origins with commas and redeploy the backend.
2. Verify the Render health endpoint, load the Vercel site, sign in, and test an API request and document upload/download.
3. Run `npm run seed` from the backend only if you want the demo loan products/accounts; do not seed a live database unless you intend to add that demo data.

Do not put `MONGODB_URL`, `JWT_SECRET`, or other secrets in Vercel frontend variables or source control. Only `VITE_API_URL` should be exposed to the frontend.

---

## 6. Installation & Quick Start

### Step 1: Install Backend & Frontend Dependencies
```bash
# In backend directory
cd backend
npm install

# In frontend directory
cd ../frontend
npm install
```

### Step 2: Seed the Database
Populate standard loan products, demo accounts, and multi-stage applications:
```bash
cd backend
npm run seed
```

### Step 3: Run the Development Servers
In two separate terminal windows:
```bash
# Terminal 1: Backend API (Port 5000)
cd backend
npm start

# Terminal 2: Frontend Client (Port 5173)
cd frontend
npm run dev
```

Visit the application at: **[http://localhost:5173](http://localhost:5173)**

---

## 7. Demo User Credentials (1-Click Switcher Available)

For rapid evaluation, the navigation bar includes a **1-Click "Switch Role"** button that lets you instantly test every persona without typing passwords:

| Role | Email | Password | Persona & Key Use-Case |
|---|---|---|---|
| **CUSTOMER** | `customer@loanflow.com` | `Customer@123` | **Rahul Patil** (Main Demo Lead, ₹4,00,000 Personal Loan, Monthly Income ₹55,000) |
| **LOAN OFFICER** | `officer@loanflow.com` | `Officer@123` | Sanjay Verma (Lead conversion, document verification, quantitative eligibility engine) |
| **MANAGER** | `manager@loanflow.com` | `Manager@123` | Anjali Deshmukh (Credit Committee sanction decrees, fund disbursement executions) |
| **ADMIN** | `admin@loanflow.com` | `Admin@123` | Super Admin (System-wide analytics, product policy limits, user RBAC) |

---

## 8. Automated Testing

Run the automated domain and business logic tests:
```bash
cd backend
npm run test:api
```
Tests:
- Precision of the reducing-balance EMI amortization formula.
- Evaluation of dynamic Debt-to-Income ($DTI$) compliance across products.
- Product-specific configurable threshold check (e.g., Vehicle Loan strict 45% ceiling).
- Validation of document stages and rejection guardrails.

---

## 9. Documentation Index

- [Business Requirements Document (BRD)](file:///d:/Company%20Tasks/loan-application-tracker/docs/BUSINESS_REQUIREMENTS.md)
- [Business Workflow Specification](file:///d:/Company%20Tasks/loan-application-tracker/docs/BUSINESS_WORKFLOW.md)
- [Business Rules & Policy Engine](file:///d:/Company%20Tasks/loan-application-tracker/docs/BUSINESS_RULES.md)
- [Database Architecture & Mongoose Models](file:///d:/Company%20Tasks/loan-application-tracker/docs/DATABASE_DESIGN.md)
- [System Architecture Specification](file:///d:/Company%20Tasks/loan-application-tracker/docs/ARCHITECTURE.md)
- [API Documentation](file:///d:/Company%20Tasks/loan-application-tracker/docs/API_DOCUMENTATION.md)
- [Testing & Quality Assurance Guide](file:///d:/Company%20Tasks/loan-application-tracker/docs/TESTING.md)
- [Live Demo Script](file:///d:/Company%20Tasks/loan-application-tracker/docs/DEMO_SCRIPT.md)
- [AI Development & Engineering Log](file:///d:/Company%20Tasks/loan-application-tracker/docs/AI_DEVELOPMENT_LOG.md)
