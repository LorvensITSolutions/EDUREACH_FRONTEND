import React, { useEffect, useState } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import { Loader2, Download, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import format from "date-fns/format";

const ParentPaymentHistoryPage = () => {
  const { payments, fetchMyPayments, loading, error, generateReceipt } = useFeeStore();
  const [generatingReceipt, setGeneratingReceipt] = useState({});

  useEffect(() => {
    fetchMyPayments();
  }, []);

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
        <span className="ml-2">Loading payment history...</span>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (payments.length === 0) {
    return <div className="text-gray-500 p-4">No payments found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      {payments.map((payment) => (
        <div
          key={payment._id}
          className="bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200"
        >
          <h2 className="font-semibold text-lg">
            {payment.student.name} - Class {payment.student.class} {payment.student.section}
          </h2>
          <p className="text-sm text-gray-500">
            Academic Year: {payment.academicYear}
          </p>

          <div className="mt-2 text-sm text-gray-700">
            <p>Amount Paid: ₹{payment.amountPaid} {payment.lateFee ? `(Late Fee: ₹${payment.lateFee})` : null}</p>
            <p>Method: {payment.paymentMethod || 'online'}</p>
            <p>Status: 
              <span className={`ml-1 font-semibold ${
                payment.status === "paid" ? "text-green-600" : payment.status === 'pending_verification' ? 'text-amber-600' : 'text-orange-500'
              }`}>
                {payment.status}
              </span>
            </p>
            <p>
              Paid At:{" "}
              {payment.paidAt
                ? format(new Date(payment.paidAt), "dd MMM yyyy, hh:mm a")
                : payment.updatedAt ? format(new Date(payment.updatedAt), "dd MMM yyyy, hh:mm a") : "N/A"}
            </p>
            {payment.razorpay && (
              <>
                <p className="text-xs text-gray-400 mt-1">Razorpay Order ID: {payment.razorpay?.orderId}</p>
                <p className="text-xs text-gray-400">Payment ID: {payment.razorpay?.paymentId || "Pending"}</p>
              </>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {payment.receiptUrl ? (
              <a
                href={payment.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                <FileText className="h-4 w-4" />
                View Receipt
              </a>
            ) : (
              <button
                onClick={() => handleGenerateReceipt(payment._id)}
                disabled={generatingReceipt[payment._id]}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
      ))}
    </div>
  );
};

export default ParentPaymentHistoryPage;
