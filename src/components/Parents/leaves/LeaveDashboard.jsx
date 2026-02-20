// src/components/Parents/leaves/LeaveDashboard.jsx

import LeaveApplicationForm from "../leaves/LeaveApplicationForm";
import ParentLeaveList from "../leaves/ParentLeaveList";
import { useTranslation } from "react-i18next";

const LeaveDashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary mb-2">{t('parent.leave.title')}</h1>
      <LeaveApplicationForm />
      <ParentLeaveList />
    </div>
  );
};

export default LeaveDashboard; // ✅ Default export
