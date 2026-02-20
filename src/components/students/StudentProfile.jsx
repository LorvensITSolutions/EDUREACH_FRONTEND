import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Calendar, GraduationCap, Shield, Eye, EyeOff, Save, Edit3, Phone, MapPin, Users, BookOpen, Award, Clock } from "lucide-react";
import { getCurrentAcademicYear, getNextAcademicYear } from "../../utils/academicYear";

const StudentProfile = () => {
  const { t } = useTranslation();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch student profile data
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching user profile...');
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
        const response = await fetch(`${baseUrl}/auth/profile`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Profile response status:', response.status);
        console.log('Profile response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Profile fetch error:', errorText);
          
          if (response.status === 401) {
            throw new Error('Authentication required. Please log in to view your profile.');
          } else if (response.status === 403) {
            throw new Error('Access denied. You do not have permission to view this profile.');
          } else {
            throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
          }
        }
        
        const userData = await response.json();
        console.log('User data received:', userData);
        
        // Fetch additional student data if user is a student
        if (userData.role === 'student' && userData.studentId) {
          console.log('Fetching student details for ID:', userData.studentId);
          const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
          const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
          const studentResponse = await fetch(`${baseUrl}/students/profile/${userData.studentId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          console.log('Student response status:', studentResponse.status);
          
          if (studentResponse.ok) {
            const studentInfo = await studentResponse.json();
            console.log('Student info received:', studentInfo);
            setStudentData({ ...userData, ...studentInfo });
          } else {
            const errorText = await studentResponse.text();
            console.error('Student fetch error:', errorText);
            setStudentData(userData);
          }
        } else {
          setStudentData(userData);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        // If it's an authentication error, show demo data for preview
        if (err.message.includes('Authentication required')) {
          console.log('Showing demo profile data...');
          setStudentData({
            name: "Student2 Demo",
            email: "student2@demo.com",
            role: "student",
            studentId: "REG2",
            class: "IX",
            section: "A",
            birthDate: "2005-05-05",
            parent: {
              name: "Parent2",
              phone: "9930106513"
            },
            generatedCredentials: {
              username: "student2@demo.com",
              generatedAt: "2024-01-01"
            }
          });
          setError(null);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordError("");
      
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setPasswordSuccess("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setShowPasswordForm(false);
      } else {
        setPasswordError(result.message || "Failed to change password");
      }
    } catch (err) {
      setPasswordError("Network error. Please try again.");
      console.error('Password change error:', err);
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString();
  };

  // Determine the student's current academic year based on promotion history
  const getStudentAcademicYear = () => {
    const currentAcademicYear = getCurrentAcademicYear();
    
    // If student data is not loaded yet, return current academic year
    if (!studentData || !studentData.promotionHistory) {
      return currentAcademicYear;
    }

    const promotionHistory = studentData.promotionHistory || [];
    
    // Check if student was promoted in the current academic year (and not reverted)
    const promotionInCurrentYear = promotionHistory.find(
      p => p.academicYear === currentAcademicYear && 
           p.promotionType === 'promoted' && 
           !p.reverted
    );
    
    // If promoted in current year, they should see the next academic year
    if (promotionInCurrentYear) {
      return getNextAcademicYear(currentAcademicYear);
    }
    
    // Otherwise, return current academic year
    return currentAcademicYear;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Profile Header with Gradient Background */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-r from-primary via-primary-dark to-primary rounded-xl shadow-xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Image - Responsive */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex-shrink-0"
            >
              <div className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 overflow-hidden shadow-2xl">
                {studentData?.image?.url ? (
                  <img 
                    src={studentData.image.url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-white sm:w-16 sm:h-16 lg:w-24 lg:h-24" />
                )}
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 bg-success rounded-full border-4 border-white flex items-center justify-center shadow-lg"
              >
                <div className="w-3 h-3 sm:w-5 sm:h-5 bg-white rounded-full"></div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex-1 text-white text-center lg:text-left"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">{studentData?.name || "Student"}</h1>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-8 mb-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 bg-white/20 px-3 py-2 sm:px-4 rounded-full backdrop-blur-sm"
                >
                  <Users size={16} className="sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-lg font-medium">{studentData?.generatedCredentials?.username || 'Not assigned'}</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 bg-white/20 px-3 py-2 sm:px-4 rounded-full backdrop-blur-sm"
                >
                  <Users size={16} className="sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-lg">Parent: {studentData?.parent?.name || 'Not assigned'}</span>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm"
                >
                  <Calendar size={16} className="text-blue-200 sm:w-5 sm:h-5" />
                  <div>
                    <p className="text-xs sm:text-sm text-blue-200">Date of Birth</p>
                    <p className="text-sm sm:text-base font-medium">{formatDate(studentData?.birthDate)}</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm"
                >
                  <GraduationCap size={16} className="text-blue-200 sm:w-5 sm:h-5" />
                  <div>
                    <p className="text-xs sm:text-sm text-blue-200">Class/Section</p>
                    <p className="text-sm sm:text-base font-medium">{studentData?.class || 'N/A'} ({studentData?.section || 'N/A'})</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm"
                >
                  <Phone size={16} className="text-blue-200 sm:w-5 sm:h-5" />
                  <div>
                    <p className="text-xs sm:text-sm text-blue-200">Phone</p>
                    <p className="text-sm sm:text-base font-medium">{studentData?.parent?.phone || 'Not provided'}</p>
                  </div>
                </motion.div>
                
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Academic Details Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border p-4 sm:p-6 lg:p-8"
      >
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center"
        >
          <BookOpen size={20} className="mr-2 sm:mr-3 text-primary sm:w-6 sm:h-6" />
          Academic Details
        </motion.h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-primary-light/20 to-primary/20 p-4 sm:p-6 rounded-xl border border-primary-light shadow-md"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
                <BookOpen size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Branch</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-gray-900">EDUREACH SCHOOL</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-success/20 to-success/10 p-6 rounded-xl border border-success/30 shadow-md"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success rounded-full flex items-center justify-center">
                <Calendar size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Academic Year</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-gray-900">{getStudentAcademicYear()}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-info/20 to-info/10 p-4 sm:p-6 rounded-xl border border-info/30 shadow-md"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-info rounded-full flex items-center justify-center">
                <Award size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Register No</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-gray-900">{studentData?.studentId || 'REG2'}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Personal Information Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg border p-4 sm:p-6 lg:p-8"
      >
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center mr-2 sm:mr-3">
            <User size={16} className="text-white sm:w-5 sm:h-5" />
          </div>
          Personal Information
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-success/20 to-success/10 rounded-xl border border-success/30"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <Phone size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Phone Number</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{studentData?.parent?.phone || "Not provided"}</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-accent/20 to-accent-light/20 rounded-xl border border-accent/30"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <GraduationCap size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Class & Section</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{studentData?.class || "Not assigned"} - {studentData?.section || "Not assigned"}</p>
              </div>
            </motion.div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.02, x: -5 }}
              className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-danger/20 to-danger/10 rounded-xl border border-danger/30"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-danger rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <Calendar size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Date of Birth</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{formatDate(studentData?.birthDate)}</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.02, x: -5 }}
              className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-primary-dark/20 to-primary/20 rounded-xl border border-primary-dark/30"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-dark rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <Users size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Parent/Guardian</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{studentData?.parent?.name || "Not assigned"}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Login Credentials Section
      {studentData?.generatedCredentials && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg border p-8"
        >
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-2xl font-bold text-gray-900 mb-6 flex items-center"
          >
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center mr-3">
              <Shield size={20} className="text-white" />
            </div>
            Login Credentials
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-gradient-to-r from-success/20 to-success/10 p-6 rounded-xl border border-success/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Username</p>
                <p className="font-bold text-gray-900 text-lg">{studentData.generatedCredentials.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Generated Date</p>
                <p className="font-bold text-gray-900 text-lg">{formatDate(studentData.generatedCredentials.generatedAt)}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )} */}

      {/* Password Change Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-white rounded-xl shadow-lg border p-4 sm:p-6 lg:p-8"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-danger rounded-full flex items-center justify-center mr-2 sm:mr-3">
              <Shield size={16} className="text-white sm:w-5 sm:h-5" />
            </div>
            Security Settings
          </h2>
          {!showPasswordForm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPasswordForm(true)}
              className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-xl hover:from-primary-dark hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 shadow-lg"
            >
              <Edit3 size={16} className="mr-2 sm:w-4 sm:h-4" />
              Change Password
            </motion.button>
          )}
        </motion.div>

        {showPasswordForm && (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handlePasswordSubmit} 
            className="space-y-6 sm:space-y-8"
          >
            {passwordError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4"
              >
                <p className="text-xs sm:text-sm text-red-600">{passwordError}</p>
              </motion.div>
            )}
            
            {passwordSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4"
              >
                <p className="text-xs sm:text-sm text-green-600">{passwordSuccess}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-10 sm:pr-12 transition-all duration-300 text-sm sm:text-base"
                    placeholder="Enter current password"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-10 sm:pr-12 transition-all duration-300 text-sm sm:text-base"
                    placeholder="Enter new password"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-10 sm:pr-12 transition-all duration-300 text-sm sm:text-base"
                    placeholder="Confirm new password"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
                  </motion.button>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-xl hover:from-primary-dark hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    <span className="text-xs sm:text-sm">Changing Password...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Save Password</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300"
              >
                <span className="text-xs sm:text-sm">Cancel</span>
              </motion.button>
            </motion.div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default StudentProfile;
