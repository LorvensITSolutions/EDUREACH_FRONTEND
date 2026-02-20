import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useDeviceTrustStore = create((set, get) => ({
  loading: false,
  devices: [],

  // Get all trusted devices
  getTrustedDevices: async () => {
    try {
      const res = await axios.get("/auth/device-trust/devices");
      set({ devices: res.data.devices || [] });
      return res.data.devices || [];
    } catch (error) {
      console.error("Failed to get trusted devices:", error);
      set({ devices: [] });
      return [];
    }
  },

  // Revoke a specific device
  revokeDevice: async (deviceId) => {
    set({ loading: true });
    try {
      await axios.delete(`/auth/device-trust/devices/${deviceId}`);
      toast.success("Device revoked successfully");
      // Refresh device list
      await get().getTrustedDevices();
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to revoke device");
      throw error;
    }
  },

  // Revoke all devices
  revokeAllDevices: async () => {
    set({ loading: true });
    try {
      await axios.delete("/auth/device-trust/devices");
      toast.success("All devices revoked successfully");
      set({ devices: [] });
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to revoke devices");
      throw error;
    }
  },

  // Get device token from cookie
  getDeviceToken: () => {
    // Device token is stored in httpOnly cookie, so we can't access it directly
    // The backend will read it from cookies automatically
    return null;
  },
}));

