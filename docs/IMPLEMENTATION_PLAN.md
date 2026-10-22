# LOANFLOW - Phased Implementation Plan

This document establishes the roadmap and verification criteria for delivering LOANFLOW module by module.

---

## Roadmap & Milestones

### Phase 1: Planning, Documentation & Environment Verification
- [x] Initial workspace inspection.
- [x] Creation of BRD, Workflow, Rules, DB Design, Architecture, Implementation Plan.
- [ ] Setup repository `.gitignore` and `.env.example`.

### Phase 2: Backend Core Setup & Database Configuration
- [ ] Initialize `backend/` with Node.js, Express, Mongoose, dotenv, cors, helmet, multer, bcrypt, jsonwebtoken, morgan.
- [ ] Implement `backend/src/config/db.js` with MongoDB Atlas connection using `process.env.MONGODB_URL`.
- [ ] Implement graceful handling for local testing / in-memory or fallback Atlas connection test.
- [ ] Setup Express app skeleton, security middleware, and centralized error handler.

### Phase 3: Mongoose Data Models & Audit Helpers
- [ ] Implement all 12 Mongoose Models: User, Customer, LoanProduct, LoanEnquiry, LoanApplication, ApplicationDocument, EligibilityAssessment, ApplicationReview, Sanction, Disbursement, ApplicationStatusHistory, Notification.
- [ ] Create `auditService.js` to log state transitions automatically.
- [ ] Create comprehensive database seed script `seedData.js` with Rahul Patil demo account, Admin, Officer, Manager, Customer, standard products, and multi-stage sample applications.

### Phase 4: Backend REST API Endpoints & Business Validation
- [ ] Auth & RBAC routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- [ ] Loan Products CRUD (`/api/loan-products`).
- [ ] Enquiries & Lead Conversion (`/api/enquiries`, `/api/enquiries/:id/convert`).
- [ ] Loan Applications CRUD, Filters & Transitions (`/api/applications`).
- [ ] Document Upload (Multer) & Verification/Rejection (`/api/applications/:id/documents`, `/api/documents/:id/verify`, `/api/documents/:id/reject`).
- [ ] Eligibility Engine API (`/api/applications/:id/eligibility`).
- [ ] Officer Review & Recommendation (`/api/applications/:id/recommend`, `/api/applications/:id/request-documents`).
- [ ] Manager Approval / Rejection (`/api/applications/:id/approve`, `/api/applications/:id/reject`).
- [ ] Sanction Generation (`/api/applications/:id/sanction`).
- [ ] Disbursement Processing (`/api/applications/:id/disburse`).
- [ ] History & Notifications (`/api/applications/:id/history`, `/api/notifications`).
- [ ] Dashboards & Metrics for all 4 roles (`/api/dashboard/:role`).

### Phase 5: Frontend Setup & Design System
- [ ] Initialize `frontend/` with Vite + React (JavaScript only, NO TypeScript).
- [ ] Configure Tailwind CSS, Inter font typography, and design tokens (Deep Navy `#0F172A`, Blue `#2563EB`, Emerald `#10B981`, Amber `#F59E0B`).
- [ ] Build reusable UI kit: Button, Card, Badge, Dialog, Tabs, Table, Alert, Progress, Tooltip, Select, Input, Dropdown.
- [ ] Setup Axios client, Auth Context, Notification Context, and React Router with Role-Based Route Guards.

### Phase 6: Application Lifecycle Frontend Views
- [ ] Landing page & Loan Products Catalog.
- [ ] Customer Enquiry Modal & Conversion workflow.
- [ ] Customer Dashboard & Application Origination form.
- [ ] Document Upload & Re-upload Workbench with feedback viewer.
- [ ] Loan Officer Underwriting Workspace: Document verification modal, eligibility runner, approval recommendation form.
- [ ] Manager Approval Workspace: Sanction adjustment, approval/rejection modal, disbursement trigger with UTR capture.
- [ ] Core Application Dossier Page:
  - Header: Application ID, Name, Product, Amount, Status Badge.
  - Multi-stage Progress Tracker (Enquiry $\rightarrow$ Disbursed).
  - Multi-tab dossier: Overview, Customer, Loan, Documents, Eligibility, Review, Approval, Sanction, Disbursement, Timeline.
  - Context-sensitive actions per role.
- [ ] Vertical Timeline component for `ApplicationStatusHistory`.

### Phase 7: Analytics Dashboards & Role Experiences
- [ ] Customer Dashboard with Active Loans, Status cards, and Notifications.
- [ ] Loan Officer Dashboard with Lead conversion queue, Review queue, and Recharts distribution.
- [ ] Manager Dashboard with Approval queue, Disbursement pipeline, and Recharts financial trends.
- [ ] Admin Dashboard with System stats, Product configuration, and User role management.

### Phase 8: Verification, Testing & Polish
- [ ] Run backend automated API tests & business validation checks.
- [ ] Build frontend and verify zero build errors, zero TypeScript files.
- [ ] Validate entire live demo scenario with **Rahul Patil** (Personal Loan, ₹4,00,000, monthly salary ₹55,000) from Enquiry to Disbursement.
- [ ] Generate comprehensive documentation: `README.md`, `AI_DEVELOPMENT_LOG.md`, `DEMO_SCRIPT.md`, `TESTING.md`.
