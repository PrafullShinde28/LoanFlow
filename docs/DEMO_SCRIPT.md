# LOANFLOW - Live Hiring Demonstration Script

Follow this step-by-step walkthrough to demonstrate the full end-to-end institutional loan lifecycle during the live evaluation.

---

## Preparation: Pre-Seeded Accounts
Open **[http://localhost:5173](http://localhost:5173)** in your browser.  
Notice the **"Switch Role"** button in the top navigation bar, allowing instant 1-click persona switching without typing passwords.

---

## Act 1: The Customer Enquiry (Lead Intake)
1. **Persona:** Unauthenticated visitor or Customer.
2. Go to **Submit Enquiry** (`/enquiry`).
3. Fill out the lead form:
   - Name: **Rahul Patil**
   - Email: `customer@loanflow.com`
   - Mobile: `+91 98765 43210`
   - Product: **Personal Loan**
   - Requested Amount: **₹4,00,000**
   - Tenure: **36 Months**
   - Monthly Income: **₹55,000**
   - Purpose: *Home Renovation and Personal Funding*
4. Click **Submit Loan Enquiry**.
5. Observe the generated ticket code: `ENQ-2026-XXXX`.

---

## Act 2: Loan Officer Lead Qualification & Conversion
1. Click **Switch Role** $\rightarrow$ **Loan Officer** (`officer@loanflow.com`).
2. Go to **Enquiries & Leads** (`/officer/enquiries`).
3. View the incoming lead in the table.
4. Click **Mark Contacted** (simulates phone qualification).
5. Click **Convert to Loan**.
6. System converts the lead into an official loan application (`LOAN-2026-XXXX`) and redirects directly to the **Application Dossier**.
7. Observe the horizontal **Application Lifecycle Tracker** showing:
   - Stage 2: `Documents Pending` (Amber).

---

## Act 3: Document Uploads & Real-World Exception Handling
1. Click **Switch Role** $\rightarrow$ **Rahul Patil (Customer)**.
2. Open the application dossier from **My Applications** (`/my-applications`).
3. Click on the **Documents** tab.
4. Upload files for the required categories (Identity Proof, Address Proof, Income Proof, Bank Statement, Employment Proof).
5. Once uploaded, click **Switch Role** $\rightarrow$ **Loan Officer**.
6. As Loan Officer, open the **Documents** tab.
7. Click **Review & Verify** on **Identity Proof** $\rightarrow$ click **Approve / Verify**.
8. **Demonstrate Exception Handling:**
   - On **Bank Statement**, click **Review & Verify** $\rightarrow$ select **Reject with Reason**.
   - Type rejection reason: *"The uploaded bank statement is blurry and pages 3-4 are missing. Please upload a clear 6-month statement with official bank stamp."*
   - Click **Reject Document & Request Re-upload**.
   - Notice the application status updates to **ADDITIONAL_DOCUMENTS_REQUIRED**!
   - Observe the real-time notification alert dispatched to the customer.
9. Click **Switch Role** $\rightarrow$ **Customer**.
   - The customer sees the amber warning alert with the officer's exact feedback.
   - Click **Re-upload** on Bank Statement, select a new file, and submit.
10. Click **Switch Role** $\rightarrow$ **Loan Officer**.
    - Verify the newly uploaded Bank Statement.
    - Verify remaining proofs until all 5 are marked `VERIFIED`.

---

## Act 4: Quantitative Financial Eligibility Engine
1. With all 5 proofs `VERIFIED`, click **Run Eligibility** in the top action bar or open the **Eligibility Engine** tab.
2. The modal displays:
   - Gross Monthly Income: **₹55,000**
   - Existing Monthly Debts: **₹5,000**
   - Reducing-Balance EMI formula:
     $$EMI = \frac{400000 \times 0.009583 \times (1 + 0.009583)^{36}}{(1 + 0.009583)^{36} - 1} \approx \text{₹}13,190$$
   - Total Debt Commitments: ₹18,190
   - Applicant DTI: **33.1%** (well within product ceiling of 50.0%)
3. Click **Run Assessment Engine**.
4. Result: **`ELIGIBLE`**.
5. Application status automatically advances to **`OFFICER_REVIEW`**.

---

## Act 5: Credit Underwriter Recommendation
1. As Loan Officer, navigate to the **Officer Review** tab.
2. Fill in the credit appraisal:
   - Credit Risk Score: **780**
   - Remarks: *"Physical KYC and salary slips cross-checked. Employment with Tech Mahindra confirmed for 5 years. DTI is comfortable at 33.1%. Strongly recommend full sanction of ₹4,00,000."*
3. Click **Submit Appraisal to Manager**.
4. Application status updates to **`MANAGER_APPROVAL`**!

---

## Act 6: Dual-Control Branch Manager Sanction
1. Click **Switch Role** $\rightarrow$ **Branch Manager** (`manager@loanflow.com`).
2. Go to **Approval Queue** (`/manager/approvals`).
3. Open Rahul Patil's application dossier.
4. Review the complete dossier tabs: Customer profile, verified documents, and officer appraisal notes.
5. Click **Sanction / Approve** (or open **Manager Approval** tab).
6. Modal opens:
   - Sanctioned Amount: **₹4,00,000**
   - Tenure: **36 Months**
   - Remarks: *"Approved at 11.5% APR under standard corporate lending terms."*
7. Click **Confirm Sanction & Approve**.
8. System generates **Sanction Letter Code** (`SANC-2026-XXXX`).
9. Application status moves to **`DISBURSEMENT_PENDING`**.
10. Open the **Sanction Letter** tab to inspect the formal commitment letter.

---

## Act 7: Fund Disbursement & Closing
1. As Manager, click **Disburse Funds** in the top header (or navigate to **Disbursement Queue** `/manager/disbursements`).
2. In the Disbursement Modal:
   - Disbursed Amount: **₹4,00,000** (Test business rule: attempting to disburse ₹4,00,001 is immediately blocked).
   - Payment Mode: **NEFT**
   - Bank UTR Ref: `UTR-2026-HDFC-99120`
   - Account: `HDFC-XXXX-4921`
3. Click **Execute Transfer**.
4. **Celebration:** Confetti bursts across the screen!
5. Application status permanently updates to **`DISBURSED`**.

---

## Act 8: Complete Customer Journey & Audit Trail
1. Click **Switch Role** $\rightarrow$ **Rahul Patil (Customer)**.
2. Observe dashboard: 1 Disbursed Loan, status badge **DISBURSED** (Emerald).
3. Open the application dossier.
4. Check the **Application Lifecycle Tracker**: all 9 stages marked with emerald checkmarks!
5. Check the **Disbursement** tab: Displays UTR number and payment settlement details.
6. Open the **Audit Timeline** tab:
   - Shows the entire immutable vertical history:
     $$\text{Enquiry Converted} \rightarrow \text{Documents Submitted} \rightarrow \text{Document Rejected} \rightarrow \text{Replacement Re-uploaded} \rightarrow \text{All Verified} \rightarrow \text{Eligibility Passed} \rightarrow \text{Officer Recommended} \rightarrow \text{Manager Approved} \rightarrow \text{Funds Disbursed}$$
   - Every entry records the actor name, role, timestamp, and justification notes!
