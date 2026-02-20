import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

// Helper function to wait for Razorpay to load
const waitForRazorpay = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== 'undefined') {
      resolve();
      return;
    }

    // Try to load Razorpay script if not already loaded
    if (!document.querySelector('script[src*="checkout.razorpay.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script')); 
      document.head.appendChild(script);
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    const interval = setInterval(() => {
      attempts++;
      if (typeof window.Razorpay !== 'undefined') {
        clearInterval(interval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error('Razorpay script failed to load. Please refresh the page.'));
      }
    }, 100);
  });
};

export const useFeeStore = create((set, get) => ({
  feeStructures: [],
  childrenFees: [],
  payments: [],
  allStudentsFeeStatus: [],
  pendingOfflinePayments: [], // ✅ New: Store pending offline payments
  loading: false,
  error: null,
  reminderLoading: false,
  defaultersLoading: false,
  customFeeLoading: false,
  offlinePaymentLoading: false, // ✅ New: Loading state for offline payments
  totalDueSum: 0,
  currentPage: 1,
  totalPages: 1,
  totalStudents: 0, // Total count of students (after filters)
  statusFilter: "",
  searchQuery: "",
  customFeeFilter: "",

  // ✅ Admin - Create Standard Fee Structure
  createFeeStructure: async (data) => {
    set({ loading: true });
    try {
      await axios.post("/payment/create-fee-structure", data);
      toast.success("Fee structure created successfully!");
      get().fetchAllStructures();
    } catch (err) {
      toast.error(err.response?.data?.message || "Create fee structure failed");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Admin - Fetch all fee structures
  fetchAllStructures: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/payment/all");
      set({ feeStructures: res.data.structures, loading: false });
    } catch (err) {
      toast.error("Failed to fetch fee structures");
      set({ loading: false });
    }
  },

  // ✅ Admin - Update fee structure
  updateStructure: async (id, updatedData) => {
    set({ loading: true });
    try {
      await axios.put(`/payment/${id}`, updatedData);
      toast.success("Structure updated successfully!");
      get().fetchAllStructures();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Admin - Delete fee structure
  deleteStructure: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`/payment/${id}`);
      toast.success("Structure deleted");
      get().fetchAllStructures();
    } catch (err) {
      console.error("Delete structure error:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage = err.response?.data?.message || "Delete failed";
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Parent - Get fee structure for children
  fetchChildrenFees: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/payment/fee-structure");
      set({ childrenFees: res.data.children, loading: false });
    } catch (err) {
      toast.error("Failed to fetch children's fee");
      set({ loading: false });
    }
  },

  // ✅ Parent - Get payment history
  fetchMyPayments: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/payment/my-payments");
      set({ payments: res.data.payments, loading: false });
    } catch (err) {
      toast.error("Failed to fetch payments");
      set({ loading: false });
    }
  },

  // ✅ Parent - Start Razorpay payment (Online)
  initiatePayment: async (
    studentId,
    amount,
    parentName = "Parent",
    parentEmail = "parent@example.com",
    academicYear = null
  ) => {
    try {
      if (!amount || amount <= 0) {
        toast.error("⚠️ Please enter a valid amount to pay.");
        return;
      }

      // Wait for Razorpay to be available
      await waitForRazorpay();

      const res = await axios.post("/payment/create-order", { 
        studentId, 
        amount, 
        paymentMethod: "online",
        academicYear: academicYear || undefined // Pass academic year if provided
      });
      const { order, razorpayKey, feePaymentId } = res.data;

      const options = {
        key: razorpayKey,
        amount: order.amount, // in paise
        currency: order.currency,
        name: "EduReach International",
        description: "School Fee Payment",
        order_id: order.id,
        prefill: {
          name: parentName,
          email: parentEmail,
        },
        theme: {
          color: "#10B981",
        },
        modal: {
          ondismiss: () => {
            toast("⚠️ Payment cancelled by user.");
          },
        },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              feePaymentId,
            });

            if (verifyRes.data.success) {
              toast.success("✅ Payment successful! Receipt sent to your email.");

              // Refresh data so the page shows updated payment status (no redirect)
              get().fetchMyPayments();
              get().fetchChildrenFees();
            } else {
              toast.error("❌ Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("❌ Verification failed. Please contact school support.");
          }
        },
      };

      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay script not loaded. Please refresh the page and try again.');
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("initiatePayment error:", error);

      // Show specific error message
      if (error?.message?.includes('Razorpay script')) {
        toast.error("❌ Payment system not ready. Please refresh the page and try again.");
      } else if (error?.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`);
      } else {
        toast.error("❌ Payment initiation failed. Please try again.");
      }
    }
  },

  // ✅ Parent - Create Offline Payment Request
  initiateOfflinePayment: async (studentId, amount, academicYear = null) => {
    set({ offlinePaymentLoading: true });
    try {
      if (!amount || amount <= 0) {
        toast.error("⚠️ Please enter a valid amount to pay.");
        return;
      }

      const res = await axios.post("/payment/create-order", {
        studentId,
        amount,
        paymentMethod: "offline",
        academicYear: academicYear || undefined // Pass academic year if provided
      });

      if (res.data.success) {
        toast.success("✅ Offline payment request created! Please visit the school office to complete payment.");
        
        // Refresh children fees to show updated status
        get().fetchChildrenFees();
        
        return res.data;
      }
    } catch (error) {
      console.error("Offline payment error:", error);
      if (error?.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`);
      } else {
        toast.error("❌ Offline payment request failed. Try again.");
      }
    } finally {
      set({ offlinePaymentLoading: false });
    }
  },

  // ✅ Admin - Fetch Pending Offline Payments
  fetchPendingOfflinePayments: async ({ page = 1, limit = 10, search = "", academicYear = "" } = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (search) params.append("search", search);
      if (academicYear) params.append("academicYear", academicYear);

      const res = await axios.get(`/payment/pending-offline?${params.toString()}`);
      
      set({
        pendingOfflinePayments: res.data.payments,
        currentPage: res.data.page,
        totalPages: res.data.totalPages,
        loading: false,
      });
    } catch (err) {
      console.error("Fetch pending payments error:", err);
      toast.error("Failed to fetch pending offline payments");
      set({ loading: false });
    }
  },

  // ✅ Admin - Verify Offline Payment
  verifyOfflinePayment: async (paymentId, notes = "") => {
    set({ loading: true });
    try {
      const res = await axios.post(`/payment/verify-offline/${paymentId}`, { notes });
      
      if (res.data.success) {
        toast.success("✅ Offline payment verified! Receipt sent to parent.");
        
        // Refresh pending payments list
        get().fetchPendingOfflinePayments();
        
        return res.data;
      }
    } catch (error) {
      console.error("Verify offline payment error:", error);
      if (error?.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`);
      } else {
        toast.error("❌ Payment verification failed.");
      }
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Admin - Fetch defaulters / unpaid students
  // ✅ Fetch with filters, search, and pagination
  fetchAllStudentsFeeStatus: async ({ status = "", search = "", customFeeFilter = "", page = 1, limit = 10, academicYear = "" } = {}) => {
    set({ defaultersLoading: true });

    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      if (customFeeFilter) params.append("customFeeFilter", customFeeFilter);
      if (academicYear) params.append("academicYear", academicYear);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const res = await axios.get(`/payment/fee-defaulters?${params.toString()}`);

      set({
        allStudentsFeeStatus: res.data.students,
        totalDueSum: res.data.totalDueSum || 0,
        currentPage: page,
        totalPages: res.data.totalPages || 1,
        totalStudents: res.data.total || 0, // Total count of filtered students
        defaultersLoading: false,
        statusFilter: status,
        searchQuery: search,
        customFeeFilter,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch fee statuses");
      set({ defaultersLoading: false });
    }
  },

  setCustomFeeFilter: (customFeeFilter) => {
    set({ customFeeFilter });
    const { statusFilter, searchQuery } = get();
    get().fetchAllStudentsFeeStatus({ status: statusFilter, search: searchQuery, customFeeFilter });
  },

  clearFilters: () => {
    set({
      statusFilter: "",
      searchQuery: "",
      customFeeFilter: "",
      allStudentsFeeStatus: [], // Clear student data
      totalStudents: 0, // Reset total count
      currentPage: 1, // Reset to page 1
      totalPages: 1, // Reset total pages
    });
    // Don't fetch data when clearing filters - user needs to select a class to load data
  },

  goToPage: (page) => {
    const { statusFilter, searchQuery, customFeeFilter } = get();
    get().fetchAllStudentsFeeStatus({
      page,
      status: statusFilter,
      search: searchQuery,
      customFeeFilter,
    });
  },

  // ✅ Admin - Send fee reminder
  sendFeeReminder: async (studentId) => {
    set({ reminderLoading: true });
    try {
      await axios.post(`/payment/send-reminder/${studentId}`);
      toast.success("Reminder sent via email/WhatsApp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reminder send failed");
    } finally {
      set({ reminderLoading: false });
    }
  },

  // ✅ Admin - Create or Update Custom Fee
  createOrUpdateCustomFee: async (data) => {
    set({ customFeeLoading: true });
    try {
      const res = await axios.post("/payment/custom-fee", data);
      toast.success("Custom fee saved successfully");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save custom fee");
    } finally {
      set({ customFeeLoading: false });
    }
  },

  // ✅ Admin - Fetch all custom fees
  fetchAllCustomFees: async () => {
    set({ customFeeLoading: true });
    try {
      const res = await axios.get("/payment/custom-fees");
      return res.data.customFees || [];
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch custom fees");
      return [];
    } finally {
      set({ customFeeLoading: false });
    }
  },

  // ✅ Admin - Update custom fee
  updateCustomFee: async (customFeeId, data) => {
    set({ customFeeLoading: true });
    try {
      const res = await axios.put(`/payment/custom-fee/${customFeeId}`, data);
      toast.success("Custom fee updated successfully");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update custom fee");
      throw err;
    } finally {
      set({ customFeeLoading: false });
    }
  },

  // ✅ Generate Payment Receipt
  generateReceipt: async (paymentId) => {
    try {
      const res = await axios.post(`/payment/generate-receipt/${paymentId}`);
      if (res.data.success) {
        toast.success("Receipt generated successfully");
        // Refresh payments to get updated receipt URL
        get().fetchMyPayments();
        return res.data.receiptUrl;
      } else {
        throw new Error(res.data.message || "Failed to generate receipt");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate receipt");
      throw err;
    }
  },

  // ✅ Reset store (optional)
  resetFeeStore: () =>
    set({
      feeStructures: [],
      childrenFees: [],
      payments: [],
      allStudentsFeeStatus: [],
      pendingOfflinePayments: [], // ✅ Added
      loading: false,
      error: null,
      reminderLoading: false,
      defaultersLoading: false,
      customFeeLoading: false,
      offlinePaymentLoading: false, // ✅ Added
    }),
}));

