# LOANFLOW - Quality Assurance & Test Verification Guide

This document records the verification steps, test suites, and compliance checks performed across the system.

---

## 1. Automated Test Suite Execution

Run the backend integration and financial formula verification:
```bash
cd backend
npm run test:api
```

### Verified Test Cases:
1. **Financial Formula Precision:**
   - Validates that standard reducing-balance formula:
     `EMI = P * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1)`
     yields the expected monthly installment of ~₹13,190 on a ₹4,00,000 principal at 11.5% APR over 36 months.
2. **Deterministic Eligibility Evaluation (Passing Case):**
   - Assesses applicant **Rahul Patil** (Monthly Income: ₹55,000, Existing Debts: ₹5,000, Requested Loan: ₹4,00,000).
   - Expected Output: $DTI = 33.1\% \le 50.0\% \implies$ `ELIGIBLE`. Passed.
3. **Deterministic Eligibility Evaluation (Rejection Case):**
   - Assesses low-income applicant (Monthly Income: ₹20,000 below product threshold of ₹25,000 and DTI > 100%).
   - Expected Output: `NOT_ELIGIBLE`. Passed.
4. **Configurable Dynamic Policy Threshold (Vehicle Loan):**
   - Assesses applicant with $DTI = 48.0\%$ against Vehicle Loan configured with $45.0\%$ ceiling.
   - Expected Output: `NOT_ELIGIBLE`. Confirms system evaluates dynamic database policies rather than hardcoded thresholds.
5. **Database Model Validation:**
   - Verifies all 12 Mongoose collections connect and persist correctly on MongoDB Atlas.

---

## 2. Frontend Production Compilation Verification

Run Vite production build:
```bash
cd frontend
npm run build
```
- **Result:** Code compiles cleanly into `dist/assets/` in under 7 seconds with **0 errors**.
- **Constraint Check:**
  - Zero TypeScript (`.ts`, `.tsx`) files exist in the repository.
  - No `tsconfig.json` exists.
  - Pure JavaScript ES6+ throughout.

---

## 3. Business Rule Boundary & Security Verification

| Test Scenario | Expected Result | Verified Result |
|---|---|---|
| Customer attempts to access another customer's loan dossier | HTTP 403 Forbidden | Passed |
| Unauthenticated user calls `/api/applications` | HTTP 401 Unauthorized | Passed |
| Loan Officer attempts to approve an application without Manager role | HTTP 403 Forbidden | Passed |
| Attempt to run Eligibility Assessment before verifying all 5 required documents | HTTP 422 Unprocessable Entity | Passed |
| Attempt to approve loan without eligibility check | HTTP 422 Unprocessable Entity | Passed |
| Attempt to approve loan without officer recommendation | HTTP 422 Unprocessable Entity | Passed |
| Officer attempts to reject document without providing reason | HTTP 400 Bad Request | Passed |
| Manager attempts to disburse ₹1 more than sanctioned amount | HTTP 400 Bad Request | Passed |
| Uploading an unsupported file extension (`.exe` or `.sh`) | Multer rejects with HTTP 400 | Passed |
| Uploading a file larger than 5 MB | Multer rejects with HTTP 400 | Passed |
