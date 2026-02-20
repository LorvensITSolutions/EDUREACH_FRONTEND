import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockUsers, mockGrades, mockAssignments } from '../../utils/mockData';
import { 
  BookOpen, 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Save,
  Plus,
  Award,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react';

const GradeBook = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('Grade 10A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGrade, setEditingGrade] = useState(null);
  const [grades, setGrades] = useState(mockGrades);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [newGrade, setNewGrade] = useState({
    studentId: '',
    subject: selectedSubject,
    marks: '',
    totalMarks: 100,
    assignment: '',
    term: 'Mid-term'
  });

  // Get students for the selected class
  const classStudents = mockUsers.filter(u => u.role === 'student' && u.grade === selectedClass);
  
  // Get grades for the selected class and subject
  const classGrades = grades.filter(g => {
    const student = mockUsers.find(u => u.id === g.studentId);
    return student && student.grade === selectedClass && g.subject === selectedSubject;
  });

  // Filter students based on search
  const filteredStudents = classStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateGrade = (marks, totalMarks) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleGradeEdit = (gradeId, field, value) => {
    setGrades(grades.map(grade => {
      if (grade.id === gradeId) {
        const updatedGrade = { ...grade, [field]: value };
        if (field === 'marks' || field === 'totalMarks') {
          updatedGrade.grade = calculateGrade(
            field === 'marks' ? parseInt(value) : grade.marks,
            field === 'totalMarks' ? parseInt(value) : grade.totalMarks
          );
        }
        return updatedGrade;
      }
      return grade;
    }));
  };

  const handleAddGrade = (e) => {
    e.preventDefault();
    const grade = {
      id: grades.length + 1,
      ...newGrade,
      studentId: parseInt(newGrade.studentId),
      marks: parseInt(newGrade.marks),
      totalMarks: parseInt(newGrade.totalMarks),
      grade: calculateGrade(parseInt(newGrade.marks), parseInt(newGrade.totalMarks)),
      date: new Date().toISOString().split('T')[0]
    };
    setGrades([...grades, grade]);
    setNewGrade({
      studentId: '',
      subject: selectedSubject,
      marks: '',
      totalMarks: 100,
      assignment: '',
      term: 'Mid-term'
    });
    setShowAddGrade(false);
  };

  const getStudentGrades = (studentId) => {
    return classGrades.filter(g => g.studentId === studentId);
  };

  const getStudentAverage = (studentId) => {
    const studentGrades = getStudentGrades(studentId);
    if (studentGrades.length === 0) return 0;
    const total = studentGrades.reduce((sum, grade) => sum + (grade.marks / grade.totalMarks) * 100, 0);
    return (total / studentGrades.length).toFixed(1);
  };

  const classAverage = classGrades.length > 0 
    ? (classGrades.reduce((sum, grade) => sum + (grade.marks / grade.totalMarks) * 100, 0) / classGrades.length).toFixed(1)
    : 0;

  const stats = [
    {
      title: 'Total Students',
      value: classStudents.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Graded Assignments',
      value: classGrades.length,
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'Class Average',
      value: `${classAverage}%`,
      icon: TrendingUp,
      color: 'bg-primary'
    },
    {
      title: 'Highest Score',
      value: classGrades.length > 0 ? `${Math.max(...classGrades.map(g => (g.marks / g.totalMarks) * 100)).toFixed(1)}%` : '0%',
      icon: Award,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Grade Book</h1>
          <p className="text-gray-600 mt-2">Manage student grades and assessments</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Grade 10A">Grade 10A</option>
                <option value="Grade 10B">Grade 10B</option>
                <option value="Grade 11A">Grade 11A</option>
              </select>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Physics">Physics</option>
                <option value="Art">Art</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setShowAddGrade(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Grade</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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

        {/* Grade Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedSubject} - {selectedClass}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const studentGrades = getStudentGrades(student.id);
                  const average = getStudentAverage(student.id);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {studentGrades.map((grade) => (
                            <div key={grade.id} className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{grade.assignment}:</span>
                              {editingGrade === grade.id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={grade.marks}
                                    onChange={(e) => handleGradeEdit(grade.id, 'marks', e.target.value)}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    min="0"
                                    max={grade.totalMarks}
                                  />
                                  <span className="text-sm text-gray-500">/{grade.totalMarks}</span>
                                  <button
                                    onClick={() => setEditingGrade(null)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <Save size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">{grade.marks}/{grade.totalMarks}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    grade.grade === 'A+' ? 'bg-green-100 text-green-800' :
                                    grade.grade === 'A' ? 'bg-blue-100 text-blue-800' :
                                    grade.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {grade.grade}
                                  </span>
                                  <button
                                    onClick={() => setEditingGrade(grade.id)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          {studentGrades.length === 0 && (
                            <span className="text-sm text-gray-400">No grades yet</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{average}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all duration-300"
                            style={{ width: `${Math.min(average, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary hover:text-primary-dark">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Grade Modal */}
        {showAddGrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Grade</h2>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select
                    required
                    value={newGrade.studentId}
                    onChange={(e) => setNewGrade({...newGrade, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Student</option>
                    {classStudents.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
                  <input
                    type="text"
                    required
                    value={newGrade.assignment}
                    onChange={(e) => setNewGrade({...newGrade, assignment: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Assignment name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                    <input
                      type="number"
                      required
                      value={newGrade.marks}
                      onChange={(e) => setNewGrade({...newGrade, marks: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                    <input
                      type="number"
                      required
                      value={newGrade.totalMarks}
                      onChange={(e) => setNewGrade({...newGrade, totalMarks: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <select
                    value={newGrade.term}
                    onChange={(e) => setNewGrade({...newGrade, term: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Mid-term">Mid-term</option>
                    <option value="Final">Final</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Add Grade
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddGrade(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1"
                  >
                    Cancel
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

export default GradeBook;