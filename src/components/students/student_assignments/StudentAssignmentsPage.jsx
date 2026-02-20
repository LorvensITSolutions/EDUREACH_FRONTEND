import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useStudentAssignmentStore } from "../../stores/useStudentAssignmentStore";
import AssignmentPerformanceChart from "../student_assignments/AssignmentPerformanceChart";
import { format } from "date-fns";
import { Loader2, UploadCloud, FileText, Download, Eye, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { getCurrentAcademicYear, getAcademicYearOptions } from "../../../utils/academicYear";
import axios from "../../lib/axios";

// Helper function to get academic year from a date
const getAcademicYearFromDate = (date) => {
  const assignmentDate = new Date(date);
  const year = assignmentDate.getFullYear();
  const month = assignmentDate.getMonth(); // 0-11
  
  // Academic year runs from June to May
  if (month >= 5) { // June (5) to December (11)
    return `${year}-${year + 1}`;
  } else { // January (0) to May (4)
    return `${year - 1}-${year}`;
  }
};

const StudentAssignmentsPage = () => {
  const {
    assignments,
    fetchStudentAssignments,
    submitAssignment,
    loading,
    submitting,
  } = useStudentAssignmentStore();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(getCurrentAcademicYear());
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "submitted" | "not_submitted"
  const [viewingAttachmentsModal, setViewingAttachmentsModal] = useState(null); // assignmentId when modal open
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchStudentAssignments();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus, selectedAcademicYear]);

  const handleSubmit = async () => {
    if (!selectedFile || !selectedAssignmentId)
      return toast.error("Please select a file to submit.");

    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
      await submitAssignment(selectedAssignmentId, formData);
      
      // Clear the form state after successful submission
      setSelectedFile(null);
      setSelectedAssignmentId(null);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error is already handled in the store
      console.error("Submission failed:", error);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterStatus("all");
  };

  // View/download own submission via API (no direct /uploads/ URL)
  const handleViewSubmission = useCallback(async (assignmentId, filename) => {
    try {
      const { data } = await axios.get(`/assignments/${assignmentId}/my-submission`, { responseType: "blob" });
      const url = window.URL.createObjectURL(data);
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (w) setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      else window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error opening submission:", err);
      toast.error(err.response?.status === 404 ? "File not found." : "Failed to open file.");
    }
  }, []);

  const handleDownloadSubmission = useCallback(async (assignmentId, filename) => {
    try {
      const { data } = await axios.get(`/assignments/${assignmentId}/my-submission`, { responseType: "blob" });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "Submission";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading submission:", err);
      toast.error(err.response?.status === 404 ? "File not found." : "Download failed.");
    }
  }, []);

  // View/download assignment attachment (question paper) via API
  const handleViewAttachment = useCallback(async (assignmentId, index, filename) => {
    try {
      const { data } = await axios.get(`/assignments/${assignmentId}/attachment-view`, {
        params: { index },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(data);
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (w) setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      else window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error opening attachment:", err);
      toast.error(err.response?.status === 404 ? "File not found." : "Failed to open file.");
    }
  }, []);

  const handleDownloadAttachment = useCallback(async (assignmentId, index, filename) => {
    try {
      const { data } = await axios.get(`/assignments/${assignmentId}/attachment-view`, {
        params: { index },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "Attachment";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading attachment:", err);
      toast.error(err.response?.status === 404 ? "File not found." : "Download failed.");
    }
  }, []);

  // Get available academic years from assignments
  const availableAcademicYears = useMemo(() => {
    const years = new Set();
    const currentYear = getCurrentAcademicYear();
    
    // Always include current academic year
    years.add(currentYear);
    
    // Add years from assignments
    assignments.forEach(assignment => {
      if (assignment.createdAt) {
        const year = getAcademicYearFromDate(assignment.createdAt);
        years.add(year);
      }
    });
    
    // Also include nearby academic years (previous 2, next 1) for better UX
    const yearOptions = getAcademicYearOptions(2, 1);
    yearOptions.forEach(year => years.add(year));
    
    return Array.from(years).sort().reverse(); // Sort descending (newest first)
  }, [assignments]);

  // Filter assignments by academic year, search, and status
  const filteredAssignments = useMemo(() => {
    let list = assignments;
    if (selectedAcademicYear) {
      list = list.filter((a) => {
        if (!a.createdAt) return false;
        return getAcademicYearFromDate(a.createdAt) === selectedAcademicYear;
      });
    }
    const q = (searchText || "").trim().toLowerCase();
    if (q) {
      list = list.filter((a) =>
        [a.title, a.description || ""].some((s) => String(s).toLowerCase().includes(q))
      );
    }
    if (filterStatus === "submitted") {
      list = list.filter((a) => a.submission != null);
    } else if (filterStatus === "not_submitted") {
      list = list.filter((a) => a.submission == null);
    }
    return list;
  }, [assignments, selectedAcademicYear, searchText, filterStatus]);

  const hasActiveFilters = searchText.trim() || filterStatus !== "all";

  // Pagination (10 per page)
  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginatedAssignments = filteredAssignments.slice(start, start + PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-3 animate-fade-in">
      <h1 className="text-xl md:text-2xl font-bold text-primary mb-2 sm:mb-3">
        Your Assignments
      </h1>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      {/* Search and filters — above the table */}
      <div className="bg-white rounded-md border border-gray-200 p-3 sm:p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-52 md:w-60">
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Title, description..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-32 sm:w-36">
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="all">All</option>
              <option value="submitted">Submitted</option>
              <option value="not_submitted">Not submitted</option>
            </select>
          </div>
          <div className="w-40 sm:w-52">
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Year</label>
            <select
              value={selectedAcademicYear || getCurrentAcademicYear()}
              onChange={(e) => setSelectedAcademicYear(e.target.value || getCurrentAcademicYear())}
              className="w-full border border-gray-300 rounded px-2.5 py-2 pr-7 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white"
            >
              {availableAcademicYears.map((year) => (
                <option key={year} value={year}>
                  {year} {year === getCurrentAcademicYear() ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <p className="text-[11px] text-gray-500 mt-1">
            Showing {filteredAssignments.length} of {assignments?.length || 0} assignments
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-28">
          <Loader2 className="animate-spin text-primary w-5 h-5" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm mb-1">
            No assignments match your filters for academic year {selectedAcademicYear}.
          </p>
          <p className="text-xs text-gray-400">
            Try different filters or another academic year.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-10">#</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell max-w-[80px]">Description</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-24">Due</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-28">Status</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-20">Files</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-20">Total Marks</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-20">Score</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell max-w-[120px]">Feedback</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedAssignments.map((a, idx) => {
                  const isLate = new Date(a.dueDate) < new Date();
                  const hasSubmitted = a.submission != null;
                  const hasAttachments = a.attachments && a.attachments.length > 0;

                  return (
                    <tr key={a._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2 text-xs text-gray-600">{start + idx + 1}</td>
                      <td className="px-3 py-2">
                        <span className="font-medium text-gray-900 text-xs">{a.title}</span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600 hidden md:table-cell max-w-[140px] truncate" title={a.description}>
                        {a.description || "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">
                        {format(new Date(a.dueDate), "dd MMM yy")}
                      </td>
                      <td className="px-3 py-2">
                        {hasSubmitted ? (
                          <span className="inline-block px-1.5 py-0.5 text-[11px] rounded font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            Submitted
                          </span>
                        ) : isLate ? (
                          <span className="inline-block px-1.5 py-0.5 text-[11px] rounded font-medium bg-red-100 text-red-600 border border-red-200">
                            Closed
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 text-[11px] rounded font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="flex flex-col gap-1 items-start">
                          {hasAttachments && (
                            <button
                              type="button"
                              onClick={() => setViewingAttachmentsModal(a._id)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs text-left p-0 m-0 leading-tight"
                            >
                              Test ({a.attachments.length})
                            </button>
                          )}
                          {hasSubmitted && a.submission?.file && (
                            <button
                              type="button"
                              onClick={() => setViewingAttachmentsModal(`submission-${a._id}`)}
                              className="text-green-600 hover:text-green-800 font-medium text-xs text-left p-0 m-0 leading-tight"
                            >
                              Submission
                            </button>
                          )}
                          {!hasAttachments && !hasSubmitted && <span className="text-gray-500">—</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 text-center">
                        {(a.totalMarks != null && a.totalMarks !== "") ? a.totalMarks : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 text-center">
                        {a.evaluation != null && a.evaluation.marks != null ? (
                          (a.totalMarks != null && a.totalMarks !== "") ? (
                            `${a.evaluation.marks} / ${a.totalMarks}`
                          ) : (
                            `${a.evaluation.marks}`
                          )
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600 hidden md:table-cell max-w-[120px] truncate" title={a.evaluation?.feedback || undefined}>
                        {a.evaluation?.feedback || "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-right">
                        {hasSubmitted ? (
                          <span className="text-blue-600 font-medium">Done</span>
                        ) : isLate ? (
                          <span className="text-gray-500">—</span>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAssignmentId(a._id);
                                  setSelectedFile(null);
                                  if (fileInputRef.current) { fileInputRef.current.value = ""; }
                                  fileInputRef.current?.click();
                                }}
                                className="px-2 py-1 text-[11px] border border-gray-300 rounded hover:bg-gray-50"
                                title="PDF or image (JPG, PNG, GIF, WebP)"
                              >
                                Choose
                              </button>
                              <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || selectedAssignmentId !== a._id || !selectedFile}
                                className="inline-flex items-center gap-0.5 px-2 py-1 bg-primary text-white text-[11px] rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submitting && selectedAssignmentId === a._id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <UploadCloud className="w-2.5 h-2.5" />}
                                {submitting && selectedAssignmentId === a._id ? "Submitting" : "Submit"}
                              </button>
                            </div>
                            {selectedAssignmentId === a._id && selectedFile && (
                              <span className="text-[11px] text-gray-600 truncate max-w-[120px] text-right" title={selectedFile.name}>
                                {selectedFile.name}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2 sm:px-3 border-t border-gray-200 bg-gray-50/50">
            <p className="text-xs text-gray-600">
              {filteredAssignments.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filteredAssignments.length)} of {filteredAssignments.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="inline-flex items-center gap-0.5 px-1.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3 h-3" />
                Prev
              </button>
              <span className="text-xs text-gray-600 px-1.5">
                {safePage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="inline-flex items-center gap-0.5 px-1.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment performance chart — bottom */}
      {filteredAssignments.some((a) => a.evaluation) && (
        <div className="mt-4">
          <AssignmentPerformanceChart
            data={filteredAssignments
              .filter((a) => a.evaluation)
              .map((a) => ({
                title: a.title.length > 10 ? a.title.slice(0, 10) + "…" : a.title,
                marks: a.evaluation.marks,
              }))}
          />
        </div>
      )}

      {/* Attachments modal — uses API for view/download (no direct /uploads/ URL) */}
      {viewingAttachmentsModal && (() => {
        // Submission modal (my submitted file)
        if (viewingAttachmentsModal.startsWith("submission-")) {
          const assignmentId = viewingAttachmentsModal.replace("submission-", "");
          const a = assignments.find((x) => x._id === assignmentId);
          if (!a?.submission?.file) return null;
          const filename = a.submission.file.split("/").pop() || "Submission";
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50">
              <div className="bg-white rounded-md shadow-xl max-w-sm w-full p-4 max-h-[75vh] overflow-y-auto">
                <h3 className="text-base font-semibold text-gray-900 mb-2">My Submission: {a.title}</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 p-1.5 bg-green-50 rounded border border-green-200">
                    <FileText size={12} className="text-green-600 shrink-0" />
                    <span className="text-xs text-gray-700 flex-1 truncate">{filename}</span>
                    <button type="button" onClick={() => handleViewSubmission(a._id, filename)} className="p-0.5 text-blue-600 hover:text-blue-800" title="View">
                      <Eye size={12} />
                    </button>
                    <button type="button" onClick={() => handleDownloadSubmission(a._id, filename)} className="p-0.5 text-green-600 hover:text-green-800" title="Download">
                      <Download size={12} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => setViewingAttachmentsModal(null)} className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded text-xs font-medium">
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        }
        // Assignment files modal (question papers)
        const a = assignments.find((x) => x._id === viewingAttachmentsModal);
        if (!a?.attachments?.length) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50">
            <div className="bg-white rounded-md shadow-xl max-w-sm w-full p-4 max-h-[75vh] overflow-y-auto">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Assignment Files: {a.title}</h3>
              <div className="space-y-1.5">
                {a.attachments.map((att, i) => {
                  const filename = att.split("/").pop() || "Attachment";
                  return (
                    <div key={i} className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded">
                      <FileText size={12} className="text-gray-600 shrink-0" />
                      <span className="text-xs text-gray-700 flex-1 truncate">{filename}</span>
                      <button type="button" onClick={() => handleViewAttachment(a._id, i, filename)} className="p-0.5 text-blue-600 hover:text-blue-800" title="View">
                        <Eye size={12} />
                      </button>
                      <button type="button" onClick={() => handleDownloadAttachment(a._id, i, filename)} className="p-0.5 text-green-600 hover:text-green-800" title="Download">
                        <Download size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={() => setViewingAttachmentsModal(null)} className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded text-xs font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default StudentAssignmentsPage;
