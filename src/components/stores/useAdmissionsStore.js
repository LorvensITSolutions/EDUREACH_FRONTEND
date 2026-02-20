import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import axios from '../lib/axios';

const useAdmissionStore = create((set, get) => ({
  applications: [],
  selectedApplication: null,
  loading: false,
  error: null,
  success: false,
  notificationStatus: {
    emailSent: false,
    whatsappSent: false,
    emailError: null,
    whatsappError: null
  },

  fetchApplications: async () => {
  // Fetch all applications
    set((state) => ({ ...state, loading: true, error: null }));
    try {
      const res = await axios.get('/admissions');
      set((state) => ({ ...state, applications: res.data, loading: false }));
    } catch (error) {
      set((state) => ({ ...state, error: error.response?.data?.message || error.message, loading: false }));
    }
  },

  // Submit a new application
  submitApplication: async (formData) => {
    set({ 
      loading: true, 
      error: null, 
      success: false,
      notificationStatus: {
        emailSent: false,
        whatsappSent: false,
        emailError: null,
        whatsappError: null
      }
    });
    
    try {
      const documents = {};

      // Upload files to Cloudinary (Base64 encoding expected by backend)
      for (const key in formData.documents) {
        const file = formData.documents[key];
        if (file) {
          const base64 = await toBase64(file);
          documents[key] = base64;
        }
      }

      const res = await axios.post('/admissions', {
        ...formData,
        documents,
      });

      // Set success state with notification status
      set((state) => ({ 
        ...state,
        loading: false, 
        success: true, 
        error: null,
        notificationStatus: {
          emailSent: true,
          whatsappSent: true,
          emailError: null,
          whatsappError: null
        }
      }));

      return res.data;
    } catch (error) {
      set((state) => ({ 
        ...state,
        error: error.response?.data?.message || error.message, 
        loading: false, 
        success: false 
      }));
      throw error; // Re-throw to handle in component
    }
  },

  // Fetch a single application by ID
  getApplicationById: async (id) => {
    set((state) => ({ ...state, loading: true, error: null }));
    try {
      const res = await axios.get(`/admissions/${id}`);
      set((state) => ({ ...state, selectedApplication: res.data, loading: false }));
    } catch (error) {
      set((state) => ({ ...state, error: error.response?.data?.message || error.message, loading: false }));
    }
  },

  // Clear success state
  clearSuccess: () => set((state) => ({ ...state, success: false })),
  
  // Clear error state
  clearError: () => set((state) => ({ ...state, error: null })),

  // Clear messages (both error and success)
  clearMessages: () => set((state) => ({ ...state, error: null, success: false })),

  // Clear notification status
  clearNotificationStatus: () => set((state) => ({ 
    ...state,
    notificationStatus: {
      emailSent: false,
      whatsappSent: false,
      emailError: null,
      whatsappError: null
    }
  })),

  // Review application
  reviewApplication: async (id, reviewData) => {
    set((state) => ({ ...state, loading: true, error: null }));
    try {
      const res = await axios.put(`/admissions/${id}/review`, reviewData);
      
      // Update the application in the list
      set((state) => ({
        ...state,
        applications: state.applications.map(app => 
          app._id === id ? { ...app, ...res.data.application } : app
        ),
        loading: false,
        success: true
      }));

      return res.data;
    } catch (error) {
      set((state) => ({ 
        ...state,
        error: error.response?.data?.message || error.message, 
        loading: false, 
        success: false 
      }));
      throw error;
    }
  },
}));

export default useAdmissionStore;

// Utility: Convert file to base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
