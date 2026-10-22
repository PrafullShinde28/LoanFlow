import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Shield, Sparkles, ArrowRight, UserCheck } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const { login, quickLogin } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await login(email, password);
      showToast(`Welcome back, ${data.user.name}!`, "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message || "Invalid credentials", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    try {
      setIsLoading(true);
      const data = await quickLogin(role);
      showToast(`Logged in as demo ${role}: ${data.user.name}`, "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message || "Quick login failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white shadow-lg mb-3">
          <Shield className="w-6 h-6 text-blue-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
          LOANFLOW
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Smart Loan Application Management & Underwriting Engine
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 space-y-5">
            {/* Quick Demo Switcher */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
              <span className="text-[11px] font-bold text-blue-900 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Fast Demo Access (1-Click Login)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("CUSTOMER")}
                  className="py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-blue-900 font-semibold hover:bg-blue-100/50 text-left transition-colors"
                >
                  <span className="block text-[10px] text-slate-400">Main Demo Applicant</span>
                  Rahul Patil (Customer)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("LOAN_OFFICER")}
                  className="py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-blue-900 font-semibold hover:bg-blue-100/50 text-left transition-colors"
                >
                  <span className="block text-[10px] text-slate-400">Credit Underwriting</span>
                  Loan Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("MANAGER")}
                  className="py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-blue-900 font-semibold hover:bg-blue-100/50 text-left transition-colors"
                >
                  <span className="block text-[10px] text-slate-400">Credit Committee</span>
                  Branch Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("ADMIN")}
                  className="py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-blue-900 font-semibold hover:bg-blue-100/50 text-left transition-colors"
                >
                  <span className="block text-[10px] text-slate-400">System Admin</span>
                  Super Admin
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase">
                Or Sign In With Email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full gap-2"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              New customer?{" "}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                Register an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
