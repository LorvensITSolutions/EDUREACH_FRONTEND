// src/stores/useParentStore.js
import { create } from "zustand";
import axios from "../lib/axios";

export const useParentStore = create((set) => ({
  parents: [],
  parentCount: 0,
  loading: false,
  errorMessage: "",
  successMessage: "",

  fetchParents: async (filters = {}) => {
    try {
      set({ loading: true });
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(`/parents?${queryParams}`);
      set({ parents: res.data.parents, loading: false });
    } catch (err) {
      set({
        errorMessage: "Failed to fetch parents",
        loading: false,
      });
      console.error("Fetch parents error:", err);
    }
  },

  fetchParentCount: async () => {
    try {
      const res = await axios.get("/parents/count");
      set({ parentCount: res.data.count });
    } catch (error) {
      console.error("Fetch parent count error:", error);
    }
  },

  clearMessages: () => set({ errorMessage: "", successMessage: "" }),
}));
