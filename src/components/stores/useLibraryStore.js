// src/stores/useLibraryStore.js
import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useLibraryStore = create((set, get) => ({
  books: [],
  pendingRequests: [],
  myRequests: [],
  myIssuedBooks: [],
  loading: false,

  // ✅ Get all books
  fetchBooks: async (query = "") => {
    try {
      set({ loading: true });
      const res = await axios.get(`/library/books${query}`);
      set({ books: res.data.books });
    } catch (err) {
      toast.error("Failed to load books");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Bulk upload Excel (admin)
  uploadBooksBulk: async (file) => {
    try {
      set({ loading: true });
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/library/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message);
      await get().fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk upload failed");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Update book (admin)
  updateBook: async (bookId, data) => {
    try {
      set({ loading: true });
      await axios.put(`/library/book/${bookId}`, data);
      toast.success("Book updated");
      await get().fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Delete book (admin)
  deleteBook: async (bookId) => {
    try {
      set({ loading: true });
      await axios.delete(`/library/book/${bookId}`);
      toast.success("Book deleted");
      set((state) => ({
        books: state.books.filter((b) => b._id !== bookId),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Pending requests (admin)
  fetchPendingRequests: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/library/pending-requests");
      set({ pendingRequests: res.data.requests });
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Approve request (admin)
  approveRequest: async (requestId) => {
    try {
      set({ loading: true });
      await axios.post("/library/approve-request", { requestId });
      toast.success("Request approved");
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r._id !== requestId),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Request a book (student/teacher)
  requestBook: async (bookId) => {
    try {
      set({ loading: true });
      const res = await axios.post("/library/request-book", { bookId });

      toast.success(res.data.message || "Book requested");

      // Optional: refresh my requests
      await get().fetchMyRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Fetch my book requests (student/teacher)
  fetchMyRequests: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/library/my-requests");
      set({ myRequests: res.data.requests || [] });
    } catch (err) {
      toast.error("Failed to load your requests");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Fetch my issued books (student/teacher)
  fetchMyIssuedBooks: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/library/my-issued-books");
      set({ myIssuedBooks: res.data.issues || [] });
    } catch (err) {
      toast.error("Failed to load issued books");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Return book (student/teacher)
  returnBook: async (issueId) => {
    try {
      set({ loading: true });
      const res = await axios.post("/library/return", { issueId });
      toast.success(res.data.message || "Book returned");

      // Refresh list
      await get().fetchMyIssuedBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Return failed");
    } finally {
      set({ loading: false });
    }
  },
}));
