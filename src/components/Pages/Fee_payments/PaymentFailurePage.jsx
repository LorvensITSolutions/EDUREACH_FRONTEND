// src/pages/Parent/PaymentFailurePage.jsx
import React from "react";
import { Link } from "react-router-dom";

const PaymentFailurePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Payment Failed ❌</h2>
        <p className="text-gray-700 mb-4">Unfortunately, your payment could not be completed.</p>
        <Link
          to="/parent-dashboard"
          className="mt-6 inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
