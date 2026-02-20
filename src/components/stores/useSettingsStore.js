import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useSettingsStore = create((set, get) => ({
  settings: {},
  loading: false,
  error: null,

  fetchAllSettings: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/settings");
      const map = {};
      (res.data.settings || []).forEach((s) => {
        map[s.key] = s.value;
      });
      set({ settings: map, loading: false });
    } catch (err) {
      set({ loading: false, error: "Failed to load settings" });
      toast.error(err?.response?.data?.message || "Failed to load settings");
    }
  },

  updateReminderTime: async (time) => {
    set({ loading: true });
    try {
      await axios.post("/settings/reminder-time", { time });
      toast.success("Reminder time updated");
      await get().fetchAllSettings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update reminder time");
    } finally {
      set({ loading: false });
    }
  },

  updateReminderDays: async (days) => {
    set({ loading: true });
    try {
      await axios.post("/settings/reminder-days", { days });
      toast.success("Reminder days updated");
      await get().fetchAllSettings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update reminder days");
    } finally {
      set({ loading: false });
    }
  },
}));


