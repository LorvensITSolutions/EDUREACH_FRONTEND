// src/pages/admin/LmsManagement.jsx
import BulkUploadForm from "../Library/BulkUploadForm"
import BookListTable from "../Library/BookListTable";
import PendingRequests from "../Library/PendingRequests";
import { useLibraryStore } from "../../stores/useLibraryStore";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const LmsManagement = () => {
  const {
    fetchBooks,
    fetchPendingRequests,
    successMessage,
    errorMessage,
    clearMessages,
  } = useLibraryStore();

  useEffect(() => {
    fetchBooks();
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearMessages();
    }
    if (errorMessage) {
      toast.error(errorMessage);
      clearMessages();
    }
  }, [successMessage, errorMessage]);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-background min-h-screen">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold text-primary">Library Management</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text">Upload Excel File</h2>
        <BulkUploadForm />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text">Book List</h2>
        <BookListTable />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text">Pending Book Requests</h2>
        <PendingRequests />
      </section>
    </div>
  );
};

export default LmsManagement;
