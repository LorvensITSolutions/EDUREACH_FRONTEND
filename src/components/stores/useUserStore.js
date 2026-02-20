// src/stores/useUserStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      checkingAuth: false,
      authChecked: false, // Flag to prevent multiple auth checks

      setUser: (user) => set({ user }),

      // Signup
      signup: async ({ name, email, password, confirmPassword, role }) => {
        set({ loading: true });
        if (password !== confirmPassword) {
          set({ loading: false });
          return toast.error("Passwords do not match");
        }

        try {
          const res = await axios.post("/auth/signup", {
            name,
            email,
            password,
            role,
          });
          set({ user: res.data, loading: false });
          toast.success("Signup successful!");
        } catch (error) {
          set({ loading: false });
          toast.error(error?.response?.data?.message || "Signup failed");
        }
      },

      // Login
      login: async (username, password) => {
        set({ loading: true });
        try {
          // Get device information for consistent device fingerprint
          const screenResolution = `${window.screen.width}x${window.screen.height}`;
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const userAgent = navigator.userAgent;
          const platform = navigator.platform;
          
          // Send device info in the format backend expects (nested in deviceInfo)
          const res = await axios.post("/auth/login", { 
            email: username, 
            password,
            deviceInfo: {
              screenResolution,
              timezone,
              userAgent,
              platform,
              deviceType: /Mobile|Android|iPhone|iPad/i.test(userAgent) ? "Mobile" : "Desktop"
            }
          });
          
          // Check if device is trusted (skips 2FA)
          if (res.data.deviceTrusted) {
            // Device is trusted, login successful
            // ✅ Get full profile data with avatar after login
            const profileRes = await axios.get("/auth/profile");
            set({ user: profileRes.data, loading: false, authChecked: true });
            
            toast.success("Login successful!");
            return profileRes.data;
          }
          
          // Check if TOTP 2FA is required (highest priority)
          if (res.data.requires2FA) {
            set({ loading: false });
            return {
              requires2FA: true,
              userId: res.data.userId,
              message: res.data.message,
            };
          }
          
          // Check if SMS 2FA is required (second priority)
          if (res.data.requiresSMS2FA) {
            set({ loading: false });
            return {
              requiresSMS2FA: true,
              userId: res.data.userId,
              phoneMasked: res.data.phoneMasked,
              message: res.data.message,
            };
          }
          
          // Check if email 2FA is required (third priority)
          if (res.data.requiresEmail2FA) {
            set({ loading: false });
            return {
              requiresEmail2FA: true,
              userId: res.data.userId,
              message: res.data.message,
            };
          }
          
          // ✅ Get full profile data with avatar after login
          const profileRes = await axios.get("/auth/profile");
          set({ user: profileRes.data, loading: false, authChecked: true });
          
          toast.success("Login successful!");
          return profileRes.data;
        } catch (error) {
          set({ loading: false });

          if (error.response?.status === 403) {
            toast.error("Password reset required");
            return { mustChangePassword: true };
          }

          toast.error(error?.response?.data?.message || "Login failed");
          return null;
        }
      },

      // Logout
      logout: async () => {
        try {
          await axios.post("/auth/logout");
          set({ user: null, authChecked: false });
          toast.success("Logged out successfully");
        } catch (error) {
          // Even if logout fails on server, clear local state
          set({ user: null, authChecked: false });
          toast.error(error?.response?.data?.message || "Logout failed");
        }
      },

      // Check Auth - Only check if user exists in storage
      checkAuth: async () => {
        const state = get();
        // Prevent multiple simultaneous auth checks
        if (state.checkingAuth || state.authChecked) {
          return;
        }
        
        // Only check auth if we have a stored user
        if (!state.user) {
          set({ authChecked: true });
          return;
        }
        
        set({ checkingAuth: true });
        try {
          const res = await axios.get("/auth/profile");
          set({ user: res.data, checkingAuth: false, authChecked: true });
        } catch (error) {
          // If auth check fails, clear the stored user
          if (error.response?.status === 401 || error.response?.status === 403) {
            set({ user: null, checkingAuth: false, authChecked: true });
          } else {
            console.error("Auth check error:", error);
            set({ checkingAuth: false, authChecked: true });
          }
        }
      },

      // Reset auth check flag (for testing or manual refresh)
      resetAuthCheck: () => set({ authChecked: false }),

      // Refresh Token
      refreshToken: async () => {
        if (get().checkingAuth) return;
        set({ checkingAuth: true });
        try {
          const res = await axios.post("/auth/refresh-token");
          set({ checkingAuth: false });
          return res.data;
        } catch (err) {
          set({ user: null, checkingAuth: false });
          throw err;
        }
      },

      // Forgot Password
      forgotPassword: async (email) => {
        try {
          const res = await axios.post("/auth/forgot-password", { email });
          toast.success(res.data.message);
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to send reset email");
        }
      },

      // Reset Password
      resetPassword: async (token, password) => {
        try {
          const res = await axios.post(`/auth/reset-password/${token}`, {
            password,
          });
          toast.success(res.data.message);
        } catch (error) {
          toast.error(error?.response?.data?.message || "Password reset failed");
        }
      },

      // Change Password
      changePassword: async ({ currentPassword, newPassword }) => {
        try {
          const res = await axios.post("/auth/change-password", {
            currentPassword,
            newPassword,
          });
          toast.success(res.data.message);
          // Refresh user profile to get updated mustChangePassword flag
          await get().getProfile();
        } catch (error) {
          toast.error(error?.response?.data?.message || "Change password failed");
        }
      },

      // Fetch current profile manually
      getProfile: async () => {
        try {
          const res = await axios.get("/auth/profile");
          set({ user: res.data, authChecked: true, checkingAuth: false });
          return res.data;
        } catch (error) {
          set({ authChecked: true, checkingAuth: false });
          // Don't show error toast for 401/403 - user just isn't logged in
          if (error.response?.status !== 401 && error.response?.status !== 403) {
            toast.error("Failed to fetch user profile");
          }
          throw error;
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

