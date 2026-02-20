// src/components/admin/library/BulkUploadForm.jsx
import { useState } from "react";
import { useLibraryStore } from "../../stores/useLibraryStore";

const BulkUploadForm = () => {
  const [file, setFile] = useState(null);
  const uploadBooksBulk = useLibraryStore((state) => state.uploadBooksBulk);
  const loading = useLibraryStore((state) => state.loading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    await uploadBooksBulk(file);
    setFile(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-4 items-start md:items-center"
    >
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
        className="border border-gray-300 p-2 rounded-md w-full md:w-auto"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
};

export default BulkUploadForm;
