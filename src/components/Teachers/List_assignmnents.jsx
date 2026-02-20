import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTeacherAssignmentStore } from "../stores/useTeacherAssignmentStore";
import { useAttendanceTeacherStore } from "../stores/useAttendanceTeacherStore";
import axios from "../lib/axios";
import { format } from "date-fns";
import { Trash2, Pencil, Search, X, Check, Loader2, FileText, Download } from "lucide-react";
import { toast } from "react-hot-toast";

const TeacherAssignmentsPage = () => {
  const {
    assignments,
    fetchAssignments,
    deleteAssignment,
    updateAssignment,
    updatingAssignment,
  } = useTeacherAssignmentStore();
  const { assignedClasses, fetchAssignedStudentsWithAttendance } = useAttendanceTeacherStore();

  const [editForm, setEditForm] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    fetchAssignedStudentsWithAttendance(format(new Date(), "yyyy-MM-dd"));
  }, [fetchAssignedStudentsWithAttendance]);

  // Derive unique class and section options from assignments (for filters)
  const { classOptions, sectionOptions } = useMemo(() => {
    const classes = [...new Set((assignments || []).map((a) => a.className || a.class || "").filter(Boolean))].sort();
    const sections = [...new Set((assignments || []).map((a) => a.section || "").filter(Boolean))].sort();
    return { classOptions: classes, sectionOptions: sections };
  }, [assignments]);

  // Class/section options for Edit modal: from assignedClasses, plus current assignment values if missing
  const { editClassOptions, editSectionOptions } = useMemo(() => {
    const fromAssigned = assignedClasses || [];
    const classes = [...new Set(fromAssigned.map((c) => (c && String(c).split("-")[0]) || "").filter(Boolean))].sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      if (!isNaN(na)) return -1;
      if (!isNaN(nb)) return 1;
      return String(a).localeCompare(String(b));
    });
    const withCurrent = editForm?.className && !classes.includes(editForm.className)
      ? [...classes, editForm.className].sort()
      : classes;
    const forClass = editForm?.className
      ? [...new Set(fromAssigned.filter((c) => c && c.startsWith(editForm.className + "-")).map((c) => c.split("-")[1]).filter(Boolean))].sort()
      : [];
    const secWithCurrent = editForm?.section && !forClass.includes(editForm.section)
      ? [...forClass, editForm.section].sort()
      : forClass;
    return { editClassOptions: withCurrent, editSectionOptions: secWithCurrent };
  }, [assignedClasses, editForm?.className, editForm?.section]);

  // Filter assignments by search and filters
  const filteredAssignments = useMemo(() => {
    const list = assignments || [];
    const q = (searchText || "").trim().toLowerCase();
    const fc = filterClass === "all" ? "" : filterClass;
    const fs = filterSection === "all" ? "" : filterSection;

    return list.filter((a) => {
      const cls = a.className || a.class || "";
      const sec = a.section || "";
      const matchSearch =
        !q ||
        [a.title, a.description || "", cls, sec].some((s) => (String(s).toLowerCase() || "").includes(q));
      const matchClass = !fc || cls === fc;
      const matchSection = !fs || sec === fs;
      return matchSearch && matchClass && matchSection;
    });
  }, [assignments, searchText, filterClass, filterSection]);

  const handleEditSubmit = async () => {
    if (!editForm) return;
    const { assignmentId, title, description, dueDate, className, section } = editForm;
    if (!title?.trim()) return toast.error("Title is required");
    if (!className || !section) return toast.error("Class and Section are required");
    const ok = await updateAssignment(assignmentId, { 
      title: title.trim(), 
      description: description || "", 
      dueDate: dueDate || null, 
      className, 
      section, 
      totalMarks: editForm.totalMarks || "",
      files: editForm.files || [],
      removedAttachments: editForm.removedAttachments || [],
    });
    if (ok) setEditForm(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    await deleteAssignment(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterClass("all");
    setFilterSection("all");
  };

  const handleViewAttachment = useCallback(async (assignmentId, index) => {
    try {
      const { data } = await axios.get(`/assignments/${assignmentId}/attachment`, {
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

  const hasActiveFilters = searchText.trim() || filterClass !== "all" || filterSection !== "all";

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-3 md:p-4 animate-fade-in">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-4 sm:mb-5 md:mb-6">
        📚 Your Uploaded Assignments
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Title, description, class, section..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="all">All</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="all">All</option>
              {sectionOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredAssignments.length} of {assignments?.length || 0} assignments
          </p>
        )}
      </div>

      {!assignments?.length ? (
        <p className="text-sm sm:text-base text-gray-500 px-2">No assignments uploaded yet.</p>
      ) : !filteredAssignments.length ? (
        <p className="text-sm sm:text-base text-gray-500 px-2">No assignments match your filters.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">#</th>
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell max-w-[200px]">Description</th>
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">Class</th>
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">Section</th>
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Due Date</th>
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Total Marks</th>
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Files</th>
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAssignments.map((a, idx) => (
                  <tr key={a._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                      <span className="font-medium text-gray-900">{a.title}</span>
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-600 hidden md:table-cell max-w-[200px] whitespace-normal break-words" title={a.description}>
                      {a.description || "—"}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-700">{a.className || a.class || "—"}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-700">{a.section || "—"}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-700">
                      {a.dueDate ? format(new Date(a.dueDate), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-700 text-center">
                      {a.totalMarks != null && a.totalMarks !== "" ? a.totalMarks : "—"}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                      {a.attachments && a.attachments.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {a.attachments.slice(0, 3).map((file, fileIdx) => {
                            const fileName = file?.split("/").pop() || file?.replace(/^.*[\\/]/, "") || `File ${fileIdx + 1}`;
                            return (
                              <button
                                key={fileIdx}
                                type="button"
                                onClick={() => handleViewAttachment(a._id, fileIdx)}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[120px] text-left bg-transparent border-none p-0 cursor-pointer"
                                title={fileName}
                              >
                                <FileText className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{fileName}</span>
                              </button>
                            );
                          })}
                          {a.attachments.length > 3 && (
                            <span className="text-xs text-gray-500">+{a.attachments.length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            setEditForm({
                              assignmentId: a._id,
                              title: a.title,
                              description: a.description || "",
                              dueDate: a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 10) : "",
                              className: a.className || a.class || "",
                              section: a.section || "",
                              totalMarks: a.totalMarks || "",
                              files: [],
                              existingAttachments: a.attachments || [],
                              removedAttachments: [],
                            })
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit assignment"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(a._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit assignment modal */}
      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit assignment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Description"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Due date</label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, dueDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Total Marks (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.totalMarks}
                  onChange={(e) => setEditForm((p) => ({ ...p, totalMarks: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Total Marks"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
                  <select
                    value={editForm.className}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, className: e.target.value, section: "" }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    <option value="">Select class</option>
                    {editClassOptions.map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
                  <select
                    value={editForm.section}
                    onChange={(e) => setEditForm((p) => ({ ...p, section: e.target.value }))}
                    disabled={!editForm.className}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{editForm.className ? "Select section" : "Select class first"}</option>
                    {editSectionOptions.map((s) => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Files</label>
                
                {/* Existing attachments */}
                {editForm.existingAttachments && editForm.existingAttachments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {editForm.existingAttachments
                      .filter((file) => !editForm.removedAttachments?.includes(file))
                      .map((file, idx) => {
                        const fileName = file?.split("/").pop() || file?.replace(/^.*[\\/]/, "") || `File ${idx + 1}`;
                        const attachmentIndex = editForm.existingAttachments.indexOf(file);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                          >
                            <button
                              type="button"
                              onClick={() => handleViewAttachment(editForm.assignmentId, attachmentIndex)}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline flex-1 min-w-0 text-left bg-transparent border-none p-0 cursor-pointer"
                            >
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{fileName}</span>
                            </button>
                      <button
                              type="button"
                              onClick={() => {
                                setEditForm((p) => ({
                                  ...p,
                                  removedAttachments: [...(p.removedAttachments || []), file],
                                }));
                              }}
                              className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                      </button>
                    </div>
                        );
                      })}
                  </div>
                )}
                
                {/* Add new files */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Add new PDFs or images (optional)</label>
                  <input
                    key={editForm.assignmentId}
                    type="file"
                    accept="application/pdf,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={(e) => setEditForm((p) => ({ ...p, files: Array.from(e.target.files || []) }))}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                  />
                  {editForm.files?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{editForm.files.length} new file(s) selected</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, GIF or WebP. Up to 3 files.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditForm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={updatingAssignment}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updatingAssignment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {updatingAssignment ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete assignment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this assignment? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentsPage;
