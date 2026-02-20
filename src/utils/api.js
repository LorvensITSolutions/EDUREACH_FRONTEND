// Helper function to get the API base URL for fetch requests
// This ensures all API calls use the correct backend URL (local or production)

export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Get API base URL from environment variable
   const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Remove /api suffix from baseURL if present (to avoid double /api/api)
  const cleanBaseURL = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;
  
  // Return full URL
  return `${cleanBaseURL}/api/${cleanEndpoint}`;
};

