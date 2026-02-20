import React, { useEffect, useState, useMemo } from "react";
import { useClassTeacherStore } from "../stores/useClassTeacherStore";
import { MessageCircle, ChevronDown } from "lucide-react";
import { getCurrentAcademicYear, getNextAcademicYear } from "../../utils/academicYear";

const ClassTeachersInfo = () => {
  const { fetchClassTeachers, teachers, studentInfo, children, previousClassTeachers, loading, error } =
    useClassTeacherStore();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedAcademicYearForChild, setSelectedAcademicYearForChild] = useState({}); // For multiple children

  useEffect(() => {
    fetchClassTeachers(); // will fetch based on user role and attached student info
  }, []);

  // Check if we have multiple children
  const hasMultipleChildren = children && Array.isArray(children) && children.length > 1;

  // Get unique academic years from previous class teachers
  const availableAcademicYears = useMemo(() => {
    const years = new Set();
    if (previousClassTeachers && previousClassTeachers.length > 0) {
      previousClassTeachers.forEach(prev => {
        if (prev.academicYear) years.add(prev.academicYear);
      });
    }
    if (children && Array.isArray(children)) {
      children.forEach(child => {
        if (child.previousClassTeachers && child.previousClassTeachers.length > 0) {
          child.previousClassTeachers.forEach(prev => {
            if (prev.academicYear) years.add(prev.academicYear);
          });
        }
      });
    }
    return Array.from(years).sort().reverse(); // Sort descending (newest first)
  }, [previousClassTeachers, children]);

  // Get teachers for selected academic year - for single child
  const getTeachersForAcademicYear = (academicYear) => {
    if (!academicYear) return [];
    if (previousClassTeachers && previousClassTeachers.length > 0) {
      return previousClassTeachers.filter(prev => prev.academicYear === academicYear);
    }
    return [];
  };

  // Get teachers for selected academic year - for specific child (multiple children)
  const getTeachersForAcademicYearForChild = (childData, academicYear) => {
    if (!academicYear || !childData.previousClassTeachers) return [];
    return childData.previousClassTeachers.filter(prev => prev.academicYear === academicYear);
  };

  // Determine child's current academic year based on promotion
  const getChildAcademicYear = (childData) => {
    const currentAcademicYear = getCurrentAcademicYear();
    
    if (!childData.student || !childData.student.promotionHistory) {
      return currentAcademicYear;
    }

    const promotionHistory = childData.student.promotionHistory || [];
    
    // Check if student was promoted in the current academic year (and not reverted)
    const promotionInCurrentYear = promotionHistory.find(
      p => p.academicYear === currentAcademicYear && 
           p.promotionType === 'promoted' && 
           !p.reverted
    );
    
    // If promoted in current year, they should see the next academic year
    if (promotionInCurrentYear) {
      return getNextAcademicYear(currentAcademicYear);
    }
    
    return currentAcademicYear;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
        📘 Class Teachers
      </h2>

      {loading && <p className="text-info">Loading teacher info...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* Single child display */}
      {studentInfo && !hasMultipleChildren && (
        <div className="bg-white shadow rounded-xl p-4 mb-6">
          <p className="text-lg font-semibold text-text">
            👤 <span className="text-primary">{studentInfo.name}</span>
          </p>
          <p className="text-md text-gray-600">
            🎓 Class {studentInfo.class} - Section {studentInfo.section}
          </p>
        </div>
      )}

      {/* Multiple children display */}
      {hasMultipleChildren ? (
        children.map((childData, groupIdx) => (
          <div key={childData.student?._id || groupIdx} className="mb-8">
            <div className="bg-white shadow rounded-xl p-4 mb-4">
              <p className="text-lg font-semibold text-text">
                👤 <span className="text-primary">{childData.student?.name}</span>
              </p>
              <p className="text-md text-gray-600">
                🎓 Class {childData.student?.class} - Section {childData.student?.section}
              </p>
            </div>

            {(!childData.teachers || childData.teachers.length === 0) ? (
              <p className="text-gray-500 italic">No class teachers assigned yet.</p>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Current Class Teachers
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Academic Year: {getChildAcademicYear(childData)}
                    {getChildAcademicYear(childData) !== getCurrentAcademicYear() && " (Your Year)"}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {childData.teachers.map((teacher, idx) => (
                    <div
                      key={`${childData.student?._id}-${idx}`}
                      className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6"
                    >
                      <h3 className="text-xl font-semibold text-primary-dark mb-1">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-gray-700 mb-1">
                        📧 {teacher.email}
                      </p>
                      <p className="text-sm text-gray-700 mb-1">
                        📞 {teacher.phone || "N/A"}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        📚 Subject: {teacher.subject}
                      </p>

                      {teacher.whatsappLink && (
                        <a
                          href={teacher.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat on WhatsApp
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Previous Class Teachers */}
                {childData.previousClassTeachers && childData.previousClassTeachers.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                        📚 Previous Class Teachers
                      </h3>
                      <div className="relative">
                        <select
                          value={selectedAcademicYearForChild[childData.student?._id] || ""}
                          onChange={(e) => setSelectedAcademicYearForChild({
                            ...selectedAcademicYearForChild,
                            [childData.student?._id]: e.target.value || null
                          })}
                          className="appearance-none bg-white border-2 border-primary rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                        >
                          <option value="">Select Academic Year</option>
                          {Array.from(new Set(childData.previousClassTeachers.map(p => p.academicYear)))
                            .sort()
                            .reverse()
                            .map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    
                    {selectedAcademicYearForChild[childData.student?._id] ? (
                      // Show teachers for selected academic year
                      getTeachersForAcademicYearForChild(childData, selectedAcademicYearForChild[childData.student?._id]).map((prevClass, classIdx) => (
                        <div key={classIdx} className="mb-6">
                          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-4 border-l-4 border-primary">
                            <h4 className="font-semibold text-gray-800 mb-1">
                              Class {prevClass.class} - Section {prevClass.section}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Academic Year: {prevClass.academicYear}
                            </p>
                          </div>
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {prevClass.teachers.map((teacher, idx) => (
                              <div
                                key={`${childData.student?._id}-prev-${classIdx}-${idx}`}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200"
                              >
                                <h3 className="text-lg font-semibold text-primary-dark mb-2">
                                  {teacher.name}
                                </h3>
                                <div className="space-y-1.5 mb-3">
                                  <p className="text-sm text-gray-700 flex items-center gap-2">
                                    <span>📧</span> {teacher.email}
                                  </p>
                                  <p className="text-sm text-gray-700 flex items-center gap-2">
                                    <span>📞</span> {teacher.phone || "N/A"}
                                  </p>
                                  <p className="text-sm text-gray-700 flex items-center gap-2">
                                    <span>📚</span> Subject: {teacher.subject}
                                  </p>
                                </div>

                                {teacher.whatsappLink && (
                                  <a
                                    href={teacher.whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    Chat on WhatsApp
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">Please select an academic year to view previous class teachers</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))
      ) : (
        /* Single child or no children - display all teachers */
        <>
          {teachers.length > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                Current Class Teachers
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Academic Year: {getCurrentAcademicYear()}
              </span>
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.length === 0 && !loading ? (
              <p className="text-gray-500 italic">No class teachers found.</p>
            ) : (
              teachers.map((teacher, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6"
                >
                  <h3 className="text-xl font-semibold text-primary-dark mb-1">
                    {teacher.name}
                  </h3>
                  <p className="text-sm text-gray-700 mb-1">
                    📧 {teacher.email}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    📞 {teacher.phone || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    📚 Subject: {teacher.subject}
                  </p>

                  {teacher.whatsappLink && (
                    <a
                      href={teacher.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Previous Class Teachers for Single Child */}
          {previousClassTeachers && previousClassTeachers.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                  📚 Previous Class Teachers
                </h3>
                <div className="relative">
                  <select
                    value={selectedAcademicYear || ""}
                    onChange={(e) => setSelectedAcademicYear(e.target.value || null)}
                    className="appearance-none bg-white border-2 border-primary rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                  >
                    <option value="">Select Academic Year</option>
                    {availableAcademicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              {selectedAcademicYear ? (
                // Show teachers for selected academic year
                getTeachersForAcademicYear(selectedAcademicYear).map((prevClass, classIdx) => (
                  <div key={classIdx} className="mb-6">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-4 border-l-4 border-primary">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        Class {prevClass.class} - Section {prevClass.section}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Academic Year: {prevClass.academicYear}
                      </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {prevClass.teachers.map((teacher, idx) => (
                        <div
                          key={`prev-${classIdx}-${idx}`}
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200"
                        >
                          <h3 className="text-lg font-semibold text-primary-dark mb-2">
                            {teacher.name}
                          </h3>
                          <div className="space-y-1.5 mb-3">
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <span>📧</span> {teacher.email}
                            </p>
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <span>📞</span> {teacher.phone || "N/A"}
                            </p>
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <span>📚</span> Subject: {teacher.subject}
                            </p>
                          </div>

                          {teacher.whatsappLink && (
                            <a
                              href={teacher.whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Chat on WhatsApp
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm">Please select an academic year to view previous class teachers</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassTeachersInfo;
