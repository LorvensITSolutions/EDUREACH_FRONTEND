import React, { useEffect, useState } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import { Loader2, Download, FileText, Search, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import format from "date-fns/format";

const AdminPaymentReceipts = () => {
  const { allStudentsFeeStatus, fetchAllStudentsFeeStatus, loading, error, generateReceipt } = useFeeStore();
  const [generatingReceipt, setGeneratingReceipt] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredPayments, setFilteredPayments] = useState([]);

  useEffect(() => {
    fetchAllStudentsFeeStatus();
  }, []);

  useEffect(() => {
    // Filter payments based on search term and status
    let filtered = allStudentsFeeStatus || [];
    
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student?.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student?.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.parent?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }
    
    setFilteredPayments(filtered);
  }, [allStudentsFeeStatus, searchTerm, statusFilter]);

  const handleGenerateReceipt = async (paymentId) => {
    setGeneratingReceipt(prev => ({ ...prev, [paymentId]: true }));
    try {
      const receiptUrl = await generateReceipt(paymentId);
      if (receiptUrl) {
        // Open receipt in new tab
        window.open(receiptUrl, '_blank');
      }
    } catch (error) {
      console.error('Receipt generation failed:', error);
    } finally {
      setGeneratingReceipt(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
        <span className="ml-2">Loading payment data...</span>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by student name, class, section, or parent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payments found matching your criteria.
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Payment Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {payment.student?.name || "Unknown Student"}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === "paid" 
                        ? "bg-green-100 text-green-800" 
                        : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {payment.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Class & Section:</span>
                      <p>{payment.student?.class} {payment.student?.section}</p>
                    </div>
                    <div>
                      <span className="font-medium">Parent:</span>
                      <p>{payment.parent?.name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>
                      <p>₹{payment.amountPaid || payment.totalAmount || "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Payment Date:</span>
                      <p>
                        {payment.paidAt 
                          ? format(new Date(payment.paidAt), "dd MMM yyyy")
                          : payment.updatedAt 
                          ? format(new Date(payment.updatedAt), "dd MMM yyyy")
                          : "N/A"
                        }
                      </p>
                    </div>
                  </div>
                  
                  {payment.paymentMethod && (
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Method:</span> {payment.paymentMethod}
                    </div>
                  )}
                </div>

                {/* Receipt Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {payment.receiptUrl ? (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      View Receipt
                    </a>
                  ) : (
                    <button
                      onClick={() => handleGenerateReceipt(payment._id)}
                      disabled={generatingReceipt[payment._id]}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingReceipt[payment._id] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Generate Receipt
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredPayments.filter(p => p.status === "paid").length}
          </div>
          <div className="text-sm text-green-700">Paid Payments</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredPayments.filter(p => p.status === "pending").length}
          </div>
          <div className="text-sm text-yellow-700">Pending Payments</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {filteredPayments.filter(p => p.status === "overdue").length}
          </div>
          <div className="text-sm text-red-700">Overdue Payments</div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentReceipts;

