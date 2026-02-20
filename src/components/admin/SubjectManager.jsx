import React, { useState, useEffect } from 'react';
import { useSubjectStore } from '../stores/useSubjectStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  BookOpen, 
  Save, 
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

export default function SubjectManager() {
  const { 
    subjects, 
    loading, 
    error, 
    fetchSubjects, 
    addSubject, 
    updateSubject, 
    deleteSubject 
  } = useSubjectStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Subject name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Subject name must be less than 50 characters';
    }

    if (formData.code && formData.code.length > 10) {
      newErrors.code = 'Subject code must be less than 10 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const subjectData = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined
      };

      if (editingSubject) {
        await updateSubject(editingSubject._id, subjectData);
      } else {
        await addSubject(subjectData);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving subject:', error);
      setErrors({ submit: 'Failed to save subject. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingSubject(null);
    setErrors({});
    setFormData({
      name: '',
      code: '',
      description: ''
    });
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      description: subject.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(subjectId);
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Failed to delete subject. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans p-2 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-dark">
                  Subject Management
                </h1>
                <p className="text-text/70 text-xs sm:text-sm md:text-base">
                  Manage school subjects and curriculum
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-primary text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add Subject</span>
            </motion.button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-danger/10 border border-danger/20 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-danger flex-shrink-0" />
            <p className="text-danger font-medium text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {subjects.map((subject) => (
            <motion.div
              key={subject._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-primary-dark mb-1 break-words">
                    {subject.name}
                  </h3>
                  {subject.code && (
                    <p className="text-xs sm:text-sm text-accent-dark font-medium">
                      Code: {subject.code}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit subject"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject._id)}
                    className="p-1.5 sm:p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    title="Delete subject"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              
              {subject.description && (
                <p className="text-text/70 text-xs sm:text-sm leading-relaxed break-words">
                  {subject.description}
                </p>
              )}
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Active Subject</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {subjects.length === 0 && !loading && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-6 sm:p-8 md:p-12 text-center">
            <BookOpen className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
              No subjects found
            </h3>
            <p className="text-gray-500 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base">
              Start by adding your first subject to the system
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm sm:text-base"
            >
              Add First Subject
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-6 sm:p-8 md:p-12 text-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading subjects...</p>
          </div>
        )}

        {/* Add/Edit Subject Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && resetForm()}
            >
              <motion.div
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white p-4 sm:p-5 md:p-6 rounded-t-2xl sm:rounded-t-3xl">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                          {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                        </h3>
                        <p className="text-primary-light text-xs sm:text-sm truncate">
                          {editingSubject ? 'Update subject details' : 'Fill in the subject information'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetForm}
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div className="p-4 sm:p-5 md:p-6">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Error Message */}
                    {errors.submit && (
                      <div className="bg-danger/10 border border-danger/20 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-danger flex-shrink-0" />
                        <p className="text-danger font-medium text-sm sm:text-base">{errors.submit}</p>
                      </div>
                    )}

                    {/* Subject Name */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-text">
                        Subject Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter subject name..."
                        className={`w-full p-3 sm:p-3.5 md:p-4 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-light/20 text-sm sm:text-base ${
                          errors.name 
                            ? 'border-danger bg-danger/10' 
                            : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                        }`}
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) {
                            setErrors({ ...errors, name: '' });
                          }
                        }}
                        maxLength={50}
                      />
                      {errors.name && (
                        <p className="text-danger text-xs sm:text-sm flex items-center gap-1">
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Subject Code */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-text">
                        Subject Code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter subject code (optional)..."
                        className={`w-full p-3 sm:p-3.5 md:p-4 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-light/20 text-sm sm:text-base ${
                          errors.code 
                            ? 'border-danger bg-danger/10' 
                            : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                        }`}
                        value={formData.code}
                        onChange={(e) => {
                          setFormData({ ...formData, code: e.target.value });
                          if (errors.code) {
                            setErrors({ ...errors, code: '' });
                          }
                        }}
                        maxLength={10}
                      />
                      {errors.code && (
                        <p className="text-danger text-xs sm:text-sm flex items-center gap-1">
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          {errors.code}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-text">
                        Description
                      </label>
                      <textarea
                        placeholder="Enter subject description (optional)..."
                        rows={4}
                        className={`w-full p-3 sm:p-3.5 md:p-4 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-light/20 resize-none text-sm sm:text-base ${
                          errors.description 
                            ? 'border-danger bg-danger/10' 
                            : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                        }`}
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({ ...formData, description: e.target.value });
                          if (errors.description) {
                            setErrors({ ...errors, description: '' });
                          }
                        }}
                        maxLength={200}
                      />
                      {errors.description && (
                        <p className="text-danger text-xs sm:text-sm flex items-center gap-1">
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-gray-300 text-text rounded-lg sm:rounded-xl font-semibold hover:bg-background transition-colors text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg sm:rounded-xl font-semibold hover:from-primary-dark hover:to-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>{editingSubject ? 'Updating...' : 'Creating...'}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>{editingSubject ? 'Update Subject' : 'Create Subject'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
