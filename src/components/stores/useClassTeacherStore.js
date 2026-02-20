import { create } from "zustand";
import axios from "../lib/axios"; // your axios instance with auth headers

export const useClassTeacherStore = create((set) => ({
  loading: false,
  error: null,
  teachers: [],
  studentInfo: null,
  children: [], // For multiple children
  previousClassTeachers: [], // Previous class teachers for single child

  fetchClassTeachers: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get("/teachers/class-teachers");

      // Handle single child format (backward compatibility)
      if (res.data.student && res.data.teachers) {
        set({
          teachers: res.data.teachers || [],
          studentInfo: res.data.student || null,
          previousClassTeachers: res.data.previousClassTeachers || [],
          children: null, // Single child mode
          loading: false,
          error: null,
        });
      }
      // Handle multiple children format
      else if (res.data.children && Array.isArray(res.data.children)) {
        // If only one child in array, treat it like single child for backward compatibility
        if (res.data.children.length === 1) {
          const singleChild = res.data.children[0];
          set({
            teachers: singleChild.teachers || [],
            studentInfo: singleChild.student || null,
            previousClassTeachers: singleChild.previousClassTeachers || [],
            children: null, // Single child mode
            loading: false,
            error: null,
          });
        } else {
          // Multiple children: store the children array
          set({
            teachers: [], // Don't flatten for multiple children
            studentInfo: null, // Multiple children, no single student info
            children: res.data.children, // Store children data as-is (includes previousClassTeachers)
            previousClassTeachers: [], // Not applicable for multiple children
            loading: false,
            error: null,
          });
        }
      } else {
        // Fallback: empty data
        set({
          teachers: [],
          studentInfo: null,
          children: null,
          previousClassTeachers: [],
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error("Fetch class teachers failed:", err);
      set({
        loading: false,
        error: err.response?.data?.message || "Failed to fetch class teachers",
        teachers: [],
        studentInfo: null,
        children: null,
        previousClassTeachers: [],
      });
    }
  },

  clearTeachers: () =>
    set({
      teachers: [],
      studentInfo: null,
      children: null,
      previousClassTeachers: [],
      error: null,
      loading: false,
    }),
}));
