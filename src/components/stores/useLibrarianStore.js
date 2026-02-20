// src/stores/useLibrarianStore.js
import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useLibrarianStore = create((set, get) => ({
  loading: false,
  librarians: [],

  // ✅ Create a new librarian (admin only)
  createLibrarian: async ({ name, email }) => {
    try {
      set({ loading: true });
      const res = await axios.post("/librarians/create-librarian", { name, email });
      toast.success(res.data.message || "Librarian created successfully");

      // Optional: refresh list
      await get().getAllLibrarians();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create librarian");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Fetch all librarians (admin only)
  getAllLibrarians: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/librarians/all");
      set({ librarians: res.data.librarians || [] });
    } catch (err) {
      toast.error("Failed to fetch librarians");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Delete a librarian by ID (admin only)
  deleteLibrarian: async (librarianId) => {
    try {
      set({ loading: true });
      await axios.delete(`/librarians/${librarianId}`);
      toast.success("Librarian deleted");

      // Update local state
      set((state) => ({
        librarians: state.librarians.filter((l) => l._id !== librarianId),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete librarian");
    } finally {
      set({ loading: false });
    }
  },
}));
