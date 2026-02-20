import React, { useState, useEffect } from "react";
import axios from "../lib/axios";
import { Search, Plus, Trash2, Download, RefreshCw, Users, Building2, UserCheck, Eye, FileText } from "lucide-react";

export default function ExamSeatingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [examHalls, setExamHalls] = useState([]);
  const [newHallName, setNewHallName] = useState("");
  const [newHallCapacity, setNewHallCapacity] = useState(30);
  const [newHallRows, setNewHallRows] = useState(6);

  // Options
  const [shuffleSameClass, setShuffleSameClass] = useState(true);
  const [minDistance, setMinDistance] = useState(2);
  const [randomizeSeats, setRandomizeSeats] = useState(true);

  // Auto-fill data
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState(0);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [loadingAutoFill, setLoadingAutoFill] = useState(false);

  // Generated result
  const [generatedSeating, setGeneratedSeating] = useState(null);
  const [savedSeatings, setSavedSeatings] = useState([]);
  const [viewSeating, setViewSeating] = useState(null); // For viewing detailed seating
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Fetch available classes and teachers on mount
  useEffect(() => {
    fetchAvailableClasses();
    fetchAvailableTeachers();
  }, []);

  // Auto-calculate total students when classes change
  useEffect(() => {
    if (selectedClasses.length > 0) {
      fetchStudentsCount();
    }
  }, [selectedClasses]);

  const fetchAvailableClasses = async () => {
    try {
      setLoadingAutoFill(true);
      const response = await axios.get("/exam-seating/auto-fill/classes");
      if (response.data.success) {
        setAvailableClasses(response.data.classes || []);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoadingAutoFill(false);
    }
  };

  const fetchAvailableTeachers = async () => {
    try {
      const response = await axios.get("/exam-seating/auto-fill/teachers");
      if (response.data.success) {
        setAvailableTeachers(response.data.totalTeachers || 0);
        setTotalTeachers(response.data.totalTeachers || 0);
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  const fetchStudentsCount = async () => {
    if (selectedClasses.length === 0) {
      setTotalStudents(0);
      setStudentsByClass({});
      return;
    }

    try {
      setLoadingAutoFill(true);
      // Send classes as comma-separated string for better compatibility
      const response = await axios.get("/exam-seating/auto-fill/students", {
        params: { 
          classes: selectedClasses.join(',')
        }
      });
      if (response.data.success) {
        setTotalStudents(response.data.totalStudents || 0);
        setStudentsByClass(response.data.studentsByClass || {});
        if (response.data.message) {
          setSuccess(response.data.message);
          setTimeout(() => setSuccess(null), 3000);
        }
      }
    } catch (err) {
      console.error("Error fetching students count:", err);
      setError(err.response?.data?.error || "Failed to fetch students count");
    } finally {
      setLoadingAutoFill(false);
    }
  };

  const handleAddHall = () => {
    if (!newHallName || newHallCapacity <= 0 || newHallRows <= 0) {
      setError("Please enter a valid hall name, capacity, and number of rows");
      return;
    }

    if (examHalls.some(h => h.hallName === newHallName)) {
      setError("Hall name already exists");
      return;
    }

    // Calculate columns based on capacity and rows
    const columns = Math.ceil(newHallCapacity / newHallRows);

    setExamHalls([
      ...examHalls,
      { 
        hallName: newHallName, 
        capacity: newHallCapacity,
        rows: newHallRows,
        columns: columns
      }
    ]);
    setNewHallName("");
    setNewHallCapacity(30);
    setNewHallRows(6);
    setError(null);
  };

  const handleRemoveHall = (index) => {
    setExamHalls(examHalls.filter((_, i) => i !== index));
  };

  const handleToggleClass = (className) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (!examName || !examDate) {
      setError("Please enter exam name and date");
      return;
    }

    if (selectedClasses.length === 0) {
      setError("Please select at least one class");
      return;
    }

    if (totalStudents === 0) {
      setError("No students found for selected classes");
      return;
    }

    if (examHalls.length === 0) {
      setError("Please add at least one exam hall");
      return;
    }

    if (totalTeachers < examHalls.length) {
      setError(`Not enough teachers. Need ${examHalls.length} teachers for ${examHalls.length} halls.`);
      return;
    }

    const totalCapacity = examHalls.reduce((sum, hall) => sum + hall.capacity, 0);
    if (totalStudents > totalCapacity) {
      setError(`Total students (${totalStudents}) exceed total hall capacity (${totalCapacity})`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("/exam-seating/generate", {
        examName,
        examDate,
        classes: selectedClasses,
        totalStudents,
        totalTeachers,
        examHalls,
        options: {
          shuffleSameClass,
          minDistanceBetweenSameClass: minDistance,
          randomizeSeats: randomizeSeats
        }
      });

      if (response.data.success) {
        setGeneratedSeating(response.data.examSeating);
        setSuccess("Exam seating arrangement generated successfully!");
        fetchSavedSeatings(); // Refresh list
      } else {
        setError(response.data.error || "Generation failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to generate seating arrangement");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedSeatings = async () => {
    try {
      const response = await axios.get("/exam-seating/all");
      if (response.data.success) {
        setSavedSeatings(response.data.examSeatings || []);
      }
    } catch (err) {
      console.error("Error fetching saved seatings:", err);
    }
  };

  useEffect(() => {
    fetchSavedSeatings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam seating arrangement?")) {
      return;
    }

    try {
      const response = await axios.delete(`/exam-seating/${id}`);
      if (response.data.success) {
        setSuccess("Exam seating arrangement deleted successfully");
        fetchSavedSeatings();
        if (generatedSeating && generatedSeating._id === id) {
          setGeneratedSeating(null);
        }
        if (viewSeating && viewSeating._id === id) {
          setViewSeating(null);
          setShowDetailedView(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleViewSeating = async (id) => {
    try {
      const response = await axios.get(`/exam-seating/${id}`);
      if (response.data.success) {
        setViewSeating(response.data.examSeating);
        setShowDetailedView(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load seating arrangement");
    }
  };

  // Render seating grid for a hall
  const renderSeatingGrid = (hall) => {
    if (!hall.students || hall.students.length === 0) return null;

    // Get rows and columns from hall config
    let rows = hall.rows;
    let columns = hall.columns;

    // If not set, calculate from capacity
    if (!rows || rows <= 0) {
      rows = Math.ceil(Math.sqrt(hall.capacity || hall.totalStudents || 1));
      if (rows <= 0) rows = 1;
    }
    if (!columns || columns <= 0) {
      columns = Math.ceil((hall.capacity || hall.totalStudents || 1) / rows);
      if (columns <= 0) columns = 1;
    }

    // Ensure valid integers
    rows = Math.max(1, Math.floor(rows));
    columns = Math.max(1, Math.floor(columns));

    // Create a 2D grid
    const grid = Array(rows).fill(null).map(() => Array(columns).fill(null));

    // Place students in grid based on their row and column positions
    hall.students.forEach(student => {
      // Use row and column from student data (1-based)
      const rowIndex = Number(student.row) - 1;
      const colIndex = Number(student.column) - 1;
      
      // Validate bounds
      if (
        Number.isInteger(rowIndex) && 
        Number.isInteger(colIndex) &&
        rowIndex >= 0 && 
        rowIndex < rows &&
        colIndex >= 0 && 
        colIndex < columns
      ) {
        grid[rowIndex][colIndex] = student;
      } else {
        // If student doesn't have row/column, assign sequentially
        // Find first empty slot
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < columns; c++) {
            if (!grid[r][c]) {
              grid[r][c] = student;
              student.row = r + 1;
              student.column = c + 1;
              return;
            }
          }
        }
      }
    });

    return (
      <div className="mt-3 sm:mt-4">
        <div className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex flex-wrap items-center gap-1 sm:gap-2">
          <span>Seating Layout: {rows} rows × {columns} columns</span>
          <span className="text-gray-500">({hall.totalStudents} students)</span>
        </div>
        <div className="overflow-x-auto -mx-2 sm:mx-0 border border-gray-300 rounded-lg shadow-md">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-400 p-1.5 sm:p-2 md:p-3 bg-primary-dark text-xs sm:text-sm font-bold text-center min-w-[60px] sm:min-w-[80px]">
                  Row / Column
                </th>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <th key={colIndex} className="border border-gray-400 p-1.5 sm:p-2 md:p-3 bg-primary-dark text-xs sm:text-sm font-bold text-center min-w-[120px] sm:min-w-[150px]">
                    Col {colIndex + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-1.5 sm:p-2 md:p-3 bg-gray-100 text-xs sm:text-sm font-bold text-center align-middle">
                    Row {rowIndex + 1}
                  </td>
                  {row.map((student, colIndex) => (
                    <td
                      key={colIndex}
                      className="border border-gray-300 p-1 sm:p-1.5 md:p-2 align-top"
                    >
                      {student ? (
                        <div className="text-center p-1.5 sm:p-2 md:p-3 border-2 border-blue-500 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors min-h-[80px] sm:min-h-[100px] flex flex-col justify-between">
                          <div className="font-bold text-blue-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2 leading-tight break-words">{student.name}</div>
                          <div className="text-gray-700 text-xs mb-1 sm:mb-2 font-mono bg-white px-1 sm:px-2 py-0.5 sm:py-1 rounded">ID: {student.studentId || 'N/A'}</div>
                          <div className="text-gray-900 text-xs sm:text-sm font-semibold bg-white px-1 sm:px-2 py-0.5 sm:py-1 rounded border border-gray-300">{student.class}{student.section || ''}</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center p-1.5 sm:p-2 md:p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[80px] sm:min-h-[100px] flex items-center justify-center">
                          <span className="text-xs">Empty</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const totalCapacity = examHalls.reduce((sum, hall) => sum + hall.capacity, 0);
  const utilizationRate = totalStudents > 0 ? ((totalStudents / totalCapacity) * 100).toFixed(1) : 0;

  // If showing detailed view, render that instead
  if (showDetailedView && viewSeating) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-5 md:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Exam Seating Details</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">{viewSeating.examName} - {new Date(viewSeating.examDate).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => {
                setShowDetailedView(false);
                setViewSeating(null);
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm sm:text-base"
            >
              Back to List
            </button>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold">{viewSeating.totalStudents}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Halls</p>
                <p className="text-xl sm:text-2xl font-bold">{viewSeating.examHalls?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Teachers</p>
                <p className="text-xl sm:text-2xl font-bold">{viewSeating.totalTeachers}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Classes</p>
                <p className="text-xl sm:text-2xl font-bold">{viewSeating.classes?.length || 0}</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
              <p className="text-xs sm:text-sm text-gray-600 break-words">Classes: {viewSeating.classes?.join(', ') || 'N/A'}</p>
            </div>
          </div>

          {/* Detailed Seating for Each Hall */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {viewSeating.examHalls?.map((hall, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3 sm:mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold">{hall.hallName}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {hall.totalStudents} / {hall.capacity} students
                      {hall.rows && hall.columns && ` • ${hall.rows} rows × ${hall.columns} columns`}
                    </p>
                  </div>
                  {hall.supervisor && (
                    <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto">
                      <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Supervisor: </span>{hall.supervisor}
                    </span>
                  )}
                </div>

                {/* Seating Grid */}
                {renderSeatingGrid(hall)}

                {/* Student List */}
                <div className="mt-4 sm:mt-5 md:mt-6">
                  <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Student List</h4>
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <table className="w-full border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-1.5 sm:p-2 text-left">Seat #</th>
                          <th className="border p-1.5 sm:p-2 text-left">Row</th>
                          <th className="border p-1.5 sm:p-2 text-left">Column</th>
                          <th className="border p-1.5 sm:p-2 text-left">Student Name</th>
                          <th className="border p-1.5 sm:p-2 text-left">Student ID</th>
                          <th className="border p-1.5 sm:p-2 text-left">Class</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hall.students?.map((student, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border p-1.5 sm:p-2">{student.seatNumber}</td>
                            <td className="border p-1.5 sm:p-2">{student.row || '-'}</td>
                            <td className="border p-1.5 sm:p-2">{student.column || '-'}</td>
                            <td className="border p-1.5 sm:p-2 font-medium">{student.name}</td>
                            <td className="border p-1.5 sm:p-2 text-gray-600">{student.studentId}</td>
                            <td className="border p-1.5 sm:p-2">{student.class}{student.section || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-5 md:mb-6">Exam Seating Arrangement</h1>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm sm:text-base">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Details */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Exam Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Exam Name *
                  </label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g., Mid-Term Exam 2024"
                    className="w-full border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Class Selection */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Select Classes</h2>
                <button
                  onClick={fetchAvailableClasses}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  Refresh
                </button>
              </div>
              {loadingAutoFill ? (
                <p className="text-gray-500 text-sm sm:text-base">Loading classes...</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableClasses.length === 0 ? (
                    <p className="text-gray-500 text-xs sm:text-sm">No classes found. Add classes first.</p>
                  ) : (
                    availableClasses.map((cls) => (
                      <label
                        key={cls.name}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(cls.name)}
                          onChange={() => handleToggleClass(cls.name)}
                          className="w-4 h-4 text-blue-600 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm sm:text-base">{cls.name}</span>
                          <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">
                            ({cls.studentCount || 0} students)
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
              {selectedClasses.length > 0 && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-700 break-words">
                    <strong>Selected:</strong> {selectedClasses.join(", ")}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">
                    <strong>Total Students:</strong> {totalStudents}
                  </p>
                </div>
              )}
            </div>

            {/* Teachers */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Teachers</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Total Teachers Available
                  </label>
                  <input
                    type="number"
                    value={totalTeachers}
                    onChange={(e) => setTotalTeachers(Number(e.target.value))}
                    min={examHalls.length}
                    className="w-full border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {availableTeachers} | Required: {examHalls.length}
                  </p>
                </div>
                <button
                  onClick={fetchAvailableTeachers}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  Auto-fill
                </button>
              </div>
            </div>

            {/* Exam Halls */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Exam Halls</h2>
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                {examHalls.map((hall, index) => {
                const columns = hall.columns || Math.ceil((hall.capacity || 30) / (hall.rows || 6));
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm sm:text-base">{hall.hallName}</span>
                      <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2 block sm:inline">
                        Capacity: {hall.capacity} | Rows: {hall.rows || 6} | Columns: {columns}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveHall(index)}
                      className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newHallName}
                  onChange={(e) => setNewHallName(e.target.value)}
                  placeholder="Hall Name (e.g., Hall A)"
                  className="border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <input
                  type="number"
                  value={newHallCapacity}
                  onChange={(e) => {
                    const capacity = Number(e.target.value);
                    setNewHallCapacity(capacity);
                    // Auto-calculate columns if rows are set
                    if (newHallRows > 0) {
                      const cols = Math.ceil(capacity / newHallRows);
                      // Update columns display (optional)
                    }
                  }}
                  placeholder="Total Capacity"
                  min="1"
                  className="border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <input
                  type="number"
                  value={newHallRows}
                  onChange={(e) => {
                    const rows = Number(e.target.value);
                    setNewHallRows(rows);
                    // Auto-calculate columns if capacity is set
                    if (newHallCapacity > 0) {
                      const cols = Math.ceil(newHallCapacity / rows);
                      // Update columns display (optional)
                    }
                  }}
                  placeholder="Number of Rows"
                  min="1"
                  className="border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1">
                  <button
                    onClick={handleAddHall}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1.5 sm:gap-2 flex-1 text-sm sm:text-base"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Hall
                  </button>
                </div>
              </div>
              {newHallCapacity > 0 && newHallRows > 0 && (
                <div className="mt-2 text-xs sm:text-sm text-gray-600">
                  <strong>Calculated:</strong> {Math.ceil(newHallCapacity / newHallRows)} columns per row 
                  ({newHallRows} rows × {Math.ceil(newHallCapacity / newHallRows)} columns = {newHallRows * Math.ceil(newHallCapacity / newHallRows)} seats)
                </div>
              )}
              {examHalls.length > 0 && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs sm:text-sm">
                    <strong>Total Capacity:</strong> {totalCapacity} seats
                  </p>
                  <p className="text-xs sm:text-sm">
                    <strong>Utilization:</strong> {utilizationRate}% ({totalStudents} / {totalCapacity})
                  </p>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Shuffling Options</h2>
              <div className="space-y-2 sm:space-y-3">
                <label className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    checked={shuffleSameClass}
                    onChange={(e) => setShuffleSameClass(e.target.checked)}
                    className="w-4 h-4 text-blue-600 flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm md:text-base">Distribute same class students across different halls</span>
                </label>
                <label className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    checked={randomizeSeats}
                    onChange={(e) => setRandomizeSeats(e.target.checked)}
                    className="w-4 h-4 text-blue-600 flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm md:text-base">Randomize seat assignments</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-xs sm:text-sm font-medium">Min distance between same class:</label>
                  <input
                    type="number"
                    value={minDistance}
                    onChange={(e) => setMinDistance(Number(e.target.value))}
                    min="1"
                    max="10"
                    className="w-20 border rounded px-2 py-1 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Generate Seating Arrangement
                </>
              )}
            </button>
          </div>

          {/* Right Column - Preview/Results */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Summary</h2>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Classes:</span>
                  <span className="font-medium">{selectedClasses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-medium">{totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teachers:</span>
                  <span className="font-medium">{totalTeachers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Halls:</span>
                  <span className="font-medium">{examHalls.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Capacity:</span>
                  <span className="font-medium">{totalCapacity}</span>
                </div>
                {totalCapacity > 0 && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Utilization:</span>
                    <span className="font-medium">{utilizationRate}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Seating Preview */}
            {generatedSeating && (
              <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold">Generated Arrangement</h2>
                  <button
                    onClick={() => {
                      setViewSeating(generatedSeating);
                      setShowDetailedView(true);
                    }}
                    className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    View Details
                  </button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {generatedSeating.examHalls?.map((hall, index) => (
                    <div key={index} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">{hall.hallName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {hall.totalStudents} / {hall.capacity} students
                            {hall.rows && hall.columns && ` • ${hall.rows} rows × ${hall.columns} columns`}
                          </p>
                        </div>
                        {hall.supervisor && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded self-start sm:self-auto">
                            <UserCheck className="w-3 h-3 inline mr-1" />
                            {hall.supervisor}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Students: {hall.students?.length || 0}
                      </div>
                    </div>
                  ))}
                </div>
                {generatedSeating.summary && (
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
                    <p><strong>Utilization:</strong> {generatedSeating.summary.utilizationRate}</p>
                  </div>
                )}
              </div>
            )}

            {/* Saved Arrangements */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Saved Arrangements</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {savedSeatings.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-500">No saved arrangements</p>
                ) : (
                  savedSeatings.map((seating) => (
                    <div
                      key={seating._id}
                      className="border rounded-lg p-2 sm:p-3 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-xs sm:text-sm">{seating.examName}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(seating.examDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {seating.classes?.length || 0} classes, {seating.totalStudents} students
                          </p>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleViewSeating(seating._id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(seating._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

