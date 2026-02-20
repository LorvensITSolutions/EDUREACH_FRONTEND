


import { useState } from "react";
import { useStudentStore } from "../stores/useStudentStore";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../components/lib/axios";

const CreateStudentForm = ({ isOpen, onClose }) => {
  const { createSingleStudent } = useStudentStore();

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    class: "",
    section: "",
    birthDate: "",
    parentName: "",
    parentPhone: "",
    image: null, // ✅ For student photo
  });

  const [studentIdValidation, setStudentIdValidation] = useState({
    isValid: null,
    message: "",
    checking: false
  });

  // Function to check if student ID exists
  const checkStudentIdExists = async (studentId) => {
    if (!studentId.trim()) {
      setStudentIdValidation({
        isValid: false,
        message: "Student ID is required",
        checking: false
      });
      return;
    }

    setStudentIdValidation({
      isValid: null,
      message: "",
      checking: true
    });

    try {
      const response = await axios.get(`/students/search/${encodeURIComponent(studentId)}`);
      // If response is 200, student exists
      if (response.status === 200 && response.data.success) {
        setStudentIdValidation({
          isValid: false,
          message: "Student ID already exists",
          checking: false
        });
      } else {
        setStudentIdValidation({
          isValid: true,
          message: "Student ID is available",
          checking: false
        });
      }
    } catch (error) {
      // If 404, student doesn't exist (available)
      if (error.response && error.response.status === 404) {
        setStudentIdValidation({
          isValid: true,
          message: "Student ID is available",
          checking: false
        });
      } else {
        // For other errors, don't show validation (network error, etc.)
        setStudentIdValidation({
          isValid: null,
          message: "",
          checking: false
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else if (name === "class") {
      // Convert class input to uppercase
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "studentId") {
      checkStudentIdExists(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.studentId.trim()) {
      alert("Student ID is required");
      return;
    }
    if (!formData.name.trim()) {
      alert("Student name is required");
      return;
    }
    if (!formData.class.trim()) {
      alert("Class is required");
      return;
    }
    if (!formData.section.trim()) {
      alert("Section is required");
      return;
    }
    if (!formData.birthDate) {
      alert("Birth date is required");
      return;
    }
    if (!formData.parentName.trim()) {
      alert("Parent name is required");
      return;
    }
    if (!formData.parentPhone.trim()) {
      alert("Parent phone is required");
      return;
    }

    // Prepare payload
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        payload.append(key, value);
      }
    });

    await createSingleStudent(payload);

    setFormData({
      studentId: "",
      name: "",
      class: "",
      section: "",
      birthDate: "",
      parentName: "",
      parentPhone: "",
      image: null,
    });

    setStudentIdValidation({
      isValid: null,
      message: "",
      checking: false
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    Create New Student
                  </h2>
                  <p className="text-teal-100 text-sm mt-1">
                    Add a new student to the system
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-teal-200 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 flex-1 overflow-y-auto">

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student ID and Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Student ID *
                  </label>
                  <div className="relative">
                    <input
                      name="studentId"
                      placeholder="Enter Student ID"
                      value={formData.studentId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        studentIdValidation.isValid === true
                          ? "border-green-500 bg-green-50 focus:ring-green-500"
                          : studentIdValidation.isValid === false
                          ? "border-red-500 bg-red-50 focus:ring-red-500"
                          : "border-gray-300 focus:ring-teal-500"
                      }`}
                      required
                    />
                    
                    {/* Validation Icon */}
                    {studentIdValidation.checking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                      </div>
                    )}
                    {studentIdValidation.isValid === true && !studentIdValidation.checking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                    {studentIdValidation.isValid === false && !studentIdValidation.checking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Validation Message */}
                  {studentIdValidation.message && (
                    <p className={`text-xs ${
                      studentIdValidation.isValid === true ? "text-green-600" : "text-red-600"
                    }`}>
                      {studentIdValidation.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Student Name *
                  </label>
                  <input
                    name="name"
                    placeholder="Enter Student Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Class and Section Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Class *
                  </label>
                  <input
                    name="class"
                    placeholder="e.g., 10, NURSERY, LKG"
                    value={formData.class}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Section *
                  </label>
                  <input
                    name="section"
                    placeholder="Enter Section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Birth Date *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Parent Information Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Name *
                  </label>
                  <input
                    name="parentName"
                    placeholder="Enter Parent Name"
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Phone *
                  </label>
                  <input
                    name="parentPhone"
                    placeholder="Enter Phone Number"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Student Photo (Optional)
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" 
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-md hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  Add Student
                </button>
              </div>
            </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateStudentForm;