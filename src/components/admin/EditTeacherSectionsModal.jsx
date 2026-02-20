// src/components/admin/EditTeacherSectionsModal.jsx
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { useTeacherStore } from "../stores/useTeacherStore";
import { useClassesAndSections } from "../../hooks/useClassesAndSections";
import { toast } from "react-hot-toast";

const EditTeacherSectionsModal = ({ teacher, isOpen, onClose }) => {
  const { assignSection, removeSection, loading } = useTeacherStore();
  const { classes, sections, loading: classesLoading } = useClassesAndSections();
  
  const [currentSections, setCurrentSections] = useState([]);
  const [newSection, setNewSection] = useState({ className: "", section: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState({});

  useEffect(() => {
    if (teacher && teacher.sectionAssignments) {
      setCurrentSections([...teacher.sectionAssignments]);
    }
  }, [teacher]);

  if (!isOpen || !teacher) return null;

  const handleAddSection = async (e) => {
    e.preventDefault();
    
    if (!newSection.className || !newSection.section) {
      toast.error("Please select both class and section");
      return;
    }

    // Check for duplicate
    const isDuplicate = currentSections.some(
      s => s.className === newSection.className && s.section === newSection.section
    );

    if (isDuplicate) {
      toast.error("This section is already assigned to this teacher");
      return;
    }

    setIsAdding(true);
    try {
      await assignSection({
        teacherId: teacher._id,
        className: newSection.className,
        section: newSection.section,
      });
      
      // Update local state
      setCurrentSections([
        ...currentSections,
        { className: newSection.className, section: newSection.section }
      ]);
      
      // Reset form
      setNewSection({ className: "", section: "" });
      toast.success("Section added successfully");
    } catch (error) {
      console.error("Failed to add section:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSection = async (className, section) => {
    const key = `${className}-${section}`;
    setIsRemoving({ ...isRemoving, [key]: true });
    
    try {
      await removeSection({
        teacherId: teacher._id,
        className,
        section,
      });
      
      // Update local state
      setCurrentSections(
        currentSections.filter(
          s => !(s.className === className && s.section === section)
        )
      );
      
      toast.success("Section removed successfully");
    } catch (error) {
      console.error("Failed to remove section:", error);
    } finally {
      setIsRemoving({ ...isRemoving, [key]: false });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Teacher Sections</h2>
            <p className="text-sm text-gray-600 mt-1">{teacher.name} - {teacher.teacherId || "No ID"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Current Sections */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Sections</h3>
            {currentSections.length === 0 ? (
              <p className="text-gray-500 text-sm">No sections assigned</p>
            ) : (
              <div className="space-y-2">
                {currentSections.map((section, index) => {
                  const key = `${section.className}-${section.section}`;
                  const removing = isRemoving[key];
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="font-medium text-gray-800">
                        {section.className}-{section.section}
                      </span>
                      <button
                        onClick={() => handleRemoveSection(section.className, section.section)}
                        disabled={removing || loading}
                        className="text-red-600 hover:text-red-800 transition-colors p-1.5 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove section"
                      >
                        {removing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Section</h3>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Class
                  </label>
                  <select
                    value={newSection.className}
                    onChange={(e) => setNewSection({ ...newSection, className: e.target.value })}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    disabled={isAdding || classesLoading}
                    required
                  >
                    <option value="">Choose a class...</option>
                    {classes.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Section
                  </label>
                  <select
                    value={newSection.section}
                    onChange={(e) => setNewSection({ ...newSection, section: e.target.value })}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    disabled={isAdding || classesLoading}
                    required
                  >
                    <option value="">Choose a section...</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding || loading || classesLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherSectionsModal;

