# LOANFLOW - RESTful API Specification

Base URL: `http://localhost:5000/api`

All protected endpoints require an `Authorization: Bearer <jwt_token>` header.

---

## 1. Authentication & Session

### `POST /auth/register`
Creates a new customer account.
- **Request Body:** `{ name, email, password, phone, role }`
- **Response:** `{ success: true, message, data: { user, token } }`

### `POST /auth/login`
Authenticates user and generates JWT.
- **Request Body:** `{ email, password }`
- **Response:** `{ success: true, message, data: { user, customerProfile, token } }`

### `GET /auth/me`
Restores user session.
- **Headers:** `Bearer <token>`
- **Response:** `{ success: true, data: { user, customerProfile } }`

---

## 2. Loan Products

### `GET /loan-products`
Lists all available products (optional filter `?activeOnly=true`).

### `POST /loan-products` (Admin Only)
Creates a new loan product with custom DTI ceilings.
- **Request Body:**
  ```json
  {
    "code": "PL-001",
    "name": "Personal Loan",
    "category": "PERSONAL",
    "minAmount": 50000,
    "maxAmount": 1500000,
    "minTenureMonths": 12,
    "maxTenureMonths": 60,
    "interestRateAnnual": 11.5,
    "minMonthlyIncome": 25000,
    "maxDtiPercent": 50
  }
  ```

### `PUT /loan-products/:id` (Admin Only)
Updates product parameters and policy thresholds.

---

## 3. Customer Enquiries & Lead Conversion

### `POST /enquiries` (Public / Customer)
Generates enquiry `ENQ-2026-XXXX`.
- **Request Body:** `{ fullName, email, mobile, loanProductId, requestedAmount, requestedTenureMonths, monthlyIncome, purpose }`

### `GET /enquiries` (Staff Only)
Search and filter enquiries by status (`NEW`, `CONTACTED`, `CONVERTED`, `CLOSED`).

### `PUT /enquiries/:id` (Staff Only)
Updates enquiry status and logs notes.

### `POST /enquiries/:id/convert` (Officer / Admin)
Transforms a qualified enquiry into a formal loan dossier (`LOAN-2026-XXXX`), creates Customer profile, and logs history.

---

## 4. Loan Applications

### `GET /applications`
Lists loan applications with search, status filters, product filters, and pagination.
*(Customer role automatically scopes to own applications).*

### `GET /applications/:id`
Retrieves master application dossier with customer coordinates, product limits, assigned officers, and current workflow status.

### `POST /applications` (Customer)
Submits a direct loan application.

---

## 5. Document Management

### `GET /applications/:id/documents`
Lists all submitted proofs, verification remarks, and check state.

### `POST /applications/:id/documents`
Multipart file upload (`file`, `documentType`, `title`). Quarantines file in `backend/uploads/documents/{applicationNumber}/`.

### `PUT /documents/:id/verify` (Officer / Manager)
Marks document status as `VERIFIED` with underwriter notes.

### `PUT /documents/:id/reject` (Officer / Manager)
Marks document as `REJECTED`. Requires mandatory reason string. Moves application to `ADDITIONAL_DOCUMENTS_REQUIRED`.

### `GET /documents/:id/file`
Safely streams the physical proof document.

---

## 6. Underwriting & Eligibility Engine

### `POST /applications/:id/eligibility` (Officer / Admin)
Executes deterministic reducing-balance EMI formula and evaluates dynamic DTI against product policy:
$$EMI = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$
$$DTI = \left(\frac{\text{Existing Obligations} + \text{Estimated EMI}}{\text{Monthly Income}}\right) \times 100$$
Advances application to `OFFICER_REVIEW`.

### `GET /applications/:id/eligibility`
Retrieves quantitative calculation breakdown and policy rule checklist.

### `POST /applications/:id/recommend` (Officer)
Submits appraisal dossier with formal `RECOMMEND_APPROVAL` decree, risk score, and credit notes. Moves application to `MANAGER_APPROVAL`.

### `POST /applications/:id/reject-officer` (Officer)
Declines application with reason. Moves status to `REJECTED`.

---

## 7. Manager Sanction & Disbursement

### `POST /applications/:id/approve` (Manager)
Issues official sanction decree (`SANC-2026-XXXX`). Sets approved amount, approved tenure, and remarks. Advances to `DISBURSEMENT_PENDING`.
*Guardrails: Blocks approval if documents unverified or eligibility missing.*

### `POST /applications/:id/reject` (Manager)
Declines application with executive rationale. Sets status to `REJECTED`.

### `GET /applications/:id/sanction`
Retrieves sanction commitment letter and terms.

### `POST /applications/:id/disburse` (Manager)
Executes fund transfer. Captures payment method, bank UTR, and account. Advances status to `DISBURSED`.
*Guardrail: Validates disbursed amount $\le$ sanctioned amount.*

---

## 8. Audit Trail & In-App Notifications

### `GET /applications/:id/history`
Returns immutable chronological status transitions.

### `GET /notifications`
Returns in-app alerts for the current logged-in user.

### `PUT /notifications/:id/read`
Marks alert as read.

### `PUT /notifications/read-all`
Marks all alerts as read.

---

## 9. Dashboards

- `GET /dashboard/customer`
- `GET /dashboard/officer`
- `GET /dashboard/manager`
- `GET /dashboard/admin`
