import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockUsers, mockGrades, mockAttendance } from '../../utils/mockData';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const StudentManagement = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState(mockUsers.filter(u => u.role === 'student'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const grades = ['all', 'Grade 9A', 'Grade 9B', 'Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 11B', 'Grade 12A', 'Grade 12B'];

  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(student => selectedGrade === 'all' || student.grade === selectedGrade);

  const getStudentGrades = (studentId) => {
    return mockGrades.filter(grade => grade.studentId === studentId);
  };

  const getStudentAttendance = (studentId) => {
    const attendance = mockAttendance.filter(att => att.studentId === studentId);
    const totalDays = attendance.length;
    const presentDays = attendance.filter(att => att.status === 'present').length;
    return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  };

  const getAverageGrade = (studentId) => {
    const grades = getStudentGrades(studentId);
    if (grades.length === 0) return 'N/A';
    const average = grades.reduce((sum, grade) => sum + grade.marks, 0) / grades.length;
    return average.toFixed(1);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      setStudents(students.filter(s => s.id !== studentId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-2">Manage student information and academic records</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Student</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Students',
              value: students.length,
              icon: Users,
              color: 'bg-blue-500'
            },
            {
              title: 'Active Students',
              value: students.filter(s => s.status !== 'inactive').length,
              icon: CheckCircle,
              color: 'bg-green-500'
            },
            {
              title: 'Average Attendance',
              value: '94%',
              icon: Calendar,
              color: 'bg-orange-500'
            },
            {
              title: 'Honor Students',
              value: students.filter(s => getAverageGrade(s.id) >= 90).length,
              icon: Award,
              color: 'bg-purple-500'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg card-hover">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex space-x-4">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>
                    {grade === 'all' ? 'All Grades' : grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const averageGrade = getAverageGrade(student.id);
                  const attendance = getStudentAttendance(student.id);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${
                            averageGrade >= 90 ? 'text-green-600' :
                            averageGrade >= 80 ? 'text-blue-600' :
                            averageGrade >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {averageGrade}%
                          </span>
                          {averageGrade >= 90 && (
                            <Award className="ml-2 text-yellow-500" size={16} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            attendance >= 95 ? 'bg-green-500' :
                            attendance >= 85 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-gray-900">{attendance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Edit Student"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Student"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Student Details Modal */}
        {showDetailsModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Student Info */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-center mb-6">
                      <img
                        src={selectedStudent.avatar}
                        alt={selectedStudent.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                      />
                      <h3 className="text-xl font-semibold text-gray-900">{selectedStudent.name}</h3>
                      <p className="text-gray-600">{selectedStudent.studentId}</p>
                      <span className="inline-block px-3 py-1 bg-primary text-white rounded-full text-sm mt-2">
                        {selectedStudent.grade}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Attendance: {getStudentAttendance(selectedStudent.id)}%</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Average: {getAverageGrade(selectedStudent.id)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Performance */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Grades</h4>
                      <div className="space-y-3">
                        {getStudentGrades(selectedStudent.id).map((grade) => (
                          <div key={grade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium text-gray-900">{grade.subject}</span>
                              <p className="text-sm text-gray-600">{grade.assignment}</p>
                            </div>
                            <div className="text-right">
                              <span className={`font-bold ${
                                grade.grade === 'A+' ? 'text-green-600' :
                                grade.grade === 'A' ? 'text-blue-600' :
                                grade.grade === 'B' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {grade.grade}
                              </span>
                              <p className="text-sm text-gray-500">{grade.marks}/{grade.totalMarks}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <BookOpen className="text-blue-600 mr-2" size={20} />
                            <span className="font-medium text-blue-900">Subjects</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            {getStudentGrades(selectedStudent.id).length}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Award className="text-green-600 mr-2" size={20} />
                            <span className="font-medium text-green-900">A Grades</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {getStudentGrades(selectedStudent.id).filter(g => g.grade.startsWith('A')).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">Select Grade</option>
                    {grades.slice(1).map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter student ID"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;