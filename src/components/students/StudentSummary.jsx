// src/components/students/StudentSummary.jsx
import { useEffect } from "react";
import { useStudentStore } from "../stores/useStudentStore";

const StudentSummary = () => {
  const { count, fetchStudentCount } = useStudentStore();

  useEffect(() => {
    fetchStudentCount();
  }, []);

  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-md flex justify-between items-center">
      <h2 className="text-base sm:text-lg font-semibold text-text">Total Students</h2>
      <span className="text-xl sm:text-2xl font-bold text-primary">{count}</span>
    </div>
  );
};

export default StudentSummary;
