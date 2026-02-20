// stores/useTimetableStore.js
import { create } from "zustand";
import axios from "../lib/axios";

export const useTimetableStore = create((set, get) => ({
  // 🔹 Timetable Input State
  classes: [], // [{ name: "10A", subjects: [{ name: "Maths", periodsPerWeek: 5 }] }]
  teachers: [], // [{ name: "Mr. Smith", subjects: ["Maths", "Science"] }]
  days: 5,
  dayNames: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"],
  periodsPerDay: 8,
  options: { allowConflicts: false },

  // 🔹 Timetable Output State
  timetable: null,       // full response
  classesResult: null,   // extracted classes from backend response
  timeSlots: null,       // extracted timeSlots
  quality: null,        // quality metrics from generation
  loading: false,
  error: null,

  // ----- Actions -----

  // ✅ Add a class
  addClass: (newClass) =>
    set((state) => ({ classes: [...state.classes, newClass] })),

  // ✅ Add a teacher
  addTeacher: (newTeacher) =>
    set((state) => ({ teachers: [...state.teachers, newTeacher] })),

  // ✅ Update days (number)
  setDays: (days) => set({ days }),

  // ✅ Update day names (array)
  setDayNames: (dayNames) => set({ dayNames, days: dayNames.length }),

  // ✅ Update periods per day
  setPeriodsPerDay: (periods) => set({ periodsPerDay: periods }),

  // ✅ Update options
  setOptions: (options) => set({ options }),

  // ✅ Generate timetable (API call)
  generateTimetable: async (options = {}) => {
    set({ loading: true, error: null });

    try {
      const { classes, teachers, dayNames, periodsPerDay } = get();

      // Validate input
      if (!classes || classes.length === 0) {
        throw new Error("Please add at least one class");
      }
      if (!teachers || teachers.length === 0) {
        throw new Error("Please add at least one teacher");
      }
      
      // Additional validation
      classes.forEach((c, index) => {
        if (!c.name) {
          throw new Error(`Class ${index + 1} is missing a name`);
        }
        if (!c.subjects || c.subjects.length === 0) {
          throw new Error(`Class ${c.name} has no subjects defined`);
        }
        c.subjects.forEach((s, sIndex) => {
          if (!s.name) {
            throw new Error(`Class ${c.name}, subject ${sIndex + 1} is missing a name`);
          }
          if (!s.periodsPerWeek || s.periodsPerWeek <= 0) {
            throw new Error(`Class ${c.name}, subject ${s.name} must have at least 1 period per week`);
          }
        });
      });
      
      teachers.forEach((t, index) => {
        if (!t.name) {
          throw new Error(`Teacher ${index + 1} is missing a name`);
        }
        if (!t.subjects || t.subjects.length === 0) {
          throw new Error(`Teacher ${t.name} has no subjects assigned`);
        }
      });

      const res = await axios.post("/timetable/generate", {
        classes,
        teachers,
        days: dayNames, // backend expects an array of day names
        periodsPerDay,
        options: {
          allowConflicts: false,
          ...options
        },
      });

      // extract values from backend response
      const { success, classes: classesResult, days, periodsPerDay: ppd, timeSlots, quality } = res.data;

      if (!success) {
        throw new Error(res.data.error || "Timetable generation failed");
      }

      set({
        timetable: res.data,
        classesResult,
        days,
        periodsPerDay: ppd,
        timeSlots,
        loading: false,
      });
    } catch (err) {
      console.error("Timetable generation error:", err);
      
      // Provide more specific error messages
      let errorMessage = err.message;
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message.includes("Cannot set properties of undefined")) {
        errorMessage = "Timetable generation failed due to invalid data structure. Please check your input data.";
      } else if (err.message.includes("Unable to generate valid timetable")) {
        errorMessage = "Unable to generate a valid timetable. This could be due to:\n" +
          "• Too many periods required per week vs available slots\n" +
          "• Insufficient teachers for all subjects\n" +
          "• Conflicting teacher availability\n" +
          "• Overly restrictive constraints\n\n" +
          "Try reducing periods per week for some subjects or adding more teachers.";
      }
      
      set({ error: errorMessage, loading: false });
    }
  },

  // ✅ Fetch all timetables
  fetchAllTimetables: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/timetable/all");
      set({ timetable: res.data.timetables, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  // ✅ Delete a timetable by id
  deleteTimetable: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/timetable/${id}`);
      // Optionally, you can refetch or filter out the deleted timetable in your UI
      set((state) => ({
        savedTimetables: state.savedTimetables?.filter((tt) => tt._id !== id),
        loading: false
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  // ✅ Reset timetable
  resetTimetable: () =>
    set({
      classes: [],
      teachers: [],
      timetable: null,
      classesResult: null,
      timeSlots: null,
      days: 5,
      dayNames: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      periodsPerDay: 8,
      options: { allowConflicts: false },
      error: null,
    }),

  // Teachers List
  teachersList: [], // fetched from backend

  // Fetch teachers from backend
  fetchTeachers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/teachers");
      set({ teachersList: res.data.teachers, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  // ============================================
  // NEW FEATURES
  // ============================================

  // Validation
  validationResult: null,
  validateInput: async () => {
    set({ loading: true, error: null });
    try {
      const { classes, teachers, dayNames, periodsPerDay } = get();
      const res = await axios.post("/timetable/validate", {
        classes,
        teachers,
        days: dayNames,
        periodsPerDay
      });
      set({ validationResult: res.data, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  // Progress Tracking
  progress: null,
  jobId: null,
  checkProgress: async (jobId) => {
    try {
      const res = await axios.get(`/timetable/progress/${jobId}`);
      set({ progress: res.data });
      return res.data;
    } catch (err) {
      console.error("Progress check error:", err);
      return null;
    }
  },

  // Generate with progress tracking
  generateTimetableWithProgress: async (options = {}) => {
    set({ loading: true, error: null, validationResult: null });
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set({ jobId });

    try {
      const { classes, teachers, dayNames, periodsPerDay } = get();
      const res = await axios.post("/timetable/generate", {
        classes,
        teachers,
        days: dayNames,
        periodsPerDay,
        options: {
          allowConflicts: false,
          ...options
        },
        jobId
      });

      if (res.data.success) {
        set({
          timetable: res.data,
          classesResult: res.data.classes,
          days: res.data.days,
          periodsPerDay: res.data.periodsPerDay,
          timeSlots: res.data.timeSlots,
          quality: res.data.quality || null, // Store quality metrics
          loading: false,
          progress: { status: "completed", progress: 100 }
        });
      } else {
        // Handle validation errors
        if (res.data.errors && Array.isArray(res.data.errors)) {
          set({ 
            validationResult: {
              valid: false,
              errors: res.data.errors,
              warnings: res.data.warnings || []
            },
            error: "Validation failed. Please check the errors below.",
            loading: false 
          });
        } else {
          throw new Error(res.data.error || "Generation failed");
        }
      }
    } catch (err) {
      // Handle 400 Bad Request with validation errors
      if (err.response?.status === 400 && err.response?.data?.errors) {
        set({ 
          validationResult: {
            valid: false,
            errors: err.response.data.errors,
            warnings: err.response.data.warnings || []
          },
          error: "Validation failed. Please check the errors below.",
          loading: false 
        });
      } else {
        // Handle other errors
        const errorMessage = err.response?.data?.error || err.message || "An error occurred";
        set({ error: errorMessage, loading: false });
      }
    }
  },

  // Bulk Import
  importClasses: async (file) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/timetable/import/classes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success && res.data.classes) {
        set((state) => ({
          classes: [...state.classes, ...res.data.classes],
          loading: false
        }));
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  importTeachers: async (file) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/timetable/import/teachers", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success && res.data.teachers) {
        set((state) => ({
          teachers: [...state.teachers, ...res.data.teachers],
          loading: false
        }));
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  // Auto-fill
  autoFillTeachers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/timetable/auto-fill/teachers");
      if (res.data.success) {
        const { teachers: existingTeachers } = get();
        const newTeachers = res.data.teachers || [];
        
        // Merge with existing teachers (avoid duplicates by name)
        const mergedTeachers = [...existingTeachers];
        newTeachers.forEach(newTeacher => {
          const exists = mergedTeachers.find(t => t.name === newTeacher.name);
          if (!exists) {
            mergedTeachers.push(newTeacher);
          } else {
            // Merge subjects if teacher already exists
            const existingSubjects = new Set(exists.subjects || []);
            newTeacher.subjects.forEach(subj => existingSubjects.add(subj));
            exists.subjects = Array.from(existingSubjects);
          }
        });
        
        set({ 
          teachers: mergedTeachers, 
          loading: false 
        });
        
        // Show success message
        if (res.data.message) {
          console.log(res.data.message);
        }
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  autoFillClasses: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/timetable/auto-fill/classes");
      if (res.data.success) {
        const { classes: existingClasses } = get();
        const newClasses = res.data.classes || [];
        
        // Merge with existing classes (avoid duplicates by name)
        const mergedClasses = [...existingClasses];
        newClasses.forEach(newClass => {
          const exists = mergedClasses.find(c => c.name === newClass.name);
          if (!exists) {
            mergedClasses.push(newClass);
          } else {
            // Merge subjects if class already exists
            const existingSubjects = new Map();
            (exists.subjects || []).forEach(s => existingSubjects.set(s.name, s));
            (newClass.subjects || []).forEach(s => {
              if (!existingSubjects.has(s.name)) {
                existingSubjects.set(s.name, s);
              }
            });
            exists.subjects = Array.from(existingSubjects.values());
          }
        });
        
        set({ 
          classes: mergedClasses, 
          loading: false 
        });
        
        // Show success message
        if (res.data.message) {
          console.log(res.data.message);
          // You can also show a toast notification here
        }
      } else {
        set({ error: res.data.message || "Failed to load classes", loading: false });
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  // Templates
  templates: [],
  fetchTemplates: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/timetable/templates");
      if (res.data.success) {
        set({ templates: res.data.templates, loading: false });
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  saveTemplate: async (templateData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/timetable/templates", templateData);
      if (res.data.success) {
        set((state) => ({
          templates: [res.data.template, ...state.templates],
          loading: false
        }));
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  loadTemplate: async (templateId) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/timetable/templates/${templateId}`);
      if (res.data.success) {
        const template = res.data.template;
        set({
          classes: template.classes || [],
          teachers: template.teachers || [],
          dayNames: template.days || [],
          days: template.days?.length || 5,
          periodsPerDay: template.periodsPerDay || 8,
          options: template.options || {},
          loading: false
        });
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  deleteTemplate: async (templateId) => {
    set({ loading: true });
    try {
      const res = await axios.delete(`/timetable/templates/${templateId}`);
      if (res.data.success) {
        set((state) => ({
          templates: state.templates.filter(t => t._id !== templateId),
          loading: false
        }));
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  // Manual Editing
  updateSlot: async (timetableId, slotData) => {
    set({ loading: true });
    try {
      const res = await axios.patch(`/timetable/${timetableId}/slot`, slotData);
      if (res.data.success) {
        set({ timetable: res.data.timetable, loading: false });
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  swapSlots: async (timetableId, slot1, slot2) => {
    set({ loading: true });
    try {
      const res = await axios.post(`/timetable/${timetableId}/swap`, { slot1, slot2 });
      if (res.data.success) {
        set({ timetable: res.data.timetable, loading: false });
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      return null;
    }
  },

  // Export (download file instead of opening in new tab)
  exportTimetable: async (timetableId, format) => {
    try {
      const res = await axios.get(`/timetable/${timetableId}/export/${format}`, {
        responseType: "blob",
      });
      const blob = res.data;
      const contentDisposition = res.headers["content-disposition"];
      let filename = `timetable.${format === "pdf" ? "pdf" : "xlsx"}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "").trim();
        }
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
      return false;
    }
  },

  // Save class subjects to database
  saveClassSubjectsToDatabase: async (classesToSave) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/timetable/save-class-subjects", {
        classes: classesToSave
      });
      
      if (res.data.success) {
        set({ loading: false });
        return res.data;
      } else {
        throw new Error(res.data.error || "Failed to save subjects");
      }
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },
}));
