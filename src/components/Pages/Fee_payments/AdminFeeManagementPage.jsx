import React, { useState } from "react";
import AdminFeeStructureList from "../Fee_payments/AdminFeeStructureList";
import AdminFeeStructurePage from "../Fee_payments/AdminFeeStructurePage";
import All_Students_Fee from "../Fee_payments/All_Students_Fee";
import PendingOfflinePayment from "../Fee_payments/PendingOfflinePayments";
import { motion } from "framer-motion";
import CustomFeeForm from "../Fee_payments/CustomFeeForm";
// import AdminPaymentReceipts from "../Fee_payments/AdminPaymentReceipts";

const AdminFeeManagementPage = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="min-h-screen bg-background px-2 py-4 sm:px-4 sm:py-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-4 sm:mb-6">
          Fee Management
        </h1>
 
        {/* ✅ Tab Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "create"
                ? "bg-primary text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Create Structure
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "view"
                ? "bg-primary text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            View All Structures
          </button>

          <button
            onClick={() => setActiveTab("Get-ALL")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "Get-ALL"
                ? "bg-primary text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Students Fee
          </button>
          <button
            onClick={() => setActiveTab("offline_payment")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "offline_payment"
                ? "bg-primary text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Pending Offline Payments
          </button>

          <button
            onClick={() => setActiveTab("custom")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "custom"
                ? "bg-primary text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Assign Custom Fee
          </button>
        </div>

        {/* ✅ Tab Content */}
        {activeTab === "create" && (
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-card border border-gray-100">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary mb-3 sm:mb-4">
              Create New Fee Structure
            </h2>
            <AdminFeeStructurePage />
          </div>
        )}

        {activeTab === "view" && (
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-card border border-gray-100">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary mb-3 sm:mb-4">
              All Fee Structures
            </h2>
            <AdminFeeStructureList />
          </div>
        )}

        {activeTab === "Get-ALL" && (
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-card border border-gray-100">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary mb-3 sm:mb-4">
              ALL Students Fee Status
            </h2>
            <All_Students_Fee/>
          </div>
        )}
        {activeTab === "offline_payment" && (
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-card border border-gray-100">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary mb-3 sm:mb-4">
              Pending Offline Payments
            </h2>
            <PendingOfflinePayment/>
          </div>
        )}

        {activeTab === "custom" && (
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-card border border-gray-100">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary mb-3 sm:mb-4">
              Assign Custom Fee to Student
            </h2>
            <CustomFeeForm />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminFeeManagementPage;
