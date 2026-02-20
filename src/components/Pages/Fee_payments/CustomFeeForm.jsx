import React, { useState, useEffect } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import { motion } from "framer-motion";
import { 
  Search, 
  User, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  Plus, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  FileText,
  Receipt,
  Download,
  CreditCard,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Edit,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../lib/axios";
import { format } from "date-fns";
import { getCurrentAcademicYear, getAcademicYearOptions, getPreviousAcademicYear } from "../../../utils/academicYear";

const initialBreakdown = [{ key: "Tuition", value: "" }];

const CustomFeeForm = () => {
  const { createOrUpdateCustomFee, fetchAllCustomFees, updateCustomFee, customFeeLoading } = useFeeStore();
  const [activeTab, setActiveTab] = useState("assign");
  const [customFees, setCustomFees] = useState([]);
  const [editingFee, setEditingFee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    totalFee: "",
    frequency: "annually",
    dueDate: "",
    lateFeePerDay: 0,
    reason: "",
    className: "",
    section: "",
  });
  const [editBreakdown, setEditBreakdown] = useState([]);
  const [form, setForm] = useState({
    student: "",
    academicYear: getCurrentAcademicYear(),
    totalFee: "",
    frequency: "annually",
    dueDate: "",
    lateFeePerDay: 0,
    reason: "",
    className: "",
    section: "",
  });
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [expandedFees, setExpandedFees] = useState({});
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, paid, unpaid, partial
  const [academicYearFilter, setAcademicYearFilter] = useState(""); // Academic year filter for View tab
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [studentFeeDetails, setStudentFeeDetails] = useState(null);
  const [loadingFeeDetails, setLoadingFeeDetails] = useState(false);
  const [existingCustomFee, setExistingCustomFee] = useState(null);
  const [loadingCustomFee, setLoadingCustomFee] = useState(false);

  // Fetch students from backend with search functionality
  const fetchStudents = async (search = "") => {
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      
      const response = await axios.get(`/students/all?${params.toString()}`);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch available academic years from backend
    const loadAcademicYears = async () => {
      try {
        const { data } = await axios.get('/students/unique-values');
        const years = (data.academicYears || []).sort((a, b) => {
          const [aStart] = a.split('-').map(y => parseInt(y, 10));
          const [bStart] = b.split('-').map(y => parseInt(y, 10));
          return bStart - aStart; // Newest first
        });
        setAcademicYearOptions(years);
      } catch (error) {
        console.error('Failed to load academic years:', error);
        // Fallback to generated options if API fails
        setAcademicYearOptions(getAcademicYearOptions(2, 2));
      }
    };
    loadAcademicYears();
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Fetch custom fees when View tab is active
  useEffect(() => {
    if (activeTab === "view") {
      loadCustomFees();
    }
  }, [activeTab]);

  const loadCustomFees = async () => {
    try {
      const fees = await fetchAllCustomFees();
      setCustomFees(fees);
    } catch (error) {
      console.error("Error loading custom fees:", error);
    }
  };

  // Handle edit button click
  const handleEditClick = (customFee) => {
    // Check if payments have been made
    if (customFee.totalPaid > 0) {
      toast.error(`Cannot edit custom fee. Student has already paid ₹${customFee.totalPaid.toLocaleString()}`);
      return;
    }

    setEditingFee(customFee);
    
    // Convert breakdown to array format for editing
    const breakdownArray = Object.entries(customFee.breakdown || {}).map(([key, value]) => ({
      key,
      value: value.toString()
    }));
    
    if (breakdownArray.length === 0) {
      breakdownArray.push({ key: "Tuition", value: "" });
    }

    setEditForm({
      totalFee: customFee.totalFee?.toString() || "",
      frequency: customFee.frequency || "annually",
      dueDate: customFee.dueDate ? format(new Date(customFee.dueDate), "yyyy-MM-dd") : "",
      lateFeePerDay: customFee.lateFeePerDay || 0,
      reason: customFee.reason || "",
      className: customFee.displayClass || customFee.student?.class || "",
      section: customFee.displaySection || customFee.student?.section || "",
    });
    setEditBreakdown(breakdownArray);
    setShowEditModal(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingFee) return;

    // Validation
    if (!editForm.totalFee || parseFloat(editForm.totalFee) <= 0) {
      toast.error("Please enter a valid total fee amount");
      return;
    }

    setLoading(true);
    try {
      // Convert breakdown array to object
      const breakdownObj = {};
      editBreakdown.forEach(({ key, value }) => {
        if (key && value) breakdownObj[key] = Number(value);
      });

      // Get the correct class for the academic year
      const classInfo = editingFee.student ? getStudentClassForAcademicYear(editingFee.student, editingFee.academicYear) : null;
      const classNameToUse = editingFee.displayClass || classInfo?.displayClass || editForm.className || editingFee.student?.class || "";
      const sectionToUse = editingFee.displaySection || classInfo?.displaySection || editForm.section || editingFee.student?.section || "";

      const payload = {
        ...editForm,
        className: classNameToUse,
        section: sectionToUse,
        breakdown: breakdownObj,
        totalFee: parseFloat(editForm.totalFee),
      };

      const result = await updateCustomFee(editingFee._id, payload);
      
      // Show comparison if available
      if (result && result.comparison) {
        const { old, new: newValues, difference } = result.comparison;
        const feeDiff = difference.totalFee;
        const discountDiff = difference.discount;
        
        if (feeDiff !== 0) {
          toast.success(
            `Custom fee updated! ${feeDiff > 0 ? 'Increased' : 'Decreased'} by ₹${Math.abs(feeDiff).toLocaleString()}`,
            { duration: 5000 }
          );
        } else {
          toast.success("Custom fee updated successfully!");
        }
      } else {
        toast.success("Custom fee updated successfully!");
      }

      // Store student info before closing modal
      const editedStudentId = editingFee.student?._id || editingFee.student;
      const editedAcademicYear = editingFee.academicYear;

      // Close modal
      setShowEditModal(false);
      setEditingFee(null);
      
      // Refresh custom fees list (for view tab)
      loadCustomFees();
      
      // Refresh existing custom fee display if we're on assign tab and the edited fee matches the selected student
      if (activeTab === "assign" && selectedStudent) {
        const currentStudentId = selectedStudent._id;
        const currentAcademicYear = form.academicYear;
        
        // Convert both IDs to strings for comparison
        const editedStudentIdStr = String(editedStudentId);
        const currentStudentIdStr = String(currentStudentId);
        
        // If the edited fee is for the currently selected student and academic year, refresh the display
        if (editedStudentIdStr === currentStudentIdStr && editedAcademicYear === currentAcademicYear) {
          // Add a small delay to ensure backend has processed the update
          setTimeout(() => {
            // Refresh the existing custom fee display
            fetchExistingCustomFee(currentStudentId, currentAcademicYear);
            // Also refresh standard fee details to ensure everything is up to date
            fetchStudentFeeDetails(selectedStudent, currentAcademicYear);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error updating custom fee:", error);
      // Error toast is handled in the store
    } finally {
      setLoading(false);
    }
  };

  // Handle edit breakdown changes
  const handleEditBreakdownChange = (idx, field, value) => {
    const updated = editBreakdown.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setEditBreakdown(updated);
    
    // Auto-calculate total fee
    const totalFee = updated.reduce((sum, item) => {
      const amount = parseFloat(item.value) || 0;
      return sum + amount;
    }, 0);
    setEditForm({ ...editForm, totalFee: totalFee.toString() });
  };

  const addEditBreakdownField = () => {
    setEditBreakdown([...editBreakdown, { key: "", value: "" }]);
  };

  const removeEditBreakdownField = (idx) => {
    const updated = editBreakdown.filter((_, i) => i !== idx);
    setEditBreakdown(updated);
    
    // Recalculate total fee
    const totalFee = updated.reduce((sum, item) => {
      const amount = parseFloat(item.value) || 0;
      return sum + amount;
    }, 0);
    setEditForm({ ...editForm, totalFee: totalFee.toString() });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStudentDropdown && !event.target.closest('.student-dropdown-container')) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStudentDropdown]);

  // Use students directly from API (no client-side filtering needed)
  const filteredStudents = students;

  // Helper function to determine student's class for a specific academic year
  const getStudentClassForAcademicYear = (student, targetAcademicYear) => {
    const promotionHistory = student.promotionHistory || [];
    const currentAcademicYear = getCurrentAcademicYear();
    // Compare academic years by extracting start year (e.g., "2026-2027" -> 2026)
    const targetStartYear = parseInt(targetAcademicYear?.split('-')[0]) || 0;
    const currentStartYear = parseInt(currentAcademicYear?.split('-')[0]) || 0;
    const isFutureYear = targetStartYear > currentStartYear;
    
    // Check if there's a revert record for this academic year (takes precedence)
    const revertRecord = promotionHistory.find(
      p => p.academicYear === targetAcademicYear && p.promotionType === 'reverted'
    );
    
    // Check if student was promoted IN this academic year (and not reverted)
    const promotionInThisYear = promotionHistory.find(
      p => p.academicYear === targetAcademicYear && 
           p.promotionType === 'promoted' && 
           !p.reverted
    );
    
    if (revertRecord) {
      // Student's promotion was reverted - show them in the class they were reverted to
      return {
        displayClass: revertRecord.toClass,
        displaySection: revertRecord.toSection,
        isInAcademicYear: true
      };
    }
    
    if (promotionInThisYear) {
      // Student was promoted in this year (and not reverted) - show them in their OLD class (fromClass)
      return {
        displayClass: promotionInThisYear.fromClass,
        displaySection: promotionInThisYear.fromSection,
        isInAcademicYear: true
      };
    }
    
    // Check if student was promoted in the PREVIOUS academic year (affects this year)
    const previousAcademicYear = getPreviousAcademicYear(targetAcademicYear);
    const revertInPreviousYear = promotionHistory.find(
      p => p.academicYear === previousAcademicYear && p.promotionType === 'reverted'
    );
    
    if (revertInPreviousYear) {
      // Promotion was reverted in previous year - show them in the class they were reverted to
      return {
        displayClass: revertInPreviousYear.toClass,
        displaySection: revertInPreviousYear.toSection,
        isInAcademicYear: true
      };
    }
    
    const promotionInPreviousYear = promotionHistory.find(
      p => p.academicYear === previousAcademicYear && 
           p.promotionType === 'promoted' && 
           !p.reverted
    );
    
    if (promotionInPreviousYear) {
      // Student was promoted in previous year (and not reverted) - show them in their NEW class (toClass) for this year
      return {
        displayClass: promotionInPreviousYear.toClass,
        displaySection: promotionInPreviousYear.toSection,
        isInAcademicYear: true
      };
    }
    
    // For future academic years, if no promotion record exists, student is not in that year yet
    if (isFutureYear) {
      return {
        displayClass: null,
        displaySection: null,
        isInAcademicYear: false
      };
    }
    
    // No promotion affecting this year - use current class (for current or past years)
    return {
      displayClass: student.class,
      displaySection: student.section,
      isInAcademicYear: true
    };
  };

  // Fetch existing custom fee for student
  const fetchExistingCustomFee = async (studentId, academicYear) => {
    if (!studentId || !academicYear) {
      setExistingCustomFee(null);
      return;
    }
    
    setLoadingCustomFee(true);
    try {
      // Fetch all custom fees and find matching one
      const response = await axios.get("/payment/custom-fees");
      const customFees = response.data.customFees || [];
      
      // Convert studentId to string for consistent comparison
      const studentIdStr = String(studentId);
      
      const matchingCustomFee = customFees.find(
        (cf) => {
          // Handle both populated and non-populated student references
          const cfStudentId = cf.student?._id || cf.student;
          const cfStudentIdStr = cfStudentId ? String(cfStudentId) : null;
          return cfStudentIdStr === studentIdStr && cf.academicYear === academicYear;
        }
      );
      console.log("matchingCustomFee", matchingCustomFee);
      if (matchingCustomFee) {
        const breakdown = matchingCustomFee.breakdown instanceof Map
          ? Object.fromEntries(matchingCustomFee.breakdown)
          : matchingCustomFee.breakdown || {};
        
        setExistingCustomFee({
          ...matchingCustomFee,
          breakdown
        });
      } else {
        setExistingCustomFee(null);
      }
    } catch (error) {
      console.error("Error fetching existing custom fee:", error);
      setExistingCustomFee(null);
    } finally {
      setLoadingCustomFee(false);
    }
  };

  // Fetch fee structure for selected student
  const fetchStudentFeeDetails = async (student, academicYear) => {
    if (!student || !academicYear) {
      setStudentFeeDetails(null);
      return;
    }
    
    setLoadingFeeDetails(true);
    try {
      // Determine the student's class for the selected academic year
      const classInfo = getStudentClassForAcademicYear(student, academicYear);
      
      // Check if student is in this academic year
      if (!classInfo.isInAcademicYear) {
        setStudentFeeDetails({
          isInAcademicYear: false,
          displayClass: null,
          displaySection: null
        });
        setLoadingFeeDetails(false);
        return;
      }
      
      const displayClass = classInfo.displayClass;
      const displaySection = classInfo.displaySection;
      
      if (!displayClass || !displaySection) {
        setStudentFeeDetails({
          isInAcademicYear: false,
          displayClass: null,
          displaySection: null
        });
        setLoadingFeeDetails(false);
        return;
      }
      
      
      // Fetch all fee structures and find matching one using displayClass and displaySection
      const response = await axios.get("/payment/all");
      const feeStructures = response.data.structures || [];
      
      const matchingStructure = feeStructures.find(
        (fs) =>
          fs.class === displayClass &&
          fs.section === displaySection &&
          fs.academicYear === academicYear
      );
      
      if (matchingStructure) {
        const breakdown = matchingStructure.breakdown instanceof Map
          ? Object.fromEntries(matchingStructure.breakdown)
          : matchingStructure.breakdown || {};
        
        setStudentFeeDetails({
          ...matchingStructure,
          breakdown,
          displayClass, // Store for display
          displaySection, // Store for display
          isInAcademicYear: true
        });
      } else {
        setStudentFeeDetails({
          isInAcademicYear: true,
          displayClass,
          displaySection,
          totalFee: null,
          breakdown: null
        });
        console.log(`No fee structure found for ${displayClass}-${displaySection} in ${academicYear}`);
      }
    } catch (error) {
      console.error("Error fetching fee details:", error);
      setStudentFeeDetails(null);
    } finally {
      setLoadingFeeDetails(false);
    }
  };

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    // Get the correct class for the selected academic year
    const classInfo = getStudentClassForAcademicYear(student, form.academicYear);
    setForm({
      ...form,
      student: student._id,
      className: classInfo.displayClass || student.class,
      section: classInfo.displaySection || student.section,
    });
    setSearchQuery(`${student.name} (${student.studentId || 'N/A'}) - ${classInfo.displayClass || student.class} ${classInfo.displaySection || student.section}`);
    setShowStudentDropdown(false);
    
    // Check if student is in the selected academic year before fetching
    if (classInfo.isInAcademicYear) {
      // Fetch fee details and existing custom fee immediately
      fetchStudentFeeDetails(student, form.academicYear);
      fetchExistingCustomFee(student._id, form.academicYear);
    } else {
      // Clear fee details if student is not in this academic year
      setStudentFeeDetails({ isInAcademicYear: false });
      setExistingCustomFee(null);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowStudentDropdown(true);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      if (value.trim()) {
        fetchStudents(value.trim());
      } else {
        setStudents([]); // Clear results when search is empty
      }
    }, 300); // 300ms delay
    
    setSearchTimeout(timeout);
    
    // If user clears the search, reset selection immediately
    if (!value) {
      setSelectedStudent(null);
      setStudentFeeDetails(null);
      setForm({
        ...form,
        student: "",
        className: "",
        section: "",
      });
    }
  };

  const handleChange = (e) => {
    // If academic year changed and student is selected, update class and refetch fee details
    if (e.target.name === 'academicYear' && selectedStudent) {
      const classInfo = getStudentClassForAcademicYear(selectedStudent, e.target.value);
      // Update form with correct class for this academic year
      setForm({
        ...form,
        [e.target.name]: e.target.value,
        className: classInfo.displayClass || selectedStudent.class,
        section: classInfo.displaySection || selectedStudent.section,
      });
      
      if (classInfo.isInAcademicYear) {
        fetchStudentFeeDetails(selectedStudent, e.target.value);
        fetchExistingCustomFee(selectedStudent._id, e.target.value);
      } else {
        // Clear fee details if student is not in this academic year
        setStudentFeeDetails({ isInAcademicYear: false });
        setExistingCustomFee(null);
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleBreakdownChange = (idx, field, value) => {
    const updated = breakdown.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setBreakdown(updated);
    
    // Auto-calculate total fee
    const totalFee = updated.reduce((sum, item) => {
      const amount = parseFloat(item.value) || 0;
      return sum + amount;
    }, 0);
    setForm({ ...form, totalFee: totalFee.toString() });
  };

  const addBreakdownField = () => {
    setBreakdown([...breakdown, { key: "", value: "" }]);
  };

  const removeBreakdownField = (idx) => {
    setBreakdown(breakdown.filter((_, i) => i !== idx));
    
    // Recalculate total fee
    const updated = breakdown.filter((_, i) => i !== idx);
    const totalFee = updated.reduce((sum, item) => {
      const amount = parseFloat(item.value) || 0;
      return sum + amount;
    }, 0);
    setForm({ ...form, totalFee: totalFee.toString() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }
    
    // Validate academic year is set
    if (!form.academicYear) {
      toast.error("Please select an academic year");
      return;
    }
    
    // Check if standard fee exists and is greater than 0
    const hasValidStandardFee = studentFeeDetails && 
                               studentFeeDetails.isInAcademicYear !== false && 
                               studentFeeDetails.totalFee !== null &&
                               studentFeeDetails.totalFee !== undefined &&
                               studentFeeDetails.totalFee > 0;
    
    if (!hasValidStandardFee) {
      toast.error("Cannot create custom fee. Standard fee structure must exist and be greater than ₹0 for this academic year.");
      return;
    }
    
    if (!form.totalFee || parseFloat(form.totalFee) <= 0) {
      toast.error("Please enter a valid total fee amount");
      return;
    }
    
    setLoading(true);
    try {
      // Convert breakdown array to object
      const breakdownObj = {};
      breakdown.forEach(({ key, value }) => {
        if (key && value) breakdownObj[key] = Number(value);
      });
      
      // Get the correct class for the selected academic year
      const academicYearToUse = form.academicYear || getCurrentAcademicYear();
      const classInfo = selectedStudent ? getStudentClassForAcademicYear(selectedStudent, academicYearToUse) : null;
      const classNameToUse = classInfo?.displayClass || form.className || selectedStudent?.class || "";
      const sectionToUse = classInfo?.displaySection || form.section || selectedStudent?.section || "";
      
      // Explicitly set student and academicYear to ensure they're correct
      const payload = {
        student: selectedStudent._id, // Explicitly use selectedStudent._id
        academicYear: academicYearToUse, // Explicitly use the current academic year from form
        className: classNameToUse,
        section: sectionToUse,
        breakdown: breakdownObj,
        totalFee: parseFloat(form.totalFee),
        frequency: form.frequency || "annually",
        dueDate: form.dueDate || "",
        lateFeePerDay: form.lateFeePerDay || 0,
        reason: form.reason || "",
      };
      
      await createOrUpdateCustomFee(payload);
      
      // Reset form
      setForm({
        student: "",
        academicYear: getCurrentAcademicYear(),
        totalFee: "",
        frequency: "annually",
        dueDate: "",
        lateFeePerDay: 0,
        reason: "",
        className: "",
        section: "",
      });
      // Store selected student before reset
      const currentStudent = selectedStudent;
      const currentAcademicYear = form.academicYear;
      
      // Reset form but keep student selected to show updated custom fee
      setForm({
        student: "",
        academicYear: getCurrentAcademicYear(),
        totalFee: "",
        frequency: "annually",
        dueDate: "",
        lateFeePerDay: 0,
        reason: "",
        className: "",
        section: "",
      });
      setBreakdown(initialBreakdown);
      setSearchQuery("");
      setExistingCustomFee(null);
      setStudentFeeDetails(null);
      
      toast.success("Custom fee created successfully!");
      
      // Refresh custom fees list if on view tab
      if (activeTab === "view") {
        loadCustomFees();
      }
      
      // Refresh custom fee info for the student (keep them selected to see the update)
      if (currentStudent) {
        setTimeout(() => {
          fetchExistingCustomFee(currentStudent._id, currentAcademicYear);
          // Also refresh standard fee details
          fetchStudentFeeDetails(currentStudent, currentAcademicYear);
        }, 500); // Small delay to ensure backend has processed
      } else {
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error("Error creating custom fee:", error);
      toast.error("Failed to create custom fee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-5 md:p-8"
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg sm:rounded-xl flex items-center justify-center">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Custom Fee Management</h2>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Set up and view custom fee structures for specific students</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-5 md:mb-6 border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("assign")}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                activeTab === "assign"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Assign Custom Fee</span>
                <span className="sm:hidden">Assign</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("view")}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                activeTab === "view"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">View Custom Fees</span>
                <span className="sm:hidden">View</span>
              </div>
            </button>
          </div>
        </div>

        {/* Assign Tab Content */}
        {activeTab === "assign" && (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Student Selection */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Select Student
            </label>
            
            <div className="relative student-dropdown-container">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowStudentDropdown(true)}
                  placeholder="Search by name, ID, class..."
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-sm sm:text-base"
                />
                {studentsLoading && (
                  <Loader2 className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                )}
              </div>
              
              {/* Student Dropdown */}
              {showStudentDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handleStudentSelect(student)}
                        className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{student.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              ID: {student.studentId || 'N/A'} • Class: {student.class} {student.section}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-xs sm:text-sm text-gray-500">
                              {student.parent?.name || 'Parent N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
                      {studentsLoading ? "Searching students..." : 
                       searchQuery.trim() ? "No students found matching your search" : 
                       "Start typing to search for students"}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* Selected Student Display with Fee Details */}
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  <div className="min-w-0 flex-1">
                      <div className="font-bold text-base sm:text-lg text-gray-900 truncate">{selectedStudent.name}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        Student ID: <span className="font-semibold">{selectedStudent.studentId || 'N/A'}</span>
                    </div>
                      {(() => {
                        const classInfo = getStudentClassForAcademicYear(selectedStudent, form.academicYear);
                        const isDifferentClass = classInfo.displayClass !== selectedStudent.class || classInfo.displaySection !== selectedStudent.section;
                        return (
                          <div className="text-sm mt-1">
                            <span className="text-gray-600">
                              Current Class: <span className="font-semibold">{selectedStudent.class}-{selectedStudent.section}</span>
                            </span>
                            {isDifferentClass && (
                              <span className="ml-2 text-blue-600 font-semibold">
                                • Class in {form.academicYear}: <span className="font-bold">{classInfo.displayClass}-{classInfo.displaySection}</span>
                              </span>
                            )}
                  </div>
                        );
                      })()}
                </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-gray-500 mb-1">Academic Year</div>
                    <div className="px-2 sm:px-3 py-1 bg-primary text-white rounded-lg font-semibold text-xs sm:text-sm inline-block">
                      {form.academicYear}
                    </div>
                  </div>
                </div>

                {/* Check if student is in this academic year */}
                {(() => {
                  const classInfo = getStudentClassForAcademicYear(selectedStudent, form.academicYear);
                  const currentAcademicYear = getCurrentAcademicYear();
                  // Compare academic years by extracting start year
                  const targetStartYear = parseInt(form.academicYear?.split('-')[0]) || 0;
                  const currentStartYear = parseInt(currentAcademicYear?.split('-')[0]) || 0;
                  const isFutureYear = targetStartYear > currentStartYear;
                  
                  if (!classInfo.isInAcademicYear && isFutureYear) {
                    return (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-orange-900 mb-2">Student Not Promoted Yet</h4>
                              <p className="text-sm text-orange-800 mb-2">
                                This student has not been promoted to academic year <span className="font-bold">{form.academicYear}</span> yet.
                              </p>
                              <p className="text-sm text-orange-700">
                                The student is currently in <span className="font-semibold">{selectedStudent.class}-{selectedStudent.section}</span> for academic year <span className="font-semibold">{currentAcademicYear}</span>.
                                They need to be promoted first before you can assign a custom fee for {form.academicYear}.
                              </p>
                              <div className="mt-3 p-2 bg-white rounded-lg border border-orange-200">
                                <p className="text-xs text-orange-700">
                                  💡 <span className="font-semibold">Note:</span> Please promote the student first in the "Student Promotion" section, then you can assign a custom fee for the new academic year.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Standard Fee Details */}
                {loadingFeeDetails ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                    <span className="text-sm text-gray-600">Loading fee details...</span>
                  </div>
                ) : studentFeeDetails && studentFeeDetails.isInAcademicYear !== false ? (
                  // Check if standard fee exists and is greater than 0
                  (() => {
                    const hasValidStandardFee = studentFeeDetails.totalFee !== null &&
                                               studentFeeDetails.totalFee !== undefined &&
                                               studentFeeDetails.totalFee > 0;
                    
                    if (!hasValidStandardFee) {
                      // Show message when no standard fee or fee is 0
                      const classInfo = getStudentClassForAcademicYear(selectedStudent, form.academicYear);
                      const displayClass = studentFeeDetails.displayClass || classInfo.displayClass || selectedStudent.class;
                      const displaySection = studentFeeDetails.displaySection || classInfo.displaySection || selectedStudent.section;
                      
                      return (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-red-900 mb-2">Cannot Create Custom Fee</h4>
                                <p className="text-sm text-red-800 mb-2">
                                  There is no standard fee structure available, so we can't create custom fee for this student ({displayClass}-{displaySection}) with ({form.academicYear}).
                                </p>
                                <p className="text-sm text-red-700">
                                  Custom fees can only be created when a standard fee structure exists and has a fee amount greater than ₹0.
                                </p>
                                <div className="mt-3 p-2 bg-white rounded-lg border border-red-200">
                                  <p className="text-xs text-red-700">
                                    💡 <span className="font-semibold">Note:</span> Please create a standard fee structure first for {displayClass}-{displaySection} in academic year {form.academicYear}, then you can create a custom fee.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // Show standard fee structure when it exists and is > 0
                    return (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-gray-900">Standard Fee Structure</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Total Standard Fee</div>
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        ₹{studentFeeDetails.totalFee?.toLocaleString('en-IN') || "0"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 break-words">
                        For {studentFeeDetails.displayClass || selectedStudent.class}-{studentFeeDetails.displaySection || selectedStudent.section}
                        {studentFeeDetails.displayClass && 
                         (studentFeeDetails.displayClass !== selectedStudent.class || studentFeeDetails.displaySection !== selectedStudent.section) && (
                          <span className="block sm:inline sm:ml-2 text-blue-600 font-semibold">
                            (Student was in this class during {form.academicYear})
                          </span>
                        )}
                      </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Fee Breakdown</div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {Object.entries(studentFeeDetails.breakdown || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600 truncate pr-2">{key}:</span>
                              <span className="font-semibold text-gray-900 flex-shrink-0">₹{Number(value).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        💡 <span className="font-semibold">Tip:</span> You can set a custom fee different from the standard fee above. 
                        The system will automatically calculate the discount or additional amount.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                            if (studentFeeDetails && studentFeeDetails.breakdown && studentFeeDetails.totalFee > 0) {
                          const breakdownArray = Object.entries(studentFeeDetails.breakdown).map(([key, value]) => ({
                            key,
                            value: value.toString()
                          }));
                          setBreakdown(breakdownArray);
                          setForm(prev => ({ ...prev, totalFee: studentFeeDetails.totalFee?.toString() || "" }));
                          toast.success("Fee breakdown auto-filled from standard structure!");
                        }
                      }}
                      className="mt-3 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Use Standard Fee Structure
                    </button>
                  </div>
                    );
                  })()
                ) : (() => {
                  const classInfo = getStudentClassForAcademicYear(selectedStudent, form.academicYear);
                  const currentAcademicYear = getCurrentAcademicYear();
                  // Compare academic years by extracting start year
                  const targetStartYear = parseInt(form.academicYear?.split('-')[0]) || 0;
                  const currentStartYear = parseInt(currentAcademicYear?.split('-')[0]) || 0;
                  const isFutureYear = targetStartYear > currentStartYear;
                  
                  // Check if student is not in this academic year
                  if (!classInfo.isInAcademicYear && isFutureYear) {
                    return (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-orange-900 mb-2">Student Not Promoted Yet</h4>
                              <p className="text-sm text-orange-800 mb-2">
                                This student has not been promoted to academic year <span className="font-bold">{form.academicYear}</span> yet.
                              </p>
                              <p className="text-sm text-orange-700">
                                The student is currently in <span className="font-semibold">{selectedStudent.class}-{selectedStudent.section}</span> for academic year <span className="font-semibold">{currentAcademicYear}</span>.
                                They need to be promoted first before you can assign a custom fee for {form.academicYear}.
                              </p>
                              <div className="mt-3 p-2 bg-white rounded-lg border border-orange-200">
                                <p className="text-xs text-orange-700">
                                  💡 <span className="font-semibold">Note:</span> Please promote the student first in the "Student Promotion" section, then you can assign a custom fee for the new academic year.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Show "No standard fee structure found" message
                  const displayClass = classInfo.displayClass || selectedStudent.class;
                  const displaySection = classInfo.displaySection || selectedStudent.section;
                  
                  return (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-900 mb-2">Cannot Create Custom Fee</h4>
                            <p className="text-sm text-red-800 mb-2">
                              There is no standard fee structure available, so we can't create custom fee for this student ({displayClass}-{displaySection}) with ({form.academicYear}).
                            </p>
                            <p className="text-sm text-red-700">
                              Custom fees can only be created when a standard fee structure exists and has a fee amount greater than ₹0.
                            </p>
                            <div className="mt-3 p-2 bg-white rounded-lg border border-red-200">
                              <p className="text-xs text-red-700">
                                💡 <span className="font-semibold">Note:</span> Please create a standard fee structure first for {displayClass}-{displaySection} in academic year {form.academicYear}, then you can create a custom fee.
                          </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Existing Custom Fee Display - Only show if student is in this academic year */}
                {(() => {
                  const classInfo = getStudentClassForAcademicYear(selectedStudent, form.academicYear);
                  if (!classInfo.isInAcademicYear) {
                    return null; // Don't show custom fee section if student is not in this year
                  }
                  
                  // Show custom fee section
                  if (loadingCustomFee) {
                    return (
                      <div className="mt-4 pt-4 border-t border-green-200 flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                        <span className="text-sm text-gray-600">Checking for existing custom fee...</span>
                      </div>
                    );
                  }
                  
                  if (existingCustomFee) {
                    return (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                        <h4 className="font-semibold text-gray-900">Existing Custom Fee</h4>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                          Already Assigned
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEditClick(existingCustomFee)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                        disabled={existingCustomFee.totalPaid > 0}
                        title={existingCustomFee.totalPaid > 0 ? "Cannot edit - payments already made" : "Edit Custom Fee"}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>
                    
                    {existingCustomFee.totalPaid > 0 && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-800">
                          ⚠️ <span className="font-semibold">Cannot edit:</span> Student has already paid ₹{existingCustomFee.totalPaid?.toLocaleString('en-IN') || "0"}
                        </p>
                      </div>
                    )}

                    <div className={`grid gap-4 mb-4 ${studentFeeDetails ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <div className="text-xs text-gray-500 mb-1">Custom Fee Amount</div>
                        <div className="text-2xl font-bold text-orange-600">
                          ₹{existingCustomFee.totalFee?.toLocaleString('en-IN') || "0"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {existingCustomFee.frequency || "N/A"} payment
                        </div>
                      </div>
                      {studentFeeDetails ? (
                        <>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Standard Fee</div>
                            <div className="text-xl font-bold text-gray-700">
                              ₹{studentFeeDetails.totalFee?.toLocaleString('en-IN') || "0"}
                            </div>
                          </div>
                          <div className={`bg-white rounded-lg p-4 border ${
                            existingCustomFee.totalFee < studentFeeDetails.totalFee
                              ? 'border-green-300 bg-green-50/50'
                              : existingCustomFee.totalFee > studentFeeDetails.totalFee
                              ? 'border-red-300 bg-red-50/50'
                              : 'border-gray-200'
                          }`}>
                            <div className="text-xs text-gray-500 mb-1">
                              {existingCustomFee.totalFee < studentFeeDetails.totalFee ? 'Discount' : existingCustomFee.totalFee > studentFeeDetails.totalFee ? 'Additional Fee' : 'Same as Standard'}
                            </div>
                            <div className={`text-xl font-bold ${
                              existingCustomFee.totalFee < studentFeeDetails.totalFee
                                ? 'text-green-600'
                                : existingCustomFee.totalFee > studentFeeDetails.totalFee
                                ? 'text-red-600'
                                : 'text-gray-700'
                            }`}>
                              {existingCustomFee.totalFee !== studentFeeDetails.totalFee ? (
                                <>
                                  {existingCustomFee.totalFee < studentFeeDetails.totalFee ? '−' : '+'}
                                  ₹{Math.abs(existingCustomFee.totalFee - studentFeeDetails.totalFee).toLocaleString('en-IN')}
                                </>
                              ) : (
                                'No difference'
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Standard Fee</div>
                          <div className="text-lg font-semibold text-gray-400">
                            Not Available
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            No standard fee structure for this class
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                      <div className="text-xs text-gray-500 mb-2">Custom Fee Breakdown</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {Object.entries(existingCustomFee.breakdown || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-semibold text-gray-900">₹{Number(value).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {existingCustomFee.reason && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                        <div className="text-xs text-gray-500 mb-1">Reason:</div>
                        <div className="text-sm text-gray-700">{existingCustomFee.reason}</div>
                      </div>
                    )}

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        ℹ️ <span className="font-semibold">Note:</span> This student already has a custom fee assigned. 
                        {existingCustomFee.totalPaid > 0 
                          ? " You cannot modify it as payments have been made. View it in the 'View Custom Fees' tab to see payment details."
                          : " You can edit it using the 'Edit' button above."}
                      </p>
                    </div>
                  </div>
                    );
                  }
                  
                  return null; // No existing custom fee
                })()}
              </motion.div>
            )}
          </div>

          {/* Academic Year */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Academic Year
            </label>
            <div className="relative">
              <select
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white pr-8 sm:pr-10 text-sm sm:text-base"
              required
              >
                {academicYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year} {year === getCurrentAcademicYear() ? '(Current)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current Academic Year: <span className="font-semibold">{getCurrentAcademicYear()}</span>
            </p>
          </div>
   {/* Total Fee Input */}
   <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                Total Fee Amount
              </label>
              <input
                name="totalFee"
                type="number"
                value={form.totalFee}
                onChange={handleChange}
                placeholder="Enter total fee amount"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                min="0"
                step="0.01"
                required
              />
            </div>
          {/* Fee Breakdown */}
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Fee Breakdown
            </label>
            
            <div className="space-y-2 sm:space-y-3">
              {breakdown.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center"
                >
                  <input
                    value={item.key}
                    onChange={(e) => handleBreakdownChange(idx, "key", e.target.value)}
                    placeholder="Component (e.g., Tuition)"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    required
                  />
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => handleBreakdownChange(idx, "value", e.target.value)}
                      placeholder="Amount"
                      className="flex-1 sm:w-32 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                      required
                      min="0"
                      step="0.01"
                    />
                    {breakdown.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBreakdownField(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              
              <button
                type="button"
                onClick={addBreakdownField}
                className="flex items-center gap-1 sm:gap-2 text-primary hover:text-primary-dark font-medium transition-colors text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                Add Fee Component
              </button>
            </div>
            
         
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                Payment Frequency
              </label>
              <select
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              >
                <option value="annually">Annually</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                Due Date
              </label>
              <input
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                Late Fee Per Day (₹)
              </label>
              <input
                name="lateFeePerDay"
                type="number"
                value={form.lateFeePerDay}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                Reason (Optional)
              </label>
              <input
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Reason for custom fee..."
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 sm:pt-6">
            {(() => {
              // Check if standard fee exists and is greater than 0
              const hasValidStandardFee = studentFeeDetails && 
                                         studentFeeDetails.isInAcademicYear !== false && 
                                         studentFeeDetails.totalFee !== null &&
                                         studentFeeDetails.totalFee !== undefined &&
                                         studentFeeDetails.totalFee > 0;
              
              // Check if custom fee already exists for this student and academic year
              const hasExistingCustomFee = existingCustomFee !== null && existingCustomFee !== undefined;
              
              const isDisabled = loading || !selectedStudent || !hasValidStandardFee || hasExistingCustomFee;
              
              // Determine the tooltip message
              let tooltipMessage = "";
              if (!selectedStudent) {
                tooltipMessage = "Please select a student";
              } else if (!hasValidStandardFee) {
                tooltipMessage = "Standard fee must be greater than ₹0 to create custom fee";
              } else if (hasExistingCustomFee) {
                tooltipMessage = `Custom fee already exists for this student in academic year ${form.academicYear}. Please edit the existing fee instead.`;
              }
              
              return (
            <motion.button
              type="submit"
                  disabled={isDisabled}
              className={`px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 sm:gap-3 text-sm sm:text-base ${
                    isDisabled
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:scale-105'
              }`}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  title={tooltipMessage}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden sm:inline">Creating Custom Fee...</span>
                  <span className="sm:hidden">Creating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Create Custom Fee</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </motion.button>
              );
            })()}
          </div>
        </form>
        )}

        {/* View Tab Content */}
        {activeTab === "view" && (
          <div className="space-y-6">
            {customFeeLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-600">Loading custom fees...</span>
              </div>
            ) : customFees.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Custom Fees Found</h3>
                <p className="text-gray-600">No students have custom fees assigned yet.</p>
              </div>
            ) : (
              <>
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, ID, class..."
                        value={searchFilter}
                        onChange={(e) => {
                          setSearchFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    {/* Academic Year Filter */}
                    <div className="relative w-full sm:w-64">
                      <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <select
                        value={academicYearFilter}
                        onChange={(e) => {
                          setAcademicYearFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-8 sm:pl-10 pr-7 sm:pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                      >
                        <option value="">All Academic Years</option>
                        {academicYearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Status Filter */}
                    <div className="relative w-full sm:w-auto">
                      <Filter className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full sm:w-auto pl-8 sm:pl-10 pr-7 sm:pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                      >
                        <option value="all">All Status</option>
                        <option value="paid">Fully Paid</option>
                        <option value="partial">Partially Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filtered and Paginated Results */}
                {(() => {
                  // Filter custom fees
                  const filteredFees = customFees.filter((customFee) => {
                    const student = customFee.student;
                    if (!student) return false;

                    // Search filter
                    const searchLower = searchFilter.toLowerCase();
                    const displayClass = customFee.displayClass || student.class;
                    const displaySection = customFee.displaySection || student.section;
                    const matchesSearch = 
                      !searchFilter ||
                      student.name?.toLowerCase().includes(searchLower) ||
                      student.studentId?.toLowerCase().includes(searchLower) ||
                      `${student.class}-${student.section}`.toLowerCase().includes(searchLower) ||
                      `${displayClass}-${displaySection}`.toLowerCase().includes(searchLower) ||
                      customFee.academicYear?.toLowerCase().includes(searchLower);

                    // Academic Year filter
                    const matchesAcademicYear = 
                      !academicYearFilter || 
                      customFee.academicYear === academicYearFilter;

                    // Status filter
                    let matchesStatus = true;
                    if (statusFilter === "paid") {
                      matchesStatus = customFee.remaining === 0;
                    } else if (statusFilter === "partial") {
                      matchesStatus = customFee.totalPaid > 0 && customFee.remaining > 0;
                    } else if (statusFilter === "unpaid") {
                      matchesStatus = customFee.totalPaid === 0;
                    }

                    return matchesSearch && matchesAcademicYear && matchesStatus;
                  });

                  // Pagination
                  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginatedFees = filteredFees.slice(startIndex, startIndex + itemsPerPage);

                  return (
                    <>
                      {/* Results Count */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredFees.length)} of {filteredFees.length} custom fees
                        </p>
                        {(filteredFees.length !== customFees.length || academicYearFilter) && (
                          <button
                            onClick={() => {
                              setSearchFilter("");
                              setStatusFilter("all");
                              setAcademicYearFilter("");
                              setCurrentPage(1);
                            }}
                            className="text-sm text-primary hover:text-primary-dark font-medium"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>

                      {/* Custom Fees List */}
                      <div className="space-y-3">
                        {paginatedFees.map((customFee) => {
                          const student = customFee.student;
                          if (!student) return null;

                          // Convert breakdown Map to object if needed
                          const breakdown = customFee.breakdown instanceof Map 
                            ? Object.fromEntries(customFee.breakdown)
                            : customFee.breakdown || {};

                          const isExpanded = expandedFees[customFee._id];
                          
                          return (
                            <motion.div
                              key={customFee._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                              {/* Compact Summary Header */}
                              <div 
                                className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedFees(prev => ({
                                  ...prev,
                                  [customFee._id]: !prev[customFee._id]
                                }))}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                                    {/* Student Info */}
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Student</div>
                                      <div className="font-semibold text-gray-900">{student.name || "N/A"}</div>
                                      <div className="text-xs text-gray-600">ID: {student.studentId || "N/A"}</div>
                                    </div>
                                    {/* Class & Section */}
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Class & Section</div>
                                      <div className="font-semibold text-gray-900">
                                        {customFee.displayClass || student.class || "N/A"} - {customFee.displaySection || student.section || "N/A"}
                                      </div>
                                      <div className="text-xs text-gray-600">{customFee.academicYear || "N/A"}</div>
                                    </div>
                                    {/* Custom Fee */}
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Custom Fee</div>
                                      <div className="font-bold text-primary">
                                        ₹{customFee.totalFee?.toLocaleString('en-IN') || "0"}
                                      </div>
                                      {customFee.actualFee !== null && customFee.actualFee !== undefined && (
                                        <div className="text-xs text-gray-500">
                                          Standard: ₹{customFee.actualFee?.toLocaleString('en-IN')}
                                        </div>
                                      )}
                                    </div>
                                    {/* Payment Status */}
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Payment Status</div>
                                      <div className="flex items-center gap-2">
                                        <div className={`text-lg font-bold ${
                                          customFee.remaining === 0 ? 'text-green-600' : 
                                          customFee.totalPaid > 0 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                          ₹{customFee.totalPaid?.toLocaleString('en-IN') || "0"}
                                        </div>
                                        <span className="text-xs text-gray-500">/ ₹{customFee.totalFee?.toLocaleString('en-IN') || "0"}</span>
                                      </div>
                                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                        customFee.remaining === 0 
                                          ? 'bg-green-100 text-green-800'
                                          : customFee.totalPaid > 0
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {customFee.remaining === 0 
                                          ? '✓ Paid'
                                          : customFee.totalPaid > 0
                                          ? '⏳ Partial'
                                          : '⚠️ Unpaid'}
                                      </div>
                                    </div>
                                    {/* Progress */}
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Progress</div>
                                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${customFee.percentPaid || 0}%` }}
                                          transition={{ duration: 0.5 }}
                                          className={`h-full rounded-full ${
                                            customFee.percentPaid === 100 
                                              ? 'bg-green-500'
                                              : customFee.percentPaid > 0
                                              ? 'bg-yellow-500'
                                              : 'bg-gray-300'
                                          }`}
                                        />
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">{customFee.percentPaid || 0}%</div>
                                    </div>
                                  </div>
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 sm:ml-4">
                                    {/* Edit Button - Only show if no payments made */}
                                    {customFee.totalPaid === 0 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditClick(customFee);
                                        }}
                                        className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        title="Edit Custom Fee"
                                      >
                                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      </button>
                                    )}
                                    {/* Expand/Collapse Button */}
                                    <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="border-t border-gray-200 p-6 space-y-6"
                                >
                                  {/* Fee Comparison Section */}
                                  {customFee.actualFee !== null && customFee.actualFee !== undefined && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Fee Comparison</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="text-sm text-gray-600 mb-1">Actual Fee (Standard)</div>
                              <div className="text-2xl font-bold text-gray-700">
                                ₹{customFee.actualFee?.toLocaleString('en-IN') || "0"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Standard fee for this class</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-primary/30">
                              <div className="text-sm text-gray-600 mb-1">Custom Fee</div>
                              <div className="text-2xl font-bold text-primary">
                                ₹{customFee.totalFee?.toLocaleString('en-IN') || "0"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 capitalize">
                                {customFee.frequency || "N/A"} payment
                              </div>
                            </div>
                            <div className={`bg-white rounded-lg p-4 border ${
                              customFee.hasDiscount 
                                ? 'border-green-300 bg-green-50/50' 
                                : customFee.discount !== null && customFee.discount < 0
                                ? 'border-red-300 bg-red-50/50'
                                : 'border-gray-200'
                            }`}>
                              <div className="text-sm text-gray-600 mb-1">
                                {customFee.hasDiscount ? 'Discount' : customFee.discount !== null && customFee.discount < 0 ? 'Additional Fee' : 'Difference'}
                              </div>
                              <div className={`text-2xl font-bold ${
                                customFee.hasDiscount 
                                  ? 'text-green-600' 
                                  : customFee.discount !== null && customFee.discount < 0
                                  ? 'text-red-600'
                                  : 'text-gray-700'
                              }`}>
                                {customFee.discount !== null ? (
                                  <>
                                    {customFee.hasDiscount ? '−' : customFee.discount < 0 ? '+' : ''}
                                    ₹{Math.abs(customFee.discount).toLocaleString('en-IN')}
                                  </>
                                ) : (
                                  'N/A'
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {customFee.hasDiscount 
                                  ? 'Student saved this amount' 
                                  : customFee.discount !== null && customFee.discount < 0
                                  ? 'Additional amount charged'
                                  : 'No standard fee found'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Status Summary */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Custom Fee Amount</div>
                            <div className="text-2xl font-bold text-primary">
                              ₹{customFee.totalFee?.toLocaleString('en-IN') || "0"}
                            </div>
                            <div className="text-xs text-gray-500 capitalize mt-1">
                              {customFee.frequency || "N/A"} payment
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Total Paid</div>
                            <div className="text-2xl font-bold text-green-600">
                              ₹{customFee.totalPaid?.toLocaleString('en-IN') || "0"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {customFee.percentPaid || 0}% paid
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Remaining</div>
                            <div className={`text-2xl font-bold ${customFee.remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                              ₹{customFee.remaining?.toLocaleString('en-IN') || "0"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {customFee.remaining > 0 ? 'Pending' : 'Fully Paid'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Assigned Date</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {customFee.assignedDate 
                                ? format(new Date(customFee.assignedDate), "dd MMM yyyy")
                                : "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {customFee.assignedDate 
                                ? format(new Date(customFee.assignedDate), "hh:mm a")
                                : ""}
                            </div>
                          </div>
                        </div>
                        
                        {/* Payment Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Payment Progress</span>
                            <span className="font-semibold">{customFee.percentPaid || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${customFee.percentPaid || 0}%` }}
                              transition={{ duration: 0.5 }}
                              className={`h-full rounded-full ${
                                customFee.percentPaid === 100 
                                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                                  : customFee.percentPaid > 0
                                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                  : 'bg-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Student & Fee Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Student Name</div>
                          <div className="font-semibold text-gray-900">{student.name || "N/A"}</div>
                          <div className="text-sm text-gray-600">ID: {student.studentId || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Class & Section</div>
                          <div className="font-semibold text-gray-900">
                            {customFee.displayClass || student.class || "N/A"} - {customFee.displaySection || student.section || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600">Academic Year: {customFee.academicYear || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Due Date</div>
                          <div className="font-semibold text-gray-900">
                            {customFee.dueDate 
                              ? format(new Date(customFee.dueDate), "dd MMM yyyy")
                              : "Not set"}
                          </div>
                          {customFee.lateFeePerDay > 0 && (
                            <div className="text-sm text-orange-600">
                              Late fee: ₹{customFee.lateFeePerDay}/day
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Payment Status</div>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            customFee.remaining === 0 
                              ? 'bg-green-100 text-green-800'
                              : customFee.totalPaid > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {customFee.remaining === 0 
                              ? '✓ Fully Paid'
                              : customFee.totalPaid > 0
                              ? '⏳ Partially Paid'
                              : '⚠️ Unpaid'}
                          </div>
                        </div>
                      </div>

                      {/* Fee Breakdown Comparison */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm font-semibold text-gray-700 mb-4">Fee Breakdown:</div>
                        
                        {/* Standard Fee Breakdown (if available) */}
                        {customFee.standardFee && customFee.standardFee.breakdown && (
                          <div className="mb-4">
                            <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              Standard Fee Breakdown
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {Object.entries(customFee.standardFee.breakdown).map(([key, value]) => (
                                <div key={key} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                  <div className="text-xs text-gray-600 mb-1">{key}</div>
                                  <div className="font-semibold text-gray-700">₹{Number(value).toLocaleString('en-IN')}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Custom Fee Breakdown */}
                        {Object.keys(breakdown).length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Custom Fee Breakdown
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {Object.entries(breakdown).map(([key, value]) => {
                                // Find corresponding standard fee component for comparison
                                const standardValue = customFee.standardFee?.breakdown?.[key];
                                const difference = standardValue ? Number(value) - Number(standardValue) : null;
                                
                                return (
                                  <div key={key} className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                                    <div className="text-xs text-gray-600 mb-1">{key}</div>
                                    <div className="font-semibold text-primary">₹{Number(value).toLocaleString('en-IN')}</div>
                                    {difference !== null && difference !== 0 && (
                                      <div className={`text-xs mt-1 ${
                                        difference < 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {difference < 0 ? '↓' : '↑'} ₹{Math.abs(difference).toLocaleString('en-IN')} 
                                        {difference < 0 ? ' discount' : ' additional'}
                                      </div>
                                    )}
                                    {standardValue && difference === 0 && (
                                      <div className="text-xs text-gray-500 mt-1">Same as standard</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reason */}
                      {customFee.reason && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm font-semibold text-gray-700 mb-1">Reason:</div>
                          <div className="text-sm text-gray-600">{customFee.reason}</div>
                        </div>
                      )}

                      {/* Parent Info */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-5 h-5 text-primary" />
                          <h3 className="text-sm font-semibold text-gray-700">Parent Information</h3>
                        </div>
                        {(() => {
                          // Check if parent exists (could be ObjectId or populated object)
                          const parent = student?.parent;
                          const hasParent = parent && (typeof parent === 'object');
                          const parentName = hasParent && parent.name ? parent.name : null;
                          const parentEmail = hasParent && parent.email ? parent.email : null;
                          const parentPhone = hasParent && parent.phone ? parent.phone : null;
                          
                          if (hasParent && (parentName || parentEmail || parentPhone)) {
                            return (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {parentName && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Parent Name</div>
                                      <div className="font-semibold text-gray-900">
                                        {parentName}
                                      </div>
                                    </div>
                                  )}
                                  {parentEmail && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Email</div>
                                      <div className="font-semibold text-gray-900 break-all">
                                        {parentEmail}
                                      </div>
                                    </div>
                                  )}
                                  {parentPhone && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Phone</div>
                                      <div className="font-semibold text-gray-900">
                                        {parentPhone}
                                      </div>
                                      <a
                                        href={`https://wa.me/${parentPhone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors"
                                      >
                                        <MessageCircle className="w-3 h-3" />
                                        WhatsApp
                                      </a>
                                    </div>
                                  )}
                                </div>
                                {!parentEmail && !parentPhone && parentName && (
                                  <div className="text-sm text-gray-500 mt-2">
                                    Contact information not available
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="text-sm text-gray-500 italic">
                                  {parent && typeof parent === 'object' && !parent.name && !parent.email && !parent.phone
                                    ? "Parent information exists but contact details are missing"
                                    : "Parent information not available for this student"}
                                </div>
                                {parent && typeof parent === 'object' && (
                                  <div className="text-xs text-gray-400 mt-2">
                                    Debug: Parent object exists but no name/email/phone found
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })()}
                      </div>

                      {/* Payment History */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              Payment History ({customFee.paymentHistory?.length || 0})
                            </h3>
                          </div>
                          {/* Edit Button - Only show if no payments made */}
                          {customFee.totalPaid === 0 && (
                            <button
                              onClick={() => handleEditClick(customFee)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              title="Edit Custom Fee"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Fee
                            </button>
                          )}
                        </div>

                        {customFee.paymentHistory && customFee.paymentHistory.length > 0 ? (
                          <div className="space-y-3">
                            {customFee.paymentHistory.map((payment) => (
                              <motion.div
                                key={payment._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary/30 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                                        payment.status === 'paid' || payment.status === 'success'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {payment.status === 'paid' || payment.status === 'success' ? '✓ Paid' : payment.status}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {payment.paidAt 
                                          ? format(new Date(payment.paidAt), "dd MMM yyyy, hh:mm a")
                                          : "N/A"}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                      <div>
                                        <div className="text-gray-500">Amount Paid</div>
                                        <div className="font-semibold text-gray-900">
                                          ₹{payment.amountPaid?.toLocaleString('en-IN') || "0"}
                                        </div>
                                      </div>
                                      {payment.lateFee > 0 && (
                                        <div>
                                          <div className="text-gray-500">Late Fee</div>
                                          <div className="font-semibold text-orange-600">
                                            ₹{payment.lateFee.toLocaleString('en-IN')}
                                          </div>
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-gray-500">Payment Method</div>
                                        <div className="font-semibold text-gray-900 capitalize flex items-center gap-1">
                                          {payment.paymentMethod === 'online' ? (
                                            <CreditCard className="w-3 h-3" />
                                          ) : (
                                            <DollarSign className="w-3 h-3" />
                                          )}
                                          {payment.paymentMethod || 'Online'}
                                        </div>
                                      </div>
                                      {payment.verifiedBy && (
                                        <div>
                                          <div className="text-gray-500">Verified By</div>
                                          <div className="font-semibold text-gray-900">
                                            {payment.verifiedBy.name || 'Admin'}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {payment.razorpay?.paymentId && (
                                      <div className="mt-2 text-xs text-gray-500">
                                        Payment ID: {payment.razorpay.paymentId}
                                      </div>
                                    )}
                                  </div>
                                  {payment.receiptUrl && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          toast.loading("Loading receipt...", { id: 'receiptLoad' });
                                          let receiptUrl = payment.receiptUrl;
                                          
                                          // If it's already a full URL (Cloudinary), open directly
                                          if (receiptUrl.startsWith('http://') || receiptUrl.startsWith('https://')) {
                                            if (receiptUrl.includes('cloudinary.com')) {
                                              window.open(receiptUrl, '_blank');
                                              toast.dismiss('receiptLoad');
                                              return;
                                            }
                                            // If it's a full HTTP URL but not Cloudinary, try to fetch it
                                            const response = await axios.get(receiptUrl, {
                                              responseType: 'blob',
                                              withCredentials: true
                                            });
                                            const blob = new Blob([response.data], { type: 'application/pdf' });
                                            const url = window.URL.createObjectURL(blob);
                                            window.open(url, '_blank');
                                            setTimeout(() => window.URL.revokeObjectURL(url), 100);
                                            toast.dismiss('receiptLoad');
                                            toast.success("Receipt opened successfully");
                                            return;
                                          }
                                          
                                          // Handle API endpoint - construct full URL
                                          // receiptUrl format: /api/payment/receipt/:paymentId
                                          const apiBase = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
                                          let finalUrl = '';
                                          
                                          if (receiptUrl.startsWith('/api/')) {
                                            // Already has /api/ prefix
                                            finalUrl = `${apiBase}${receiptUrl}`;
                                          } else if (receiptUrl.startsWith('/')) {
                                            // Starts with / but no /api
                                            finalUrl = `${apiBase}/api${receiptUrl}`;
                                          } else {
                                            // Just payment ID
                                            finalUrl = `${apiBase}/api/payment/receipt/${receiptUrl}`;
                                          }
                                          
                                          console.log('Fetching receipt from:', finalUrl);
                                          
                                          // Use axios for consistency and better error handling
                                          const response = await axios.get(finalUrl, {
                                            responseType: 'blob',
                                            withCredentials: true,
                                            headers: {
                                              'Accept': 'application/pdf'
                                            }
                                          });
                                          
                                          // Create blob URL and open
                                          const blob = new Blob([response.data], { type: 'application/pdf' });
                                          const url = window.URL.createObjectURL(blob);
                                          window.open(url, '_blank');
                                          
                                          // Clean up after a delay
                                          setTimeout(() => {
                                            window.URL.revokeObjectURL(url);
                                          }, 100);
                                          
                                          toast.dismiss('receiptLoad');
                                          toast.success("Receipt opened successfully");
                                        } catch (error) {
                                          console.error('Error viewing receipt:', error);
                                          console.error('Receipt URL was:', payment.receiptUrl);
                                          toast.dismiss('receiptLoad');
                                          
                                          // More detailed error message
                                          if (error.response) {
                                            if (error.response.status === 404) {
                                              toast.error('Receipt not found. It may not have been generated yet.');
                                            } else if (error.response.status === 401 || error.response.status === 403) {
                                              toast.error('You do not have permission to view this receipt.');
                                            } else {
                                              toast.error(`Failed to load receipt: ${error.response.statusText || 'Server error'}`);
                                            }
                                          } else if (error.request) {
                                            toast.error('Network error. Please check your connection and try again.');
                                          } else {
                                            toast.error('Failed to view receipt. Please try again.');
                                          }
                                        }
                                      }}
                                      className="ml-4 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                                      title="View Receipt"
                                    >
                                      <Receipt className="w-4 h-4" />
                                      <span className="text-xs">Receipt</span>
                                    </button>
                                  )}
                                </div>
      </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-600 text-sm">No payments made yet</p>
                          </div>
                        )}
                      </div>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                              // Show first page, last page, current page, and pages around current
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 border rounded-lg transition-colors ${
                                      currentPage === page
                                        ? 'bg-primary text-white border-primary'
                                        : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                              ) {
                                return <span key={page} className="px-2">...</span>;
                              }
                              return null;
                            })}
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Edit Custom Fee Modal */}
      {showEditModal && editingFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg sm:rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-1 sm:gap-2">
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Edit Custom Fee - {editingFee.student?.name || 'N/A'}</span>
                <span className="sm:hidden">Edit Fee</span>
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingFee(null);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 md:p-6">
              {/* Warning if payments exist */}
              {editingFee.totalPaid > 0 && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Cannot Edit - Payments Already Made</p>
                      <p className="text-xs sm:text-sm">Student has already paid ₹{editingFee.totalPaid.toLocaleString()}. Custom fees with payments cannot be modified.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Before/After Comparison Preview */}
              {editingFee && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Fee Comparison (Before vs After)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Current Fee</div>
                      <div className="text-2xl font-bold text-gray-700">
                        ₹{editingFee.totalFee?.toLocaleString('en-IN') || "0"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Before changes</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-primary/30">
                      <div className="text-sm text-gray-600 mb-1">New Fee</div>
                      <div className="text-2xl font-bold text-primary">
                        ₹{parseFloat(editForm.totalFee || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">After changes</div>
                    </div>
                    <div className={`bg-white rounded-lg p-4 border ${
                      parseFloat(editForm.totalFee || 0) < editingFee.totalFee
                        ? 'border-green-300 bg-green-50/50'
                        : parseFloat(editForm.totalFee || 0) > editingFee.totalFee
                        ? 'border-red-300 bg-red-50/50'
                        : 'border-gray-200'
                    }`}>
                      <div className="text-sm text-gray-600 mb-1">Difference</div>
                      <div className={`text-2xl font-bold flex items-center gap-1 ${
                        parseFloat(editForm.totalFee || 0) < editingFee.totalFee
                          ? 'text-green-600'
                          : parseFloat(editForm.totalFee || 0) > editingFee.totalFee
                          ? 'text-red-600'
                          : 'text-gray-700'
                      }`}>
                        {parseFloat(editForm.totalFee || 0) !== editingFee.totalFee && (
                          parseFloat(editForm.totalFee || 0) < editingFee.totalFee ? (
                            <TrendingDown className="w-5 h-5" />
                          ) : (
                            <TrendingUp className="w-5 h-5" />
                          )
                        )}
                        {parseFloat(editForm.totalFee || 0) !== editingFee.totalFee ? (
                          <>
                            {parseFloat(editForm.totalFee || 0) < editingFee.totalFee ? '−' : '+'}
                            ₹{Math.abs(parseFloat(editForm.totalFee || 0) - editingFee.totalFee).toLocaleString('en-IN')}
                          </>
                        ) : (
                          'No change'
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {parseFloat(editForm.totalFee || 0) < editingFee.totalFee
                          ? 'Discount increased'
                          : parseFloat(editForm.totalFee || 0) > editingFee.totalFee
                          ? 'Fee increased'
                          : 'No change'}
                      </div>
                    </div>
                  </div>

                  {/* Standard Fee Comparison */}
                  {editingFee.actualFee !== null && editingFee.actualFee !== undefined && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Standard Fee</div>
                          <div className="text-lg font-bold text-gray-700">
                            ₹{editingFee.actualFee.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-primary/30">
                          <div className="text-xs text-gray-600 mb-1">
                            {parseFloat(editForm.totalFee || 0) < editingFee.actualFee ? 'Discount' : 'Additional Fee'}
                          </div>
                          <div className={`text-lg font-bold ${
                            parseFloat(editForm.totalFee || 0) < editingFee.actualFee
                              ? 'text-green-600'
                              : parseFloat(editForm.totalFee || 0) > editingFee.actualFee
                              ? 'text-red-600'
                              : 'text-gray-700'
                          }`}>
                            {parseFloat(editForm.totalFee || 0) !== editingFee.actualFee ? (
                              <>
                                {parseFloat(editForm.totalFee || 0) < editingFee.actualFee ? '−' : '+'}
                                ₹{Math.abs(editingFee.actualFee - parseFloat(editForm.totalFee || 0)).toLocaleString('en-IN')}
                              </>
                            ) : (
                              'Same as standard'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Edit Form */}
              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Student Info (Read-only) */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Student Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-900 ml-2">{editingFee.student?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <span className="font-semibold text-gray-900 ml-2">{editingFee.student?.studentId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Class:</span>
                      <span className="font-semibold text-gray-900 ml-2">{editingFee.displayClass || editingFee.student?.class || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Section:</span>
                      <span className="font-semibold text-gray-900 ml-2">{editingFee.displaySection || editingFee.student?.section || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Academic Year:</span>
                      <span className="font-semibold text-gray-900 ml-2">{editingFee.academicYear || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Total Fee */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Total Fee Amount
                  </label>
                  <input
                    name="totalFee"
                    type="number"
                    value={editForm.totalFee}
                    onChange={(e) => setEditForm({ ...editForm, totalFee: e.target.value })}
                    placeholder="Enter total fee amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Fee Breakdown */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Fee Breakdown
                  </label>
                  
                  <div className="space-y-3">
                    {editBreakdown.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 items-center"
                      >
                        <input
                          value={item.key}
                          onChange={(e) => handleEditBreakdownChange(idx, "key", e.target.value)}
                          placeholder="Component (e.g., Tuition, Transport)"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => handleEditBreakdownChange(idx, "value", e.target.value)}
                          placeholder="Amount"
                          className="w-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                          min="0"
                          step="0.01"
                        />
                        {editBreakdown.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditBreakdownField(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addEditBreakdownField}
                      className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Fee Component
                    </button>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Payment Frequency
                    </label>
                    <select
                      name="frequency"
                      value={editForm.frequency}
                      onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="annually">Annually</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Due Date
                    </label>
                    <input
                      name="dueDate"
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Late Fee Per Day (₹)
                    </label>
                    <input
                      name="lateFeePerDay"
                      type="number"
                      value={editForm.lateFeePerDay}
                      onChange={(e) => setEditForm({ ...editForm, lateFeePerDay: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Reason (Optional)
                    </label>
                    <input
                      name="reason"
                      value={editForm.reason}
                      onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                      placeholder="Reason for custom fee..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingFee(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading || editingFee.totalPaid > 0}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      loading || editingFee.totalPaid > 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:scale-105'
                    }`}
                    whileHover={!loading && editingFee.totalPaid === 0 ? { scale: 1.02 } : {}}
                    whileTap={!loading && editingFee.totalPaid === 0 ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Update Custom Fee
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CustomFeeForm;