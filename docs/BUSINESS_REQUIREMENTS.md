# LOANFLOW - Business Requirements Document (BRD)

**Product Name:** LOANFLOW  
**Tagline:** Smart Loan Application Management  
**Version:** 1.0.0  
**Target Domain:** Retail & Commercial Lending / Fintech SaaS  

---

## 1. Executive Summary & Problem Statement
Traditional lending institutions and non-banking financial companies (NBFCs) struggle with fragmented loan processing workflows. Customer enquiries often sit in email threads or disparate CRM tables, documents are gathered through unencrypted channels, verification requires manual cross-referencing without clear audit trails, and approvals lack controlled stage-gate validation.

**LOANFLOW** is an end-to-end, multi-tenant capable loan origination and lifecycle management platform built to govern a loan application through every critical stage:
1. Customer Enquiry Generation & Triage
2. Conversion to Formal Loan Application
3. Mandatory Document Collection & Archival
4. Underwriting Document Verification & Rejection Workflows
5. Automated Quantitative Eligibility Engine (EMI, Debt-To-Income, Max Loan Calculations)
6. Credit / Loan Officer Sanction Recommendation
7. Branch / Credit Manager Stage-Gate Approval
8. Sanction Letter Generation & Offer Issuance
9. Disbursement Execution & Audit Trail Completion

---

## 2. Stakeholders & User Roles

| Role | Responsibility & Authority |
|---|---|
| **CUSTOMER** | Explores loan products, submits initial enquiries, tracks application progress, completes detailed demographic & income profile, uploads mandatory documents, resolves document objections via re-upload, accepts sanction offers, and views disbursement status. |
| **LOAN OFFICER** | Manages incoming pipeline, qualifies and converts customer enquiries, validates uploaded proofs against product criteria, marks documents as verified or rejected with actionable notes, triggers eligibility assessments, submits formal underwriting recommendations (Approve / Reject / Additional Docs Required). |
| **MANAGER** | Holds final credit approval authority. Reviews completed application dossiers, verifies underwriting notes and eligibility ratios, sets or amends sanctioned amounts and tenures, issues formal sanction decrees, and triggers disbursement executions. |
| **ADMIN** | System administrator. Manages user provisioning and role assignments, creates and configures loan products (min/max limits, base APRs, tenure bounds, minimum income), maintains document checklists, and monitors system-wide analytics, audit logs, and throughput reports. |

---

## 3. High-Level Functional Requirements

### 3.1 Authentication & Role-Based Access Control (RBAC)
- Secure registration and authentication using JSON Web Tokens (JWT) and bcrypt (salt rounds = 10).
- Granular role guards (`CUSTOMER`, `LOAN_OFFICER`, `MANAGER`, `ADMIN`) across all protected REST API routes and React view routes.
- Automatic session hydration via `/api/auth/me` with persistent state management.

### 3.2 Product Catalogue & Business Constraints
- Multi-product lending support:
  - **Personal Loan** (Unsecured, standard interest, quick turnaround)
  - **Home Loan** (Secured, higher ticket size, extended tenure)
  - **Education Loan** (Targeted tenure, moratorium options)
  - **Vehicle Loan** (Hypothecated collateral, strict EMI to income validation)
- Product configuration controls minimum/maximum sanctioned amounts, tenures, base interest rates, and minimum applicant monthly income.

### 3.3 Enquiry Management
- Lead intake capturing full applicant name, contact coordinates, product interest, requested amount, employment type, and gross monthly income.
- Automated human-readable identifier sequence: `ENQ-2026-XXXX`.
- Status lifecycle: `NEW` $\rightarrow$ `CONTACTED` $\rightarrow$ `CONVERTED` $\rightarrow$ `CLOSED`.
- One-click transformation of qualified enquiries into formal Loan Applications.

### 3.4 Application Origination & Profile Completion
- Unique application identifier sequence: `LOAN-2026-XXXX`.
- Captures extensive Personal, Demographic, Residential, and Employment metadata (Employer, Years in Service, Gross Monthly Salary, Existing Monthly Debt Obligations).
- Initial state: `DOCUMENT_PENDING`.

### 3.5 Document Lifecycle & Exception Handling
- Mandatory document collection categorized into:
  - Identity Proof (Aadhaar / Passport / Voter ID)
  - Address Proof (Utility Bill / Rental Agreement)
  - Income Proof (Pay Slips / ITR / Form 16)
  - Bank Statement (Last 6 Months Bank Statement)
  - Employment Proof (Offer Letter / Employee ID)
- Validated uploads: PDF, JPG, JPEG, PNG capped at 5MB per file with MIME type and magic number validation.
- Organized partitioned physical storage: `uploads/documents/LOAN-2026-XXXX/`.
- Granular per-document status: `PENDING`, `UPLOADED`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`.
- Rejection handling: Officers must specify clear reasons; customers receive real-time notifications and can re-upload targeted files.

### 3.6 Quantitative Eligibility Engine
- Deterministic calculation of Estimated Monthly Installment (EMI) using standard financial formulas:
  $$EMI = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$
- Debt-to-Income (DTI) calculation factoring existing obligations and prospective loan EMI:
  $$DTI = \frac{\text{Existing Obligations} + \text{Estimated EMI}}{\text{Monthly Income}} \times 100\%$$
- Rule assessment results stored with immutable audit metadata:
  - DTI $\le 50\%$ threshold rule
  - Minimum income threshold check against product rules
  - Loan amount ceiling check against product limits

### 3.7 Dual-Control Underwriting & Approval Workflow
- **Loan Officer Review:** Cannot recommend approval without 100% verified required documents and passing eligibility check.
- **Manager Approval:** Independent second-line review. Manager can approve, reject, or adjust sanctioned amount and tenure. Rejection mandates explicit business justification.
- **Sanction Issuance:** Generation of official sanction records (`SANC-2026-XXXX`) capturing final approved terms, APR, monthly EMI, and expiry date.

### 3.8 Disbursement Processing
- Transition to `DISBURSEMENT_PENDING` upon sanction acceptance.
- Disbursement execution capturing transaction reference, payment method (NEFT, RTGS, IMPS), disbursement date, and remarks.
- Strict validation: Disbursed amount cannot exceed sanctioned amount.
- Final state: `DISBURSED`.

### 3.9 Comprehensive Audit Trail & In-App Notifications
- Automated appending to `ApplicationStatusHistory` on any stage transition with actor ID, actor role, timestamp, old state, new state, and justification notes.
- In-app notification center notifying customers and operational staff of state transitions and required actions.

---

## 4. Non-Functional Requirements
- **Technology Constraint:** 100% JavaScript (ES6+), React 18+, Node.js, Express, MongoDB Atlas, Mongoose. **Zero TypeScript**.
- **Security:** HTTP security headers via Helmet, sanitized inputs, parameterized Mongoose queries, strict CORS whitelisting, Bcrypt hashed credentials, and zero secret leakage.
- **Design Standard:** High-contrast fintech SaaS aesthetic utilizing Deep Navy (`#0F172A`), Primary Action Blue (`#2563EB`), Emerald Success (`#10B981`), Amber Warning (`#F59E0B`), and Slate neutrals (`#F8FAFC`, `#E2E8F0`).
