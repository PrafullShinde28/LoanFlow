/**
 * Quantitative Financial Eligibility Calculation Engine for LOANFLOW
 *
 * Implements standard financial formulas with dynamic, configurable product policies.
 */

export const calculateEmi = (principal, annualInterestRate, tenureMonths) => {
  if (tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualInterestRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);

  return Math.round(emi);
};

export const assessEligibility = ({
  monthlyIncome,
  existingObligations = 0,
  requestedAmount,
  requestedTenure,
  loanProduct,
}) => {
  const annualInterestRate = loanProduct.interestRateAnnual;
  const estimatedEmi = calculateEmi(requestedAmount, annualInterestRate, requestedTenure);
  const totalMonthlyObligations = existingObligations + estimatedEmi;

  // Debt-to-Income (DTI) calculation
  const rawDti = (totalMonthlyObligations / (monthlyIncome || 1)) * 100;
  const debtToIncomeRatio = Math.round(rawDti * 10) / 10; // 1 decimal place

  const maxDtiAllowed = loanProduct.maxDtiPercent || 50;

  // Evaluate rule matrix against product configuration
  const ruleResults = [
    {
      rule: "MIN_INCOME",
      description: `Applicant gross monthly income must meet product minimum requirement`,
      passed: monthlyIncome >= loanProduct.minMonthlyIncome,
      threshold: loanProduct.minMonthlyIncome,
      actual: monthlyIncome,
    },
    {
      rule: "AMOUNT_BOUNDS",
      description: `Requested loan amount must be within product limits`,
      passed: requestedAmount >= loanProduct.minAmount && requestedAmount <= loanProduct.maxAmount,
      threshold: { min: loanProduct.minAmount, max: loanProduct.maxAmount },
      actual: requestedAmount,
    },
    {
      rule: "TENURE_BOUNDS",
      description: `Requested loan tenure must be within product limits`,
      passed: requestedTenure >= loanProduct.minTenureMonths && requestedTenure <= loanProduct.maxTenureMonths,
      threshold: { min: loanProduct.minTenureMonths, max: loanProduct.maxTenureMonths },
      actual: requestedTenure,
    },
    {
      rule: "DTI_THRESHOLD",
      description: `Total debt obligations cannot exceed product max DTI threshold of ${maxDtiAllowed}%`,
      passed: debtToIncomeRatio <= maxDtiAllowed,
      threshold: maxDtiAllowed,
      actual: debtToIncomeRatio,
    },
  ];

  const isEligible = ruleResults.every((r) => r.passed);
  const result = isEligible ? "ELIGIBLE" : "NOT_ELIGIBLE";

  const notes = isEligible
    ? `Applicant satisfies all credit criteria with a healthy DTI of ${debtToIncomeRatio}% (limit: ${maxDtiAllowed}%).`
    : `Applicant failed: ${ruleResults.filter((r) => !r.passed).map((r) => r.rule).join(", ")}.`;

  return {
    monthlyIncome,
    existingMonthlyObligations: existingObligations,
    requestedAmount,
    tenureMonths: requestedTenure,
    interestRateAnnual: annualInterestRate,
    estimatedEmi,
    totalMonthlyObligations,
    debtToIncomeRatio,
    maxDtiAllowed,
    result,
    ruleResults,
    notes,
  };
};
