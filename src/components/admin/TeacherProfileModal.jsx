import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  GraduationCap, 
  MapPin, 
  Users, 
  BookOpen, 
  Award,
  Clock,
  CreditCard,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Plus,
  Camera,
  Upload
} from 'lucide-react';
import axios from "../lib/axios";
import { toast } from 'react-hot-toast';

const TeacherProfileModal = ({ teacher, isOpen, onClose }) => {
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showCredentials, setShowCredentials] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch detailed teacher information
  useEffect(() => {
    if (isOpen && teacher) {
      fetchTeacherDetails();
    }
  }, [isOpen, teacher]);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching teacher details for:', teacher._id);
      const response = await axios.get(`/teachers/admin-profile/${teacher._id}`);
      console.log('📊 Teacher details response:', response.data);
      console.log('📊 Attendance stats:', response.data?.attendanceStats);
      console.log('📊 Recent attendance:', response.data?.recentAttendance);
      setTeacherDetails(response.data);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load teacher details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
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

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axios.put(`/teachers/update-image/${teacher._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update the teacher details with new image
      setTeacherDetails(prev => ({
        ...prev,
        image: response.data.image
      }));
      
      // Clear the file input and preview
      setImageFile(null);
      setImagePreview(null);
      document.getElementById('teacher-image-upload').value = '';
      
      toast.success('Teacher image updated successfully');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update teacher image');
    } finally {
      setUploadingImage(false);
    }
  };

  const cancelImageUpload = () => {
    setImageFile(null);
    setImagePreview(null);
    document.getElementById('teacher-image-upload').value = '';
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'attendance', label: 'Teacher Attendance', icon: Clock },
    { id: 'sections', label: 'Assigned Sections', icon: Users },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Image and Basic Info */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="flex-shrink-0 relative">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300 shadow-lg">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : teacherDetails?.image?.url ? (
              <img
                src={teacherDetails.image.url}
                alt={teacherDetails.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {teacherDetails?.name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
            )}
          </div>
          
          {/* Image Upload Button */}
          <div className="absolute -bottom-2 -right-2">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              className="hidden"
              id="teacher-image-upload"
              disabled={uploadingImage}
            />
            <label
              htmlFor="teacher-image-upload"
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                uploadingImage 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl'
              }`}
            >
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : teacherDetails?.image?.url ? (
                <Camera className="w-5 h-5 text-white" />
              ) : (
                <Plus className="w-5 h-5 text-white" />
              )}
            </label>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{teacherDetails?.name || 'N/A'}</h3>
            <p className="text-lg text-gray-600">Teacher ID: {teacherDetails?.teacherId || 'N/A'}</p>
          </div>
          
          {/* Image Upload Actions */}
          {imageFile && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">
                  {imageFile.name}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    uploadingImage
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={cancelImageUpload}
                  disabled={uploadingImage}
                  className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{teacherDetails?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{teacherDetails?.userId?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{teacherDetails?.subject || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{teacherDetails?.qualification || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Personal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{teacherDetails?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{teacherDetails?.userId?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Professional Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subject:</span>
              <span className="font-medium">{teacherDetails?.subject || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Qualification:</span>
              <span className="font-medium">{teacherDetails?.qualification || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Students Count:</span>
              <span className="font-medium">{teacherDetails?.studentsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Teaching Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subject:</span>
              <span className="font-medium">{teacherDetails?.subject || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Qualification:</span>
              <span className="font-medium">{teacherDetails?.qualification || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Teacher ID:</span>
              <span className="font-medium">{teacherDetails?.teacherId || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Class Management</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Students:</span>
              <span className="font-medium">{teacherDetails?.studentsCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned Sections:</span>
              <span className="font-medium">{teacherDetails?.sectionAssignments?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Student Attendance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {teacherDetails?.attendanceStats?.present || 0}
            </div>
            <div className="text-sm text-gray-600">Present Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {teacherDetails?.attendanceStats?.absent || 0}
            </div>
            <div className="text-sm text-gray-600">Absent Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {teacherDetails?.attendancePercentage || 0}%
            </div>
            <div className="text-sm text-gray-600">Attendance %</div>
          </div>
        </div>
      </div>

      {/* Recent Teacher Attendance Records */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h4 className="font-semibold text-gray-900">Recent Teacher Attendance</h4>
        </div>
        <div className="p-4">
          {teacherDetails?.recentAttendance && teacherDetails.recentAttendance.length > 0 ? (
            <div className="space-y-2">
              {teacherDetails.recentAttendance.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${
                      record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {record.teacherName || teacherDetails?.name || 'Teacher'}
                        </span>
                        {record.subject && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                            {record.subject}
                          </span>
                        )}
                      </div>
                      {record.reason && (
                        <span className="text-xs text-gray-500 mt-1 block">
                          Reason: {record.reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      record.status === 'present' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No attendance records found</p>
              <p className="text-xs mt-1">Attendance records will appear here once the teacher starts marking attendance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSections = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Assigned Sections</h4>
        {teacherDetails?.sectionAssignments && teacherDetails.sectionAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherDetails.sectionAssignments.map((section, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {section.className} - {section.section}
                    </h5>
                    <p className="text-sm text-gray-600">
                      Subject: {teacherDetails?.subject || section.subject || 'Not specified'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No sections assigned
          </div>
        )}
      </div>
    </div>
  );


  const renderCredentials = () => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Login Credentials</h4>
        <button
          onClick={() => setShowCredentials(!showCredentials)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showCredentials ? 'Hide' : 'Show'} Credentials
        </button>
      </div>
      
      {teacherDetails?.generatedCredentials && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="font-medium text-gray-900 mb-2">Teacher Login</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="font-mono text-sm">{teacherDetails.generatedCredentials.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Password:</span>
                <span className="font-mono text-sm">
                  {showCredentials ? teacherDetails.generatedCredentials.password : '••••••••'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen || !teacher) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Teacher Profile</h2>
                  <p className="text-gray-600">{teacher.name} - {teacher.teacherId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'personal' && renderPersonalInfo()}
                  {activeTab === 'academic' && renderAcademicInfo()}
                  {activeTab === 'attendance' && renderAttendance()}
                  {activeTab === 'sections' && renderSections()}
                  
                  {/* Credentials Section - Always visible at bottom */}
                  {renderCredentials()}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default TeacherProfileModal;
