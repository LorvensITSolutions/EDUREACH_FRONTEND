// src/pages/teacher/UploadAssignment.jsx
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTeacherAssignmentStore } from "../stores/useTeacherAssignmentStore";
import { useAttendanceTeacherStore } from "../stores/useAttendanceTeacherStore";

const UploadAssignment = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    className: "",
    section: "",
    totalMarks: "",
  });
  const [pdfs, setPdfs] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const { uploadAssignment, uploading } = useTeacherAssignmentStore();
  const { assignedClasses, fetchAssignedStudentsWithAttendance } = useAttendanceTeacherStore();

  // Fetch teacher's assigned classes on mount
  useEffect(() => {
    fetchAssignedStudentsWithAttendance(format(new Date(), "yyyy-MM-dd"));
  }, [fetchAssignedStudentsWithAttendance]);

  // Derive class options (e.g. "1", "2") — sorted numerically (1, 2, 9, 10, not 1, 10, 2, 9)
  const classOptions = [...new Set((assignedClasses || [])
    .map((c) => (c && String(c).split("-")[0]) || "")
    .filter(Boolean))].sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    if (!isNaN(na)) return -1;
    if (!isNaN(nb)) return 1;
    return String(a).localeCompare(String(b));
  });

  const sectionOptions = formData.className
    ? [...new Set((assignedClasses || [])
        .filter((c) => c && c.startsWith(formData.className + "-"))
        .map((c) => c.split("-")[1])
        .filter(Boolean))].sort()
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "className" ? { section: "" } : {}),
    }));
  };

  const handleFileChange = (e) => {
    setPdfs(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    Array.from(pdfs).forEach((file) => data.append("pdfs", file));
    const result = await uploadAssignment(data);
    if (result?.success) {
      setFormData({ title: "", description: "", dueDate: "", className: "", section: "" });
      setPdfs([]);
      setFileInputKey((k) => k + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg sm:rounded-xl space-y-4 sm:space-y-5 md:space-y-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Upload Assignment</h2>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <input 
          name="title" 
          type="text" 
          placeholder="Title" 
          required 
          value={formData.title} 
          onChange={handleChange} 
          className="w-full border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
        />
        <textarea 
          name="description" 
          placeholder="Description" 
          required 
          value={formData.description} 
          onChange={handleChange} 
          rows="4"
          className="w-full border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        ></textarea>

        <input 
          name="dueDate" 
          type="date" 
          required 
          value={formData.dueDate} 
          onChange={handleChange} 
          className="w-full border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
        />

        <input 
          name="totalMarks" 
          type="number" 
          placeholder="Total Marks (optional)" 
          min="1"
          value={formData.totalMarks} 
          onChange={handleChange} 
          className="w-full border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
        />

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">Class</label>
            <select
              name="className"
              required
              value={formData.className}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="">Select Class</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
              {classOptions.length === 0 && (
                <option value="" disabled>No classes assigned</option>
              )}
            </select>
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">Section</label>
            <select
              name="section"
              required
              value={formData.section}
              onChange={handleChange}
              disabled={!formData.className}
              className="w-full border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{formData.className ? "Select Section" : "Select a class first"}</option>
              {sectionOptions.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
              {formData.className && sectionOptions.length === 0 && (
                <option value="" disabled>No sections for this class</option>
              )}
            </select>
            {!formData.className && (
              <p className="text-xs text-gray-500 mt-1">Section unlocks after you select a class</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm text-gray-700 mb-1.5 sm:mb-2">Upload PDF or image files</label>
          <input 
            key={fileInputKey}
            type="file" 
            accept="application/pdf,image/jpeg,image/jpg,image/png,image/gif,image/webp" 
            multiple 
            onChange={handleFileChange} 
            className="w-full text-xs sm:text-sm file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" 
          />
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, GIF or WebP. Up to 3 files.</p>
        </div>

        <button 
          disabled={uploading} 
          className="w-full sm:w-auto bg-primary text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-md hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
        >
          {uploading ? "Uploading..." : "Upload Assignment"}
        </button>
      </form>
    </div>
  );
};

export default UploadAssignment;