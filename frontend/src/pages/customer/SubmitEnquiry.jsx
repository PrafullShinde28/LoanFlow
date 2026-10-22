import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { enquiryApi } from "../../api/enquiryApi";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { formatCurrency } from "../../utils/formatters";
import { Send, CheckCircle2 } from "lucide-react";

export const SubmitEnquiry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [products, setProducts] = useState([]);
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.phone || "");
  const [loanProductId, setLoanProductId] = useState("");
  const [requestedAmount, setRequestedAmount] = useState(400000);
  const [requestedTenureMonths, setRequestedTenureMonths] = useState(36);
  const [employmentType, setEmploymentType] = useState("SALARIED");
  const [monthlyIncome, setMonthlyIncome] = useState(55000);
  const [purpose, setPurpose] = useState("Personal Funding");
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getProducts(true);
        if (res.success && res.data.products.length > 0) {
          setProducts(res.data.products);
          setLoanProductId(res.data.products[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await enquiryApi.createEnquiry({
        fullName,
        email,
        mobile,
        loanProductId,
        requestedAmount: Number(requestedAmount),
        requestedTenureMonths: Number(requestedTenureMonths),
        employmentType,
        monthlyIncome: Number(monthlyIncome),
        purpose,
      });

      if (res.success && res.data.enquiry) {
        setSubmittedEnquiry(res.data.enquiry);
        showToast("Enquiry submitted successfully!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to submit enquiry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (submittedEnquiry) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl border shadow-card space-y-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Enquiry Submitted!</h2>
        <p className="text-xs text-slate-600">
          Your enquiry ticket has been recorded. Our Loan Officer will contact you to qualify and convert it into a formal application.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border text-xs font-mono font-bold text-blue-600">
          Enquiry ID: {submittedEnquiry.enquiryNumber}
        </div>
        <div className="pt-2 flex justify-center gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button onClick={() => setSubmittedEnquiry(null)}>
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Customer Loan Enquiry
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          Submit your preliminary interest. Our credit officer will contact you within 24 hours.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mobile Contact"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
              <Select
                label="Select Loan Product"
                value={loanProductId}
                onChange={(e) => setLoanProductId(e.target.value)}
                required
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.interestRateAnnual}% APR)
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Requested Funding Amount (₹)"
                type="number"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                required
              />
              <Input
                label="Tenure (Months)"
                type="number"
                value={requestedTenureMonths}
                onChange={(e) => setRequestedTenureMonths(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Employment Type"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="SALARIED">Salaried Employee</option>
                <option value="SELF_EMPLOYED">Self Employed Professional</option>
                <option value="BUSINESS">Business Owner</option>
                <option value="STUDENT">Student (with Co-applicant)</option>
              </Select>
              <Input
                label="Gross Monthly Income (₹)"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                required
              />
            </div>

            <Input
              label="Purpose of Loan"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />

            <Button type="submit" isLoading={isLoading} className="w-full gap-2">
              <Send className="w-4 h-4" /> Submit Loan Enquiry
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
