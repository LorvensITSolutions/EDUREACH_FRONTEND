// src/stores/useParentAssignmentStore.js
import { create } from "zustand";
import axios from "../lib/axios";

export const useParentAssignmentStore = create((set) => ({
  assignmentsByChild: [],
  loading: false,
  error: null,

  // Fetch all children assignments (multi-child support)
  fetchChildAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/assignments/parent/student");
      set({ assignmentsByChild: res.data.assignmentsByChild });
    } catch (err) {
      console.error("Parent fetch assignments error:", err);
      set({
        error:
          err.response?.data?.message ||
          "Failed to load your child's assignments.",
        assignmentsByChild: [],
      });
    } finally {
      set({ loading: false });
    }
  },
}));
