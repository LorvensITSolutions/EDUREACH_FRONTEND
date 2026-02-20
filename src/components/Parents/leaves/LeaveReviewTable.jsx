import { useEffect } from "react";
import { useLeaveStore } from "../../stores/useLeaveStore";
import { useUserStore } from "../../stores/useUserStore";
import { Loader2, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

const LeaveReviewTable = () => {
  const user = useUserStore((s) => s.user);
  const { 
    fetchAllLeaves, 
    fetchTeacherLeaves,
    allLeaves, 
    teacherLeaves,
    leaveStatistics,
    assignedStudents,
    updateLeaveStatus, 
    loading 
  } = useLeaveStore();

  // ✅ Get appropriate data based on user role
  const leaves = user?.role === 'teacher' ? teacherLeaves : allLeaves;
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isTeacher) {
      fetchTeacherLeaves(); // Fetch teacher-specific data
    } else if (isAdmin) {
      fetchAllLeaves(); // Fetch all data for admin
    }
  }, [isTeacher, isAdmin, fetchTeacherLeaves, fetchAllLeaves]);

const handleUpdateStatus = async (leaveId, status) => {
  let rejectionReason = "";

  if (status === "rejected") {
    rejectionReason = prompt("Enter reason for rejection:");
    if (!rejectionReason) return; // User canceled
  }

  await updateLeaveStatus({ leaveId, status, rejectionReason });
};


  return (
    <div className="bg-white p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-5 md:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary break-words">
          {isTeacher ? "My Students' Leave Applications" : "Student Leave Applications"}
        </h2>
        {isTeacher && assignedStudents.length > 0 && (
          <div className="text-xs sm:text-sm text-gray-600 flex items-center">
            <Users className="inline w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span>{assignedStudents.length} assigned students</span>
          </div>
        )}
      </div>

      {/* ✅ Statistics for Teachers */}
      {isTeacher && leaveStatistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
          <div className="bg-blue-50 p-2.5 sm:p-3 md:p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-1.5 sm:mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-blue-600">Pending</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800">{leaveStatistics.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-2.5 sm:p-3 md:p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 sm:mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-green-600">Approved</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-800">{leaveStatistics.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-2.5 sm:p-3 md:p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-1.5 sm:mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-red-600">Rejected</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-800">{leaveStatistics.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-2.5 sm:p-3 md:p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-1.5 sm:mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{leaveStatistics.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6 sm:py-8">
          <Loader2 className="animate-spin w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-sm sm:text-base text-gray-500 mb-2 break-words">
            {isTeacher ? "No leave applications from your assigned students." : "No leave applications found."}
          </p>
          {isTeacher && assignedStudents.length === 0 && (
            <p className="text-xs sm:text-sm text-gray-400">You don't have any assigned students yet.</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <table className="min-w-full text-xs sm:text-sm border border-gray-200 min-w-[800px]">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-1.5 sm:p-2 text-left text-xs sm:text-sm">Student</th>
                <th className="p-1.5 sm:p-2 text-left text-xs sm:text-sm">Class</th>
                <th className="p-1.5 sm:p-2 text-left text-xs sm:text-sm hidden md:table-cell">Date Range</th>
                <th className="p-1.5 sm:p-2 text-left text-xs sm:text-sm">Reason</th>
                <th className="p-1.5 sm:p-2 text-left text-xs sm:text-sm">Status</th>
                <th className="p-1.5 sm:p-2 text-left text-xs sm:text-sm hidden lg:table-cell">Rejection Reason</th>
                <th className="p-1.5 sm:p-2 text-left text-xs sm:text-sm hidden lg:table-cell">Reviewed By</th>
                <th className="p-1.5 sm:p-2 text-left text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id} className="border-b hover:bg-gray-50">
                  <td className="p-1.5 sm:p-2">
                    <div className="break-words">{leave.student?.name}</div>
                    <span className="text-xs text-gray-500">{leave.student?.studentId}</span>
                    <div className="text-xs text-gray-600 mt-1 md:hidden">
                      {format(new Date(leave.fromDate), "dd MMM")} - {format(new Date(leave.toDate), "dd MMM yyyy")}
                    </div>
                  </td>

                  <td className="p-1.5 sm:p-2 whitespace-nowrap">
                    {leave.student?.class}-{leave.student?.section}
                  </td>

                  <td className="p-1.5 sm:p-2 hidden md:table-cell whitespace-nowrap">
                    {format(new Date(leave.fromDate), "dd MMM yyyy")} →{" "}
                    {format(new Date(leave.toDate), "dd MMM yyyy")}
                  </td>

                  <td className="p-1.5 sm:p-2 max-w-[150px] sm:max-w-none">
                    <div className="break-words truncate sm:truncate-none" title={leave.reason}>
                      {leave.reason}
                    </div>
                  </td>

                  <td className="p-1.5 sm:p-2 font-medium">
                    <span
                      className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs whitespace-nowrap ${
                        leave.status === "approved"
                          ? "bg-green-100 text-green-600"
                          : leave.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="p-1.5 sm:p-2 text-xs sm:text-sm text-red-500 italic hidden lg:table-cell max-w-[150px]">
                    <div className="break-words truncate" title={leave.status === "rejected" ? (leave.rejectionReason || "No reason") : "-"}>
                      {leave.status === "rejected" ? leave.rejectionReason || "No reason" : "-"}
                    </div>
                  </td>

                  <td className="p-1.5 sm:p-2 text-xs sm:text-sm hidden lg:table-cell">
                    <div className="break-words">{leave.approvedBy?.name || "-"}</div>
                  </td>

                  <td className="p-1.5 sm:p-2">
                    {leave.status === "pending" && (
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          onClick={() => handleUpdateStatus(leave._id, "approved")}
                          className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-green-600 transition text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(leave._id, "rejected")}
                          className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-600 transition text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveReviewTable;
