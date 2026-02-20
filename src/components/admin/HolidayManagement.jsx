// components/admin/HolidayManagement.jsx
import HolidayForm from "./HolidayForm";
import HolidayList from "./HolidayList";

const HolidayManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Holiday Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage school holidays. Attendance cannot be marked on holidays.
        </p>
      </div>
      <HolidayForm />
      <HolidayList />
    </div>
  );
};

export default HolidayManagement;
