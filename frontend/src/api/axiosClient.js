import axios from "axios";

export const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;

  // Fallback if not configured in environment
  if (!url || typeof url !== "string" || !url.trim()) {
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      return "https://loanflow-3yif.onrender.com/api";
    }
    return "http://localhost:5000/api";
  }

  // Strip whitespace and quotes
  url = url.trim().replace(/^["']|["']$/g, "");

  // If missing protocol, prepend https:// (or http:// if localhost)
  if (!/^https?:\/\//i.test(url)) {
    url =
      url.includes("localhost") || url.includes("127.0.0.1")
        ? `http://${url}`
        : `https://${url}`;
  }

  // Prevent mixed-content if the site is served over HTTPS
  if (
    typeof window !== "undefined" &&
    window.location?.protocol === "https:" &&
    url.startsWith("http://") &&
    !url.includes("localhost")
  ) {
    url = url.replace(/^http:\/\//i, "https://");
  }

  // Strip trailing slashes
  url = url.replace(/\/+$/, "");

  // Ensure /api suffix
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }

  return url;
};

export const API_BASE_URL = getApiBaseUrl();

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
