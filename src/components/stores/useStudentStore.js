

// src/stores/useStudentStore.js
import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useStudentStore = create((set, get) => ({
  students: [],
  count: 0,
  studentInfo: null, // ✅ For parent's child info
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  },
  // Cache management
  cache: new Map(),
  isLoading: false,
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds

  // ✅ Fetch students with server-side filtering (no client-side caching for filtered requests)
  fetchStudents: async (filters = {}) => {
    try {
      set({ isLoading: true });
      
      // Clean up filters - remove empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
      );
      
      const query = new URLSearchParams(cleanFilters).toString();
      const { data } = await axios.get(`/students/all?${query}`);
     
      
      const responseData = {
        students: data.students,
        pagination: data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalStudents: data.students.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10
        }
      };

      // Only cache if no filters are applied (for performance)
      const hasFilters = Object.keys(cleanFilters).length > 0;
      if (!hasFilters) {
        const { cache } = get();
        const cacheKey = JSON.stringify(cleanFilters);
        cache.set(cacheKey, responseData);
      }
      
      set({ 
        ...responseData,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error("Failed to fetch students");
      console.error("Fetch students error:", error);
    }
  },

  // ✅ Bulk upload students (Excel + ZIP)
  uploadStudents: async (formData) => {
    try {
      const { data } = await axios.post("/students/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${data.count} students uploaded`);
      get().invalidateStudentCache(); // Clear cache
      get().fetchStudents(); // Refresh list
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Upload failed"
      );
      console.error("Upload students error:", error);
    }
  },

  // ✅ Create single student (with optional image)
  createSingleStudent: async (studentData) => {
    try {
      // If studentData contains image, use FormData
      let payload = studentData;
      let headers = {};
      if (studentData.image) {
        payload = new FormData();
        Object.entries(studentData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            payload.append(key, value);
          }
        });
        headers = { "Content-Type": "multipart/form-data" };
      }

      const { data } = await axios.post(
        "/students/create-single",
        payload,
        { headers }
      );

      toast.success("Student created successfully");

      // Invalidate cache and refresh
      get().invalidateStudentCache();
      await get().fetchStudents();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create student"
      );
      console.error("Create student error:", error);
    }
  },

  // ✅ Delete a student
  deleteStudent: async (studentId) => {
    try {
      await axios.delete(`/students/${studentId}`);
      toast.success("Student deleted");
      get().invalidateStudentCache(); // Clear cache
      await get().fetchStudents(); // Refresh list
    } catch (error) {
      toast.error("Failed to delete student");
      console.error("Delete student error:", error);
    }
  },

  // ✅ Get total student count (optional filters)
  fetchStudentCount: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const { data } = await axios.get(`/students/count-students?${query}`);
      set({ count: data.count });
    } catch (error) {
      console.error("Fetch student count error:", error);
    }
  },

  // ✅ Fetch student info by parent (used in leave form)
  fetchStudentInfo: async () => {
    try {
      const { data } = await axios.get("/students/by-parent");
      set({ studentInfo: data });
    } catch (error) {
      toast.error("Failed to fetch student info");
      console.error("Fetch studentInfo error:", error);
    }
  },

  // ✅ Set students directly (for credentials management)
  setStudents: (students) => {
    set({ students });
  },

  // ✅ Update student images from ZIP
  updateStudentImages: async (imagesZipFile) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append('imagesZip', imagesZipFile);
      
      const res = await axios.post('/students/update-images', formData);
      
      const { updated, notFound, errors, details } = res.data;
      
      if (updated > 0) {
        toast.success(`${updated} student images updated successfully`);
      }
      
      if (notFound > 0) {
        toast.error(`${notFound} students not found in database`);
      }
      
      if (errors > 0) {
        toast.error(`${errors} images failed to upload`);
      }
      
      // Show detailed results
      if (details.notFoundStudents.length > 0) {
        console.warn('Students not found:', details.notFoundStudents);
      }
      
      if (details.errors.length > 0) {
        console.error('Upload errors:', details.errors);
      }
      
      get().invalidateStudentCache(); // Clear cache
      get().fetchStudents(); // Refresh state
      
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student images');
      console.error(err);
      throw err; // Re-throw to handle in component
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Cache management functions
  clearCache: () => {
    const { cache } = get();
    cache.clear();
    set({ lastFetchTime: null });
  },

  invalidateStudentCache: () => {
    get().clearCache();
  },

  // ✅ Pagination functions
  goToPage: async (page, filters = {}) => {
    const { pagination } = get();
    console.log("Going to page:", page, "Current pagination:", pagination, "With filters:", filters);
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      await get().fetchStudents({ ...filters, page, limit: 10 });
    }
  },

  nextPage: async (filters = {}) => {
    const { pagination } = get();
    console.log("Next page clicked, current page:", pagination?.currentPage, "With filters:", filters);
    if (pagination?.hasNextPage) {
      await get().goToPage((pagination?.currentPage || 1) + 1, filters);
    }
  },

  prevPage: async (filters = {}) => {
    const { pagination } = get();
    console.log("Previous page clicked, current page:", pagination?.currentPage, "With filters:", filters);
    if (pagination?.hasPrevPage) {
      await get().goToPage((pagination?.currentPage || 1) - 1, filters);
    }
  },
}));
