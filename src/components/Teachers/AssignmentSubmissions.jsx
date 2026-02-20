import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTeacherAssignmentStore } from "../stores/useTeacherAssignmentStore";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { Loader2, Eye, Download, Check } from "lucide-react";

const AssignmentSubmissions = ({ assignmentId }) => {
  const {
    submissions,
    fetchSubmissions,
    evaluateAssignment,
    evaluating,
    evaluations,
    assignmentTotalMarks,
  } = useTeacherAssignmentStore();

  const [feedbackMap, setFeedbackMap] = useState({});
  const [marksMap, setMarksMap] = useState({});
  const [evaluated, setEvaluated] = useState({});
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);
  const lastAssignmentIdRef = useRef(null);

  // Memoize fetchSubmissions to prevent unnecessary re-renders
  const loadSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    
    setLoading(true);
    try {
      await fetchSubmissions(assignmentId);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, fetchSubmissions]);

  // Initialize submissions when assignmentId changes
  useEffect(() => {
    if (!assignmentId) {
      initializedRef.current = false;
      lastAssignmentIdRef.current = null;
      return;
    }

    // Reset state when assignment changes
    if (lastAssignmentIdRef.current !== assignmentId) {
      setFeedbackMap({});
      setMarksMap({});
      setEvaluated({});
      initializedRef.current = false;
      lastAssignmentIdRef.current = assignmentId;
      loadSubmissions();
    }
  }, [assignmentId, loadSubmissions]);

  // Load evaluations into state when they're available (updates whenever evaluations change)
  useEffect(() => {
    if (!assignmentId || loading) {
      return;
    }

    // Update maps from evaluations (backend is source of truth)
    const newMarksMap = {};
    const newFeedbackMap = {};
    const newEvaluated = {};

    if (Array.isArray(evaluations) && evaluations.length > 0) {
      evaluations.forEach((e) => {
        const id = e.studentId?.toString();
        if (id) {
          if (e.marks != null && e.marks !== "") newMarksMap[id] = e.marks;
          if (e.feedback != null && e.feedback !== "") newFeedbackMap[id] = e.feedback;
          if (e.marks != null || e.feedback != null) newEvaluated[id] = true;
        }
      });

      // Update maps with evaluation data
      setMarksMap((prev) => ({ ...prev, ...newMarksMap }));
      setFeedbackMap((prev) => ({ ...prev, ...newFeedbackMap }));
      setEvaluated((prev) => ({ ...prev, ...newEvaluated }));
      initializedRef.current = true;
    } else if (evaluations && evaluations.length === 0 && initializedRef.current) {
      // If evaluations is explicitly empty array and we've initialized, clear evaluated flags
      // (but keep marks/feedback in case user is editing)
      setEvaluated({});
    }
  }, [evaluations, assignmentId, loading]);

  const handleEvaluate = useCallback(async (studentId) => {
    const marks = marksMap[studentId];
    const feedback = feedbackMap[studentId];
    if (!marks || !feedback) return;

    await evaluateAssignment({ assignmentId, studentId, marks, feedback });
    // Refetch submissions to get updated evaluations from backend
    await loadSubmissions();
  }, [assignmentId, marksMap, feedbackMap, evaluateAssignment, loadSubmissions]);

  const handleDownload = useCallback(async (studentId, fileName) => {
    if (!assignmentId || !studentId || !fileName) return;
    try {
      const { data } = await axios.get(
        `/assignments/${assignmentId}/submission-file`,
        { params: { studentId }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading file:", err);
      const status = err.response?.status;
      const msg = status === 404 ? "File not found." : status === 403 ? "Not allowed." : err.message;
      toast.error(msg || "Download failed. Check your connection and try again.");
    }
  }, [assignmentId]);

  const handleView = useCallback(async (studentId, fileName) => {
    if (!assignmentId || !studentId) return;
    try {
      const { data } = await axios.get(
        `/assignments/${assignmentId}/submission-file`,
        { params: { studentId }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(data);
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (w) setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      else window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error opening file:", err);
      const status = err.response?.status;
      const msg = status === 404 ? "File not found." : status === 403 ? "Not allowed." : err.message;
      toast.error(msg || "Could not open file. Check your connection and try again.");
    }
  }, [assignmentId]);

  // Memoize submissions to prevent unnecessary re-renders
  const displaySubmissions = useMemo(() => {
    return Array.isArray(submissions) ? submissions : [];
  }, [submissions]);

  if (loading) {
    return (
      <div className="h-full p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg sm:rounded-xl">
        <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
          <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 animate-spin text-primary flex-shrink-0" />
          <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Loading submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg sm:rounded-xl overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Submissions</h2>
        {assignmentTotalMarks != null && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Total Marks: </span>
            <span>{assignmentTotalMarks}</span>
          </div>
        )}
      </div>

      {displaySubmissions.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-sm sm:text-base text-gray-500">No submissions found for this assignment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-10">#</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-32">Submission</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-20 text-center">Total Marks</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-28">Score</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Feedback</th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displaySubmissions.map((sub, idx) => {
                  const student = sub.studentId;
                  const studentId = student?._id?.toString();
                  const fileName = sub.file?.split("/").pop() || sub.file?.replace(/^.*[\\/]/, "") || "Submission";

                  return (
                    <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2 text-xs text-gray-600">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          <div className="font-medium text-gray-900">{student?.name || "Unknown Student"}</div>
                          <div className="text-gray-500">{student?.studentId || ""}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleView(studentId, fileName)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(studentId, fileName)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-xs text-gray-700">
                        {assignmentTotalMarks != null ? assignmentTotalMarks : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="Score"
                            value={marksMap[studentId] || ""}
                            onChange={(e) =>
                              setMarksMap({
                                ...marksMap,
                                [studentId]: e.target.value,
                              })
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                            disabled={!studentId}
                            max={assignmentTotalMarks != null ? assignmentTotalMarks : undefined}
                          />
                    
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="Feedback"
                          value={feedbackMap[studentId] || ""}
                          onChange={(e) =>
                            setFeedbackMap({
                              ...feedbackMap,
                              [studentId]: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                          disabled={!studentId}
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleEvaluate(studentId)}
                            disabled={!studentId || evaluating || !marksMap[studentId] || !feedbackMap[studentId]}
                            className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {evaluated[studentId] ? "Update" : "Save"}
                          </button>
                          {evaluated[studentId] && (
                            <div className="flex items-center gap-0.5 text-green-600 text-[10px]">
                              <Check className="w-3 h-3" />
                              <span>Saved</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissions;
