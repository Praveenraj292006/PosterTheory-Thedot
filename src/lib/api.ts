import axios from "axios";

const api = axios.create();

let csrfToken: string | null = null;

export const getCsrfToken = () => csrfToken;

// Fetch CSRF token on first load
export const fetchCsrfToken = async () => {
  try {
    const res = await axios.get("/api/csrf-token");
    csrfToken = res.data.csrfToken;
  } catch {
    console.warn("Failed to fetch CSRF token");
  }
};

// Attach CSRF token to all non-GET requests
api.interceptors.request.use(async (config) => {
  if (!csrfToken) await fetchCsrfToken();
  if (csrfToken && config.method && !["get", "head", "options"].includes(config.method)) {
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});

// If CSRF fails (403), refresh token and retry once
// If session expired (401), auto-logout
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 403 && error.response?.data?.error?.includes("csrf")) {
      await fetchCsrfToken();
      error.config.headers["x-csrf-token"] = csrfToken;
      return axios.request(error.config);
    }
    if (error.response?.status === 401 && error.response?.data?.code === "TOKEN_EXPIRED") {
      localStorage.removeItem('token');
      window.location.href = '/login?expired=1';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;
