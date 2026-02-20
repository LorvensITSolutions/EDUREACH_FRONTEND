import React, { useState } from "react";
import AllBooksPage from "../Library_s_t/AllBooksPage";
import MyRequestsPage from "../Library_s_t/MyRequestsPage";
import MyIssuedBooksPage from "../Library_s_t/MyIssuedBooksPage";

const tabs = ["All Books", "My Requests", "My Issued Books"];

const LibraryDashboard = () => {
  const [activeTab, setActiveTab] = useState("All Books");

  const tabClass = (tab) =>
    `px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium transition whitespace-nowrap ${
      activeTab === tab
        ? "bg-primary text-white shadow"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="min-h-screen px-2 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 md:py-8 bg-background text-text">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-primary-dark">📚 Library Dashboard</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
        {tabs.map((tab) => (
          <button key={tab} className={tabClass(tab)} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Render components based on tab */}
      <div className="animate-fade-in">
        {activeTab === "All Books" && <AllBooksPage />}
        {activeTab === "My Requests" && <MyRequestsPage />}
        {activeTab === "My Issued Books" && <MyIssuedBooksPage />}
      </div>
    </div>
  );
};

export default LibraryDashboard;
