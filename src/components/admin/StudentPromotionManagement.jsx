import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useClassesAndSections } from '../../hooks/useClassesAndSections';
import {
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Search,
  Filter,
  ArrowRight,
  UserX,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  User,
  Phone,
  Mail,
  BookOpen,
  History,
  X,
  List,
  Clock,
  RotateCcw,
  AlertTriangle,
  Receipt,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

const StudentPromotionManagement = () => {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // Store all fetched students
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // Get current academic year in "YYYY-YYYY" format
  const getCurrentAcademicYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    // If June or later, academic year is currentYear-nextYear, else previousYear-currentYear
    if (currentMonth >= 5) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  // Get next academic year
  const getNextAcademicYear = (academicYear) => {
    if (!academicYear || !academicYear.includes('-')) {
      const current = getCurrentAcademicYear();
      const [startYear, endYear] = current.split('-').map(y => parseInt(y));
      return `${startYear + 1}-${endYear + 1}`;
    }
    const [startYear, endYear] = academicYear.split('-').map(y => parseInt(y));
    return `${startYear + 1}-${endYear + 1}`;
  };

  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  
  // Generate academic year options (current year and next year)
  const currentAcadYear = getCurrentAcademicYear();
  const nextAcadYear = getNextAcademicYear(currentAcadYear);
  const academicYearOptions = [currentAcadYear, nextAcadYear];
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [promotionType, setPromotionType] = useState('promoted');
  const [reason, setReason] = useState('');
  const [minAttendance, setMinAttendance] = useState(75);
  const [showBulkPromote, setShowBulkPromote] = useState(false);
  const [tcStudentId, setTcStudentId] = useState('');
  const [tcReason, setTcReason] = useState('');
  const [showTcModal, setShowTcModal] = useState(false);
  const [tcStudentInfo, setTcStudentInfo] = useState(null);
  const [tcStudentLoading, setTcStudentLoading] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudentAttendance, setSelectedStudentAttendance] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('');
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [studentToRevert, setStudentToRevert] = useState(null);
  const [revertReason, setRevertReason] = useState('');
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const validateTimeoutRef = useRef(null);
  
  // Use the hook to fetch classes dynamically
  const { classes, loading: classesLoading, error: classesError } = useClassesAndSections();

  // Debounce validation when tcStudentId changes
  useEffect(() => {
    if (validateTimeoutRef.current) {
      clearTimeout(validateTimeoutRef.current);
    }

    if (tcStudentId && tcStudentId.trim() !== '') {
      validateTimeoutRef.current = setTimeout(async () => {
        const studentId = tcStudentId.trim();
        setTcStudentLoading(true);
        
        // First, search for student by studentId in the current students list
        let foundStudent = students.find(s => s.studentId === studentId);
        let promotionStatus = 'eligible';
        
        // If found in current list, use promotion status from there
        if (foundStudent) {
          if (foundStudent.promotedInThisYear) {
            promotionStatus = 'promoted';
          } else if (foundStudent.isEligibleForPromotion !== undefined) {
            promotionStatus = foundStudent.isEligibleForPromotion ? 'eligible' : 'hold-back';
          }
        } else {
          // If not found in current list, search via API
          try {
            const res = await axios.get(`/students/search/${studentId}`, {
              params: { academicYear: academicYear }
            });
            if (res.data && res.data.success && res.data.student) {
              foundStudent = {
                name: res.data.student.name,
                currentStatus: res.data.student.status || 'active',
                class: res.data.student.class,
                section: res.data.student.section,
                studentId: res.data.student.studentId
              };
              promotionStatus = res.data.student.promotionStatus || 'eligible';
            }
          } catch (error) {
            // Student not found in API either
            console.log('Student not found:', studentId);
          }
        }
        
        if (foundStudent) {
          // Determine promotion status display
          let statusDisplay = 'Eligible';
          let statusColor = 'text-emerald-700';
          
          if (promotionStatus === 'promoted') {
            statusDisplay = 'Promoted';
            statusColor = 'text-blue-700';
          } else if (promotionStatus === 'hold-back') {
            statusDisplay = 'Hold Back';
            statusColor = 'text-orange-700';
          } else if (promotionStatus === 'eligible') {
            statusDisplay = 'Eligible';
            statusColor = 'text-emerald-700';
          }
          
          setTcStudentInfo({
            name: foundStudent.name,
            status: foundStudent.currentStatus || 'active',
            promotionStatus: promotionStatus,
            statusDisplay: statusDisplay,
            statusColor: statusColor,
            class: foundStudent.class,
            section: foundStudent.section
          });
        } else {
          setTcStudentInfo(null);
        }
        setTcStudentLoading(false);
      }, 500);
    } else {
      setTcStudentInfo(null);
    }

    return () => {
      if (validateTimeoutRef.current) {
        clearTimeout(validateTimeoutRef.current);
      }
    };
  }, [tcStudentId, students]);

  // Removed automatic fetch on mount - students will be fetched only when:
  // 1. User selects a class and clicks Refresh
  // 2. User clicks the Refresh button
  // 3. User changes academic year and clicks Refresh

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { academicYear };
      if (selectedClass) params.className = selectedClass;

      console.log('Fetching students with params:', params);
      const res = await axios.get('/promotion/students', { params });
      console.log('Students response:', res.data);
      const fetchedStudents = res.data.students || [];
      setAllStudents(fetchedStudents);
      
      if (fetchedStudents.length > 0) {
        console.log('Sample student data:', fetchedStudents[0]);
      }
    } catch (error) {
      console.error('Fetch students error:', error);
      console.error('Error response:', error?.response?.data);
      toast.error(error?.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on selected status and search query
  useEffect(() => {
    let filtered = [...allStudents];

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(student => {
        if (selectedStatus === 'graduated') {
          return student.currentStatus === 'graduated' || 
                 student.class === 'Graduated' || 
                 student.promotionRecord?.toClass === 'Graduated';
        } else if (selectedStatus === 'eligible') {
          return student.isEligibleForPromotion && 
                 !student.promotedInThisYear && 
                 !student.transferCertificate?.issued && 
                 student.currentStatus !== 'transferred' && 
                 student.currentStatus !== 'graduated' && 
                 student.class !== 'Graduated';
        } else if (selectedStatus === 'hold-back') {
          return !student.isEligibleForPromotion && 
                 !student.promotedInThisYear && 
                 !student.transferCertificate?.issued && 
                 student.currentStatus !== 'transferred' && 
                 student.currentStatus !== 'graduated' && 
                 student.class !== 'Graduated';
        } else if (selectedStatus === 'promoted') {
          return student.promotedInThisYear && 
                 !student.transferCertificate?.issued && 
                 student.currentStatus !== 'transferred' && 
                 student.currentStatus !== 'graduated' && 
                 student.class !== 'Graduated';
        } else if (selectedStatus === 'transferred') {
          return student.transferCertificate?.issued || 
                 student.currentStatus === 'transferred';
        }
        return true;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(student => {
        const name = (student.name || '').toLowerCase();
        const studentId = (student.studentId || '').toLowerCase();
        const className = (student.class || '').toLowerCase();
        const section = (student.section || '').toLowerCase();
        
        return name.includes(query) || 
               studentId.includes(query) || 
               className.includes(query) || 
               section.includes(query);
      });
    }

    setStudents(filtered);
  }, [allStudents, selectedStatus, searchQuery]);

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      // Only select students who are eligible for promotion if promotionType is 'promoted'
      const eligibleStudents = promotionType === 'promoted'
        ? students.filter(s => s.totalDays > 0 && s.attendancePercentage >= 75)
        : students;
      setSelectedStudents(eligibleStudents.map(s => s._id));
    }
  };

  const handlePromote = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    // Check if any selected students don't meet attendance requirement
    if (promotionType === 'promoted') {
      const ineligibleStudents = selectedStudents
        .map(id => students.find(s => s._id === id))
        .filter(s => {
          if (!s) return true;
          // Check if student has no attendance records or below 75%
          if (s.totalDays === 0) return true;
          if (s.attendancePercentage < 75) return true;
          return false;
        });

      if (ineligibleStudents.length > 0) {
        const names = ineligibleStudents.map(s => s?.name || 'Unknown').join(', ');
        toast.error(
          `Cannot promote: ${ineligibleStudents.length} student(s) don't meet 75% attendance requirement: ${names}`,
          { duration: 6000 }
        );
        return;
      }

      if (!reason && selectedStudents.length > 0) {
        toast.error('Please provide a reason for promotion');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.post('/promotion/promote', {
        studentIds: selectedStudents,
        academicYear,
        promotionType,
        reason: reason || (promotionType === 'hold-back' ? 'Low attendance' : 'Promoted to next class')
      });

      toast.success(res.data.message);
      setSelectedStudents([]);
      setReason('');
      fetchStudents();
    } catch (error) {
      console.error('Promote error:', error);
      toast.error(error?.response?.data?.message || 'Failed to promote students');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPromote = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/promotion/bulk-promote', {
        className: selectedClass,
        academicYear,
        minAttendancePercentage: minAttendance
      });

      // Show detailed success message
      if (res.data.summary) {
        const { promoted, holdBack, total, errors } = res.data.summary;
        let message = `Bulk promotion completed: ${promoted} promoted, ${holdBack} held back`;
        if (errors > 0) {
          message += `, ${errors} errors`;
        }
        toast.success(message, { duration: 5000 });
      } else {
        toast.success(res.data.message);
      }
      
      setShowBulkPromote(false);
      fetchStudents();
    } catch (error) {
      console.error('Bulk promote error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to bulk promote';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateStudentId = async (studentId) => {
    if (!studentId || studentId.trim() === '') {
      setTcStudentInfo(null);
      return;
    }

    setTcStudentLoading(true);
    try {
      // First, search for student by studentId in the current students list
      let foundStudent = students.find(s => s.studentId === studentId.trim());
      let promotionStatus = 'eligible';
      
      // If found in current list, use promotion status from there
      if (foundStudent) {
        if (foundStudent.promotedInThisYear) {
          promotionStatus = 'promoted';
        } else if (foundStudent.isEligibleForPromotion !== undefined) {
          promotionStatus = foundStudent.isEligibleForPromotion ? 'eligible' : 'hold-back';
        }
      } else {
        // If not found in current list, search via API
        try {
          const res = await axios.get(`/students/search/${studentId.trim()}`, {
            params: { academicYear: academicYear }
          });
          if (res.data && res.data.success && res.data.student) {
            foundStudent = {
              name: res.data.student.name,
              currentStatus: res.data.student.status || 'active',
              class: res.data.student.class,
              section: res.data.student.section,
              studentId: res.data.student.studentId
            };
            promotionStatus = res.data.student.promotionStatus || 'eligible';
          }
        } catch (error) {
          console.error('API search student ID error:', error);
          foundStudent = null;
        }
      }
      
      if (foundStudent) {
        // Determine promotion status display
        let statusDisplay = 'Eligible';
        let statusColor = 'text-emerald-700';
        
        if (promotionStatus === 'promoted') {
          statusDisplay = 'Promoted';
          statusColor = 'text-blue-700';
        } else if (promotionStatus === 'hold-back') {
          statusDisplay = 'Hold Back';
          statusColor = 'text-orange-700';
        } else if (promotionStatus === 'eligible') {
          statusDisplay = 'Eligible';
          statusColor = 'text-emerald-700';
        }
        
        setTcStudentInfo({
          name: foundStudent.name,
          status: foundStudent.currentStatus || 'active',
          promotionStatus: promotionStatus,
          statusDisplay: statusDisplay,
          statusColor: statusColor,
          class: foundStudent.class,
          section: foundStudent.section
        });
      } else {
        setTcStudentInfo(null);
      }
    } catch (error) {
      console.error('Validate student ID error:', error);
      setTcStudentInfo(null);
    } finally {
      setTcStudentLoading(false);
    }
  };

  const handleIssueTC = async () => {
    if (!tcStudentId || !tcReason) {
      toast.error('Please provide student ID and reason');
      return;
    }

    if (!tcStudentInfo) {
      toast.error('Please enter a valid student ID');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/promotion/issue-tc', {
        studentId: tcStudentId,
        reason: tcReason
      });

      toast.success(res.data.message);
      setShowTcModal(false);
      setTcStudentId('');
      setTcReason('');
      setTcStudentInfo(null);
      fetchStudents();
    } catch (error) {
      console.error('Issue TC error:', error);
      toast.error(error?.response?.data?.message || 'Failed to issue TC');
    } finally {
      setLoading(false);
    }
  };

  const handleRevertPromotion = async () => {
    if (!studentToRevert) {
      toast.error('No student selected for revert');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/promotion/revert', {
        studentId: studentToRevert._id,
        academicYear: academicYear,
        reason: revertReason || 'Promotion reverted by admin'
      });

      toast.success(res.data.message);
      setShowRevertModal(false);
      setStudentToRevert(null);
      setRevertReason('');
      fetchStudents();
    } catch (error) {
      console.error('Revert promotion error:', error);
      toast.error(error?.response?.data?.message || 'Failed to revert promotion');
    } finally {
      setLoading(false);
    }
  };

  const getNextClass = (currentClass) => {
    // Handle class names (case-insensitive)
    const normalizedClass = String(currentClass).trim();
    const classMap = {
      'Nursery': 'LKG',
      'nursery': 'LKG',
      'NURSERY': 'LKG',
      'LKG': '1',
      'lkg': '1',
      'Lkg': '1',
      '1': '2', '2': '3', '3': '4', '4': '5', '5': '6',
      '6': '7', '7': '8', '8': '9', '9': '10', '10': 'Graduated', '11': '12', '12': 'Graduated'
    };
    return classMap[normalizedClass] || currentClass;
  };

  const transferredCount = allStudents.filter(s => s.transferCertificate?.issued || s.currentStatus === 'transferred').length;
  const graduatedCount = allStudents.filter(s => s.currentStatus === 'graduated' || s.class === 'Graduated' || s.promotionRecord?.toClass === 'Graduated').length;
  const eligibleCount = allStudents.filter(s => s.isEligibleForPromotion && !s.promotedInThisYear && !s.transferCertificate?.issued && s.currentStatus !== 'transferred' && s.currentStatus !== 'graduated' && s.class !== 'Graduated').length;
  const notEligibleCount = allStudents.filter(s => !s.isEligibleForPromotion && !s.promotedInThisYear && !s.transferCertificate?.issued && s.currentStatus !== 'transferred' && s.currentStatus !== 'graduated' && s.class !== 'Graduated').length;
  const promotedCount = allStudents.filter(s => s.promotedInThisYear && !s.transferCertificate?.issued && s.currentStatus !== 'transferred' && s.currentStatus !== 'graduated' && s.class !== 'Graduated').length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1 text-primary flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          Student Promotion Management
        </h2>
        <p className="text-sm text-gray-600">Manage student promotions, hold-backs, and transfer certificates</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={classesLoading}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {classesLoading ? 'Loading classes...' : 'All Classes'}
              </option>
              {classes && classes.length > 0 ? (
                classes.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))
              ) : (
                !classesLoading && <option value="" disabled>No classes available</option>
              )}
            </select>
            {classesError && (
              <p className="text-xs text-red-500 mt-1">{classesError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {academicYearOptions.map(year => (
                <option key={year} value={year}>
                  {year} {year === currentAcadYear ? '(Current)' : '(Next Year)'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {academicYear === nextAcadYear 
                ? 'View promoted students in their new classes' 
                : 'View students for promotion in current year'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="eligible">Eligible</option>
              <option value="hold-back">Hold Back</option>
              <option value="promoted">Promoted</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={fetchStudents}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              <Search className="w-4 h-4 inline mr-1" />
              Refresh
            </button>
            <button
              onClick={() => setShowBulkPromote(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4 inline mr-1" />
              Bulk Promote
            </button>
            <button
              onClick={() => setShowTcModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Issue TC
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Search className="w-4 h-4 inline mr-1" />
            Search Students
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, student ID, class, or section..."
              className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-1">
              Showing {students.length} result{students.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <motion.div
          className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 text-white rounded-lg p-4 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{allStudents.length}</div>
              <div className="text-white/80 text-xs font-medium">Total</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-lg p-4 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{promotedCount}</div>
              <div className="text-white/90 text-xs font-medium">Promoted</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-lg p-4 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{eligibleCount}</div>
              <div className="text-white/90 text-xs font-medium">Eligible</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 text-white rounded-lg p-4 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{notEligibleCount}</div>
              <div className="text-white/90 text-xs font-medium">Hold Back</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students for Promotion
            </h3>
            <div className="text-xs font-medium">
              {selectedStudents.length > 0 && (
                <span className="bg-white/20 px-2.5 py-1 rounded-full">
                  {selectedStudents.length} Selected
                </span>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-lg font-semibold mb-2">
              {selectedStatus || selectedClass
                ? 'No students match the selected filters'
                : academicYear === nextAcadYear 
                ? 'No promoted students found' 
                : 'No students loaded'}
            </p>
            <p className="text-sm text-gray-400">
              {selectedStatus || selectedClass
                ? 'Try adjusting your filters or click "Refresh" to reload students'
                : academicYear === nextAcadYear 
                ? `No students were promoted to ${academicYear}. Promoted students will appear here in their new classes.` 
                : 'Please select a class and click "Refresh" to load students'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === students.length && students.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase">Class</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase">Attendance</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase">Fee Status</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase">Fee Paid/Due</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase">Next Class</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr
                      key={student._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        student.promotedInThisYear ? 'bg-blue-50 border-l-4 border-l-blue-500' :
                        !student.isEligibleForPromotion ? 'bg-orange-50' :
                        student.feeInfo && student.feeInfo.remaining > 0 ? 'bg-yellow-50 border-l-2 border-l-yellow-400' : ''
                      }`}
                      title={
                        student.feeInfo && student.feeInfo.remaining > 0
                          ? `Fee Pending: ₹${student.feeInfo.remaining.toLocaleString()}`
                          : ''
                      }
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleSelectStudent(student._id)}
                          disabled={
                            student.transferCertificate?.issued || 
                            student.currentStatus === 'transferred' ||
                            (promotionType === 'promoted' && (student.totalDays === 0 || student.attendancePercentage < 75))
                          }
                          className="w-4 h-4 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            student.transferCertificate?.issued || student.currentStatus === 'transferred'
                              ? 'Student has Transfer Certificate issued'
                              : promotionType === 'promoted' && (student.totalDays === 0 || student.attendancePercentage < 75)
                              ? `Cannot promote: ${student.totalDays === 0 ? 'No attendance records' : `Attendance ${student.attendancePercentage}% < 75%`}`
                              : 'Select student'
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 font-mono">{student.studentId}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {student.class} - {student.section}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-sm font-bold ${
                            student.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-orange-600'
                          }`}>
                            {student.attendancePercentage}%
                          </span>
                          <span className="text-xs text-gray-500">
                            ({student.presentDays}/{student.totalDays})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.feeInfo && student.feeInfo.feeStructure ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              student.feeInfo.paymentStatus === 'Paid'
                                ? 'bg-green-100 text-green-700'
                                : student.feeInfo.paymentStatus === 'Partially Paid'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {student.feeInfo.paymentStatus}
                            </span>
                            {student.feeInfo.hasCustomFee && (
                              <span className="text-xs text-purple-600 font-medium">Custom Fee</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No Fee Structure</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.feeInfo && student.feeInfo.feeStructure ? (
                          <div className="flex flex-col items-center gap-0.5 text-xs">
                            <div className="text-gray-600">
                              Paid: <span className="font-semibold text-green-600">₹{student.feeInfo.totalPaid.toLocaleString()}</span>
                            </div>
                            <div className="text-gray-600">
                              Due: <span className={`font-semibold ${
                                student.feeInfo.remaining > 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                ₹{student.feeInfo.remaining.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-gray-500 text-[10px]">
                              Total: ₹{student.feeInfo.totalFee.toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.transferCertificate?.issued || student.currentStatus === 'transferred' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            <FileText className="w-3 h-3" />
                            Transferred
                          </span>
                        ) : student.currentStatus === 'graduated' || student.class === 'Graduated' || student.promotionRecord?.toClass === 'Graduated' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            <GraduationCap className="w-3 h-3" />
                            Graduated
                          </span>
                        ) : student.promotedInThisYear ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            <CheckCircle className="w-3 h-3" />
                            Promoted
                          </span>
                        ) : student.isEligibleForPromotion ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                            <XCircle className="w-3 h-3" />
                            Hold Back
                          </span>
                        )}
                        {/* Show warning if student has promotion history but doesn't meet requirements */}
                        {student.promotionHistory && student.promotionHistory.length > 0 && 
                         student.promotionHistory.some(p => p.academicYear === academicYear) &&
                         !student.promotedInThisYear && 
                         (student.totalDays === 0 || student.attendancePercentage < 75) && (
                          <span className="ml-2 text-xs text-red-600" title="Invalid promotion: Student was promoted but doesn't meet 75% attendance requirement">
                            <AlertCircle className="w-3 h-3 inline" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs">
                          {student.transferCertificate?.issued || student.currentStatus === 'transferred' ||
                           student.currentStatus === 'graduated' || student.class === 'Graduated' || student.promotionRecord?.toClass === 'Graduated' ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <>
                              <span className="text-gray-600">{student.class}</span>
                              {(() => {
                                const nextClass = student.promotedInThisYear && student.promotionRecord 
                                  ? student.promotionRecord.toClass 
                                  : getNextClass(student.class);
                                const isGraduated = nextClass === 'Graduated';
                                return (
                                  <>
                                    {!isGraduated && <ArrowRight className="w-3 h-3 text-gray-400" />}
                                    <span className={`font-semibold ${
                                      isGraduated ? 'text-purple-600' : 'text-primary'
                                    }`}>
                                      {isGraduated ? '🎓 Graduated' : nextClass}
                                    </span>
                                  </>
                                );
                              })()}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <button
                            onClick={async () => {
                              setAttendanceLoading(true);
                              setSelectedMonth(''); // Reset month filter
                              setSelectedYearFilter(''); // Reset year filter
                              setSelectedStudentAttendance(student);
                              try {
                                const res = await axios.get('/promotion/attendance', {
                                  params: {
                                    studentId: student._id,
                                    academicYear: academicYear
                                  }
                                });
                                
                                setSelectedStudentAttendance({
                                  ...student,
                                  attendanceRecords: res.data.attendance || [],
                                  attendanceStats: res.data.statistics
                                });
                                setShowAttendanceModal(true);
                              } catch (error) {
                                console.error('Fetch attendance error:', error);
                                toast.error(error?.response?.data?.message || 'Failed to fetch attendance records');
                              } finally {
                                setAttendanceLoading(false);
                              }
                            }}
                            className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                            title="View Full Attendance"
                            disabled={attendanceLoading}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          {student.feeInfo && student.feeInfo.feeStructure && (
                            <button
                              onClick={() => {
                                setSelectedStudentForPayment(student);
                                setShowPaymentHistoryModal(true);
                              }}
                              className="p-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                              title="View Payment History & Receipts"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              console.log('Viewing details for student:', student);
                              setSelectedStudentDetails(student);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="View Student Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {student.promotedInThisYear && (
                            <button
                              onClick={() => {
                                setStudentToRevert(student);
                                setShowRevertModal(true);
                              }}
                              className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Revert Promotion"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Promotion Actions */}
            {selectedStudents.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {selectedStudents.length} student(s) selected
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={promotionType}
                      onChange={(e) => setPromotionType(e.target.value)}
                      className="border border-gray-300 px-3 py-1.5 rounded-md text-sm focus:ring-2 focus:ring-primary"
                    >
                      <option value="promoted">Promote</option>
                      <option value="hold-back">Hold Back</option>
                    </select>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason (optional)"
                      className="border border-gray-300 px-3 py-1.5 rounded-md text-sm focus:ring-2 focus:ring-primary w-48"
                    />
                    <button
                      onClick={handlePromote}
                      disabled={loading}
                      className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Apply Promotion'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Promote Modal */}
      {showBulkPromote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold mb-4">Bulk Promote by Class</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Attendance Required (%)
                </label>
                <input
                  type="number"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBulkPromote}
                  disabled={loading || !selectedClass}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Bulk Promote'}
                </button>
                <button
                  onClick={() => setShowBulkPromote(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* TC Modal */}
      {showTcModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold mb-4">Issue Transfer Certificate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
                <input
                  type="text"
                  value={tcStudentId}
                  onChange={(e) => setTcStudentId(e.target.value)}
                  placeholder="Enter Student ID (e.g., S25153)"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {tcStudentLoading && (
                  <p className="text-xs text-gray-500 mt-1">Validating student ID...</p>
                )}
                {tcStudentInfo && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <div className="text-sm flex-1">
                        <div className="font-semibold text-emerald-900">{tcStudentInfo.name}</div>
                        <div className="text-xs text-emerald-700">
                          Class: {tcStudentInfo.class} - {tcStudentInfo.section}
                        </div>
                        <div className="text-xs mt-1">
                          Promotion Status: <span className={`font-semibold ${tcStudentInfo.statusColor || 'text-emerald-700'}`}>
                            {tcStudentInfo.statusDisplay || 'Eligible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {tcStudentId && !tcStudentLoading && !tcStudentInfo && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-red-700">Student not found. Please check the Student ID.</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                <textarea
                  value={tcReason}
                  onChange={(e) => setTcReason(e.target.value)}
                  placeholder="Enter reason for TC"
                  rows="3"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleIssueTC}
                  disabled={loading || !tcStudentId || !tcReason || !tcStudentInfo}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Issue TC'}
                </button>
                <button
                  onClick={() => {
                    setShowTcModal(false);
                    setTcStudentId('');
                    setTcReason('');
                    setTcStudentInfo(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Revert Promotion Modal */}
      {showRevertModal && studentToRevert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Revert Promotion</h3>
                <p className="text-sm text-gray-600">Undo promotion for {studentToRevert.name}</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will move the student back to their previous class ({studentToRevert.promotionRecord?.fromClass || 'Previous Class'}) 
                and revert their academic year to {academicYear}.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Revert (Optional)
                </label>
                <textarea
                  value={revertReason}
                  onChange={(e) => setRevertReason(e.target.value)}
                  placeholder="Enter reason for reverting promotion..."
                  rows="3"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRevertPromotion}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Reverting...' : 'Confirm Revert'}
                </button>
                <button
                  onClick={() => {
                    setShowRevertModal(false);
                    setStudentToRevert(null);
                    setRevertReason('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudentDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Details - {selectedStudentDetails.name || 'N/A'}
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedStudentDetails(null);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student ID:</span>
                      <span className="font-semibold text-gray-900">{selectedStudentDetails.studentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-900">{selectedStudentDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Class:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedStudentDetails.class} - {selectedStudentDetails.section}
                      </span>
                    </div>
                    {selectedStudentDetails.previousClass && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Previous Class:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedStudentDetails.previousClass} - {selectedStudentDetails.previousSection}
                        </span>
                      </div>
                    )}
                    {selectedStudentDetails.birthDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-semibold text-gray-900">
                          {format(new Date(selectedStudentDetails.birthDate), 'dd MMM yyyy')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold ${
                        selectedStudentDetails.currentStatus === 'active' ? 'text-emerald-600' : 'text-gray-600'
                      }`}>
                        {selectedStudentDetails.currentStatus || 'Active'}
                      </span>
                    </div>
                    {selectedStudentDetails.promotedInThisYear && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Promotion Status:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3" />
                          Promoted in {academicYear}
                        </span>
                      </div>
                    )}
                    {selectedStudentDetails.promotedInThisYear && selectedStudentDetails.promotionRecord && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Promoted To:</span>
                        <span className="font-semibold text-blue-600">
                          {selectedStudentDetails.promotionRecord.toClass === 'Graduated' 
                            ? '🎓 Graduated' 
                            : `Class ${selectedStudentDetails.promotionRecord.toClass} - ${selectedStudentDetails.promotionRecord.toSection}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Photo */}
                {selectedStudentDetails.image?.url && (
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                    <img
                      src={selectedStudentDetails.image.url}
                      alt={selectedStudentDetails.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Parent Information */}
              {(selectedStudentDetails.parent || selectedStudentDetails.parentId) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Parent Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Parent Name:</span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {selectedStudentDetails.parent?.name || selectedStudentDetails.parentName || 'N/A'}
                      </span>
                    </div>
                    {(selectedStudentDetails.parent?.phone || selectedStudentDetails.parentPhone) && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedStudentDetails.parent?.phone || selectedStudentDetails.parentPhone}
                        </span>
                      </div>
                    )}
                    {(selectedStudentDetails.parent?.email || selectedStudentDetails.parentEmail) && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedStudentDetails.parent?.email || selectedStudentDetails.parentEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fee Information */}
              {selectedStudentDetails.feeInfo && selectedStudentDetails.feeInfo.feeStructure && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Fee Information ({academicYear})
                    {selectedStudentDetails.feeInfo.hasCustomFee && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                        Custom Fee
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="text-xs text-gray-600 mb-1">Total Fee</div>
                      <div className="text-lg font-bold text-blue-600">
                        ₹{selectedStudentDetails.feeInfo.totalFee.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <div className="text-xs text-gray-600 mb-1">Total Paid</div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{selectedStudentDetails.feeInfo.totalPaid.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <div className="text-xs text-gray-600 mb-1">Remaining</div>
                      <div className={`text-lg font-bold ${
                        selectedStudentDetails.feeInfo.remaining > 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        ₹{selectedStudentDetails.feeInfo.remaining.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-600 mb-1">Status</div>
                      <div className={`text-sm font-semibold ${
                        selectedStudentDetails.feeInfo.paymentStatus === 'Paid'
                          ? 'text-green-600'
                          : selectedStudentDetails.feeInfo.paymentStatus === 'Partially Paid'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {selectedStudentDetails.feeInfo.paymentStatus}
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  {selectedStudentDetails.feeInfo.feeStructure.breakdown && 
                   Object.keys(selectedStudentDetails.feeInfo.feeStructure.breakdown).length > 0 && (
                    <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Fee Breakdown:</div>
                      <div className="space-y-1">
                        {Object.entries(selectedStudentDetails.feeInfo.feeStructure.breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="font-semibold text-gray-900">₹{value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  {selectedStudentDetails.feeInfo.paymentHistory && selectedStudentDetails.feeInfo.paymentHistory.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Payment History ({selectedStudentDetails.feeInfo.paymentHistory.length}):</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedStudentDetails.feeInfo.paymentHistory.map((payment, idx) => (
                          <div key={idx} className="bg-gray-50 rounded p-2 border border-gray-200">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-gray-900">
                                  ₹{payment.total.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {format(new Date(payment.paidAt), 'dd MMM yyyy')}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  payment.paymentMethod === 'cash'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {payment.paymentMethod === 'cash' ? 'Cash' : 'Online'}
                                </span>
                              </div>
                            </div>
                            <div className="text-[10px] text-gray-500 flex justify-between">
                              <span>Amount: ₹{payment.amountPaid.toLocaleString()}</span>
                              {payment.lateFee > 0 && (
                                <span className="text-orange-600">Late Fee: ₹{payment.lateFee.toLocaleString()}</span>
                              )}
                            </div>
                            {payment.receiptUrl && (
                              <button
                                onClick={async () => {
                                  try {
                                    if (payment.receiptUrl.startsWith('http')) {
                                      window.open(payment.receiptUrl, '_blank');
                                      return;
                                    }
                                    const apiBase = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
                                    const receiptUrl = `${apiBase}${payment.receiptUrl}`;
                                    const response = await fetch(receiptUrl, {
                                      method: 'GET',
                                      credentials: 'include',
                                    });
                                    if (!response.ok) throw new Error('Failed to fetch receipt');
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                    setTimeout(() => window.URL.revokeObjectURL(url), 100);
                                  } catch (error) {
                                    console.error('Error opening receipt:', error);
                                    toast.error('Failed to open receipt');
                                  }
                                }}
                                className="mt-1 text-[10px] text-blue-600 hover:text-blue-800 underline"
                              >
                                View Receipt
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attendance Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Attendance Statistics ({academicYear})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {selectedStudentDetails.attendancePercentage}%
                    </div>
                    <div className="text-xs text-gray-600">Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {selectedStudentDetails.presentDays || 0}
                    </div>
                    <div className="text-xs text-gray-600">Present Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedStudentDetails.absentDays || 0}
                    </div>
                    <div className="text-xs text-gray-600">Absent Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {selectedStudentDetails.totalDays || 0}
                    </div>
                    <div className="text-xs text-gray-600">Total Days</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Promotion Eligibility:</span>
                    <span className={`font-semibold ${
                      selectedStudentDetails.isEligibleForPromotion ? 'text-emerald-600' : 'text-orange-600'
                    }`}>
                      {selectedStudentDetails.isEligibleForPromotion ? 'Eligible for Promotion' : 'Hold Back Required'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        selectedStudentDetails.attendancePercentage >= 75
                          ? 'bg-emerald-500'
                          : selectedStudentDetails.attendancePercentage >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(selectedStudentDetails.attendancePercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Minimum required: 75% for promotion
                  </div>
                </div>
              </div>

              {/* Promotion History */}
              {selectedStudentDetails.promotionHistory && selectedStudentDetails.promotionHistory.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Promotion History
                  </h4>
                  <div className="space-y-3">
                    {selectedStudentDetails.promotionHistory.map((history, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            Academic Year: {history.academicYear}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            history.promotionType === 'promoted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : history.promotionType === 'hold-back'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {history.promotionType}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            From: <span className="font-semibold">{history.fromClass} - {history.fromSection}</span>
                            {' → '}
                            To: <span className="font-semibold">
                              {history.toClass === 'Graduated' 
                                ? '🎓 Graduated' 
                                : `${history.toClass} - ${history.toSection}`}
                            </span>
                          </div>
                          {history.attendancePercentage !== undefined && (
                            <div>
                              Attendance: <span className="font-semibold">{history.attendancePercentage}%</span>
                            </div>
                          )}
                          {history.reason && (
                            <div>
                              Reason: <span className="font-semibold">{history.reason}</span>
                            </div>
                          )}
                          {history.promotedAt && (
                            <div className="text-xs text-gray-500">
                              {format(new Date(history.promotedAt), 'dd MMM yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transfer Certificate Info */}
              {selectedStudentDetails.transferCertificate?.issued && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Transfer Certificate Issued
                  </h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-orange-700">Issued Date:</span>
                      <span className="font-semibold text-orange-900 ml-2">
                        {format(new Date(selectedStudentDetails.transferCertificate.issuedDate), 'dd MMM yyyy')}
                      </span>
                    </div>
                    {selectedStudentDetails.transferCertificate.reason && (
                      <div>
                        <span className="text-orange-700">Reason:</span>
                        <span className="font-semibold text-orange-900 ml-2">
                          {selectedStudentDetails.transferCertificate.reason}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    if (!selectedStudents.includes(selectedStudentDetails._id)) {
                      handleSelectStudent(selectedStudentDetails._id);
                    }
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-semibold"
                >
                  {selectedStudents.includes(selectedStudentDetails._id) ? 'Selected' : 'Select for Promotion'}
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedStudentDetails(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Attendance Records Modal */}
      {showAttendanceModal && selectedStudentAttendance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Attendance Records - {selectedStudentAttendance.name}
                </h3>
                <p className="text-sm text-emerald-100 mt-1">
                  Class {selectedStudentAttendance.class} - {selectedStudentAttendance.section} | Academic Year {academicYear}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAttendanceModal(false);
                  setSelectedStudentAttendance(null);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Statistics Summary */}
              {selectedStudentAttendance.attendanceStats && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600">
                      {selectedStudentAttendance.attendanceStats.attendancePercentage}%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Attendance</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedStudentAttendance.attendanceStats.presentDays || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Present</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedStudentAttendance.attendanceStats.absentDays || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Absent</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-gray-600">
                      {selectedStudentAttendance.attendanceStats.totalDays || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Total Days</div>
                  </div>
                </div>
              )}

              {/* Month Filter */}
              {selectedStudentAttendance.attendanceRecords && selectedStudentAttendance.attendanceRecords.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-3">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <label className="text-sm font-semibold text-gray-700">Filter by Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-gray-300 px-3 py-1.5 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">All Months</option>
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </select>
                  <button
                    onClick={() => {
                      setSelectedMonth('');
                      setSelectedYearFilter('');
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Attendance Records - Excel-like Format Grouped by Month */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Attendance Records (Excel Format)
                  </h4>
                </div>
                {attendanceLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading attendance records...</p>
                  </div>
                ) : selectedStudentAttendance.attendanceRecords && selectedStudentAttendance.attendanceRecords.length > 0 ? (
                  <div className="overflow-x-auto max-h-[500px]">
                    {/* Group attendance by month */}
                    {(() => {
                      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                      
                      // Group records by month
                      const groupedByMonth = {};
                      selectedStudentAttendance.attendanceRecords.forEach(record => {
                        const recordDate = new Date(record.date);
                        const month = recordDate.getMonth();
                        const monthKey = month;
                        
                        if (!groupedByMonth[monthKey]) {
                          groupedByMonth[monthKey] = [];
                        }
                        groupedByMonth[monthKey].push(record);
                      });

                      // Filter by selected month if any
                      const monthsToShow = selectedMonth !== '' 
                        ? [parseInt(selectedMonth)]
                        : Object.keys(groupedByMonth).map(k => parseInt(k)).sort((a, b) => a - b);

                      return monthsToShow.map(month => {
                        const records = groupedByMonth[month] || [];
                        if (records.length === 0) return null;

                        // Calculate month statistics
                        const monthPresent = records.filter(r => r.status === 'present').length;
                        const monthAbsent = records.filter(r => r.status === 'absent').length;
                        const monthTotal = records.length;
                        const monthPercentage = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;

                        return (
                          <div key={month} className="border-b border-gray-300 last:border-b-0">
                            {/* Month Header */}
                            <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 border-b border-gray-200 sticky top-0 z-10">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-gray-900 text-base">
                                  {monthNames[month]} {academicYear}
                                </h5>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-600">
                                    <span className="font-semibold text-emerald-600">{monthPresent}</span> Present
                                  </span>
                                  <span className="text-gray-600">
                                    <span className="font-semibold text-red-600">{monthAbsent}</span> Absent
                                  </span>
                                  <span className="text-gray-600">
                                    <span className="font-semibold text-gray-900">{monthTotal}</span> Total
                                  </span>
                                  <span className="text-gray-600">
                                    <span className="font-semibold text-blue-600">{monthPercentage}%</span> Attendance
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Month Table */}
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">Date</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">Day</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">Status</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {records
                                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                                  .map((record, idx) => {
                                    const recordDate = new Date(record.date);
                                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                    const dayName = dayNames[recordDate.getDay()];
                                    
                                    return (
                                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-100 font-mono">
                                          {format(recordDate, 'dd-MMM-yyyy')}
                                        </td>
                                        <td className="px-3 py-2 text-center text-xs text-gray-600 border-r border-gray-100">
                                          {dayName}
                                        </td>
                                        <td className="px-3 py-2 text-center border-r border-gray-100">
                                          {record.status === 'present' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                                              <CheckCircle className="w-3 h-3" />
                                              P
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
                                              <XCircle className="w-3 h-3" />
                                              A
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600">
                                          {record.reason || '-'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No attendance records found for this academic year</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={() => {
                  setShowAttendanceModal(false);
                  setSelectedStudentAttendance(null);
                }}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistoryModal && selectedStudentForPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Payment History - {selectedStudentForPayment.name}
                </h3>
                <p className="text-sm text-white/90 mt-1">
                  Class {selectedStudentForPayment.class} - {selectedStudentForPayment.section} | Academic Year {academicYear}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentHistoryModal(false);
                  setSelectedStudentForPayment(null);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Fee Summary */}
              {selectedStudentForPayment.feeInfo && selectedStudentForPayment.feeInfo.feeStructure && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 mb-6 border border-primary/20">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Fee Summary
                    {selectedStudentForPayment.feeInfo.hasCustomFee && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full font-medium border border-primary/30">
                        Custom Fee
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-primary/20">
                      <div className="text-xs text-gray-600 mb-1">Total Fee</div>
                      <div className="text-lg font-bold text-primary">
                        ₹{selectedStudentForPayment.feeInfo.totalFee.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <div className="text-xs text-gray-600 mb-1">Total Paid</div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{selectedStudentForPayment.feeInfo.totalPaid.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <div className="text-xs text-gray-600 mb-1">Remaining</div>
                      <div className={`text-lg font-bold ${
                        selectedStudentForPayment.feeInfo.remaining > 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        ₹{selectedStudentForPayment.feeInfo.remaining.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-600 mb-1">Status</div>
                      <div className={`text-sm font-semibold ${
                        selectedStudentForPayment.feeInfo.paymentStatus === 'Paid'
                          ? 'text-green-600'
                          : selectedStudentForPayment.feeInfo.paymentStatus === 'Partially Paid'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {selectedStudentForPayment.feeInfo.paymentStatus}
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  {selectedStudentForPayment.feeInfo.feeStructure.breakdown && 
                   Object.keys(selectedStudentForPayment.feeInfo.feeStructure.breakdown).length > 0 && (
                    <div className="bg-white rounded-lg p-3 mt-4 border border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Fee Breakdown:</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(selectedStudentForPayment.feeInfo.feeStructure.breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="font-semibold text-gray-900">₹{value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment History List */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Payment History
                    {selectedStudentForPayment.feeInfo?.paymentHistory && (
                      <span className="text-sm text-gray-600 font-normal">
                        ({selectedStudentForPayment.feeInfo.paymentHistory.length} payment{selectedStudentForPayment.feeInfo.paymentHistory.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </h4>
                </div>

                {selectedStudentForPayment.feeInfo && selectedStudentForPayment.feeInfo.paymentHistory && selectedStudentForPayment.feeInfo.paymentHistory.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {selectedStudentForPayment.feeInfo.paymentHistory.map((payment, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                payment.paymentMethod === 'cash'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {payment.paymentMethod === 'cash' ? (
                                  <DollarSign className="w-5 h-5" />
                                ) : (
                                  <Receipt className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-lg">
                                  ₹{payment.total.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {format(new Date(payment.paidAt), 'dd MMMM yyyy, hh:mm a')}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2">
                              <div>
                                <span className="text-gray-600">Amount Paid:</span>
                                <span className="font-semibold text-gray-900 ml-2">₹{payment.amountPaid.toLocaleString()}</span>
                              </div>
                              {payment.lateFee > 0 && (
                                <div>
                                  <span className="text-gray-600">Late Fee:</span>
                                  <span className="font-semibold text-orange-600 ml-2">₹{payment.lateFee.toLocaleString()}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600">Method:</span>
                                <span className={`font-semibold ml-2 ${
                                  payment.paymentMethod === 'cash' ? 'text-green-600' : 'text-blue-600'
                                }`}>
                                  {payment.paymentMethod === 'cash' ? 'Cash' : 'Online'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Receipt #:</span>
                                <span className="font-mono text-gray-900 ml-2">{payment.receiptNumber}</span>
                              </div>
                            </div>
                          </div>
                          {payment.receiptUrl && (
                            <button
                              onClick={async () => {
                                try {
                                  if (payment.receiptUrl.startsWith('http')) {
                                    window.open(payment.receiptUrl, '_blank');
                                    return;
                                  }
                                  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
                                  const receiptUrl = `${apiBase}${payment.receiptUrl}`;
                                  const response = await fetch(receiptUrl, {
                                    method: 'GET',
                                    credentials: 'include',
                                  });
                                  if (!response.ok) throw new Error('Failed to fetch receipt');
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  window.open(url, '_blank');
                                  setTimeout(() => window.URL.revokeObjectURL(url), 100);
                                } catch (error) {
                                  console.error('Error opening receipt:', error);
                                  toast.error('Failed to open receipt');
                                }
                              }}
                              className="ml-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <Receipt className="w-4 h-4" />
                              View Receipt
                            </button>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            payment.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : payment.status === 'pending_verification'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {payment.status === 'paid' ? 'Paid' : payment.status === 'pending_verification' ? 'Pending Verification' : payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">No Payment History</p>
                    <p className="text-sm text-gray-400">No payments have been made for this academic year</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={() => {
                  setShowPaymentHistoryModal(false);
                  setSelectedStudentForPayment(null);
                }}
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentPromotionManagement;

