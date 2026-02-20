import React, { useState } from 'react';
import { Plus, Trash2, Save, User, Users } from 'lucide-react';
import { useClassesAndSections } from '../../hooks/useClassesAndSections';

const AddMultipleChildren = ({ parentId, onSuccess }) => {
  const [parentInfo, setParentInfo] = useState({
    parentName: '',
    parentPhone: ''
  });
  
  const [children, setChildren] = useState([
    {
      name: '',
      studentId: '',
      class: '',
      section: '',
      birthDate: ''
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Per-child Student ID check: null | 'checking' | 'exists' | 'available'
  const [studentIdStatus, setStudentIdStatus] = useState({});

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;

  // Get dynamic classes and sections
  const { classes, sections, loading: classesLoading, error: classesError } = useClassesAndSections();

  // Add new child form
  const addChild = () => {
    setStudentIdStatus({});
    setChildren([...children, { 
      name: '', 
      studentId: '',
      class: '', 
      section: '', 
      birthDate: '' 
    }]);
  };

  // Remove child form
  const removeChild = (index) => {
    if (children.length > 1) {
      setStudentIdStatus({});
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  // Update child info
  const updateChild = (index, field, value) => {
    const updatedChildren = [...children];
    updatedChildren[index][field] = value;
    setChildren(updatedChildren);
    if (field === 'studentId') {
      setStudentIdStatus((prev) => ({ ...prev, [index]: null }));
    }
  };

  // Check if Student ID exists (on blur)
  const handleStudentIdBlur = async (index) => {
    const sid = (children[index]?.studentId || '').trim();
    if (!sid) {
      setStudentIdStatus((prev) => ({ ...prev, [index]: null }));
      return;
    }
    setStudentIdStatus((prev) => ({ ...prev, [index]: 'checking' }));
    try {
      const res = await fetch(`${baseUrl}/students/search/${encodeURIComponent(sid)}`, {
        credentials: 'include',
      });
      if (res.ok) {
        setStudentIdStatus((prev) => ({ ...prev, [index]: 'exists' }));
      } else if (res.status === 404) {
        setStudentIdStatus((prev) => ({ ...prev, [index]: 'available' }));
      } else {
        setStudentIdStatus((prev) => ({ ...prev, [index]: null }));
      }
    } catch {
      setStudentIdStatus((prev) => ({ ...prev, [index]: null }));
    }
  };

  // Update parent info
  const updateParent = (field, value) => {
    if (field === 'parentPhone') {
      // Restrict to digits only, max 10
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setParentInfo({ ...parentInfo, [field]: digitsOnly });
    } else {
      setParentInfo({ ...parentInfo, [field]: value });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    const trimmedPhone = (parentInfo.parentPhone || '').trim();
    if (!trimmedPhone) {
      setError('Parent phone number is required.');
      return;
    }
    if (trimmedPhone.length !== 10) {
      setError('Parent phone number must be exactly 10 digits.');
      return;
    }
    if (!parentInfo.parentName || !parentInfo.parentName.trim()) {
      setError('Parent name is required.');
      return;
    }
    const validChildren = children.filter(child => child.name && child.class && child.section);
    if (validChildren.length === 0) {
      setError('At least one child with name, class, and section is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        parentName: parentInfo.parentName.trim(),
        parentPhone: trimmedPhone,
        children: validChildren
      };

      const response = await fetch(`${baseUrl}/parents/create-with-children`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        let message = `Successfully created parent with ${data.children.length} children!\n\n`;
        message += `Parent Credentials:\n`;
        message += `Username: ${data.parent.credentials.username}\n`;
        message += `Password: ${data.parent.credentials.password}\n\n`;
        message += `Children Credentials:\n`;
        data.children.forEach((child, index) => {
          message += `${index + 1}. ${child.name} (${child.class}-${child.section})\n`;
          message += `   Username: ${child.credentials.username}\n`;
          message += `   Password: ${child.credentials.password}\n\n`;
        });
        alert(message);
        if (onSuccess) onSuccess(data);
        // Reset form
        setParentInfo({ parentName: '', parentPhone: '' });
        setChildren([{ name: '', studentId: '', class: '', section: '', birthDate: '' }]);
      } else {
        setError(data.message || 'Failed to create parent with children');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
          Add Parent with Multiple Children
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Parent Information */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
            <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            Parent Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Parent Name *
              </label>
              <input
                type="text"
                required
                value={parentInfo.parentName}
                onChange={(e) => updateParent('parentName', e.target.value)}
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Parent Phone *
              </label>
              <input
                type="tel"
                required
                value={parentInfo.parentPhone}
                onChange={(e) => updateParent('parentPhone', e.target.value)}
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]{10}"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234567890"
              />
            </div>
          </div>
        </div>

        {/* Children Information */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              Children Information ({children.length})
            </h3>
            <button
              type="button"
              onClick={addChild}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Add Child
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {children.map((child, index) => (
              <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h4 className="text-sm sm:text-base font-medium text-gray-700">Child {index + 1}</h4>
                  {children.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                      aria-label="Remove child"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Child Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={child.name}
                      onChange={(e) => updateChild(index, 'name', e.target.value)}
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
                      value={child.studentId}
                      onChange={(e) => updateChild(index, 'studentId', e.target.value)}
                      onBlur={() => handleStudentIdBlur(index)}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="S12345"
                    />
                    {studentIdStatus[index] === 'checking' && (
                      <p className="mt-1 text-xs text-gray-500">Checking...</p>
                    )}
                    {studentIdStatus[index] === 'exists' && (
                      <p className="mt-1 text-xs text-red-600">Student ID already exists.</p>
                    )}
                    {studentIdStatus[index] === 'available' && (
                      <p className="mt-1 text-xs text-green-600">Student ID is available.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <select
                      required
                      value={child.class}
                      onChange={(e) => updateChild(index, 'class', e.target.value)}
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
                      value={child.section}
                      onChange={(e) => updateChild(index, 'section', e.target.value)}
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
                      value={child.birthDate}
                      onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
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
            <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">{loading ? 'Creating...' : 'Create Parent with Children'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMultipleChildren;
