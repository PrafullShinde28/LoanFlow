import React, { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { applicationApi } from "../../api/applicationApi";
import { formatCurrency } from "../../utils/formatters";
import { useNotification } from "../../context/NotificationContext";
import confetti from "canvas-confetti";
import { Banknote, AlertCircle, ArrowUpRight } from "lucide-react";

export const DisbursementModal = ({
  isOpen,
  onClose,
  application,
  sanction,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const maxDisburse = sanction?.approvedAmount || application?.requestedAmount || 0;
  const [amount, setAmount] = useState(maxDisburse);
  const [paymentMethod, setPaymentMethod] = useState("NEFT");
  const [bankRef, setBankRef] = useState(
    `UTR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [accountMasked, setAccountMasked] = useState("HDFC-XXXX-4921");
  const [remarks, setRemarks] = useState("Funds released to customer verified account.");
  const [isLoading, setIsLoading] = useState(false);

  const handleDisburse = async (e) => {
    e.preventDefault();

    if (Number(amount) > maxDisburse) {
      showToast(
        `Disbursement amount cannot exceed sanctioned amount of ${formatCurrency(maxDisburse)}`,
        "error"
      );
      return;
    }

    try {
      setIsLoading(true);
      const res = await applicationApi.disburseLoan(application._id, {
        amount: Number(amount),
        paymentMethod,
        bankReferenceNumber: bankRef,
        accountNumberMasked: accountMasked,
        remarks,
      });

      if (res.success) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        showToast("Loan funds successfully disbursed!", "success");
        onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || "Disbursement failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Execute Loan Fund Disbursement"
      description="Release approved loan funds directly into customer bank account."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleDisburse} className="space-y-4">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div>
            <span className="block text-emerald-700 font-medium">Sanctioned Ceiling</span>
            <span className="text-base font-bold">{formatCurrency(maxDisburse)}</span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
            Ready for Transfer
          </span>
        </div>

        <Input
          label="Disbursement Amount (₹)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          helperText={`Must be ≤ ${formatCurrency(maxDisburse)}`}
          error={Number(amount) > maxDisburse ? "Exceeds sanctioned amount ceiling" : ""}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Payment Mode"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="NEFT">NEFT (National Electronic Fund Transfer)</option>
            <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
            <option value="IMPS">IMPS (Immediate Payment Service)</option>
            <option value="CHEQUE">Banker's Cheque / Demand Draft</option>
          </Select>

          <Input
            label="Beneficiary Account"
            value={accountMasked}
            onChange={(e) => setAccountMasked(e.target.value)}
            required
          />
        </div>

        <Input
          label="Bank UTR / Transaction Reference ID"
          value={bankRef}
          onChange={(e) => setBankRef(e.target.value)}
          required
        />

        <Input
          label="Disbursement Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            isLoading={isLoading}
            disabled={Number(amount) > maxDisburse || Number(amount) <= 0}
            className="gap-2"
          >
            <ArrowUpRight className="w-4 h-4" /> Execute Transfer
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
