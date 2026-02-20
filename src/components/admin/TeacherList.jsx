// src/components/admin/teachers/TeacherList.jsx
import { useState } from "react";
import { useTeacherStore } from "../stores/useTeacherStore";
import { Trash2, User, Phone, BookOpen, Users, Eye, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import TeacherProfileModal from "./TeacherProfileModal";
import EditTeacherSectionsModal from "./EditTeacherSectionsModal";

const TeacherList = () => {
  const { teachers, loading, pagination, deleteTeacherById, goToPage, nextPage, prevPage } = useTeacherStore();
  
  // State for profile modal
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // State for edit sections modal
  const [teacherToEdit, setTeacherToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Note: Data fetching is now handled by the parent TeacherManagement component
  // This component only displays the data and handles user interactions

  const handleDelete = async (teacherId, name) => {
    const confirm = window.confirm(`Delete ${name}? This cannot be undone.`);
    if (!confirm) return;

    try {
      await deleteTeacherById(teacherId);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Handle profile modal
  const handleViewProfile = (teacher) => {
    setSelectedTeacher(teacher);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedTeacher(null);
  };

  // Handle edit sections modal
  const handleEditSections = (teacher) => {
    setTeacherToEdit(teacher);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setTeacherToEdit(null);
  };

  // Helper function to get subjects from sectionAssignments
  const getTeacherSubjects = (teacher) => {
    // First try to get from sectionAssignments
    if (teacher.sectionAssignments && teacher.sectionAssignments.length > 0) {
      const subjects = teacher.sectionAssignments
        .map(s => s.subject)
        .filter(subject => subject && subject.trim() !== '');
      
      if (subjects.length > 0) {
        // Get unique subjects
        const uniqueSubjects = [...new Set(subjects)];
        return uniqueSubjects.join(', ');
      }
    }
    
    // Fallback to teacher.subject
    return teacher.subject || "Not specified";
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md w-full">
        <div className="flex items-center justify-center h-24 sm:h-32">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600 text-sm sm:text-base">Loading teachers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md w-full">
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-1.5 sm:gap-2">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>All Teachers ({pagination?.totalTeachers || 0})</span>
        </h2>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {teachers.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <User className="w-8 h-8 text-gray-300" />
              <span className="text-sm">No teachers found.</span>
            </div>
          </div>
        ) : (
          teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Image */}
                <div className="flex-shrink-0">
                  {teacher.image?.url ? (
                    <img
                      src={teacher.image.url}
                      alt={teacher.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base break-words">{teacher.name}</h3>
                      <p className="text-xs sm:text-sm text-teal-600 font-medium mt-0.5 break-words">
                        {getTeacherSubjects(teacher)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleViewProfile(teacher)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditSections(teacher)}
                        className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                        title="Edit Sections"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id, teacher.name)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <span className="font-medium">ID:</span>
                      <span className="font-mono">{teacher.teacherId || "Not assigned"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{teacher.phone || "Not provided"}</span>
                    </div>
                    <div>
                      {teacher.sectionAssignments && teacher.sectionAssignments.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teacher.sectionAssignments.map((s, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {s.className}-{s.section}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No sections assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 md:p-4 text-left font-medium text-gray-700">Image</th>
              <th className="p-3 md:p-4 text-left font-medium text-gray-700">Teacher ID</th>
              <th className="p-3 md:p-4 text-left font-medium text-gray-700">Name</th>
              <th className="p-3 md:p-4 text-left font-medium text-gray-700">Phone</th>
              <th className="p-3 md:p-4 text-left font-medium text-gray-700">Assigned Sections</th>
              <th className="p-3 md:p-4 text-center font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 md:p-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <User className="w-8 h-8 text-gray-300" />
                    <span>No teachers found.</span>
                  </div>
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr
                  key={teacher._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 md:p-4">
                    {teacher.image?.url ? (
                      <img
                        src={teacher.image.url}
                        alt={teacher.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="p-3 md:p-4 font-mono text-xs text-gray-600">
                    {teacher.teacherId || "Not assigned"}
                  </td>
                  <td className="p-3 md:p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{teacher.name}</span>
                      <span className="text-sm text-teal-600 font-medium mt-1">
                        {getTeacherSubjects(teacher)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 md:p-4 text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {teacher.phone || "Not provided"}
                  </td>
                  <td className="p-3 md:p-4">
                    {teacher.sectionAssignments && teacher.sectionAssignments.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teacher.sectionAssignments.map((s, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {s.className}-{s.section}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No sections assigned</span>
                    )}
                  </td>
                  <td className="p-3 md:p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewProfile(teacher)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditSections(teacher)}
                        className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                        title="Edit Sections"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id, teacher.name)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-3 sm:p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-600">
            Showing page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={prevPage}
              disabled={!pagination.hasPrevPage}
              className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={!pagination.hasNextPage}
              className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Teacher Profile Modal */}
      <TeacherProfileModal
        teacher={selectedTeacher}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfile}
      />

      {/* Edit Teacher Sections Modal */}
      <EditTeacherSectionsModal
        teacher={teacherToEdit}
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
      />
    </div>
  );
};

export default TeacherList;
