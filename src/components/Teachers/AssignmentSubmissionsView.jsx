 import React, { useEffect, useState, useCallback, useMemo } from "react";
import AssignmentSubmissions from "../Teachers/AssignmentSubmissions";
import { useTeacherAssignmentStore } from "../stores/useTeacherAssignmentStore";
import { useAttendanceTeacherStore } from "../stores/useAttendanceTeacherStore";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { Loader2, Search, Eye } from "lucide-react";
import { format } from "date-fns";

const AssignmentSubmissionsView = () => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const { assignments, fetchAssignments } = useTeacherAssignmentStore();
  const { assignedClasses, fetchAssignedStudentsWithAttendance } = useAttendanceTeacherStore();
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  // Memoize fetchAssignments to prevent unnecessary re-renders
  const loadAssignments = useCallback(async () => {
    if (hasFetched) return; // Prevent multiple fetches
    setLoading(true);
    try {
      await fetchAssignments();
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchAssignments, hasFetched]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Fetch assigned classes on mount
  useEffect(() => {
    fetchAssignedStudentsWithAttendance(format(new Date(), "yyyy-MM-dd"));
  }, [fetchAssignedStudentsWithAttendance]);

  // Derive class-section options from assigned classes (e.g. "1-A", "2-B")
  const classOptions = useMemo(() => {
    const unique = [...new Set((assignedClasses || []).map((c) => (c && String(c).trim()) || "").filter(Boolean))];
    return unique.sort((a, b) => {
      const [na, sa] = a.split("-");
      const [nb, sb] = b.split("-");
      const va = parseInt(na, 10);
      const vb = parseInt(nb, 10);
      if (!isNaN(va) && !isNaN(vb) && va !== vb) return va - vb;
      if (!isNaN(va) && !isNaN(vb)) return (sa || "").localeCompare(sb || "");
      return String(a).localeCompare(String(b));
    });
  }, [assignedClasses]);

  // Filter assignments based on search text and selected class
  const filteredAssignments = useMemo(() => {
    let filtered = assignments || [];
    
    // Filter by class-section (e.g. "1-A")
    if (selectedClass !== "all") {
      filtered = filtered.filter((a) => {
        const cls = String(a.class || a.className || "").trim();
        const sec = String(a.section || "").trim();
        const assignmentClassSection = sec ? `${cls}-${sec}` : cls;
        return assignmentClassSection === selectedClass;
      });
    }
    
    // Filter by search text
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter((a) => {
        const title = (a.title || "").toLowerCase();
        const className = (a.class || a.className || "").toLowerCase();
        const section = (a.section || "").toLowerCase();
        return title.includes(query) || className.includes(query) || section.includes(query);
      });
    }
    
    return filtered;
  }, [assignments, searchText, selectedClass]);

  // Reset selected assignment if it's not in filtered list, or auto-select first if none selected
  useEffect(() => {
    if (filteredAssignments && filteredAssignments.length > 0 && !loading) {
      const isCurrentSelectedInList = filteredAssignments.some(a => a._id === selectedAssignmentId);
      if (!isCurrentSelectedInList) {
        setSelectedAssignmentId(filteredAssignments[0]._id);
      } else if (!selectedAssignmentId) {
        setSelectedAssignmentId(filteredAssignments[0]._id);
      }
    } else if (filteredAssignments && filteredAssignments.length === 0) {
      setSelectedAssignmentId("");
    }
  }, [filteredAssignments, loading, selectedAssignmentId]);

  const handleViewQuestionPaper = useCallback(async (e, assignmentId, hasAttachments) => {
    e.stopPropagation();
    if (!hasAttachments) {
      toast.error("No question paper attached for this assignment.");
      return;
    }
    try {
      const { data } = await axios.get(`/assignments/${assignmentId}/attachment`, {
        params: { index: 0 },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(data);
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (w) setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      else window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error opening question paper:", err);
      toast.error(err.response?.status === 404 ? "Question paper not found." : "Failed to open question paper.");
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-2 ">
      {/* Sidebar - Assignments List */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-primary">Assignments</h2>
          <div className="flex gap-2 items-stretch">
          <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="flex-shrink-0 w-22 min-w-0 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="all">Classes</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
    
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          ) : Array.isArray(filteredAssignments) && filteredAssignments.length > 0 ? (
            <div className="p-2">
              {filteredAssignments.map((a) => {
                const hasAttachments = Array.isArray(a.attachments) && a.attachments.length > 0;
                return (
                  <div
                    key={a._id}
                    className={`w-full text-left p-2.5 rounded-md mb-2 transition-colors ${
                      selectedAssignmentId === a._id
                        ? "bg-primary text-white"
                        : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    {/* Row 1: assignment name + class-section */}
                    <button
                      type="button"
                      onClick={() => setSelectedAssignmentId(a._id)}
                      className="w-full text-left flex items-center justify-between gap-2 mb-1"
                    >
                      <div className="font-semibold text-sm truncate flex-1 min-w-0">{a.title}</div>
                      <div className={`text-xs flex-shrink-0 ${selectedAssignmentId === a._id ? "text-white/90" : "text-gray-600 dark:text-gray-400"}`}>
                        {a.class}-{a.section}
                      </div>
                    </button>
                    {/* Row 2: due date + eye icon */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/20">
                      {a.dueDate ? (
                        <div className={`text-xs ${selectedAssignmentId === a._id ? "text-white/80" : "text-gray-500 dark:text-gray-500"}`}>
                          Due: {format(new Date(a.dueDate), "dd MMM yy")}
                        </div>
                      ) : <span />}
                      <button
                        type="button"
                        onClick={(e) => handleViewQuestionPaper(e, a._id, hasAttachments)}
                        title="View question paper"
                        className={`p-1 rounded hover:bg-white/20 transition-colors ${hasAttachments ? (selectedAssignmentId === a._id ? "text-white" : "text-primary") : "text-gray-400 cursor-not-allowed opacity-60"}`}
                      >
                        <Eye className="w-4 h-4 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-gray-500">
                {searchText.trim() || selectedClass !== "all" 
                  ? "No assignments match your filters" 
                  : "No assignments available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Submissions */}
      <div className="flex-1 overflow-y-auto">
        {selectedAssignmentId && !loading ? (
          <AssignmentSubmissions assignmentId={selectedAssignmentId} />
        ) : !loading ? (
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500">Select an assignment to view submissions</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AssignmentSubmissionsView;
