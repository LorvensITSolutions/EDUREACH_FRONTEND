// src/stores/useTeacherStore.js
import { create } from 'zustand';
import axios from "../lib/axios";
import { toast } from 'react-hot-toast';

export const useTeacherStore = create((set, get) => ({
  teachers: [],
  loading: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTeachers: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  },
  // Cache management
  cache: new Map(),
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds

  // ✅ Fetch all teachers with caching and pagination
  fetchTeachers: async (filters = {}) => {
    try {
      const { cache, cacheExpiry, lastFetchTime } = get();
      const cacheKey = JSON.stringify(filters);
      const now = Date.now();

      // Check if we have valid cached data
      if (cache.has(cacheKey) && lastFetchTime && (now - lastFetchTime) < cacheExpiry) {
        console.log("📦 Using cached teachers data");
        const cachedData = cache.get(cacheKey);
        set({ 
          teachers: cachedData.teachers,
          pagination: cachedData.pagination,
          loading: false
        });
        return;
      }

      set({ loading: true });
      console.log("Fetching teachers with filters:", filters);
      
      const query = new URLSearchParams(filters).toString();
      console.log("API URL:", `/teachers/all?${query}`);
      const res = await axios.get(`/teachers/all?${query}`);
      console.log("API Response:", res.data);
      
      const responseData = {
        teachers: res.data.teachers,
        pagination: res.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalTeachers: res.data.teachers.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10
        }
      };

      // Cache the response
      cache.set(cacheKey, responseData);
      
      set({ 
        ...responseData,
        lastFetchTime: now,
        loading: false
      });
    } catch (err) {
      set({ loading: false });
      toast.error('Failed to fetch teachers');
      console.error(err);
    }
  },

  // ✅ Upload bulk teachers
  uploadTeachers: async (excelFile, imagesZipFile = null) => {
    const formData = new FormData();
    formData.append('excel', excelFile);
    if (imagesZipFile) {
      formData.append('imagesZip', imagesZipFile);
    }
    
    try {
      const res = await axios.post('/teachers/upload-bulk', formData);
      toast.success(`${res.data.count} teachers uploaded successfully`);
      
      // Show credentials if available
      if (res.data.teachers && res.data.teachers.length > 0) {
        console.log('Generated teacher credentials:', res.data.teachers);
        // Return the result for the component to display
        return res.data;
      }
      
      get().invalidateTeacherCache(); // Clear cache
      get().fetchTeachers(); // Refresh state
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload teachers');
      console.error(err);
      throw err; // Re-throw to handle in component
    }
  },

  // ✅ Assign section
  assignSection: async ({ teacherId, className, section }) => {
    try {
      console.log('Assigning section:', { teacherId, className, section });
      
      const res = await axios.post('/teachers/assign-section', {
        teacherId,
        className,
        section,
      });
      
      console.log('Assignment response:', res.data);
      toast.success('Section assigned successfully');
      
      // Clear cache and refresh teachers list
      get().invalidateTeacherCache();
      await get().fetchTeachers();
      
      return res.data;
    } catch (err) {
      console.error('Assignment error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to assign section';
      toast.error(errorMessage);
      throw err; // Re-throw to handle in component
    }
  },

  // ✅ Remove section assignment
  removeSection: async ({ teacherId, className, section }) => {
    try {
      console.log('Removing section:', { teacherId, className, section });
      
      const res = await axios.post('/teachers/remove-section', {
        teacherId,
        className,
        section,
      });
      
      console.log('Remove section response:', res.data);
      toast.success('Section removed successfully');
      
      // Clear cache and refresh teachers list
      get().invalidateTeacherCache();
      await get().fetchTeachers();
      
      return res.data;
    } catch (err) {
      console.error('Remove section error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to remove section';
      toast.error(errorMessage);
      throw err; // Re-throw to handle in component
    }
  },

  // ✅ Add single teacher
  createSingleTeacher: async (teacherData, imageFile = null) => {
    set({ loading: true });
    try {
      const formData = new FormData();
      
      // Add teacher data
      Object.keys(teacherData).forEach(key => {
        formData.append(key, teacherData[key]);
      });
      
      // Add image if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const res = await axios.post("/teachers/create", formData);
      toast.success("Teacher added successfully");
      
      // Show generated credentials
      if (res.data.teacher && res.data.teacher.credentials) {
        console.log('Generated teacher credentials:', res.data.teacher.credentials);
        toast.success(`Teacher ID: ${res.data.teacher.teacherId}, Username: ${res.data.teacher.credentials.username}, Password: ${res.data.teacher.credentials.password}`);
      }
      
      get().invalidateTeacherCache(); // Clear cache
      get().fetchTeachers(); // Refresh state
      
      return res.data; // Return data for component
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add teacher");
      console.error(err);
      throw err; // Re-throw to handle in component
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Update teacher images from ZIP
  updateTeacherImages: async (imagesZipFile) => {
    set({ loading: true });
    try {
      const formData = new FormData();
      formData.append('imagesZip', imagesZipFile);
      
      const res = await axios.post('/teachers/update-images', formData);
      
      const { updated, notFound, errors, details } = res.data;
      
      if (updated > 0) {
        toast.success(`${updated} teacher images updated successfully`);
      }
      
      if (notFound > 0) {
        toast.error(`${notFound} teachers not found in database`);
      }
      
      if (errors > 0) {
        toast.error(`${errors} images failed to upload`);
      }
      
      // Show detailed results
      if (details.notFoundTeachers.length > 0) {
        console.warn('Teachers not found:', details.notFoundTeachers);
      }
      
      if (details.errors.length > 0) {
        console.error('Upload errors:', details.errors);
      }
      
      get().invalidateTeacherCache(); // Clear cache
      get().fetchTeachers(); // Refresh state
      
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update teacher images');
      console.error(err);
      throw err; // Re-throw to handle in component
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Delete teacher by ID
  deleteTeacherById: async (teacherId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this teacher?");
      if (!confirmDelete) return;

      await axios.delete(`/teachers/${teacherId}`);
      toast.success("Teacher deleted successfully");

      get().invalidateTeacherCache(); // Clear cache
      get().fetchTeachers(); // Refresh state
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete teacher");
      console.error(err);
    }
  },

  // ✅ Cache management functions
  clearCache: () => {
    const { cache } = get();
    cache.clear();
    set({ lastFetchTime: null });
  },

  invalidateTeacherCache: () => {
    get().clearCache();
  },

  // ✅ Pagination functions
  goToPage: async (page) => {
    const { pagination } = get();
    console.log("Going to page:", page, "Current pagination:", pagination);
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      await get().fetchTeachers({ page, limit: 10 });
    }
  },

  nextPage: async () => {
    const { pagination } = get();
    console.log("Next page clicked, current page:", pagination?.currentPage);
    if (pagination?.hasNextPage) {
      await get().goToPage((pagination?.currentPage || 1) + 1);
    }
  },

  prevPage: async () => {
    const { pagination } = get();
    console.log("Previous page clicked, current page:", pagination?.currentPage);
    if (pagination?.hasPrevPage) {
      await get().goToPage((pagination?.currentPage || 1) - 1);
    }
  },

  // ✅ Search and filter functions
  searchTeachers: async (searchTerm) => {
    await get().fetchTeachers({ search: searchTerm, page: 1 });
  },

  filterTeachers: async (filters) => {
    await get().fetchTeachers({ ...filters, page: 1 });
  },

  // ✅ Fetch all teachers without pagination (for dropdowns)
  fetchAllTeachers: async () => {
    try {
      set({ loading: true });
      const res = await axios.get('/teachers/');
      set({ 
        teachers: res.data.teachers || [],
        loading: false 
      });
      return res.data.teachers || [];
    } catch (err) {
      set({ loading: false });
      console.error('Error fetching all teachers:', err);
      return [];
    }
  },

  // ✅ Get unique subjects and qualifications for filter dropdowns
  getUniqueSubjects: () => {
    const { teachers } = get();
    return [...new Set(teachers.map(t => t.subject).filter(Boolean))].sort();
  },

  getUniqueQualifications: () => {
    const { teachers } = get();
    return [...new Set(teachers.map(t => t.qualification).filter(Boolean))].sort();
  },
}));
