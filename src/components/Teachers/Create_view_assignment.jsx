import React, { useState } from "react";
import CreateAssignment from "../Teachers/UploadAssignment";
import ViewAssignments from "../Teachers/List_assignmnents";

const CreateAssignmentsPage = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-6">
      {/* Tabs */}
      <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition whitespace-nowrap ${
            activeTab === "create"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Create Assignment
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition whitespace-nowrap ${
            activeTab === "view"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          View Assignments
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "create" ? <CreateAssignment /> : <ViewAssignments />}
    </div>
  );
};

export default CreateAssignmentsPage;
