# LOANFLOW - Business Rules & Financial Policy Engine

This document outlines all hard business constraints, validation logic, formulas, and state validation gates enforced by the LOANFLOW backend.

> [!NOTE]
> All financial rules, interest rates, and ratios documented here are demo business rules tailored for this corporate evaluation and do not represent actual national banking policies.

---

## 1. Product Policy Matrix (Demonstration Defaults)

| Product Code | Product Name | Min Amount (₹) | Max Amount (₹) | Min Tenure (Months) | Max Tenure (Months) | Default APR (%) | Min Monthly Income (₹) | Max DTI (%) |
|---|---|---|---|---|---|---|---|---|
| `PL-001` | **Personal Loan** | 50,000 | 15,00,000 | 12 | 60 | 11.5% | 25,000 | 50% |
| `HL-001` | **Home Loan** | 5,00,000 | 1,50,00,000 | 60 | 360 | 8.5% | 40,000 | 55% |
| `EL-001` | **Education Loan** | 1,00,000 | 50,00,000 | 12 | 120 | 9.0% | 20,000 | 50% |
| `VL-001` | **Vehicle Loan** | 1,00,000 | 35,00,000 | 12 | 84 | 9.5% | 30,000 | 45% |

---

## 2. Quantitative Financial Formulas & Eligibility Rules

### 2.1 Equated Monthly Installment (EMI) Formula
Calculated using the standard reducing-balance amortization method:

$$\text{EMI} = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$

Or in standard programmatic notation:
`EMI = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)`

Where:
- `P` = Principal / Sanctioned loan amount
- `r` = Monthly interest rate = Annual Interest Rate (APR) / (12 × 100)
- `n` = Number of monthly instalments (Tenure in months)

*Special Case:* If $r = 0$, $EMI = \frac{P}{n}$.

### 2.2 Total Monthly Obligations
$$\text{Total Monthly Obligations} = \text{Existing Monthly Obligations} + \text{Estimated EMI}$$

### 2.3 Debt-to-Income (DTI) Ratio Formula
$$\text{DTI} = \left( \frac{\text{Total Monthly Obligations}}{\text{Gross Monthly Income}} \right) \times 100$$

### 2.4 Eligibility Evaluation Criteria (Dynamic Business-Rule Engine)
An applicant achieves an `ELIGIBLE` status if and only if ALL of the following parameterized rules pass:

1. **Minimum Income Rule:**
   $$\text{Applicant Monthly Income} \ge \text{Product Minimum Income}$$
2. **Loan Amount Boundary Rule:**
   $$\text{Product Min Amount} \le \text{Requested Amount} \le \text{Product Max Amount}$$
3. **Tenure Boundary Rule:**
   $$\text{Product Min Tenure} \le \text{Requested Tenure} \le \text{Product Max Tenure}$$
4. **Configurable DTI Ratio Rule:**
   $$\text{DTI} \le \text{Product Max DTI Threshold (e.g. 50% for Personal, 55% for Home, 45% for Vehicle)}$$
   *(The DTI threshold is dynamically retrieved from the configured `LoanProduct.maxDtiPercent` or global fallback, proving LOANFLOW operates as a configurable policy engine rather than hardcoded logic).*

The assessment stores an array of individual rule outcomes:
```json
[
  { "rule": "MIN_INCOME", "passed": true, "threshold": 25000, "actual": 55000 },
  { "rule": "AMOUNT_LIMITS", "passed": true, "min": 50000, "max": 1500000, "actual": 400000 },
  { "rule": "TENURE_LIMITS", "passed": true, "min": 12, "max": 60, "actual": 36 },
  { "rule": "DTI_THRESHOLD", "passed": true, "maxAllowed": 50, "actual": 32.7 }
]
```

---

## 3. Mandatory Document Checklist Rules

For an application to be legally processed through underwriter evaluation, the following 5 document types must be present and verified:
1. `IDENTITY_PROOF` (Passport, Aadhaar Card, PAN Card, Voter ID)
2. `ADDRESS_PROOF` (Electricity Bill, Passport, Rental Agreement)
3. `INCOME_PROOF` (Last 3 Months Salary Slips, Latest ITR / Form 16)
4. `BANK_STATEMENT` (Last 6 Months Bank Account Statement with official stamp/digital signature)
5. `EMPLOYMENT_PROOF` (Employee ID Card, Appointment/Offer Letter)

### Document State Validation Rules:
- Only files with extensions `.pdf`, `.jpg`, `.jpeg`, `.png` are accepted.
- File size must not exceed 5 MB (5,242,880 bytes).
- Uploaded files are quarantined to `backend/uploads/documents/{applicationId}/`.
- When an officer marks a document as `REJECTED`, a non-empty `remarks` field is mandatory (minimum 5 characters).
- Customer can only re-upload files whose status is `REJECTED` or `PENDING`.
- Once a file is marked `VERIFIED`, it is locked and cannot be deleted or overwritten by the customer.

---

## 4. State Machine Transition & Permission Rules

| Current Status | Permitted Next Status | Triggering Action | Permitted Role(s) | Required Pre-conditions |
|---|---|---|---|---|
| `APPLICATION_CREATED` | `DOCUMENT_PENDING` | Initial setup | System / Customer | Application created |
| `DOCUMENT_PENDING` | `DOCUMENT_VERIFICATION` | Customer uploads 1+ documents | Customer | Valid file payload |
| `DOCUMENT_VERIFICATION` | `ADDITIONAL_DOCUMENTS_REQUIRED` | Officer rejects 1+ documents | Loan Officer | Rejection reason provided |
| `ADDITIONAL_DOCUMENTS_REQUIRED` | `DOCUMENT_VERIFICATION` | Customer re-uploads rejected doc | Customer | Replacement file provided |
| `DOCUMENT_VERIFICATION` | `ELIGIBILITY_CHECK` | Officer triggers eligibility assessment | Loan Officer / System | 100% of required documents must be `VERIFIED` |
| `ELIGIBILITY_CHECK` | `OFFICER_REVIEW` | System completes calculation | Loan Officer | Eligibility engine run complete |
| `OFFICER_REVIEW` | `MANAGER_APPROVAL` | Officer recommends approval | Loan Officer | Eligibility assessment attached, notes provided |
| `OFFICER_REVIEW` | `REJECTED` | Officer recommends rejection | Loan Officer | Rejection reason provided |
| `MANAGER_APPROVAL` | `APPROVED` | Manager approves application | Manager | Sanction amount & tenure specified, notes provided |
| `MANAGER_APPROVAL` | `REJECTED` | Manager rejects application | Manager | Rejection reason provided |
| `APPROVED` | `SANCTIONED` | Sanction record generated | System / Manager | Approval record exists |
| `SANCTIONED` | `DISBURSEMENT_PENDING` | Offer accepted / ready for funding | Manager | Sanction letter issued |
| `DISBURSEMENT_PENDING` | `DISBURSED` | Disbursement executed | Manager | Amount $\le$ Sanctioned Amount, UTR/Ref provided |

---

## 5. Credit & Sanction Guardrails

1. **No Skip-Stage Transitions:**
   - Any API request attempting to jump from `DOCUMENT_PENDING` to `MANAGER_APPROVAL` or `APPROVED` will be rejected by backend middleware with HTTP 422 Unprocessable Entity.
2. **Dual-Control Principle:**
   - A single user acting as both `LOAN_OFFICER` and `MANAGER` cannot unilaterally approve an application without generating an independent officer recommendation record first.
3. **Disbursement Ceiling:**
   - Disbursed amount must satisfy:
     $$0 < \text{Disbursement Amount} \le \text{Sanctioned Amount}$$
   - Any attempt to disburse even ₹1 more than the approved sanction is blocked with an HTTP 400 validation error.
4. **Audit Immutability:**
   - Every state transition appends a read-only record into `ApplicationStatusHistory`. Status history records can never be updated or deleted by any user or administrator.
