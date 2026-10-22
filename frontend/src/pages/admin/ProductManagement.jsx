import React, { useState, useEffect } from "react";
import { productApi } from "../../api/productApi";
import { useNotification } from "../../context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Dialog } from "../../components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatCurrency } from "../../utils/formatters";
import { PlusCircle, Settings, Edit2, ShieldAlert } from "lucide-react";

export const ProductManagement = () => {
  const { showToast } = useNotification();
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form fields
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("PERSONAL");
  const [minAmount, setMinAmount] = useState(50000);
  const [maxAmount, setMaxAmount] = useState(1500000);
  const [minTenureMonths, setMinTenureMonths] = useState(12);
  const [maxTenureMonths, setMaxTenureMonths] = useState(60);
  const [interestRateAnnual, setInterestRateAnnual] = useState(11.5);
  const [minMonthlyIncome, setMinMonthlyIncome] = useState(25000);
  const [maxDtiPercent, setMaxDtiPercent] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await productApi.getProducts();
      if (res.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load products", "error");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setCode("");
    setName("");
    setDescription("");
    setCategory("PERSONAL");
    setMinAmount(50000);
    setMaxAmount(1500000);
    setMinTenureMonths(12);
    setMaxTenureMonths(60);
    setInterestRateAnnual(11.5);
    setMinMonthlyIncome(25000);
    setMaxDtiPercent(50);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setCurrentId(product._id);
    setCode(product.code);
    setName(product.name);
    setDescription(product.description || "");
    setCategory(product.category);
    setMinAmount(product.minAmount);
    setMaxAmount(product.maxAmount);
    setMinTenureMonths(product.minTenureMonths);
    setMaxTenureMonths(product.maxTenureMonths);
    setInterestRateAnnual(product.interestRateAnnual);
    setMinMonthlyIncome(product.minMonthlyIncome);
    setMaxDtiPercent(product.maxDtiPercent || 50);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const payload = {
        code,
        name,
        description,
        category,
        minAmount: Number(minAmount),
        maxAmount: Number(maxAmount),
        minTenureMonths: Number(minTenureMonths),
        maxTenureMonths: Number(maxTenureMonths),
        interestRateAnnual: Number(interestRateAnnual),
        minMonthlyIncome: Number(minMonthlyIncome),
        maxDtiPercent: Number(maxDtiPercent),
      };

      if (isEditing) {
        await productApi.updateProduct(currentId, payload);
        showToast("Loan product policy updated successfully", "success");
      } else {
        await productApi.createProduct(payload);
        showToast("New loan product created successfully", "success");
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.message || "Failed to save product", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Loan Products & Policy Configuration
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Configure credit boundaries, annual interest rates, and custom Debt-to-Income (DTI) thresholds per product.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="gap-1.5">
          <PlusCircle className="w-4 h-4" /> Add Loan Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Loan Amount Range</TableHead>
                <TableHead>Tenure</TableHead>
                <TableHead>APR (%)</TableHead>
                <TableHead>Min Income</TableHead>
                <TableHead>Max DTI</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-mono font-bold text-xs text-blue-600">
                    {p.code}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-slate-800">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {p.category}
                  </TableCell>
                  <TableCell className="text-xs text-slate-800 font-medium">
                    {formatCurrency(p.minAmount)} - {formatCurrency(p.maxAmount)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {p.minTenureMonths} - {p.maxTenureMonths} Mo
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">
                    {p.interestRateAnnual}%
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {formatCurrency(p.minMonthlyIncome)}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-blue-700">
                    {p.maxDtiPercent || 50}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(p)}
                      className="text-xs h-7 px-2.5 gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Policy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit / Create Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Loan Product Policy" : "Create New Loan Product"}
        description="Parameters set here are dynamically evaluated by the eligibility engine."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Product Code (e.g. PL-001)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isEditing}
              required
            />
            <Input
              label="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Product Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="PERSONAL">PERSONAL</option>
              <option value="HOME">HOME</option>
              <option value="EDUCATION">EDUCATION</option>
              <option value="VEHICLE">VEHICLE</option>
            </Select>

            <Input
              label="Annual Interest Rate (APR %)"
              type="number"
              step="0.1"
              value={interestRateAnnual}
              onChange={(e) => setInterestRateAnnual(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minimum Amount (₹)"
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              required
            />
            <Input
              label="Maximum Amount (₹)"
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Tenure (Months)"
              type="number"
              value={minTenureMonths}
              onChange={(e) => setMinTenureMonths(e.target.value)}
              required
            />
            <Input
              label="Max Tenure (Months)"
              type="number"
              value={maxTenureMonths}
              onChange={(e) => setMaxTenureMonths(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <Input
              label="Minimum Monthly Income (₹)"
              type="number"
              value={minMonthlyIncome}
              onChange={(e) => setMinMonthlyIncome(e.target.value)}
              required
            />
            <Input
              label="Configurable Max DTI Threshold (%)"
              type="number"
              value={maxDtiPercent}
              onChange={(e) => setMaxDtiPercent(e.target.value)}
              helperText="E.g. 50% for Personal, 55% for Home, 45% for Vehicle"
              required
            />
          </div>

          <Input
            label="Product Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? "Save Policy Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
