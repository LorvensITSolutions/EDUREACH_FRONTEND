import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useStudentAssignmentStore = create((set, get) => ({
  assignments: [],
  selectedAssignment: null,
  loading: false,
  submitting: false,
  error: null,

  // Fetch all assignments for the logged-in student
  fetchStudentAssignments: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get("/assignments/student");
      set({ assignments: res.data.assignments });
    } catch (err) {
      console.error("Fetch student assignments error:", err);
      toast.error(err.response?.data?.message || "Failed to load assignments");
      set({ error: err.response?.data?.message || "Failed to load assignments" });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch single assignment details for a student
  fetchSingleAssignment: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`/assignments/${id}`);
      set({ selectedAssignment: res.data });
    } catch (err) {
      console.error("Fetch single assignment error:", err);
      toast.error(err.response?.data?.message || "Assignment not found");
      set({ error: err.response?.data?.message || "Assignment not found" });
    } finally {
      set({ loading: false });
    }
  },

  // Submit assignment file
  submitAssignment: async (assignmentId, formData) => {
    try {
      set({ submitting: true, error: null });
      const res = await axios.post(
        `/assignments/submit/${assignmentId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res.data.message || "Assignment submitted");
      
      // Refresh assignments to update the UI immediately
      await get().fetchStudentAssignments();
    } catch (err) {
      console.error("Submit assignment error:", err);
      toast.error(err.response?.data?.message || "Submission failed");
      set({ error: err.response?.data?.message || "Submission failed" });
    } finally {
      set({ submitting: false });
    }
  },

  // Clear selected assignment
  clearSelectedAssignment: () => set({ selectedAssignment: null }),
}));
