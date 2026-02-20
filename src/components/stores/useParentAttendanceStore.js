import { create } from "zustand";
import axios from "../lib/axios";

export const useParentAttendanceStore = create((set) => ({
  loading: false,
  error: null,
  summary: null,

  fetchParentAttendance: async (month, year) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/attendance/parent/student-attendance", {
        params: { month, year },
      });
      set({ summary: res.data });
    } catch (error) {
      console.error("Failed to fetch parent attendance:", error);
      set({
        error: error.response?.data?.message || "Unable to fetch attendance",
        summary: null,
      });
    } finally {
      set({ loading: false });
    }
  },
}));
