import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAdmissionStore from "../stores/useAdmissionsStore";
import toast, { Toaster } from "react-hot-toast";
import { Eye, ArrowLeft, CheckCircle, XCircle, Clock, FileText, Download } from "lucide-react";
import NotificationStatus from "../shared/NotificationStatus";
import axios from "../lib/axios";

const AllAdmissions = () => {
  const applications = useAdmissionStore(state => state.applications);
  const fetchApplications = useAdmissionStore(state => state.fetchApplications);
  const reviewApplication = useAdmissionStore(state => state.reviewApplication);
  const loading = useAdmissionStore(state => state.loading);
  const error = useAdmissionStore(state => state.error);
  const clearMessages = useAdmissionStore(state => state.clearMessages);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewData, setReviewData] = useState({ status: '', reviewNotes: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []); // Remove fetchApplications from dependencies

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearMessages();
    }
  }, [error]); // Remove clearMessages from dependencies

  const filteredApps = applications.filter((app) => {
    const matchesName = app.studentName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade ? app.grade === selectedGrade : true;
    const matchesStatus = selectedStatus ? app.status === selectedStatus : true;
    return matchesName && matchesGrade && matchesStatus;
  });

  const gradeOptions = [...new Set(applications.map((app) => app.grade))];
  const statusOptions = ['submitted', 'reviewed', 'accepted', 'rejected'];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />;
      case 'reviewed':
        return <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReview = (app) => {
    setSelectedApp(app);
    setReviewData({ status: '', reviewNotes: '' });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    try {
      await reviewApplication(selectedApp._id, reviewData);
      toast.success('Application reviewed successfully!');
      setShowReviewModal(false);
      setSelectedApp(null);
      setReviewData({ status: '', reviewNotes: '' });
    } catch (error) {
      toast.error('Failed to review application');
    }
  };

  const handleExportAcceptedStudents = async () => {
    try {
      const response = await axios.get('/admissions/export/accepted', {
        responseType: 'blob', // Important for file download
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'Accepted_Students.xlsx';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.response?.data?.message || 'Failed to export accepted students');
    }
  };

  // Count accepted students
  const acceptedCount = filteredApps.filter(app => app.status === 'accepted').length;

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 bg-background">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
          Admission Applications
        </h1>
        {acceptedCount > 0 && (
          <button
            onClick={handleExportAcceptedStudents}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md w-full sm:w-auto"
            title="Download accepted students as Excel file"
          >
            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="whitespace-nowrap">Export Accepted ({acceptedCount})</span>
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-md w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-md w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Grades</option>
          {gradeOptions.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-md w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-sm sm:text-base text-gray-500 py-4 sm:py-6">Loading applications...</p>
      ) : filteredApps.length === 0 ? (
        <p className="text-center text-sm sm:text-base text-gray-400 py-4 sm:py-6">No matching applications found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-xs sm:text-sm text-left bg-white min-w-[800px]">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-2 sm:p-3 text-xs sm:text-sm">Student Name</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm">Grade</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm">DOB</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm">Parent Name</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm hidden md:table-cell">Email</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm">Phone</th>
                <th className="p-2 sm:p-3 text-center text-xs sm:text-sm">Status</th>
                <th className="p-2 sm:p-3 text-center text-xs sm:text-sm hidden lg:table-cell">Notifications</th>
                <th className="p-2 sm:p-3 text-center text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr
                  key={app._id}
                  className="border-b hover:bg-muted transition-colors"
                >
                  <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm break-words">{app.studentName}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{app.grade}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">{new Date(app.dateOfBirth).toLocaleDateString()}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm break-words">{app.parentName}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm hidden md:table-cell break-all">{app.parentEmail}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm break-words">{app.parentPhone}</td>
                  <td className="p-2 sm:p-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="hidden sm:inline">{getStatusIcon(app.status)}</span>
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)} whitespace-nowrap`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 text-center hidden lg:table-cell">
                    <NotificationStatus 
                      emailSent={true} 
                      whatsappSent={true}
                      showDetails={false}
                    />
                  </td>
                  <td className="p-2 sm:p-3 text-center">
                    <div className="flex justify-center space-x-1.5 sm:space-x-2">
                      <button
                        className="text-primary hover:text-accent p-1"
                        onClick={() => navigate(`/admin/admissions/${app._id}`)}
                        title="View Details"
                      >
                        <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1"
                        onClick={() => handleReview(app)}
                        title="Review Application"
                      >
                        <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

       {/* Review Modal */}
       {showReviewModal && selectedApp && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
           <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 w-full max-w-md">
             <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Review Application</h3>
             <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 break-words">
               Reviewing application for <strong>{selectedApp.studentName}</strong>
             </p>
             
             <div className="space-y-3 sm:space-y-4">
               <div>
                 <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                   Status
                 </label>
                 <select
                   value={reviewData.status}
                   onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                   className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required
                 >
                   <option value="">Select Status</option>
                   <option value="accepted">Accept</option>
                   <option value="rejected">Reject</option>
                   <option value="reviewed">Mark as Reviewed</option>
                 </select>
               </div>
               
               <div>
                 <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                   Review Notes (Optional)
                 </label>
                 <textarea
                   value={reviewData.reviewNotes}
                   onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
                   className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-md h-20 sm:h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                   placeholder="Add any notes about the review..."
                 />
               </div>
             </div>
             
             <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
               <button
                 onClick={() => {
                   setShowReviewModal(false);
                   setSelectedApp(null);
                   setReviewData({ status: '', reviewNotes: '' });
                 }}
                 className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 border rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto"
               >
                 Cancel
               </button>
               <button
                 onClick={handleReviewSubmit}
                 disabled={!reviewData.status || loading}
                 className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
               >
                 {loading ? 'Submitting...' : 'Submit Review'}
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default AllAdmissions;
