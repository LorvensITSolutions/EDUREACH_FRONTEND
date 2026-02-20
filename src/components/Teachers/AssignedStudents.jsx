// src/components/Teachers/AssignedStudents.jsx
import React, { useEffect, useState } from "react";
import { useAttendanceTeacherStore } from "../stores/useAttendanceTeacherStore";

export const AssignedStudents = () => {
  const {
    assignedStudents,
    attendanceRecords,
    fetchAssignedStudentsWithAttendance,
    loading,
    error,
  } = useAttendanceTeacherStore();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  useEffect(() => {
    fetchAssignedStudentsWithAttendance(selectedDate);
  }, [selectedDate]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Assigned Students</h2>
        <div className="flex items-center gap-2">
          <label className="font-medium">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-1 rounded-md"
          />
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4">
        {assignedStudents.map((student) => (
          <div key={student._id} className="p-4 border rounded shadow">
            <h3 className="font-semibold">
              {student.name} - Class {student.class} {student.section}
            </h3>
            <p>Attendance for {selectedDate}:</p>
            <ul className="list-disc list-inside">
              {attendanceRecords
                .filter((a) => a.student._id === student._id)
                .map((record) => (
                  <li key={record._id}>
                    {new Date(record.date).toLocaleTimeString()} - {record.status}
                    {record.reason && ` (${record.reason})`}
                  </li>
                ))}
              {
                attendanceRecords.filter((a) => a.student._id === student._id).length === 0 && (
                  <li>No record found</li>
                )
              }
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
