import { create } from "zustand";
import axios from "../lib/axios";
import { persist } from "zustand/middleware";

export const useStudentAttendanceStore = create(
  persist(
    (set) => ({
      loading: false,
      error: null,
      summary: null,

      fetchStudentAttendance: async (month, year) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.get(`/attendance/students-attendance`, {
            params: { month, year },
          });
          set({ summary: res.data });
        } catch (error) {
          console.error("Failed to fetch student attendance:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch attendance",
            summary: null,
          });
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: "student-attendance-store" }
  )
);
