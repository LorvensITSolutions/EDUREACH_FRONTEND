import React, { useEffect, useState } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getCurrentAcademicYear, getAcademicYearOptions } from "../../../utils/academicYear";

const AdminFeeStructureList = () => {
  const {
    fetchAllStructures,
    feeStructures,
    loading,
    deleteStructure,
    updateStructure,
  } = useFeeStore();

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // New filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear()); // Default to current academic year
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  useEffect(() => {
    fetchAllStructures();
    // Initialize academic year options
    setAcademicYearOptions(getAcademicYearOptions(2, 2)); // 2 years before, 2 years after
  }, []);

  const handleEdit = (structure) => {
    setEditId(structure._id);
    setEditData({
      class: structure.class,
      section: structure.section,
      academicYear: structure.academicYear,
      totalFee: structure.totalFee,
    });
  };

  const handleUpdate = async () => {
    await updateStructure(editId, editData);
    setEditId(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  // ✅ Filtered list based on dropdown filters and search
  const filteredStructures = feeStructures
    .filter((s) =>
      `${s.class}${s.section}${s.academicYear}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .filter((s) => (selectedClass ? s.class === selectedClass : true))
    .filter((s) => (selectedSection ? s.section === selectedSection : true))
    .filter((s) => (selectedYear ? s.academicYear === selectedYear : true));

  // Unique values for dropdowns
  const uniqueClasses = [...new Set(feeStructures.map((s) => s.class))];
  const uniqueSections = [...new Set(feeStructures.map((s) => s.section))];
  
  // Combine dynamic academic year options with unique years from structures
  const allYearOptions = [...new Set([
    ...academicYearOptions,
    ...feeStructures.map((s) => s.academicYear)
  ])].sort().reverse(); // Sort descending (newest first)

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">All Fee Structures</h2>

        <input
          type="text"
          placeholder="Search class, section, or year..."
          className="border px-3 py-2 rounded-md w-full md:w-72 text-sm sm:text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
        <select
          className="border px-3 py-2 rounded-md text-sm sm:text-base"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Filter by Class</option>
          {uniqueClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded-md text-sm sm:text-base"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          <option value="">Filter by Section</option>
          {uniqueSections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded-md text-sm sm:text-base sm:col-span-2 md:col-span-1"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">All Academic Years</option>
          {allYearOptions.map((year) => (
            <option key={year} value={year}>
              {year} {year === getCurrentAcademicYear() ? '(Current)' : ''}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-24 sm:h-32">
          <Loader2 className="animate-spin text-primary" size={20} />
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            <AnimatePresence>
              {filteredStructures.length === 0 ? (
                <div className="text-center text-gray-500 p-4 text-sm">
                  No matching records found.
                </div>
              ) : (
                filteredStructures.map((structure) => (
                  <motion.div
                    key={structure._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-white shadow-md rounded-lg p-3 border border-gray-200"
                  >
                    {editId === structure._id ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-600">Class</label>
                          <input
                            type="text"
                            value={editData.class}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                class: e.target.value,
                              })
                            }
                            className="border px-2 py-1 rounded w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Section</label>
                          <input
                            type="text"
                            value={editData.section}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                section: e.target.value,
                              })
                            }
                            className="border px-2 py-1 rounded w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Year</label>
                          <input
                            type="text"
                            value={editData.academicYear}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                academicYear: e.target.value,
                              })
                            }
                            className="border px-2 py-1 rounded w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Total Fee</label>
                          <input
                            type="number"
                            value={editData.totalFee}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                totalFee: e.target.value,
                              })
                            }
                            className="border px-2 py-1 rounded w-full text-sm"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            className="text-green-600 hover:text-green-800 p-1"
                            onClick={handleUpdate}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-800 p-1"
                            onClick={cancelEdit}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Class:</span>
                          <span className="font-medium text-sm">{structure.class}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Section:</span>
                          <span className="font-medium text-sm">{structure.section}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Year:</span>
                          <span className="font-medium text-sm">{structure.academicYear}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Total Fee:</span>
                          <span className="font-semibold text-sm text-primary">₹{structure.totalFee}</span>
                        </div>
                        <div className="flex gap-3 pt-2 border-t border-gray-200">
                          <button
                            className="text-blue-600 hover:text-blue-800 p-1"
                            onClick={() => handleEdit(structure)}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 p-1"
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this fee structure?")) {
                                try {
                                  await deleteStructure(structure._id);
                                } catch (error) {
                                  console.error("Delete error:", error);
                                }
                              }
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-3 text-left text-sm sm:text-base">Class</th>
                  <th className="p-3 text-left text-sm sm:text-base">Section</th>
                  <th className="p-3 text-left text-sm sm:text-base">Year</th>
                  <th className="p-3 text-left text-sm sm:text-base">Total Fee</th>
                  <th className="p-3 text-left text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredStructures.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-500 p-4 text-sm">
                        No matching records found.
                      </td>
                    </tr>
                  ) : (
                    filteredStructures.map((structure) => (
                      <motion.tr
                        key={structure._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="border-b"
                      >
                        {editId === structure._id ? (
                          <>
                            <td className="p-3">
                              <input
                                type="text"
                                value={editData.class}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    class: e.target.value,
                                  })
                                }
                                className="border px-2 py-1 rounded w-full text-sm"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={editData.section}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    section: e.target.value,
                                  })
                                }
                                className="border px-2 py-1 rounded w-full text-sm"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={editData.academicYear}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    academicYear: e.target.value,
                                  })
                                }
                                className="border px-2 py-1 rounded w-full text-sm"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={editData.totalFee}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    totalFee: e.target.value,
                                  })
                                }
                                className="border px-2 py-1 rounded w-full text-sm"
                              />
                            </td>
                            <td className="p-3 flex gap-2">
                              <button
                                className="text-green-600 hover:text-green-800 p-1"
                                onClick={handleUpdate}
                              >
                                <Check size={18} />
                              </button>
                              <button
                                className="text-gray-500 hover:text-gray-800 p-1"
                                onClick={cancelEdit}
                              >
                                <X size={18} />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-sm">{structure.class}</td>
                            <td className="p-3 text-sm">{structure.section}</td>
                            <td className="p-3 text-sm">{structure.academicYear}</td>
                            <td className="p-3 text-sm font-semibold">₹{structure.totalFee}</td>
                            <td className="p-3 flex gap-2">
                              <button
                                className="text-blue-600 hover:text-blue-800 p-1"
                                onClick={() => handleEdit(structure)}
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800 p-1"
                                onClick={async () => {
                                  if (window.confirm("Are you sure you want to delete this fee structure?")) {
                                    try {
                                      await deleteStructure(structure._id);
                                    } catch (error) {
                                      console.error("Delete error:", error);
                                    }
                                  }
                                }}
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </>
                        )}
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminFeeStructureList;
