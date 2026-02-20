import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useSMS2FAStore = create((set, get) => ({
  loading: false,
  sms2FAEnabled: false,
  hasPhone: false,
  phoneMasked: null,
  isParentPhone: false, // Indicates if using parent's phone (for students)

  // Send SMS 2FA code (for resending)
  sendSMS2FACode: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/sms-2fa/send", { email, password });
      set({ loading: false });
      toast.success(res.data.message || "Verification code sent to your phone");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to send verification code");
      throw error;
    }
  },

  // Verify SMS 2FA code during login
  verifySMS2FACode: async (code, userId, rememberDevice = false, screenResolution = null, timezone = null) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/sms-2fa/verify", { 
        code, 
        userId,
        rememberDevice,
        screenResolution,
        timezone,
      });
      set({ loading: false });
      toast.success(res.data.message || "SMS 2FA verified successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Invalid code. Please try again.");
      throw error;
    }
  },

  // Enable SMS 2FA
  enableSMS2FA: async (phone) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/sms-2fa/enable", phone ? { phone } : {});
      set({
        sms2FAEnabled: true,
        phoneMasked: res.data.phoneMasked || null,
        isParentPhone: res.data.isParentPhone || false,
        loading: false,
      });
      toast.success(res.data.message || "SMS 2FA enabled successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to enable SMS 2FA");
      throw error;
    }
  },

  // Disable SMS 2FA
  disableSMS2FA: async () => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/sms-2fa/disable");
      set({
        sms2FAEnabled: false,
        loading: false,
      });
      toast.success(res.data.message || "SMS 2FA disabled successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to disable SMS 2FA");
      throw error;
    }
  },

  // Get SMS 2FA status
  getSMS2FAStatus: async () => {
    try {
      const res = await axios.get("/auth/sms-2fa/status");
      set({
        sms2FAEnabled: res.data.sms2FAEnabled || false,
        hasPhone: res.data.hasPhone || false,
        phoneMasked: res.data.phoneMasked || null,
        isParentPhone: res.data.isParentPhone || false,
      });
      return res.data;
    } catch (error) {
      console.error("Failed to get SMS 2FA status:", error);
      return { sms2FAEnabled: false, hasPhone: false, phoneMasked: null };
    }
  },

  // Update phone number
  updatePhoneNumber: async (phone) => {
    set({ loading: true });
    try {
      const res = await axios.put("/auth/sms-2fa/phone", { phone });
      set({
        phoneMasked: res.data.phoneMasked || null,
        hasPhone: true,
        loading: false,
      });
      toast.success(res.data.message || "Phone number updated successfully!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to update phone number");
      throw error;
    }
  },

  // Reset state
  reset: () => {
    set({
      loading: false,
    });
  },
}));

