import React, { useState } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import { toast } from "react-hot-toast";

const OfflinePaymentTest = () => {
  const { initiateOfflinePayment, offlinePaymentLoading } = useFeeStore();
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");

  const handleTestOfflinePayment = async () => {
    if (!studentId || !amount) {
      toast.error("Please enter both student ID and amount");
      return;
    }

    try {
      const result = await initiateOfflinePayment(studentId, parseFloat(amount));
      if (result) {
        toast.success("Offline payment test successful!");
        setStudentId("");
        setAmount("");
      }
    } catch (error) {
      console.error("Test failed:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">🧪 Test Offline Payment</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student ID
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter student ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
            min="1"
          />
        </div>

        <button
          onClick={handleTestOfflinePayment}
          disabled={offlinePaymentLoading || !studentId || !amount}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {offlinePaymentLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Testing...
            </>
          ) : (
            "Test Offline Payment"
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This will create a pending offline payment request. 
          Use the admin panel to verify the payment.
        </p>
      </div>
    </div>
  );
};

export default OfflinePaymentTest;
