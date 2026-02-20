import React, { useState, lazy, Suspense } from "react";
import LmsManagement from "../Library/LMSSystem";
import { motion } from "framer-motion";
import { BookText, Settings } from "lucide-react";

const SecuritySettings = lazy(() =>
  import("../SecuritySettings").then((m) => ({
    default: m.default,
  }))
);

const LibraryDashboard = () => {
  const [activeTab, setActiveTab] = useState("library");

  const renderContent = () => {
    switch (activeTab) {
      case "library":
        return <LmsManagement />;
      case "settings":
        return (
          <div className="space-y-6 max-w-4xl">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="relative inline-block mb-8">
                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">Loading Security Settings...</h3>
                </div>
              </div>
            }>
              <SecuritySettings />
            </Suspense>
          </div>
        );
      default:
        return <LmsManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookText className="w-7 h-7 text-primary-dark" />
            <h1 className="text-2xl font-bold text-primary-dark">Librarian Dashboard</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "library"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookText className="w-4 h-4" />
                Library Management
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default LibraryDashboard;
