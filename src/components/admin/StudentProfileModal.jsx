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
import { getCurrentAcademicYear } from '../../utils/academicYear';

const StudentProfileModal = ({ student, isOpen, onClose }) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showCredentials, setShowCredentials] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch detailed student information
  useEffect(() => {
    if (isOpen && student) {
      fetchStudentDetails();
    }
  }, [isOpen, student]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/students/admin-profile/${student._id}`);
      setStudentDetails(response.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to load student details');
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
      
      const response = await axios.put(`/students/update-image/${student._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update the student details with new image
      setStudentDetails(prev => ({
        ...prev,
        image: response.data.image
      }));
      
      // Clear the file input and preview
      setImageFile(null);
      setImagePreview(null);
      document.getElementById('student-image-upload').value = '';
      
      toast.success('Student image updated successfully');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update student image');
    } finally {
      setUploadingImage(false);
    }
  };

  const cancelImageUpload = () => {
    setImageFile(null);
    setImagePreview(null);
    document.getElementById('student-image-upload').value = '';
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'payments', label: 'Payments', icon: CreditCard },
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
            ) : studentDetails?.image?.url ? (
              <img
                src={studentDetails.image.url}
                alt={studentDetails.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {studentDetails?.name?.charAt(0)?.toUpperCase() || 'S'}
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
              id="student-image-upload"
              disabled={uploadingImage}
            />
            <label
              htmlFor="student-image-upload"
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                uploadingImage 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl'
              }`}
            >
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : studentDetails?.image?.url ? (
                <Camera className="w-5 h-5 text-white" />
              ) : (
                <Plus className="w-5 h-5 text-white" />
              )}
            </label>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{studentDetails?.name || 'N/A'}</h3>
            <p className="text-lg text-gray-600">Student ID: {studentDetails?.studentId || 'N/A'}</p>
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
              <span className="text-gray-700">{studentDetails?.parent?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                DOB: {formatDate(studentDetails?.birthDate)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{studentDetails?.parent?.address || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                Parent: {studentDetails?.parent?.name || 'N/A'}
              </span>
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
              <span className="font-medium">{studentDetails?.parent?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{studentDetails?.parent?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium">{studentDetails?.parent?.address || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Personal Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium">{formatDate(studentDetails?.birthDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Roll Number:</span>
              <span className="font-medium">{studentDetails?.rollNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admission Date:</span>
              <span className="font-medium">{formatDate(studentDetails?.createdAt)}</span>
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
          <h4 className="font-semibold text-gray-900 mb-3">Current Academic Info</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Class:</span>
              <span className="font-medium">{studentDetails?.class || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Section:</span>
              <span className="font-medium">{studentDetails?.section || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Roll Number:</span>
              <span className="font-medium">{studentDetails?.rollNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admission Date:</span>
              <span className="font-medium">{formatDate(studentDetails?.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Academic Performance</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Overall Grade:</span>
              <span className="font-medium">{studentDetails?.overallGrade || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Attendance %:</span>
              <span className="font-medium">{studentDetails?.attendancePercentage || 'N/A'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Exam Score:</span>
              <span className="font-medium">{studentDetails?.lastExamScore || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Teacher */}
      {studentDetails?.assignedTeacher && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Assigned Teacher</h4>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">{studentDetails.assignedTeacher.name}</p>
              <p className="text-sm text-blue-700">{studentDetails.assignedTeacher.subject}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAttendance = () => {
    const attendanceStats = studentDetails?.attendanceStats || {};
    const present = attendanceStats.present || 0;
    const absent = attendanceStats.absent || 0;
    const total = attendanceStats.total || 0;
    const attendancePercentage = studentDetails?.attendancePercentage || 0;
    const recentAttendance = studentDetails?.recentAttendance || [];
    const currentAcademicYear = getCurrentAcademicYear();

    // Group attendance by month for monthly breakdown
    const monthlyAttendance = recentAttendance.reduce((acc, record) => {
      if (!record.date) return acc;
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          monthName,
          present: 0,
          absent: 0,
          total: 0
        };
      }
      
      if (record.status === 'present') {
        acc[monthKey].present++;
      } else if (record.status === 'absent') {
        acc[monthKey].absent++;
      }
      acc[monthKey].total++;
      
      return acc;
    }, {});

    const monthlyData = Object.values(monthlyAttendance).sort((a, b) => {
      // Sort by month name (newest first)
      return new Date(b.monthName) - new Date(a.monthName);
    });

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 text-lg">Attendance Summary</h4>
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              Academic Year: {currentAcademicYear}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {present}
              </div>
              <div className="text-sm text-gray-600 font-medium">Present Days</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-red-200">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {absent}
              </div>
              <div className="text-sm text-gray-600 font-medium">Absent Days</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {total}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Days</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {attendancePercentage}%
              </div>
              <div className="text-sm text-gray-600 font-medium">Attendance %</div>
            </div>
          </div>
          
          {/* Attendance Progress Bar */}
          {total > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Attendance Progress</span>
                <span className="font-semibold text-gray-900">
                  {present}/{total} days
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    attendancePercentage >= 75
                      ? 'bg-green-500'
                      : attendancePercentage >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-medium">75% required for promotion</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Attendance Breakdown */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                Monthly Attendance Breakdown
              </h4>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {monthlyData.map((month, index) => {
                  const monthPercentage = month.total > 0 
                    ? Math.round((month.present / month.total) * 100) 
                    : 0;
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-900">{month.monthName}</h5>
                        <span className={`text-sm font-bold ${
                          monthPercentage >= 75 ? 'text-green-600' : 
                          monthPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {monthPercentage}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{month.present}</div>
                          <div className="text-xs text-gray-600">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{month.absent}</div>
                          <div className="text-xs text-gray-600">Absent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{month.total}</div>
                          <div className="text-xs text-gray-600">Total</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            monthPercentage >= 75 ? 'bg-green-500' : 
                            monthPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(monthPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* All Attendance Records */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              All Attendance Records
              {recentAttendance.length > 0 && (
                <span className="text-xs text-gray-500 font-normal">
                  ({recentAttendance.length} total records)
                </span>
              )}
            </h4>
          </div>
          <div className="p-4">
            {recentAttendance.length > 0 ? (
              <div className="space-y-2">
                {recentAttendance.map((record, index) => {
                  const recordDate = record.date ? new Date(record.date) : null;
                  const formattedDate = recordDate 
                    ? recordDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : 'N/A';
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                          record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {formattedDate}
                          </span>
                          {record.reason && (
                            <span className="text-xs text-gray-500">
                              Reason: {record.reason}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          record.status === 'present' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {record.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">No attendance records found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Attendance records will appear here once attendance is marked
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{studentDetails?.paymentStats?.paid || 0}
            </div>
            <div className="text-sm text-gray-600">Total Paid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ₹{studentDetails?.paymentStats?.pending || 0}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ₹{studentDetails?.paymentStats?.total || 0}
            </div>
            <div className="text-sm text-gray-600">Total Due</div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h4 className="font-semibold text-gray-900">Payment History</h4>
        </div>
        <div className="p-4">
          {studentDetails?.recentPayments && studentDetails.recentPayments.length > 0 ? (
            <div className="space-y-3">
              {studentDetails.recentPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      payment.status === 'paid' ? 'bg-green-500' : 
                      payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="text-sm font-medium">
                        ₹{(payment.amountPaid || 0) + (payment.lateFee || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'Not paid'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                    {payment.paymentMethod && (
                      <span className="text-xs text-gray-500">({payment.paymentMethod})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No payment records found
            </div>
          )}
        </div>
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
      
      {studentDetails?.generatedCredentials && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="font-medium text-gray-900 mb-2">Student Login</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="font-mono text-sm">{studentDetails.generatedCredentials.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Password:</span>
                <span className="font-mono text-sm">
                  {showCredentials ? studentDetails.generatedCredentials.password : '••••••••'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="font-medium text-gray-900 mb-2">Parent Login</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="font-mono text-sm">P{studentDetails.generatedCredentials.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Password:</span>
                <span className="font-mono text-sm">
                  {showCredentials ? studentDetails.generatedCredentials.password : '••••••••'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen || !student) return null;

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
                  <h2 className="text-xl font-bold text-gray-900">Student Profile</h2>
                  <p className="text-gray-600">{student.name} - {student.studentId}</p>
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
                  {activeTab === 'payments' && renderPayments()}
                  
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

export default StudentProfileModal;
