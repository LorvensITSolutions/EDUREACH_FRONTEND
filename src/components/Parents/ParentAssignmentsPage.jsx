import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParentAssignmentStore } from "../stores/useParentAssignmentStore";
import AssignmentPerformanceChart from "../students/student_assignments/AssignmentPerformanceChart";
import { format } from "date-fns";
import { Loader2, ChevronDown, Search, X, ChevronLeft, ChevronRight, FileText, Eye, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCurrentAcademicYear, getAcademicYearOptions, getNextAcademicYear } from "../../utils/academicYear";
import axios from "../lib/axios";
import toast from "react-hot-toast";

// Helper function to get academic year from a date
const getAcademicYearFromDate = (date) => {
  const assignmentDate = new Date(date);
  const year = assignmentDate.getFullYear();
  const month = assignmentDate.getMonth(); // 0-11
  
  if (month >= 5) { // June (5) to December (11)
    return `${year}-${year + 1}`;
  } else { // January (0) to May (4)
    return `${year - 1}-${year}`;
  }
};

// Helper function to get student's academic year based on promotion
const getStudentAcademicYear = (student) => {
  const currentAcademicYear = getCurrentAcademicYear();
  
  if (!student || !student.promotionHistory) {
    return currentAcademicYear;
  }

  const promotionHistory = student.promotionHistory || [];
  
  // Check if student was promoted in the current academic year (and not reverted)
  const promotionInCurrentYear = promotionHistory.find(
    p => p.academicYear === currentAcademicYear && 
         p.promotionType === 'promoted' && 
         !p.reverted
  );
  
  // If promoted in current year, they should see the next academic year
  if (promotionInCurrentYear) {
    return getNextAcademicYear(currentAcademicYear);
  }
  
  return currentAcademicYear;
};

export const ParentAssignmentsPage = () => {
  const {
    assignmentsByChild = [],
    fetchChildAssignments,
    loading,
    error,
  } = useParentAssignmentStore();
  const { t } = useTranslation();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(getCurrentAcademicYear());
  const [childrenData, setChildrenData] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "submitted" | "not_submitted"
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingAttachmentsModal, setViewingAttachmentsModal] = useState(null);

  const PAGE_SIZE = 10;

  // Fetch children's promotion data
  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
        const response = await fetch(`${baseUrl}/auth/profile`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          
          // Fetch children data if user is a parent
          if (userData.role === 'parent' && userData.parentId) {
            // Fetch children with full data including promotion history
            const parentResponse = await fetch(`${baseUrl}/teachers/class-teachers`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (parentResponse.ok) {
              const classTeacherData = await parentResponse.json();
              
              // Extract children data from class teacher response
              if (classTeacherData.children && Array.isArray(classTeacherData.children)) {
                // Get full student objects with promotion history
                const childrenArray = classTeacherData.children.map(child => child.student).filter(Boolean);
                setChildrenData(childrenArray);
                // Set first child as default if no child is selected
                if (childrenArray.length > 0 && !selectedChildId) {
                  setSelectedChildId(childrenArray[0]._id.toString());
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching children data:', err);
      }
    };

    fetchChildrenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchChildAssignments();
  }, []);

  // Set default selected child when assignments are loaded
  useEffect(() => {
    if (assignmentsByChild.length > 0 && !selectedChildId) {
      setSelectedChildId(assignmentsByChild[0].studentId?.toString() || null);
    }
  }, [assignmentsByChild, selectedChildId]);

  // Get all assignments from all children with child info
  const allAssignmentsWithChildInfo = useMemo(() => {
    return assignmentsByChild.flatMap((entry) => {
      const child = childrenData.find(c => c._id === entry.studentId);
      const childAcademicYear = child ? getStudentAcademicYear(child) : getCurrentAcademicYear();
      
      return (entry.assignments || []).map(assignment => ({
        ...assignment,
        childName: entry.studentName,
        childClass: entry.class,
        childSection: entry.section,
        childAcademicYear,
        childId: entry.studentId
      }));
    });
  }, [assignmentsByChild, childrenData]);

  // Get assignments for selected child only (for filtering)
  const selectedChildAssignments = useMemo(() => {
    if (!selectedChildId) return allAssignmentsWithChildInfo;
    return allAssignmentsWithChildInfo.filter(a => a.childId?.toString() === selectedChildId);
  }, [allAssignmentsWithChildInfo, selectedChildId]);

  // Get all assignments (for academic year options - show all years from all children)
  const allAssignments = useMemo(() => {
    return allAssignmentsWithChildInfo;
  }, [allAssignmentsWithChildInfo]);

  // Get assignments to filter (use selected child's assignments if a child is selected)
  const assignmentsToFilter = useMemo(() => {
    return selectedChildId ? selectedChildAssignments : allAssignmentsWithChildInfo;
  }, [selectedChildAssignments, selectedChildId, allAssignmentsWithChildInfo]);

  // Get available academic years from assignments and children
  const availableAcademicYears = useMemo(() => {
    const years = new Set();
    const currentYear = getCurrentAcademicYear();
    
    // Always include current academic year
    years.add(currentYear);
    
    // Add years from assignments
    allAssignments.forEach(assignment => {
      if (assignment.createdAt) {
        const year = getAcademicYearFromDate(assignment.createdAt);
        years.add(year);
      }
    });
    
    // Add children's academic years (for promoted children)
    childrenData.forEach(child => {
      const childYear = getStudentAcademicYear(child);
      if (childYear !== currentYear) {
        years.add(childYear);
      }
    });
    
    // Also include nearby academic years (previous 2, next 1) for better UX
    const yearOptions = getAcademicYearOptions(2, 1);
    yearOptions.forEach(year => years.add(year));
    
    return Array.from(years).sort().reverse(); // Sort descending (newest first)
  }, [allAssignments, childrenData]);

  // Reset to page 1 when filters or selected child change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus, selectedAcademicYear, selectedChildId]);

  const clearFilters = () => {
    setSearchText("");
    setFilterStatus("all");
  };

  // View/download submission file via API (no direct /uploads/ URL)
  const handleViewSubmission = useCallback(async (assignmentId, studentId, filename) => {
    try {
      const { data } = await axios.get(`/assignments/${assignmentId}/child-submission-file`, {
        params: { studentId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(data);
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (w) setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      else window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error opening submission:", err);
      toast.error(err.response?.status === 404 ? "File not found." : "Failed to open file.");
    }
  }, []);

  const handleDownloadSubmission = useCallback(async (assignmentId, studentId, filename) => {
    try {
      const { data } = await axios.get(`/assignments/${assignmentId}/child-submission-file`, {
        params: { studentId },
        responseType: "blob",
      });
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

  const hasActiveFilters = searchText.trim() || filterStatus !== "all";

  // Filter assignments by selected academic year, search, and status
  const filteredAssignments = useMemo(() => {
    const validAssignments = assignmentsToFilter.filter(
      (a) => a && a.dueDate && !isNaN(new Date(a.dueDate))
    );

    let filtered = validAssignments;

    // Filter by academic year
    if (selectedAcademicYear) {
      filtered = filtered.filter(assignment => {
        if (!assignment.createdAt) return false;
        const assignmentYear = getAcademicYearFromDate(assignment.createdAt);
        return assignmentYear === selectedAcademicYear;
      });
    }

    // Filter by search text
    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      filtered = filtered.filter(assignment => {
        const title = (assignment.title || "").toLowerCase();
        const description = (assignment.description || "").toLowerCase();
        const childName = (assignment.childName || "").toLowerCase();
        const childClass = `${assignment.childClass || ""} ${assignment.childSection || ""}`.toLowerCase();
        return title.includes(query) || description.includes(query) || childName.includes(query) || childClass.includes(query);
      });
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(assignment => {
        const hasSubmitted = assignment.submission != null;
        if (filterStatus === "submitted") {
          return hasSubmitted;
        } else if (filterStatus === "not_submitted") {
          return !hasSubmitted;
        }
        return true;
      });
    }

    return filtered;
  }, [assignmentsToFilter, selectedAcademicYear, searchText, filterStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginatedAssignments = filteredAssignments.slice(start, start + PAGE_SIZE);
  console.log("assignmenst data for parent ",paginatedAssignments);

  // Get children list for tabs
  const childrenList = useMemo(() => {
    return assignmentsByChild.map(entry => ({
      studentId: entry.studentId,
      name: entry.studentName,
      class: entry.class,
      section: entry.section,
    }));
  }, [assignmentsByChild]);

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-3 md:p-4 animate-fade-in">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-4 sm:mb-5 md:mb-6">
        📚 {t('parent.assignments.title')}
      </h1>

      {/* Child Tabs */}
      {childrenList.length > 1 && (
        <div className="bg-white rounded-md border border-gray-200 p-2 mb-4">
          <div className="flex flex-wrap gap-2">
            {childrenList.map((child) => {
              const isSelected = selectedChildId === child.studentId?.toString();
              return (
                <button
                  key={child.studentId}
                  onClick={() => setSelectedChildId(child.studentId?.toString() || null)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {child.name} ({child.class}-{child.section})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-md border border-gray-200 p-3 sm:p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-52 md:w-60">
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Title, description, child name..."
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
            <div className="relative">
              <select
                value={selectedAcademicYear || getCurrentAcademicYear()}
                onChange={(e) => setSelectedAcademicYear(e.target.value || getCurrentAcademicYear())}
                className="w-full border border-gray-300 rounded px-2.5 py-2 pr-7 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white"
              >
                {availableAcademicYears.map(year => (
                  <option key={year} value={year}>
                    {year} {year === getCurrentAcademicYear() ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <p className="text-[11px] text-gray-500 mt-2">
            Showing {filteredAssignments.length} of {assignmentsToFilter.length} assignments
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-28">
          <Loader2 className="animate-spin text-primary w-5 h-5" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
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
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-10">#</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell max-w-[250px]">Description</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-24">Due</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-28">Status</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-20">Files</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-16">Marks</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell max-w-[120px]">Feedback</th>
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
                      <td className="px-3 py-2 text-xs text-gray-600 hidden md:table-cell max-w-[100px]">
                        <div className="whitespace-normal break-words">
                          {a.description || "—"}
                        </div>
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
                        {a.evaluation != null && a.evaluation.marks != null ? (
                          a.totalMarks != null && a.totalMarks !== "" ? (
                            `${a.evaluation.marks} / ${a.totalMarks}`
                          ) : (
                            `${a.evaluation.marks}`
                          )
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600 hidden md:table-cell max-w-[120px] truncate" title={a.evaluation?.feedback || undefined}>
                        {a.evaluation?.feedback || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600">
                Showing {start + 1}–{Math.min(start + PAGE_SIZE, filteredAssignments.length)} of {filteredAssignments.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="inline-flex items-center gap-0.5 px-1.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Prev
                </button>
                <span className="text-xs text-gray-600">
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
          )}
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
        // Submission modal (child's submitted file)
        if (viewingAttachmentsModal.startsWith("submission-")) {
          const assignmentId = viewingAttachmentsModal.replace("submission-", "");
          const a = allAssignmentsWithChildInfo.find((x) => x._id === assignmentId);
          if (!a?.submission?.file || !a?.childId) return null;
          const filename = a.submission.file.split("/").pop() || "Submission";
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50">
              <div className="bg-white rounded-md shadow-xl max-w-sm w-full p-4 max-h-[75vh] overflow-y-auto">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Submission: {a.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{a.childName} - {a.childClass}-{a.childSection}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 p-1.5 bg-green-50 rounded border border-green-200">
                    <FileText size={12} className="text-green-600 shrink-0" />
                    <span className="text-xs text-gray-700 flex-1 truncate">{filename}</span>
                    <button type="button" onClick={() => handleViewSubmission(a._id, a.childId, filename)} className="p-0.5 text-blue-600 hover:text-blue-800" title="View">
                      <Eye size={12} />
                    </button>
                    <button type="button" onClick={() => handleDownloadSubmission(a._id, a.childId, filename)} className="p-0.5 text-green-600 hover:text-green-800" title="Download">
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
        const a = allAssignmentsWithChildInfo.find((x) => x._id === viewingAttachmentsModal);
        if (!a?.attachments?.length) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50">
            <div className="bg-white rounded-md shadow-xl max-w-sm w-full p-4 max-h-[75vh] overflow-y-auto">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Assignment Files: {a.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{a.childName} - {a.childClass}-{a.childSection}</p>
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
