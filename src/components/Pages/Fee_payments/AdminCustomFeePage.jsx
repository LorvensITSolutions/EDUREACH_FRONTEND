import React, { useState } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import { Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const AdminCustomFeePage = () => {
  const { createOrUpdateCustomFee, customFeeLoading } = useFeeStore();

  const [student, setStudent] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [frequency, setFrequency] = useState("One-Time");
  const [dueDate, setDueDate] = useState("");
  const [lateFeePerDay, setLateFeePerDay] = useState(0);
  const [reason, setReason] = useState("");
  const [breakdownFields, setBreakdownFields] = useState([{ label: "", amount: "" }]);
  const [totalFee, setTotalFee] = useState("");

  // Auto calculate totalFee
  React.useEffect(() => {
    const total = breakdownFields.reduce((sum, field) => {
      const val = parseFloat(field.amount);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    setTotalFee(total.toFixed(2));
  }, [breakdownFields]);

  const handleBreakdownChange = (index, field, value) => {
    const updated = [...breakdownFields];
    updated[index][field] = value;
    setBreakdownFields(updated);
  };

  const addBreakdownField = () => {
    setBreakdownFields([...breakdownFields, { label: "", amount: "" }]);
  };

  const removeBreakdownField = (index) => {
    const updated = breakdownFields.filter((_, i) => i !== index);
    setBreakdownFields(updated);
    toast.success("Removed breakdown item");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!student || !className || !section || !academicYear || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const breakdown = breakdownFields.reduce((acc, curr) => {
      if (curr.label && curr.amount) acc[curr.label] = Number(curr.amount);
      return acc;
    }, {});

    const payload = {
      student,
      className,
      section,
      academicYear,
      totalFee: Number(totalFee),
      breakdown,
      frequency,
      dueDate,
      lateFeePerDay: Number(lateFeePerDay),
      reason,
    };

    const result = await createOrUpdateCustomFee(payload);
    if (result?.success) {
      setStudent("");
      setBreakdownFields([{ label: "", amount: "" }]);
      setLateFeePerDay(0);
      setReason("");
      toast.success("Custom fee updated");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background p-4">
      <motion.div
        className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-primary text-center">Custom Fee Assignment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Student ID"
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              className="input"
              required
            />
            <input
              type="text"
              placeholder="Class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="input"
              required
            />
            <input
              type="text"
              placeholder="Section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="input"
              required
            />
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="input"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="input"
            >
              <option value="One-Time">One-Time</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
              required
            />
            <input
              type="number"
              min="0"
              placeholder="Late Fee per Day"
              value={lateFeePerDay}
              onChange={(e) => setLateFeePerDay(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Breakdown</h3>
            {breakdownFields.map((field, index) => (
              <div key={index} className="flex gap-3 items-center mb-2">
                <input
                  type="text"
                  placeholder="Label"
                  className="flex-1 input"
                  value={field.label}
                  onChange={(e) => handleBreakdownChange(index, "label", e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-32 input"
                  min="0"
                  value={field.amount}
                  onChange={(e) => handleBreakdownChange(index, "amount", e.target.value)}
                  required
                />
                <button type="button" onClick={() => removeBreakdownField(index)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addBreakdownField} className="text-blue-600 mt-2">
              <Plus size={18} className="inline" /> Add Fee Item
            </button>
          </div>

          <div className="text-right font-semibold text-xl text-primary">
            Total Fee: ₹{totalFee}
          </div>

          <motion.button
            type="submit"
            disabled={customFeeLoading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition"
          >
            {customFeeLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </span>
            ) : (
              "Save Custom Fee"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminCustomFeePage;
