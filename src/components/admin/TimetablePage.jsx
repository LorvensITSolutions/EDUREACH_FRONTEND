// src/components/TimetableGeneratorForm.jsx
import React, { useState } from "react";
import { useTimetableStore } from "../stores/useTimetableStore";
import { useSubjectStore } from "../stores/useSubjectStore";

export default function TimetableGeneratorForm() {
  const {
    classes,
    teachers,
    days,
    periodsPerDay,
    timetable,
    loading,
    error,
    addClass,
    addTeacher,
    setDays,
    setPeriodsPerDay,
    generateTimetable,
    resetTimetable,
    teachersList,
    fetchTeachers,
  } = useTimetableStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { setDayNames } = useTimetableStore();

  // Local state for class input
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectPeriods, setSubjectPeriods] = useState(5);
  const [classSubjects, setClassSubjects] = useState([]);

  // Local state for teacher input
  const [teacherName, setTeacherName] = useState("");
  const [teacherSubjects, setTeacherSubjects] = useState("");
  const [selectedBackendSubjects, setSelectedBackendSubjects] = useState([]);
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

  // Local state for days input
  const [dayNames, setDayNamesLocal] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);

  // Options state
  const [avoidConsecutive, setAvoidConsecutive] = useState(false);
  const [shuffleAssignments, setShuffleAssignments] = useState(false);

  React.useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleAddSubjectToClass = () => {
    if (!subjectName) return;
    setClassSubjects([
      ...classSubjects,
      { name: subjectName, periodsPerWeek: subjectPeriods },
    ]);
    setSubjectName("");
    setSubjectPeriods(5);
  };

  const handleAddClass = () => {
    if (!className || classSubjects.length === 0) return;
    // Check if class already exists
    const existingClassIdx = classes.findIndex((c) => c.name === className);
    if (existingClassIdx !== -1) {
      // Merge subjects with existing class (avoid duplicates by subject name)
      const existingSubjects = classes[existingClassIdx].subjects;
      const newSubjects = classSubjects.filter(
        (s) => !existingSubjects.some((es) => es.name === s.name)
      );
      const updatedClasses = [...classes];
      updatedClasses[existingClassIdx] = {
        ...updatedClasses[existingClassIdx],
        subjects: [...existingSubjects, ...newSubjects],
      };
      // Replace the classes array in the store
      useTimetableStore.setState({ classes: updatedClasses });
    } else {
      addClass({
        name: className,
        subjects: classSubjects,
      });
    }
    setClassName("");
    setClassSubjects([]);
  };

  const handleAddTeacher = () => {
    if (!teacherName || (!teacherSubjects && selectedBackendSubjects.length === 0)) return;
    // Get backend subjects for this teacher (if any)
    const backendTeacher = teachersList.find(t => t.name === teacherName);
    const backendSubjects = backendTeacher
      ? (Array.isArray(backendTeacher.subject) ? backendTeacher.subject : [backendTeacher.subject])
      : [];
    // Combine backend, selected, and manual subjects
    const manualSubjects = teacherSubjects.split(",").map(s => s.trim()).filter(Boolean);
    const allSubjects = Array.from(new Set([...backendSubjects, ...selectedBackendSubjects, ...manualSubjects]));
    addTeacher({
      name: teacherName,
      subjects: allSubjects,
    });
    setTeacherName("");
    setTeacherSubjects("");
    setSelectedBackendSubjects([]);
  };

  const handleDayNamesChange = (e) => {
    const newDayNames = e.target.value
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    setDayNamesLocal(newDayNames);
    setDayNames(newDayNames); // update store
    setDays(newDayNames.length);
  };

  const handleGenerateTimetable = () => {
    generateTimetable({
      avoidConsecutiveSameSubject: avoidConsecutive,
      shuffleAssignments: shuffleAssignments,
    });
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Timetable Generator
        </h1>

        {/* Class Input */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Add Class</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-3">
              📚 Select subjects from the backend database. Add subjects through <strong>Subject Management</strong> if needed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. 10A, 9B"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Subject</option>
                  {subjects.length > 0 ? (
                    subjects.map(subj => (
                      <option key={subj._id} value={subj.name}>
                        {subj.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No subjects available</option>
                  )}
                </select>
                {subjects.length === 0 && (
                  <p className="text-xs text-danger mt-1">
                    No subjects found. Add subjects in Subject Management first.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periods/Week</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  min="1"
                  max="20"
                  value={subjectPeriods}
                  onChange={(e) => setSubjectPeriods(Number(e.target.value))}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddSubjectToClass}
              disabled={!subjectName || !className}
              className="mt-3 px-4 py-2 rounded bg-accent text-white hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Subject to Class
            </button>
          </div>
          {/* Show subjects added to class */}
          {classSubjects.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                📋 Subjects Added to {className || 'Class'}:
              </h3>
              <div className="flex flex-wrap gap-2">
                {classSubjects.map((s, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs">({s.periodsPerWeek}/week)</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={handleAddClass}
            className="mt-3 px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
          >
            Add Class
          </button>
        </section>

        {/* Classes Preview */}
        {classes.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Classes Added</h2>
            <ul className="space-y-2">
              {classes.map((c, i) => (
                <li
                  key={i}
                  className="p-3 bg-gray-50 rounded border flex flex-col gap-1"
                >
                  <span className="font-medium">{c.name}</span>
                  <div className="text-sm text-gray-600">
                    Subjects:{" "}
                    {c.subjects.map((s, idx) => (
                      <span key={idx} className="mr-2">
                        {s.name} ({s.periodsPerWeek} per week)
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Teacher Input */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Add Teacher</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Teacher Name"
              value={teacherName}
              onChange={(e) => {
                setTeacherName(e.target.value);
                setShowTeacherDropdown(true);
              }}
              onFocus={() => {
                fetchTeachers();
                setShowTeacherDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowTeacherDropdown(false), 150)}
              className="border p-2 rounded"
            />
            {/* Teacher dropdown suggestions */}
            {showTeacherDropdown && teachersList && teachersList.length > 0 && (
              <ul className="absolute bg-white border rounded shadow z-10 w-64 max-h-48 overflow-y-auto">
                {teachersList
                  .filter(t => t.name.toLowerCase().includes(teacherName.toLowerCase()))
                  .map((t, idx) => (
                    <li
                      key={idx}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => {
                        setTeacherName(t.name);
                        setTeacherSubjects(Array.isArray(t.subject) ? t.subject.join(", ") : t.subject);
                        setSelectedBackendSubjects(Array.isArray(t.subject) ? t.subject : [t.subject]);
                        setShowTeacherDropdown(false);
                      }}
                    >
                      <span className="font-medium">{t.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {Array.isArray(t.subject) ? t.subject.join(", ") : t.subject}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
            {/* Multi-select for backend subjects */}
            <select
              multiple
              value={selectedBackendSubjects}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedBackendSubjects(options);
              }}
              className="border p-2 rounded"
            >
              {subjects.map(subj => (
                <option key={subj._id} value={subj.name}>{subj.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Add extra subjects (comma separated)"
              value={teacherSubjects}
              onChange={e => setTeacherSubjects(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <button
            onClick={handleAddTeacher}
            className="mt-3 px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
          >
            Add Teacher
          </button>
        </section>

        {/* Teachers Preview */}
        {teachers.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Teachers Added</h2>
            <ul className="space-y-2">
              {teachers.map((t, i) => (
                <li
                  key={i}
                  className="p-3 bg-gray-50 rounded border flex flex-col gap-1"
                >
                  <span className="font-medium">{t.name}</span>
                  <div className="text-sm text-gray-600">
                    Subjects: {t.subjects.join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Days & Periods */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Schedule Settings</h2>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block mb-1">Days (comma separated)</label>
              <input
                type="text"
                value={dayNames.join(", ")}
                onChange={handleDayNamesChange}
                className="border p-2 rounded w-64"
              />
            </div>
            <div>
              <label className="block mb-1">Periods/Day</label>
              <input
                type="number"
                value={periodsPerDay}
                onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                className="border p-2 rounded w-24"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={avoidConsecutive}
                onChange={() => setAvoidConsecutive((v) => !v)}
              />
              Avoid Consecutive Same Subject
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={shuffleAssignments}
                onChange={() => setShuffleAssignments((v) => !v)}
              />
              Shuffle Assignments
            </label>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleGenerateTimetable}
            disabled={loading}
            className="px-6 py-2 rounded bg-accent text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Timetable"}
          </button>
          <button
            onClick={resetTimetable}
            className="px-6 py-2 rounded bg-danger text-white hover:bg-red-700"
          >
            Reset
          </button>
        </div>

        {/* Errors */}
        {error && <p className="mt-4 text-danger font-medium">{error}</p>}

        {/* Timetable Grid Preview */}
        {timetable && timetable.success && Array.isArray(timetable.classes) && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Generated Timetable
            </h2>
            {timetable.classes.map((cls, idx) => (
              <div key={idx} className="mb-10">
                <h3 className="text-lg font-bold mb-3 text-primary-dark">
                  Class: {cls.name}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg shadow">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="border px-4 py-2">Day / Period</th>
                        {Array.from({ length: periodsPerDay }).map((_, pIdx) => (
                          <th key={pIdx} className="border px-4 py-2">
                            Period {pIdx + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(timetable.days) ? timetable.days : dayNames).map((day, dIdx) => (
                        <tr
                          key={dIdx}
                          className={dIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="border px-4 py-2 font-medium">{day}</td>
                          {Array.from({ length: periodsPerDay }).map((_, pIdx) => {
                            // Handle the correct timetable structure
                            const dayTimetable = cls.timetable?.[day];
                            const slot = Array.isArray(dayTimetable) ? dayTimetable[pIdx] : null;
                            
                            return (
                              <td
                                key={pIdx}
                                className="border px-4 py-2 text-center"
                              >
                                {slot && slot.subject ? (
                                  <>
                                    <div className="font-semibold">
                                      {slot.subject}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {slot.teacher}
                                    </div>
                                  </>
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Debug: Show raw timetable data for this class */}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600">Debug: Raw Data</summary>
                  <pre className="bg-gray-100 text-xs p-2 mt-2 rounded overflow-x-auto">
                    {JSON.stringify(cls.timetable, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
