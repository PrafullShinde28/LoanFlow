import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("loanflow_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [customerProfile, setCustomerProfile] = useState(() => {
    const saved = localStorage.getItem("loanflow_customer_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("loanflow_token"));
  const [isLoading, setIsLoading] = useState(true);

  // Restore and verify user session on initial boot
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem("loanflow_token");
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data.user) {
            setUser(res.data.user);
            setCustomerProfile(res.data.customerProfile || null);
            localStorage.setItem("loanflow_user", JSON.stringify(res.data.user));
            if (res.data.customerProfile) {
              localStorage.setItem("loanflow_customer_profile", JSON.stringify(res.data.customerProfile));
            }
          }
        } catch (error) {
          console.warn("Session verification expired:", error.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data.token) {
      const { user: loggedInUser, token: jwtToken, customerProfile: profile } = res.data;
      setToken(jwtToken);
      setUser(loggedInUser);
      setCustomerProfile(profile || null);

      localStorage.setItem("loanflow_token", jwtToken);
      localStorage.setItem("loanflow_user", JSON.stringify(loggedInUser));
      if (profile) {
        localStorage.setItem("loanflow_customer_profile", JSON.stringify(profile));
      }
      return res.data;
    }
    throw new Error(res.message || "Login failed");
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.data.token) {
      const { user: registeredUser, token: jwtToken } = res.data;
      setToken(jwtToken);
      setUser(registeredUser);

      localStorage.setItem("loanflow_token", jwtToken);
      localStorage.setItem("loanflow_user", JSON.stringify(registeredUser));
      return res.data;
    }
    throw new Error(res.message || "Registration failed");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCustomerProfile(null);
    localStorage.removeItem("loanflow_token");
    localStorage.removeItem("loanflow_user");
    localStorage.removeItem("loanflow_customer_profile");
  };

  const quickLogin = async (role) => {
    const credentials = {
      ADMIN: { email: "admin@loanflow.com", password: "Admin@123" },
      LOAN_OFFICER: { email: "officer@loanflow.com", password: "Officer@123" },
      MANAGER: { email: "manager@loanflow.com", password: "Manager@123" },
      CUSTOMER: { email: "customer@loanflow.com", password: "Customer@123" },
    };

    const target = credentials[role];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
