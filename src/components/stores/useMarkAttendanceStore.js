import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useMarkAttendanceStore = create((set, get) => ({
  loading: false,
  successMessage: "",
  submittedStudents: [],
  error: null,

  markAttendance: async (attendanceData) => {
    set({ loading: true, error: null, successMessage: "" });
    
    try {
      const response = await axios.post("/attendance/mark", {
        attendanceData,
      });

      const { message, count, skippedStudents } = response.data;
      
      set({
        loading: false,
        successMessage: `${message} - ${count} students processed`,
        submittedStudents: [...get().submittedStudents, ...attendanceData.map(item => item.studentId)],
      });

      // Don't show toast here - let the component handle it
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        set({ successMessage: "" });
      }, 3000);

    } catch (error) {
      console.error("Error marking attendance:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit attendance";
      
      set({
        loading: false,
        error: errorMessage,
      });

      // Don't show toast here - let the component handle it
      
      // Clear error after 5 seconds
      setTimeout(() => {
        set({ error: null });
      }, 5000);
    }
  },

  clearMessages: () => {
    set({ successMessage: "", error: null });
  },

  resetSubmittedStudents: () => {
    set({ submittedStudents: [] });
  },
}));