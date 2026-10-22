# LOANFLOW - AI Engineering & Development Log

This document provides a transparent and structured audit of the AI-assisted software engineering process, design decisions, discovered edge cases, bug fixes, and architectural rationale for **LOANFLOW**.

---

## 1. Engineering Overview & Tooling

- **AI Assistant:** Antigravity (Google DeepMind)
- **Primary Paradigms Applied:**
  - Understand $\rightarrow$ Analyze $\rightarrow$ Design $\rightarrow$ Build $\rightarrow$ Test $\rightarrow$ Explain
  - Domain-Driven Design (Fintech Loan Origination & Servicing)
  - Strict Stage-Gate State Machine Governance
  - Pure JavaScript ES6+ (Strict zero-TypeScript mandate)

---

## 2. Architectural Decisions & Key Rationale

1. **State Machine vs. Loose Status Updates:**
   - *Decision:* Rather than allowing any controller to update `status` arbitrarily, transitions are strictly tied to domain actions (`convert`, `verify`, `runEligibility`, `recommendApproval`, `approve`, `disburse`).
   - *Rationale:* Banking systems require stage gates; an underwriter cannot jump straight from document pending to approval without proof verification and quantitative evaluation.
2. **Deterministic Reducing-Balance Amortization vs. Simple Flat Rate:**
   - *Decision:* Implemented true reducing-balance amortization formula:
     $$EMI = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$
     `EMI = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)`
   - *Rationale:* Lending systems must reflect actual banking math where interest reduces with principal amortization.
3. **Dynamic Configurable Policy Engine vs. Hardcoded 50% DTI:**
   - *Decision:* Elevated `maxDtiPercent` to a configurable attribute on `LoanProduct` schema (defaulting to 50% for Personal Loan, 55% for Home Loan, 45% for Vehicle Loan) and allowed Admins to modify policy parameters in the UI.
   - *Rationale:* Ensures LOANFLOW behaves as a configurable rule engine rather than a static calculator.
4. **Append-Only Immutable Audit Trail (`ApplicationStatusHistory`):**
   - *Decision:* Decoupled audit logging from application updates so historical entries cannot be modified or overwritten.
   - *Rationale:* Ensures compliance and traceability across all 4 user roles.
5. **1-Click Persona Switcher for Evaluation:**
   - *Decision:* Built a quick-switch dropdown in the top navbar and login page.
   - *Rationale:* Allows evaluation committees to rapidly experience all 4 perspectives (Customer, Officer, Manager, Admin) without repeatedly logging in and out.

---

## 3. Discovered Edge Cases & Solutions

### Issue 1: Port Collision on Node / Express Startup
- **Symptoms:** Server failed with `EADDRINUSE: address already in use :::5000`.
- **Root Cause:** A lingering background Node process was holding port 5000.
- **Fix:** Inspected socket connections using `Get-NetTCPConnection -LocalPort 5000`, cleanly terminated the stale PID, and verified the server bound successfully to port 5000.

### Issue 2: Vite Dev Server Port Conflict
- **Symptoms:** Vite shifted from default port 5173 to 5174.
- **Root Cause:** An existing process occupied port 5173.
- **Fix:** Terminated the previous process and explicitly bound Vite to `--port 5173 --host`.

### Issue 3: Missing Import in Seed Script
- **Symptoms:** `connectDB is not defined` during initial `npm run seed`.
- **Root Cause:** Refactored `seedData.js` to use the unified `connectDB` module without adding the import statement.
- **Fix:** Added `import connectDB from "../config/db.js"` to `backend/src/seed/seedData.js`.

### Issue 4: Zero Interest or Single-Month Loan Tenures
- **Edge Case:** If annual interest is 0% or tenure is 0 months, division by zero occurs in the factor equation `Math.pow(1 + r, n) - 1`.
- **Fix:** Added guards in `calculateEmi`:
  ```javascript
  if (tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) return Math.round(principal / tenureMonths);
  ```

### Issue 5: Document Open/Download 401 Error on Hyperlink Navigation
- **Symptoms:** Clicking "Open / Download File" (`<a href="..." target="_blank">`) in Document Verification Modal returned `{"success":false,"message":"Authentication required. Please log in.","errors":[]}`.
- **Root Cause:** Standard browser hyperlink navigation opens a new tab without custom `Authorization: Bearer <token>` HTTP request headers. Additionally, Multer stores files under `uploads/documents/:applicationId/`, which needed resilient candidate folder resolution.
- **Fix:**
  1. Updated `backend/src/routes/documentRoutes.js` to serve document files directly at `GET /api/documents/:id/file` for all stakeholders.
  2. Enhanced `serveDocument` in `backend/src/controllers/documentController.js` to search across all candidate folders (`applicationId` ObjectId, `applicationNumber`, and stored relative paths).
  3. Set proper `Content-Type: application/pdf` and `Content-Disposition: inline` headers so PDFs and images display directly inside the browser tab cleanly.

---

## 4. Verification & Validation Summary

1. **Automated Logic Tests (`npm run test:api`):**
   - Verified EMI calculation on ₹4,00,000 at 11.5% APR over 36 months = ₹13,190.
   - Verified Rahul Patil passes DTI check ($33.1\% \le 50\%$).
   - Verified high-debt applicants fail eligibility.
   - Verified Vehicle Loan policy limit ($45\%$) strictly rejects 48% DTI applicant.
2. **Frontend Production Build (`npm run build`):**
   - 2,491 modules transformed into pure JavaScript bundles with zero errors.
   - Zero `.ts`, `.tsx`, or `tsconfig.json` files generated.
3. **Database Connectivity:**
   - Verified live connection and seeding to MongoDB Atlas cluster (`ac-rrefv2i-shard-00-02.drbef3y.mongodb.net`).
