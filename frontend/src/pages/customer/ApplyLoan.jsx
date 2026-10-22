import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { applicationApi } from "../../api/applicationApi";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { formatCurrency } from "../../utils/formatters";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export const ApplyLoan = () => {
  const navigate = useNavigate();
  const { user, customerProfile } = useAuth();
  const { showToast } = useNotification();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [requestedAmount, setRequestedAmount] = useState(400000);
  const [requestedTenureMonths, setRequestedTenureMonths] = useState(36);
  const [purpose, setPurpose] = useState("Home Renovation and Personal Expenses");

  // Profile fields
  const [fullName, setFullName] = useState(customerProfile?.fullName || user?.name || "");
  const [panNumber, setPanNumber] = useState(customerProfile?.panNumber || "ABCDE1234F");
  const [monthlyIncome, setMonthlyIncome] = useState(customerProfile?.employment?.monthlyIncome || 55000);
  const [existingObligations, setExistingObligations] = useState(
    customerProfile?.employment?.existingEmiObligations || 5000
  );
  const [employerName, setEmployerName] = useState(
    customerProfile?.employment?.employerName || "Tech Mahindra Ltd."
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getProducts(true);
        if (res.success && res.data.products.length > 0) {
          setProducts(res.data.products);
          setSelectedProduct(res.data.products[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (productId) => {
    const p = products.find((prod) => prod._id === productId);
    setSelectedProduct(p);
    if (p) {
      if (requestedAmount < p.minAmount) setRequestedAmount(p.minAmount);
      if (requestedAmount > p.maxAmount) setRequestedAmount(p.maxAmount);
      if (requestedTenureMonths < p.minTenureMonths) setRequestedTenureMonths(p.minTenureMonths);
      if (requestedTenureMonths > p.maxTenureMonths) setRequestedTenureMonths(p.maxTenureMonths);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsLoading(true);
      const payload = {
        productId: selectedProduct._id,
        requestedAmount: Number(requestedAmount),
        requestedTenureMonths: Number(requestedTenureMonths),
        purpose,
        customerDetails: {
          fullName,
          panNumber: panNumber.toUpperCase(),
          employment: {
            employmentType: "SALARIED",
            employerName,
            monthlyIncome: Number(monthlyIncome),
            existingEmiObligations: Number(existingObligations),
            experienceYears: 4,
          },
        },
      };

      const res = await applicationApi.createApplication(payload);
      if (res.success && res.data.application) {
        showToast("Application submitted successfully! Please upload required proofs.", "success");
        navigate(`/applications/${res.data.application._id}`);
      }
    } catch (err) {
      showToast(err.message || "Failed to submit loan application", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Apply for a Loan
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          Select your desired loan product, customize your funding requirements, and provide employment coordinates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Product */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Loan Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((p) => {
                const isSelected = selectedProduct?._id === p._id;
                return (
                  <div
                    key={p._id}
                    onClick={() => handleProductChange(p._id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-800">{p.name}</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {p.interestRateAnnual}% p.a.
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{p.description}</p>
                    <div className="text-[11px] text-slate-400">
                      Limits: {formatCurrency(p.minAmount)} - {formatCurrency(p.maxAmount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Loan Parameters */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>2. Financing Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={`Requested Amount (₹${selectedProduct.minAmount.toLocaleString("en-IN")} - ₹${selectedProduct.maxAmount.toLocaleString("en-IN")})`}
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  min={selectedProduct.minAmount}
                  max={selectedProduct.maxAmount}
                  required
                />
                <Input
                  label={`Tenure (${selectedProduct.minTenureMonths} - ${selectedProduct.maxTenureMonths} Months)`}
                  type="number"
                  value={requestedTenureMonths}
                  onChange={(e) => setRequestedTenureMonths(e.target.value)}
                  min={selectedProduct.minTenureMonths}
                  max={selectedProduct.maxTenureMonths}
                  required
                />
              </div>

              <Input
                label="Purpose of Loan"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Higher Education, Medical Emergency, Renovations"
                required
              />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Income & Employment */}
        <Card>
          <CardHeader>
            <CardTitle>3. Employment & Underwriting Baseline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Applicant Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="PAN Card Identifier"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                maxLength={10}
                required
              />
              <Input
                label="Current Employer / Organization"
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                required
              />
              <Input
                label="Gross Monthly Income (₹)"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                required
              />
              <Input
                label="Existing Monthly EMI Commitments (₹)"
                type="number"
                value={existingObligations}
                onChange={(e) => setExistingObligations(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="gap-2 px-6"
          >
            Submit Application <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
