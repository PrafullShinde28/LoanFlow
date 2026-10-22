import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("loanflow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
      errors: error.response?.data?.errors || [],
      statusCode: error.response?.status,
    };

    if (error.response?.status === 401) {
      // Token expired or invalid
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("loanflow_token");
        localStorage.removeItem("loanflow_user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(customError);
  }
);

export default axiosClient;
