import { useState, useEffect } from "react";
import { useStudentStore } from "../stores/useStudentStore";
import { useTeacherStore } from "../stores/useTeacherStore";
import { useClassesAndSections } from "../../hooks/useClassesAndSections";
import { Download, Printer, Copy, Eye, EyeOff, Key, RefreshCw, Users, GraduationCap } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const CredentialsManagement = () => {
  const { students, fetchStudents, pagination: studentPagination } = useStudentStore();
  const { teachers, fetchTeachers, pagination: teacherPagination } = useTeacherStore();
  const { classes, sections, loading: classesLoading, error: classesError } = useClassesAndSections();
  const [activeTab, setActiveTab] = useState("students");
  const [showPasswords, setShowPasswords] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [resetModal, setResetModal] = useState({ isOpen: false, user: null, userType: null });
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Sort classes: Nursery first, then LKG, then numeric (1, 2, 3...)
  const sortClasses = (classes) => {
    if (!classes || classes.length === 0) return [];
    
    // Define the order for special classes
    const classOrder = {
      'Nursery': 1,
      'LKG': 2,
      'UKG': 3, // In case UKG exists
    };
    
    return [...classes].sort((a, b) => {
      // Get order values (undefined if not in special list)
      const aOrder = classOrder[a];
      const bOrder = classOrder[b];
      
      // If both are special classes, use their defined order
      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      
      // If only a is special, it comes first
      if (aOrder !== undefined) {
        return -1;
      }
      
      // If only b is special, it comes first
      if (bOrder !== undefined) {
        return 1;
      }
      
      // Check if both are numeric
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      const aIsNum = !isNaN(aNum) && a.toString() === aNum.toString();
      const bIsNum = !isNaN(bNum) && b.toString() === bNum.toString();
      
      // If both are numeric, sort numerically
      if (aIsNum && bIsNum) {
        return aNum - bNum;
      }
      
      // If only a is numeric, it comes after special classes but before other text
      if (aIsNum && !bIsNum) {
        return -1;
      }
      
      // If only b is numeric, it comes after special classes but before other text
      if (!aIsNum && bIsNum) {
        return 1;
      }
      
      // If both are non-numeric and not special, sort alphabetically
      return a.localeCompare(b);
    });
  };

  // Sort classes for display
  const sortedClasses = sortClasses(classes || []);

  useEffect(() => {
    if (activeTab === "students") {
      loadStudents();
    } else if (activeTab === "teachers") {
      loadTeachers();
    }
  }, [currentPage, filterClass, filterSection, filterSubject, activeTab]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: 10,
        ...(filterClass && { class: filterClass }),
        ...(filterSection && { section: filterSection })
      };
      await fetchStudents(filters);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: 10,
        ...(filterSubject && { subject: filterSubject })
      };
      await fetchTeachers(filters);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      toast.error("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleTeacherSelection = (teacherId) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(students.map(s => s._id));
  };

  const selectAllTeachers = () => {
    setSelectedTeachers(teachers.map(t => t._id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
    setSelectedTeachers([]);
  };

  const openResetModal = (user, userType) => {
    setResetModal({ isOpen: true, user, userType });
    setNewPassword("");
  };

  const closeResetModal = () => {
    setResetModal({ isOpen: false, user: null, userType: null });
    setNewPassword("");
  };

  const handleAdminPasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setResetLoading(true);

    try {
      const username = resetModal.userType === "student" 
        ? resetModal.user.studentId 
        : resetModal.user.teacherId;

      console.log("Sending admin password reset request:", {
        username,
        userType: resetModal.userType,
        newPassword: newPassword
      });
      
      const response = await axios.post("/password-reset/admin-reset", {
        username,
        userType: resetModal.userType,
        newPassword: newPassword
      });
      
      console.log("Admin password reset response:", response.data);

      if (response.data.success) {
        toast.success(`${resetModal.userType === "student" ? "Student" : "Teacher"} password reset successfully!`);
        closeResetModal();
        // Refresh data to show updated credentials
        if (resetModal.userType === "student") {
          loadStudents();
        } else {
          loadTeachers();
        }
      }
    } catch (error) {
      console.error("Admin password reset error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.response?.data?.message || error.message || "Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const printCredentials = () => {
    if (activeTab === "students") {
      const selectedStudentsData = students.filter(s => selectedStudents.includes(s._id));
      
      if (selectedStudentsData.length === 0) {
        toast.error("Please select students to print");
        return;
      }

      const printContent = selectedStudentsData.map(student => {
        const studentCreds = student.generatedCredentials;
        const parentUsername = `P${studentCreds?.username || student.studentId}`;
        const password = studentCreds?.password || "Not generated";

        return `
          <div style="page-break-after: always; padding: 20px; border: 1px solid #ccc; margin: 10px 0;">
            <h3>${student.name} - ${student.studentId}</h3>
            <p><strong>Class:</strong> ${student.class} | <strong>Section:</strong> ${student.section}</p>
            <p><strong>Parent:</strong> ${student.parent?.name || "N/A"}</p>
            
            <div style="margin: 20px 0;">
              <h4>Student Login Credentials:</h4>
              <p><strong>Username:</strong> ${studentCreds?.username || student.studentId}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <h4>Parent Login Credentials:</h4>
              <p><strong>Username:</strong> ${parentUsername}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
          </div>
        `;
      }).join('');

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Student & Parent Credentials</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h3 { color: #333; }
              h4 { color: #666; }
              p { margin: 5px 0; }
            </style>
          </head>
          <body>
            <h1>Student & Parent Login Credentials</h1>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      const selectedTeachersData = teachers.filter(t => selectedTeachers.includes(t._id));
      
      if (selectedTeachersData.length === 0) {
        toast.error("Please select teachers to print");
        return;
      }

      const printContent = selectedTeachersData.map(teacher => {
        const teacherCreds = teacher.generatedCredentials;
        const password = teacherCreds?.password || "Not generated";

        return `
          <div style="page-break-after: always; padding: 20px; border: 1px solid #ccc; margin: 10px 0;">
            <h3>${teacher.name} - ${teacher.teacherId}</h3>
            <p><strong>Subject:</strong> ${teacher.subject || "N/A"} | <strong>Qualification:</strong> ${teacher.qualification || "N/A"}</p>
            <p><strong>Phone:</strong> ${teacher.phone || "N/A"}</p>
            
            <div style="margin: 20px 0;">
              <h4>Teacher Login Credentials:</h4>
              <p><strong>Username:</strong> ${teacherCreds?.username || teacher.teacherId}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
          </div>
        `;
      }).join('');

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Teacher Credentials</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h3 { color: #333; }
              h4 { color: #666; }
              p { margin: 5px 0; }
            </style>
          </head>
          <body>
            <h1>Teacher Login Credentials</h1>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadCredentials = () => {
    if (activeTab === "students") {
      const selectedStudentsData = students.filter(s => selectedStudents.includes(s._id));
      
      if (selectedStudentsData.length === 0) {
        toast.error("Please select students to download");
        return;
      }

      const csvContent = [
        "Student Name,Student ID,Class,Section,Parent Name,Student Username,Student Password,Parent Username,Parent Password",
        ...selectedStudentsData.map(student => {
          const studentCreds = student.generatedCredentials;
          const parentUsername = `P${studentCreds?.username || student.studentId}`;
          const password = studentCreds?.password || "Not generated";
          
          return `"${student.name}","${student.studentId}","${student.class}","${student.section}","${student.parent?.name || "N/A"}","${studentCreds?.username || student.studentId}","${password}","${parentUsername}","${password}"`;
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student_credentials_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const selectedTeachersData = teachers.filter(t => selectedTeachers.includes(t._id));
      
      if (selectedTeachersData.length === 0) {
        toast.error("Please select teachers to download");
        return;
      }

      const csvContent = [
        "Teacher Name,Teacher ID,Subject,Qualification,Phone,Username,Password",
        ...selectedTeachersData.map(teacher => {
          const teacherCreds = teacher.generatedCredentials;
          const password = teacherCreds?.password || "Not generated";
          
          return `"${teacher.name}","${teacher.teacherId}","${teacher.subject || "N/A"}","${teacher.qualification || "N/A"}","${teacher.phone || "N/A"}","${teacherCreds?.username || teacher.teacherId}","${password}"`;
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teacher_credentials_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === 'class') {
      setFilterClass(value);
    } else if (type === 'section') {
      setFilterSection(value);
    } else if (type === 'subject') {
      setFilterSubject(value);
    }
    setCurrentPage(1); // Reset to first page when filters change
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    const currentPagination = activeTab === "students" ? studentPagination : teacherPagination;
    if (currentPagination?.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    const currentPagination = activeTab === "students" ? studentPagination : teacherPagination;
    if (currentPagination?.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const uniqueSubjects = [...new Set(teachers.map(t => t.subject))].filter(Boolean).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-primary">Credentials Management</h1>
        <div className="flex gap-2">
          <button
            onClick={printCredentials}
            disabled={(activeTab === "students" ? selectedStudents.length === 0 : selectedTeachers.length === 0)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <Printer size={16} />
            Print Selected
          </button>
          <button
            onClick={downloadCredentials}
            disabled={(activeTab === "students" ? selectedStudents.length === 0 : selectedTeachers.length === 0)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
          >
            <Download size={16} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border rounded-xl p-2 bg-muted/20">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all 
            ${activeTab === "students" ? "bg-primary text-white shadow" : "bg-transparent hover:bg-muted/50"}`}
        >
          <Users size={18} />
          Students
        </button>
        <button
          onClick={() => setActiveTab("teachers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all 
            ${activeTab === "teachers" ? "bg-primary text-white shadow" : "bg-transparent hover:bg-muted/50"}`}
        >
          <GraduationCap size={18} />
          Teachers
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeTab === "students" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
                <select
                  value={filterClass}
                  onChange={(e) => handleFilterChange('class', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={classesLoading}
                >
                  <option value="">{classesLoading ? "Loading classes..." : "All Classes"}</option>
                  {sortedClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                {classesError && (
                  <p className="text-red-500 text-xs mt-1">{classesError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Section</label>
                <select
                  value={filterSection}
                  onChange={(e) => handleFilterChange('section', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={classesLoading}
                >
                  <option value="">{classesLoading ? "Loading sections..." : "All Sections"}</option>
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                {classesError && (
                  <p className="text-red-500 text-xs mt-1">{classesError}</p>
                )}
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={activeTab === "students" ? selectAllStudents : selectAllTeachers}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Data List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      activeTab === "students" 
                        ? selectedStudents.length === students.length && students.length > 0
                        : selectedTeachers.length === teachers.length && teachers.length > 0
                    }
                    onChange={(e) => e.target.checked ? (activeTab === "students" ? selectAllStudents() : selectAllTeachers()) : clearSelection()}
                    className="rounded"
                  />
                </th>
                {activeTab === "students" ? (
                  <>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Class/Section</th>
                    <th className="px-4 py-3 text-left">Parent</th>
                    <th className="px-4 py-3 text-left">Student Credentials</th>
                    <th className="px-4 py-3 text-left">Parent Credentials</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left">Teacher</th>
                    <th className="px-4 py-3 text-left">Subject/Qualification</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Teacher Credentials</th>
                  </>
                )}
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeTab === "students" ? "7" : "5"} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading {activeTab}...</span>
                    </div>
                  </td>
                </tr>
              ) : (activeTab === "students" ? students.length === 0 : teachers.length === 0) ? (
                <tr>
                  <td colSpan={activeTab === "students" ? "7" : "5"} className="px-4 py-8 text-center text-gray-500">
                    No {activeTab} found
                  </td>
                </tr>
              ) : activeTab === "students" ? (
                students.map((student) => {
                const studentCreds = student.generatedCredentials;
                const parentUsername = `P${studentCreds?.username || student.studentId}`;
                const password = studentCreds?.password || "Not generated";
                const showPassword = showPasswords[student._id];

                return (
                  <tr key={student._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleStudentSelection(student._id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{student.class}</div>
                        <div className="text-gray-500">{student.section}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{student.parent?.name || "N/A"}</td>
                    
                    {/* Student Credentials */}
                    <td className="px-4 py-3">
                      {studentCreds ? (
                        <div className="space-y-1">
                          <div className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <span>User: {studentCreds.username}</span>
                              <button
                                onClick={() => copyToClipboard(studentCreds.username)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Pass: {showPassword ? password : '••••••'}</span>
                              <button
                                onClick={() => togglePasswordVisibility(student._id)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(password)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not generated</span>
                      )}
                    </td>

                    {/* Parent Credentials */}
                    <td className="px-4 py-3">
                      {studentCreds ? (
                        <div className="space-y-1">
                          <div className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <span>User: {parentUsername}</span>
                              <button
                                onClick={() => copyToClipboard(parentUsername)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Pass: {showPassword ? password : '••••••'}</span>
                              <button
                                onClick={() => copyToClipboard(password)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not generated</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePasswordVisibility(student._id)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          {showPassword ? 'Hide' : 'Show'} Passwords
                        </button>
                        <button
                          onClick={() => openResetModal(student, "student")}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <Key size={14} />
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })
              ) : (
                teachers.map((teacher) => {
                  const teacherCreds = teacher.generatedCredentials;
                  const password = teacherCreds?.password || "Not generated";
                  const showPassword = showPasswords[teacher._id];

                  return (
                    <tr key={teacher._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(teacher._id)}
                          onChange={() => toggleTeacherSelection(teacher._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-sm text-gray-500">{teacher.teacherId}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div>{teacher.subject || "N/A"}</div>
                          <div className="text-gray-500">{teacher.qualification || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{teacher.phone || "N/A"}</td>
                      
                      {/* Teacher Credentials */}
                      <td className="px-4 py-3">
                        {teacherCreds ? (
                          <div className="space-y-1">
                            <div className="font-mono text-sm">
                              <div className="flex items-center gap-2">
                                <span>User: {teacherCreds.username}</span>
                                <button
                                  onClick={() => copyToClipboard(teacherCreds.username)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Pass: {showPassword ? password : '••••••'}</span>
                                <button
                                  onClick={() => togglePasswordVisibility(teacher._id)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(password)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not generated</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePasswordVisibility(teacher._id)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            {showPassword ? 'Hide' : 'Show'} Password
                          </button>
                          <button
                            onClick={() => openResetModal(teacher, "teacher")}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                          >
                            <Key size={14} />
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {(() => {
        const currentPagination = activeTab === "students" ? studentPagination : teacherPagination;
        const currentData = activeTab === "students" ? students : teachers;
        const dataType = activeTab === "students" ? "students" : "teachers";
        
        return currentPagination && currentPagination.totalPages > 1 && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-700">
                Showing {((currentPagination.currentPage - 1) * currentPagination.limit) + 1} to {Math.min(currentPagination.currentPage * currentPagination.limit, currentPagination.totalTeachers || currentPagination.totalStudents)} of {currentPagination.totalTeachers || currentPagination.totalStudents} {dataType}
              </div>
            
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={!currentPagination.hasPrevPage}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, currentPagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-2 border rounded-md ${
                          pageNum === currentPagination.currentPage
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={!currentPagination.hasNextPage}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Reset Password Modal */}
      {resetModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reset Password for {resetModal.user?.name}
              </h3>
              <button
                onClick={closeResetModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-1"
                  >
                    <RefreshCw size={16} />
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Important:</h4>
                <p className="text-xs text-yellow-700">
                  The {resetModal.userType} will be required to change this password on their next login.
                  Make sure to provide them with the new password securely.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeResetModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminPasswordReset}
                disabled={resetLoading || !newPassword || newPassword.length < 6}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialsManagement;