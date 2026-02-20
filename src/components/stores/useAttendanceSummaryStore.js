// src/stores/useAttendanceSummaryStore.js
import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAttendanceSummaryStore = create((set) => ({
  loading: false,
  error: null,

  downloadSummary: async ({ month, year, filter }) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get(
        `/attendance/summary?month=${month}&year=${year}&filter=${filter}`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Attendance-${month}-${year}-${filter}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      toast.success("Attendance summary downloaded");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download summary");
      set({ error: error.response?.data?.message || "Download error" });
    } finally {
      set({ loading: false });
    }
  },
}));
