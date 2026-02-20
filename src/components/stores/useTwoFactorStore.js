import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useTwoFactorStore = create((set, get) => ({
  loading: false,
  qrCode: null,
  secret: null,
  twoFactorEnabled: false,
  twoFactorVerified: false,

  // Generate 2FA secret and QR code
  generate2FA: async () => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/2fa/generate");
      set({
        qrCode: res.data.qrCode,
        secret: res.data.secret,
        loading: false,
      });
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to generate 2FA");
      throw error;
    }
  },

  // Verify 2FA setup
  verify2FASetup: async (code) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/2fa/verify-setup", { code });
      set({
        twoFactorEnabled: true,
        twoFactorVerified: true,
        loading: false,
      });
      toast.success(res.data.message || "2FA enabled successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Invalid code. Please try again.");
      throw error;
    }
  },

  // Verify 2FA code during login
  verify2FACode: async (code, userId, rememberDevice = false, screenResolution = null, timezone = null) => {
    set({ loading: true });
    try {
      // Get additional device info for consistent fingerprinting
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      
      const res = await axios.post("/auth/2fa/verify", { 
        code, 
        userId, 
        rememberDevice,
        screenResolution,
        timezone,
        // Send device info in nested format for consistency with login
        deviceInfo: {
          screenResolution,
          timezone,
          userAgent,
          platform,
          deviceType: /Mobile|Android|iPhone|iPad/i.test(userAgent) ? "Mobile" : "Desktop"
        }
      });
      set({ loading: false });
      toast.success(res.data.message || "2FA verified successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Invalid code. Please try again.");
      throw error;
    }
  },

  // Disable 2FA
  disable2FA: async (code) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/2fa/disable", { code });
      set({
        twoFactorEnabled: false,
        twoFactorVerified: false,
        qrCode: null,
        secret: null,
        loading: false,
      });
      toast.success(res.data.message || "2FA disabled successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to disable 2FA");
      throw error;
    }
  },

  // Get 2FA status
  get2FAStatus: async () => {
    try {
      const res = await axios.get("/auth/2fa/status");
      set({
        twoFactorEnabled: res.data.twoFactorEnabled || false,
        twoFactorVerified: res.data.twoFactorVerified || false,
      });
      return res.data;
    } catch (error) {
      console.error("Failed to get 2FA status:", error);
      return { twoFactorEnabled: false, twoFactorVerified: false };
    }
  },

  // Reset state
  reset: () => {
    set({
      qrCode: null,
      secret: null,
      loading: false,
    });
  },
}));

