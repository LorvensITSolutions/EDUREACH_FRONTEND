import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Plus, Upload, BarChart3, Image } from "lucide-react";
import StudentTable from "../students/StudentsTable";
import UploadStudentForm from "../students/UploadStudentForm";
import StudentSummary from "../students/StudentSummary";
import CreateStudentForm from "../students/CreateStudentForm";
import UpdateStudentImages from "../admin/UpdateStudentImages";

// Custom styles for mobile responsiveness
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 475px) {
    .xs\\:hidden {
      display: none !important;
    }
    .xs\\:inline {
      display: inline !important;
    }
  }
`;

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { t } = useTranslation();

  const tabs = [
    { id: "list", label: "Student List", icon: Users },
    { id: "create", label: "Add Student", icon: Plus },
    { id: "upload", label: "Bulk Upload", icon: Upload },
    { id: "images", label: "Update Images", icon: Image },
    { id: "summary", label: "Summary", icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "list":
        return <StudentTable />;
      case "create":
        return (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
                Create New Student
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-2">
                Click the button below to open the student creation form
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow hover:bg-primary-dark transition flex items-center gap-2 mx-auto text-sm sm:text-base"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Create Student</span>
                <span className="xs:hidden">Create</span>
              </button>
            </div>
          </div>
        );
      case "upload":
        return <UploadStudentForm />;
      case "images":
        return <UpdateStudentImages />;
      case "summary":
        return <StudentSummary />;
      default:
        return <StudentTable />;
    }
  };

  return (
    <>
      <style jsx>{styles}</style>
      <div className="h-full space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
          {t('menu.admin.students')}
        </h1>
      </div>

      {/* Tab Navigation - Mobile Responsive */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md">
        <div className="border-b border-gray-200">
          {/* Mobile Tab Navigation */}
          <nav className="flex overflow-x-auto scrollbar-hide px-2 sm:px-6" aria-label="Tabs">
            <div className="flex space-x-1 sm:space-x-8 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors min-w-fit`}
                  >
                    <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
                    <span className="xs:hidden sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Tab Content - Mobile Responsive */}
      <div className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
        <div className="w-full">
          {renderTabContent()}
        </div>
      </div>

      {/* Create Student Modal */}
      <CreateStudentForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      </div>
    </>
  );
};

export default StudentManagement;
