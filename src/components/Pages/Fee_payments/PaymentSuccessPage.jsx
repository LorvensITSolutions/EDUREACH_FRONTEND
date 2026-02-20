// src/pages/Parent/PaymentSuccessPage.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";

const PaymentSuccessPage = () => {
  const { search } = useLocation();
  const paymentId = new URLSearchParams(search).get("payment_id");

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-50 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Payment Successful 🎉</h2>
        <p className="text-gray-700">Thank you for your payment.</p>
        {paymentId && (
          <p className="text-sm text-gray-500 mt-2">
            Payment ID: <span className="font-mono">{paymentId}</span>
          </p>
        )}
        <Link
          to="/parent-dashboard"
          className="mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Back to Fee Page
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
