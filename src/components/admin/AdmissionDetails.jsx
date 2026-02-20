import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAdmissionStore from "../stores/useAdmissionsStore";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const AdmissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedApplication,
    getApplicationById,
    loading,
    error,
    clearMessages,
  } = useAdmissionStore();

  useEffect(() => {
    getApplicationById(id);
  }, [id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearMessages();
    }
  }, [error]);

  if (loading || !selectedApplication) {
    return <p className="p-6 text-center text-gray-500">Loading details...</p>;
  }

  const {
    studentName,
    dateOfBirth,
    grade,
    gender,
    parentName,
    parentEmail,
    parentPhone,
    address,
    documents,
  } = selectedApplication;

  return (
    <div className="min-h-screen p-6 bg-background">
      <Toaster />

      {/* Back Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/admin-dashboard")}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4"
      >
        <ArrowLeft size={18} />
        Back to Admissions
      </motion.button>

      {/* Title */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-primary mb-6 text-center"
      >
        Application Details
      </motion.h1>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
          <div><strong>Student Name:</strong> {studentName}</div>
          <div><strong>Date of Birth:</strong> {new Date(dateOfBirth).toLocaleDateString()}</div>
          <div><strong>Gender:</strong> {gender}</div>
          <div><strong>Grade:</strong> {grade}</div>
          <div><strong>Parent Name:</strong> {parentName}</div>
          <div><strong>Parent Email:</strong> {parentEmail}</div>
          <div><strong>Parent Phone:</strong> {parentPhone}</div>
          <div><strong>Address:</strong> {address || "N/A"}</div>
        </div>

        {/* Documents */}
        {documents && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Uploaded Documents</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Object.entries(documents).map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-lg overflow-hidden shadow-sm bg-gray-50"
                >
                  <div className="p-3 border-b bg-primary text-white text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <img
                    src={value}
                    alt={key}
                    className="w-full h-48 object-cover object-top"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdmissionDetails;
