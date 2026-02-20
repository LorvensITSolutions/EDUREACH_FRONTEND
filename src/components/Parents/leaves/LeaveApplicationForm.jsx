import { useState, useEffect } from "react";
import { useLeaveStore } from "../../stores/useLeaveStore";
import { useTranslation } from "react-i18next";
import axios from "../../lib/axios";

const LeaveApplicationForm = () => {
  const { applyLeave } = useLeaveStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    studentId: "",
    reason: "",
    fromDate: "",
    toDate: "",
  });

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/leaves/children");
      setChildren(response.data.children);
      if (response.data.children.length === 1) {
        setFormData(prev => ({ ...prev, studentId: response.data.children[0]._id }));
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId) {
      return alert(t('parent.leave.selectStudent'));
    }

    await applyLeave(formData);

    setFormData({ studentId: children.length === 1 ? children[0]._id : "", reason: "", fromDate: "", toDate: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-card p-8 space-y-6 w-full max-w-2xl mx-auto animate-slide-up"
    >
      <h2 className="text-2xl font-semibold text-primary">{t('parent.leave.apply')}</h2>

      {/* Student Selection */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-text">{t('parent.leave.selectStudent')}</label>
        {loading ? (
          <div className="border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 text-gray-500">
            {t('parent.leave.loading')}...
          </div>
        ) : (
          <select
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('parent.leave.chooseStudent')}</option>
            {children.map((child) => (
              <option key={child._id} value={child._id}>
                {child.name} - Class {child.class}-{child.section} ({child.studentId})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-text">{t('parent.leave.from')}</label>
          <input
            type="date"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-text">{t('parent.leave.to')}</label>
          <input
            type="date"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-text">{t('parent.leave.reason')}</label>
        <textarea
          name="reason"
          rows={4}
          value={formData.reason}
          onChange={handleChange}
          placeholder={t('parent.leave.placeholder')}
          required
          className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <button
        type="submit"
        className="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-hover"
      >
        {t('parent.leave.submit')}
      </button>
    </form>
  );
};

export default LeaveApplicationForm;
