import { create } from "zustand";
import axios from "../lib/axios";

export const useSubjectStore = create((set, get) => ({
  subjects: [],
  loading: false,
  error: null,

  // Fetch all subjects
  fetchSubjects: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/subjects");
      set({ subjects: res.data.subjects, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  // Add a subject
  addSubject: async (subject) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/subjects", subject);
      set((state) => ({
        subjects: [...state.subjects, res.data.subject],
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  // Update a subject
  updateSubject: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/subjects/${id}`, updates);
      set((state) => ({
        subjects: state.subjects.map((s) =>
          s._id === id ? res.data.subject : s
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  // Delete a subject
  deleteSubject: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/subjects/${id}`);
      set((state) => ({
        subjects: state.subjects.filter((s) => s._id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },
}));
