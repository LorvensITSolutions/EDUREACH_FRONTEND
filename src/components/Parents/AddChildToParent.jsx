import React, { useState, useEffect } from 'react';
import { Plus, User, Users } from 'lucide-react';
import { useClassesAndSections } from '../../hooks/useClassesAndSections';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AddChildToParent = ({ parentId, onSuccess }) => {
  const [parent, setParent] = useState(null);
  const [childInfo, setChildInfo] = useState({
    name: '',
    studentId: '',
    class: '',
    section: '',
    birthDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  // Get dynamic classes and sections
  const { classes, sections, loading: classesLoading, error: classesError } = useClassesAndSections();

  // Fetch parent information
  useEffect(() => {
    if (parentId) {
      setLoadError('');
      fetchParent();
    }
  }, [parentId]);

  const fetchParent = async () => {
    try {
      const response = await fetch(`${apiBase}/parents/${parentId}`, {
        credentials: 'include'
      });
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      if (!response.ok) {
        setLoadError('Failed to load parent.');
        return;
      }
      if (!isJson) {
        setLoadError('Invalid response from server.');
        return;
      }
      const data = await response.json();
      setParent(data.parent);
    } catch (err) {
      console.error('Error fetching parent:', err);
      setLoadError('Failed to load parent.');
    }
  };

  // Update child info
  const updateChild = (field, value) => {
    setChildInfo({ ...childInfo, [field]: value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBase}/parents/${parentId}/add-child`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(childInfo)
      });
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await response.json() : { message: 'Invalid response from server.' };

      if (response.ok && isJson && data.newChild) {
        let message = `Successfully added child ${data.newChild.name} to parent!\n\n`;
        message += `Child Credentials:\n`;
        message += `Student ID: ${data.newChild.studentId}\n`;
        message += `Username: ${data.newChild.credentials.username}\n`;
        message += `Password: ${data.newChild.credentials.password}`;
        alert(message);
        if (onSuccess) onSuccess(data);
        // Reset form
        setChildInfo({
          name: '',
          studentId: '',
          class: '',
          section: '',
          birthDate: ''
        });
        // Refresh parent data
        fetchParent();
      } else {
        setError(data.message || 'Failed to add child to parent');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!parent) {
    return (
      <div className="text-center py-4 sm:py-6">
        {loadError ? (
          <div className="text-sm sm:text-base text-red-600">{loadError}</div>
        ) : (
          <div className="text-sm sm:text-base text-gray-600">Loading parent information...</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
        <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
          Add Child to Existing Parent
        </h2>
      </div>

      {/* Parent Information Display */}
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-5 md:mb-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
          <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          Parent Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <span className="text-xs sm:text-sm font-medium text-gray-600">Name:</span>
            <p className="text-sm sm:text-base text-gray-800 mt-0.5 break-words">{parent.name}</p>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-medium text-gray-600">Phone:</span>
            <p className="text-sm sm:text-base text-gray-800 mt-0.5 break-words">{parent.phone || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-medium text-gray-600">Current Children:</span>
            <p className="text-sm sm:text-base text-gray-800 mt-0.5">{parent.childrenCount || (parent.children?.length || 0)} children</p>
          </div>
        </div>
      </div>

      {/* Existing Children List */}
      {parent.children && parent.children.length > 0 && (
        <div className="mb-4 sm:mb-5 md:mb-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            Existing Children
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {parent.children.map((child, index) => (
              <div key={index} className="bg-gray-50 p-2.5 sm:p-3 rounded-lg border">
               <div className="text-sm sm:text-base font-medium text-gray-800 break-words">{child.name}</div>
               <div className="text-xs sm:text-sm text-gray-600 mt-0.5">
                 {child.class} - {child.section}
               </div>
               <div className="text-xs text-blue-600 font-mono mt-1 break-all">
                 ID: {child.studentId || child.id || child._id || 'Not assigned'}
               </div>
               {child.generatedCredentials && (
                 <div className="text-xs text-green-600 mt-1.5 space-y-0.5 break-all">
                   <div>Username: {child.generatedCredentials.username}</div>
                   <div>Password: {child.generatedCredentials.password}</div>
                 </div>
               )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Child Form */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">
          Add New Child
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Child Name *
            </label>
            <input
              type="text"
              required
              value={childInfo.name}
              onChange={(e) => updateChild('name', e.target.value)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alice Johnson"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Student ID *
            </label>
            <input
              type="text"
              required
              value={childInfo.studentId}
              onChange={(e) => updateChild('studentId', e.target.value)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="S12345"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Class *
            </label>
            <select
              required
              value={childInfo.class}
              onChange={(e) => updateChild('class', e.target.value)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={classesLoading}
            >
              <option value="">Select Class</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Section *
            </label>
            <select
              required
              value={childInfo.section}
              onChange={(e) => updateChild('section', e.target.value)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={classesLoading}
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Birth Date
            </label>
            <input
              type="date"
              value={childInfo.birthDate}
              onChange={(e) => updateChild('birthDate', e.target.value)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">{loading ? 'Adding Child...' : 'Add Child to Parent'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddChildToParent;
