import axios from "axios";

const api = axios.create();

let csrfToken: string | null = null;

export const getCsrfToken = () => csrfToken;

// Fetch CSRF token
export const fetchCsrfToken = async () => {
  try {
    const res = await axios.get("/api/csrf-token");
    csrfToken = res.data.csrfToken;
  } catch (error) {
    console.warn("Failed to fetch CSRF token");
  }
};

// Request interceptor
api.interceptors.request.use(async (config) => {
  // -------------------------
  // JWT AUTHENTICATION
  // -------------------------
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // -------------------------
  // CSRF PROTECTION
  // -------------------------
  const isSafeMethod = ["get", "head", "options"].includes(
    config.method?.toLowerCase() || ""
  );

  if (!isSafeMethod) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }

    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res) => res,

  async (error) => {
    // -------------------------
    // CSRF FAILURE
    // -------------------------
    if (
      error.response?.status === 403 &&
      error.response?.data?.error?.toLowerCase()?.includes("csrf")
    ) {
      await fetchCsrfToken();

      error.config.headers["x-csrf-token"] = csrfToken;

      return axios.request(error.config);
    }

    // -------------------------
    // EXPIRED JWT
    // -------------------------
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED"
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login?expired=1";
    }

    return Promise.reject(error);
  }
);

// API helpers
export const getTrendingProducts = async (limit = 8) => {
  const response = await api.get(
    `/api/products/trending?limit=${limit}`
  );

  return response.data;
};

export const getProductPricing = async () => {
  const response = await api.get("/api/products/pricing");

  return response.data;
};

export default api;