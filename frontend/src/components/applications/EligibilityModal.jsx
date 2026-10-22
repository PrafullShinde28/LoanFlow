import React, { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { applicationApi } from "../../api/applicationApi";
import { formatCurrency } from "../../utils/formatters";
import { useNotification } from "../../context/NotificationContext";
import { Calculator, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export const EligibilityModal = ({
  isOpen,
  onClose,
  application,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const [income, setIncome] = useState(
    application?.customerId?.employment?.monthlyIncome || 50000
  );
  const [obligations, setObligations] = useState(
    application?.customerId?.employment?.existingEmiObligations || 0
  );
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunAssessment = async () => {
    try {
      setIsLoading(true);
      const res = await applicationApi.runEligibility(application._id, {
        customIncome: Number(income),
        customObligations: Number(obligations),
      });

      if (res.success && res.data.assessment) {
        setAssessmentResult(res.data.assessment);
        showToast(`Eligibility Engine completed: ${res.data.assessment.result}`, "success");
        onSuccess();
      }
    } catch (err) {
      showToast(err.message || "Eligibility evaluation failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Quantitative Financial Eligibility Engine"
      description="Run automated reducing-balance EMI and Debt-to-Income (DTI) compliance evaluation."
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Loan Context */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Product</span>
            <span className="font-semibold text-slate-800">{application?.productId?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Amount</span>
            <span className="font-semibold text-slate-800">{formatCurrency(application?.requestedAmount)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Tenure</span>
            <span className="font-semibold text-slate-800">{application?.requestedTenureMonths} Months</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Annual APR</span>
            <span className="font-semibold text-slate-800">{application?.productId?.interestRateAnnual}%</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Gross Monthly Income (₹)"
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
          <Input
            label="Existing Monthly EMI Commitments (₹)"
            type="number"
            value={obligations}
            onChange={(e) => setObligations(e.target.value)}
          />
        </div>

        {/* Results Card if evaluated */}
        {assessmentResult && (
          <div className="p-4 rounded-xl border space-y-3 animate-in fade-in duration-200 bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Engine Verdict
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  assessmentResult.result === "ELIGIBLE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {assessmentResult.result === "ELIGIBLE" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                {assessmentResult.result}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase">Calculated EMI</span>
                <span className="text-sm font-bold text-slate-800">
                  {formatCurrency(assessmentResult.estimatedEmi)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase">Total Obligations</span>
                <span className="text-sm font-bold text-slate-800">
                  {formatCurrency(assessmentResult.totalMonthlyObligations)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase">Applicant DTI</span>
                <span
                  className={`text-sm font-bold ${
                    assessmentResult.debtToIncomeRatio <= assessmentResult.maxDtiAllowed
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {assessmentResult.debtToIncomeRatio}%
                  <span className="text-[10px] text-slate-400 block font-normal">
                    (Max: {assessmentResult.maxDtiAllowed}%)
                  </span>
                </span>
              </div>
            </div>

            {/* Rule Checklist */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-700 block">Policy Rule Matrix</span>
              {assessmentResult.ruleResults?.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-md bg-slate-50 border border-slate-100"
                >
                  <span className="text-slate-600 font-medium">{rule.description}</span>
                  <span
                    className={`font-semibold ${
                      rule.passed ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {rule.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleRunAssessment}
            isLoading={isLoading}
            className="gap-2"
          >
            <Calculator className="w-4 h-4" /> Run Assessment Engine
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
