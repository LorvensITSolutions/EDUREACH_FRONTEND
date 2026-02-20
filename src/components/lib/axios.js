import axios from "axios";

// API base URL: VITE_API_BASE_URL (set when API is on another domain) > same-origin /api (deployed) > localhost (dev)
function getApiBaseUrl() {
	if (import.meta.env.VITE_API_BASE_URL) {
		return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
	}
	if (typeof window !== "undefined" && window.location?.origin) {
		const origin = window.location.origin;
		// When deployed on a domain (not localhost dev), use same origin so one build works
		if (!origin.includes("localhost:5173") && !origin.includes("127.0.0.1")) {
			return `${origin}/api`;
		}
	}
	return "http://localhost:5000/api";
}

const API_BASE_URL = getApiBaseUrl();
if (import.meta.env.DEV) {
	console.log("🔗 API Base URL:", API_BASE_URL);
}

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
});

// Add response interceptor to handle unauthorized responses gracefully
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress 401/403 errors for auth/profile - they're expected when not logged in
    const isAuthProfileCheck = error.config?.url?.includes('/auth/profile');
    
    // Don't redirect for holidays endpoint errors (optional data)
    const isHolidaysEndpoint = error.config?.url?.includes('/holidays');
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't log or show errors for auth profile checks (expected when not logged in)
      if (isAuthProfileCheck) {
        // Silently reject - this is normal behavior
        return Promise.reject(error);
      }
      
      // Don't redirect for holidays endpoint - it's optional data
      if (isHolidaysEndpoint) {
        console.log('Holidays endpoint unauthorized - skipping redirect');
        return Promise.reject(error);
      }
      
      // For other unauthorized errors, log but don't show as error
      console.log('Unauthorized request:', error.config?.url);

      try {
        // Clear persisted user store to force logout
        localStorage.removeItem('user-storage');
      } catch {}

      // Redirect to login if not already there
      const isOnAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/auth');
      if (!isOnAuthPage) {
        window.location.href = '/login';
      }
    } else {
      // Only log non-401/403 errors
      console.error('API Error:', error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
