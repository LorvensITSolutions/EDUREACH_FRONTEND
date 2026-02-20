import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/library/my-requests");
        setRequests(res.data.requests);
      } catch (err) {
        console.error("Failed to fetch my requests", err);
        toast.error("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="p-2 sm:p-3 md:p-4 max-w-5xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary mb-3 sm:mb-4 flex items-center gap-2"
      >
        <FileText size={20} className="sm:w-6 sm:h-6 flex-shrink-0" /> 
        <span>My Book Requests</span>
      </motion.h2>

      {loading ? (
        <p className="text-center text-sm sm:text-base text-gray-600 animate-pulse">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-sm sm:text-base text-gray-500">No book requests yet.</p>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {requests.map((req) => (
            <motion.div
              key={req._id}
              className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm sm:text-base min-w-0 flex-1">
                <p className="font-medium text-text break-words mb-1">📘 {req.book?.title}</p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Requested:{" "}
                  {new Date(req.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span
                  className={`text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap
                    ${req.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : req.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                    }`}
                >
                  {req.status.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequestsPage;
