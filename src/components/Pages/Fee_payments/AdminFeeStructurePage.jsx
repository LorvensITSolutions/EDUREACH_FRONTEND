import React, { useState, useEffect } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import { Loader2, Plus, Trash2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getApiUrl } from "../../../utils/api";
import { getCurrentAcademicYear, getAcademicYearOptions } from "../../../utils/academicYear";

const AdminFeeStructurePage = () => {
  const { createFeeStructure, loading } = useFeeStore();

  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [totalFee, setTotalFee] = useState("");
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [breakdownFields, setBreakdownFields] = useState([
    { label: "", amount: "" },
  ]);

  // Dynamic classes and sections from backend
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Initialize academic year options
  useEffect(() => {
    setAcademicYearOptions(getAcademicYearOptions(2, 2)); // 2 years before, 2 years after
  }, []);

  // Fetch classes and sections from backend
  useEffect(() => {
    const fetchClassesAndSections = async () => {
      try {
        setLoadingOptions(true);
        const response = await fetch(getApiUrl('/students/unique-values'), {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Transform classes data
          const transformedClasses = data.classes.map(cls => ({
            value: cls,
            label: `Class ${cls}`
          }));
          
          // Transform sections data
          const transformedSections = data.sections.map(sec => ({
            value: sec,
            label: `Section ${sec}`
          }));
          
          setClassOptions(transformedClasses);
          setSectionOptions(transformedSections);
        } else {
          toast.error('Failed to fetch classes and sections');
        }
      } catch (error) {
        console.error('Error fetching classes and sections:', error);
        toast.error('Error fetching classes and sections');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchClassesAndSections();
  }, []);

  const handleBreakdownChange = (index, field, value) => {
    const updated = [...breakdownFields];
    
    // For label field, check length limit
    if (field === "label" && value.length > 20) {
      toast.error("Label cannot exceed 20 characters");
      return;
    }
    
    updated[index][field] = value;
    setBreakdownFields(updated);
  };

  const addBreakdownField = () => {
    setBreakdownFields([...breakdownFields, { label: "", amount: "" }]);
  };

  const removeBreakdownField = (index) => {
    const updated = breakdownFields.filter((_, i) => i !== index);
    setBreakdownFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!className || !section) {
      toast.error("Please select both class and section");
      return;
    }

    const breakdown = breakdownFields.reduce((acc, curr) => {
      if (curr.label && curr.amount) acc[curr.label] = Number(curr.amount);
      return acc;
    }, {});

    const feeData = {
      className,
      section,
      academicYear,
      totalFee: Number(totalFee),
      breakdown,
    };

    try {
      await createFeeStructure(feeData);
      // Reset form after successful creation
      setClassName("");
      setSection("");
      setTotalFee("");
      setBreakdownFields([{ label: "", amount: "" }]);
    } catch (error) {
      console.error("Error creating fee structure:", error);
    }
  };

  if (loadingOptions) {
    return (
      <div className="min-h-screen bg-background text-text p-2 sm:p-4 md:p-6 flex items-center justify-center">
        <motion.div
          className="w-full max-w-4xl bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-card border border-gray-200 p-4 sm:p-6 md:p-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
            <div className="text-center">
              <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4 text-primary" />
              <p className="text-sm sm:text-base text-gray-600">Loading classes and sections...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text p-2 sm:p-4 md:p-6 flex items-center justify-center ">
      <motion.div
        className="w-full max-w-4xl bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-card border border-gray-200 p-3 sm:p-5 md:p-8 pt-3 sm:pt-4 md:pt-6 mt-3"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-primary mb-3 sm:mb-4 md:mb-6 animate-fade-in mt-10">
          Create Fee Structure
        </h1>
        
        {/* Selected Class and Section Display */}
        {className && section && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4 md:mb-5 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg"
          >
            <p className="text-center text-primary font-medium text-sm sm:text-base">
              Creating fee structure for: <span className="font-bold block sm:inline">{classOptions.find(c => c.value === className)?.label}</span> <span className="hidden sm:inline">-</span> <span className="font-bold block sm:inline">{sectionOptions.find(s => s.value === section)?.label}</span>
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {/* Class Dropdown */}
            <motion.div
              className="flex flex-col gap-1"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <label className="font-medium text-xs sm:text-sm text-gray-700">
                Class
              </label>
              <div className="relative">
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white text-sm sm:text-base"
                  required
                  disabled={loadingOptions}
                >
                  <option value="">
                    {loadingOptions ? "Loading classes..." : "Select a class"}
                  </option>
                  {classOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
              </div>
            </motion.div>

            {/* Section Dropdown */}
            <motion.div
              className="flex flex-col gap-1"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <label className="font-medium text-xs sm:text-sm text-gray-700">
                Section
              </label>
              <div className="relative">
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white text-sm sm:text-base"
                  required
                  disabled={loadingOptions}
                >
                  <option value="">
                    {loadingOptions ? "Loading sections..." : "Select a section"}
                  </option>
                  {sectionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
              </div>
            </motion.div>

            {/* Academic Year Dropdown */}
            <motion.div
              className="flex flex-col gap-1"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <label className="font-medium text-xs sm:text-sm text-gray-700">
                Academic Year
              </label>
              <div className="relative">
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white text-sm sm:text-base"
                  required
                >
                  {academicYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year} {year === getCurrentAcademicYear() ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-xs mt-1 text-gray-500">
                Current Academic Year: {getCurrentAcademicYear()}
              </p>
            </motion.div>

            {/* Total Fee Input */}
            <motion.div
              className="flex flex-col gap-1"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <label className="font-medium text-xs sm:text-sm text-gray-700">
                Total Fee
              </label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={totalFee}
                onChange={(e) => setTotalFee(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                required
              />
            </motion.div>
          </motion.div>

          <div>
            <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-2 text-primary-dark">Breakdown</h2>
            {breakdownFields.map((field, index) => (
              <motion.div
                key={index}
                className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center mb-3 sm:mb-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Label (e.g. Tuition)"
                    className={`flex-1 w-full px-3 py-2 rounded-md border text-sm sm:text-base ${
                      field.label && field.label.length >= 20
                        ? "border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                        : "border-gray-300 focus:ring-2 focus:ring-primary"
                    }`}
                    value={field.label}
                    maxLength={20}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Prevent typing if limit reached
                      if (value.length <= 20) {
                        handleBreakdownChange(index, "label", value);
                      } else {
                        toast.error("Label cannot exceed 20 characters");
                      }
                    }}
                  />
                  {field.label && (
                    <p className={`text-xs mt-1 ${
                      field.label.length >= 20 ? "text-yellow-600 font-medium" : "text-gray-500"
                    }`}>
                      {field.label.length}/20 characters
                      {field.label.length >= 20 && " (Limit reached)"}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Amount"
                    className="flex-1 sm:w-32 px-3 py-2 rounded-md border border-gray-300 text-sm sm:text-base"
                    value={field.amount}
                    onChange={(e) =>
                      handleBreakdownChange(index, "amount", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeBreakdownField(index)}
                    className="text-danger hover:text-red-700 transition p-1 sm:p-0"
                    aria-label="Remove field"
                  >
                    <Trash2 size={18} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            <button
              type="button"
              onClick={addBreakdownField}
              className="mt-2 sm:mt-2 flex items-center text-accent hover:text-accent-dark font-medium transition text-sm sm:text-base"
            >
              <Plus className="mr-1" size={16} />
              Add Another
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-primary text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-base sm:text-lg font-semibold hover:bg-primary-dark transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm sm:text-base">Creating...</span>
              </div>
            ) : (
              <span className="text-sm sm:text-base">Create Fee Structure</span>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminFeeStructurePage;
