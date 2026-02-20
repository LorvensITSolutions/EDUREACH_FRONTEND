// src/components/admin/AddTeacherForm.jsx
import { useState } from "react";
import { useTeacherStore } from "../stores/useTeacherStore";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { UserPlus, CheckCircle, AlertCircle, Eye, EyeOff, Copy, Loader2 } from "lucide-react";
import axios from "../lib/axios";

const AddTeacherForm = () => {
  const { createSingleTeacher, loading } = useTeacherStore();
  const [formData, setFormData] = useState({
    teacherId: "",
    name: "",
    phone: "",
    qualification: "",
    subject: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [teacherIdValidation, setTeacherIdValidation] = useState({
    isValid: null,
    message: "",
    checking: false
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Reset success state when form changes
    if (isSuccess) {
      setIsSuccess(false);
      setGeneratedCredentials(null);
    }
    // Clear validation when teacherId changes
    if (e.target.name === "teacherId") {
      setTeacherIdValidation({
        isValid: null,
        message: "",
        checking: false
      });
    }
  };

  // Function to check if teacher ID exists
  const checkTeacherIdExists = async (teacherId) => {
    if (!teacherId.trim()) {
      setTeacherIdValidation({
        isValid: false,
        message: "Teacher ID is required",
        checking: false
      });
      return;
    }

    setTeacherIdValidation({
      isValid: null,
      message: "",
      checking: true
    });

    try {
      // Check if teacher exists by searching all teachers and filtering
      const response = await axios.get("/teachers/all");
      if (response.data && response.data.teachers) {
        const exists = response.data.teachers.some(
          (teacher) => teacher.teacherId === teacherId.trim()
        );
        if (exists) {
          setTeacherIdValidation({
            isValid: false,
            message: "Teacher ID already exists",
            checking: false
          });
        } else {
          setTeacherIdValidation({
            isValid: true,
            message: "Teacher ID is available",
            checking: false
          });
        }
      } else {
        setTeacherIdValidation({
          isValid: null,
          message: "",
          checking: false
        });
      }
    } catch (error) {
      // If 404 or error, assume available (or network error)
      if (error.response && error.response.status === 404) {
        setTeacherIdValidation({
          isValid: true,
          message: "Teacher ID is available",
          checking: false
        });
      } else {
        setTeacherIdValidation({
          isValid: null,
          message: "",
          checking: false
        });
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "teacherId") {
      checkTeacherIdExists(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, JPG, or PNG)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await createSingleTeacher(formData, imageFile);
      
      // Check if credentials were returned
      if (result && result.teacher && result.teacher.credentials) {
        setGeneratedCredentials(result.teacher.credentials);
        setShowCredentials(true);
        setIsSuccess(true);
        toast.success(`Teacher added successfully! Teacher ID: ${result.teacher.teacherId}`);
      } else {
        toast.success("Teacher added successfully!");
        setIsSuccess(true);
      }

      // Reset form after successful submission
    setFormData({
      teacherId: "",
      name: "",
      phone: "",
      qualification: "",
      subject: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setTeacherIdValidation({
      isValid: null,
      message: "",
      checking: false
    });
    } catch (error) {
      toast.error("Failed to add teacher");
      console.error(error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const resetForm = () => {
    setFormData({
      teacherId: "",
      name: "",
      phone: "",
      qualification: "",
      subject: "",
    });
    setGeneratedCredentials(null);
    setShowCredentials(false);
    setIsSuccess(false);
    setTeacherIdValidation({
      isValid: null,
      message: "",
      checking: false
    });
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-3 sm:p-4 md:p-6 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md w-full max-w-2xl"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
        <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
        <h2 className="text-xl sm:text-2xl font-bold text-primary">Add Single Teacher</h2>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 text-green-800">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Teacher added successfully!</span>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Teacher ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="teacherId"
                placeholder="Enter teacher ID (e.g., T24001)"
                value={formData.teacherId}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-3 py-2 pr-10 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  teacherIdValidation.isValid === true
                    ? "border-green-500 bg-green-50 focus:ring-green-500"
                    : teacherIdValidation.isValid === false
                    ? "border-red-500 bg-red-50 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                }`}
              />
              
              {/* Validation Icon */}
              {teacherIdValidation.checking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
              )}
              {teacherIdValidation.isValid === true && !teacherIdValidation.checking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              )}
              {teacherIdValidation.isValid === false && !teacherIdValidation.checking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>
            
            {/* Validation Message */}
            {teacherIdValidation.message && (
              <p className={`text-xs mt-1 ${
                teacherIdValidation.isValid === true ? "text-green-600" : "text-red-600"
              }`}>
                {teacherIdValidation.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter teacher's full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              placeholder="Enter educational qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            placeholder="Enter teaching subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Profile Image (Optional)
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">JPEG, JPG, or PNG (max 5MB)</p>
            </div>
            {imagePreview && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-gray-300 flex-shrink-0">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Generated Credentials Display */}
        {generatedCredentials && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4"
          >
            <h3 className="font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Generated Teacher Credentials</span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between gap-2 bg-white rounded-lg p-2.5 sm:p-3 border border-blue-200">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Username</p>
                  <p className="font-mono text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-all">
                    {generatedCredentials.username}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(generatedCredentials.username)}
                  className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                  title="Copy username"
                >
                  <Copy size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between gap-2 bg-white rounded-lg p-2.5 sm:p-3 border border-blue-200">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Password</p>
                  <p className="font-mono text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-all">
                    {showCredentials ? generatedCredentials.password : '••••••••'}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title={showCredentials ? "Hide password" : "Show password"}
                  >
                    {showCredentials ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.password)}
                    className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Copy password"
                  >
                    <Copy size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2 break-words">
              <strong>Important:</strong> Please save these credentials securely. They will be needed for teacher login.
            </p>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-white font-semibold transition duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                <span>Adding Teacher...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Add Teacher</span>
              </>
            )}
          </button>
          
          {isSuccess && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Add Another
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default AddTeacherForm;
