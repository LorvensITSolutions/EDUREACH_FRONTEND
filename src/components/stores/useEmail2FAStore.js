import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useEmail2FAStore = create((set, get) => ({
  loading: false,
  email2FAEnabled: false,
  hasEmail: false,

  // Send email 2FA code (for resending)
  sendEmail2FACode: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/email-2fa/send", { email, password });
      set({ loading: false });
      toast.success(res.data.message || "Verification code sent to your email");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to send verification code");
      throw error;
    }
  },

  // Verify email 2FA code during login
  verifyEmail2FACode: async (code, userId, rememberDevice = false, screenResolution = null, timezone = null) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/email-2fa/verify", { 
        code, 
        userId,
        rememberDevice,
        screenResolution,
        timezone,
      });
      set({ loading: false });
      toast.success(res.data.message || "Email 2FA verified successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Invalid code. Please try again.");
      throw error;
    }
  },

  // Enable email 2FA
  enableEmail2FA: async () => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/email-2fa/enable");
      set({
        email2FAEnabled: true,
        loading: false,
      });
      toast.success(res.data.message || "Email 2FA enabled successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to enable email 2FA");
      throw error;
    }
  },

  // Disable email 2FA
  disableEmail2FA: async () => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/email-2fa/disable");
      set({
        email2FAEnabled: false,
        loading: false,
      });
      toast.success(res.data.message || "Email 2FA disabled successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to disable email 2FA");
      throw error;
    }
  },

  // Get email 2FA status
  getEmail2FAStatus: async () => {
    try {
      const res = await axios.get("/auth/email-2fa/status");
      set({
        email2FAEnabled: res.data.email2FAEnabled || false,
        hasEmail: res.data.hasEmail || false,
      });
      return res.data;
    } catch (error) {
      console.error("Failed to get email 2FA status:", error);
      return { email2FAEnabled: false, hasEmail: false };
    }
  },

  // Reset state
  reset: () => {
    set({
      loading: false,
    });
  },
}));

