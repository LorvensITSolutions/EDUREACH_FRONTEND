/**
 * Academic Year Utility Functions
 * Handles academic year in "YYYY-YYYY" format (e.g., "2025-2026")
 */

/**
 * Get current academic year in "YYYY-YYYY" format
 * Assumes academic year runs from June to May (standard in many countries)
 */
export const getCurrentAcademicYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11 (Jan = 0, Dec = 11)
  
  // If current month is June (5) or later, academic year is currentYear-nextYear
  // If current month is before June, academic year is previousYear-currentYear
  if (currentMonth >= 5) { // June (5) to December (11)
    return `${currentYear}-${currentYear + 1}`;
  } else { // January (0) to May (4)
    return `${currentYear - 1}-${currentYear}`;
  }
};

/**
 * Get next academic year
 * @param {string} academicYear - Format: "2025-2026"
 * @returns {string} - Next academic year "2026-2027"
 */
export const getNextAcademicYear = (academicYear) => {
  if (!academicYear || !academicYear.includes('-')) {
    return getCurrentAcademicYear();
  }

  const [startYear, endYear] = academicYear.split('-').map(y => parseInt(y));
  return `${startYear + 1}-${endYear + 1}`;
};

/**
 * Get previous academic year
 * @param {string} academicYear - Format: "2025-2026"
 * @returns {string} - Previous academic year "2024-2025"
 */
export const getPreviousAcademicYear = (academicYear) => {
  if (!academicYear || !academicYear.includes('-')) {
    const current = getCurrentAcademicYear();
    const [startYear, endYear] = current.split('-').map(y => parseInt(y));
    return `${startYear - 1}-${endYear - 1}`;
  }

  const [startYear, endYear] = academicYear.split('-').map(y => parseInt(y));
  return `${startYear - 1}-${endYear - 1}`;
};

/**
 * Get list of academic years (current, previous, next)
 * @param {number} yearsBefore - Number of years before current to include
 * @param {number} yearsAfter - Number of years after current to include
 * @returns {Array} - Array of academic year strings
 */
export const getAcademicYearOptions = (yearsBefore = 2, yearsAfter = 2) => {
  const current = getCurrentAcademicYear();
  const options = [];
  
  // Add previous years
  let year = current;
  for (let i = 0; i < yearsBefore; i++) {
    year = getPreviousAcademicYear(year);
    options.unshift(year);
  }
  
  // Add current year
  options.push(current);
  
  // Add next years
  year = current;
  for (let i = 0; i < yearsAfter; i++) {
    year = getNextAcademicYear(year);
    options.push(year);
  }
  
  return options;
};

/**
 * Validate academic year format
 * @param {string} academicYear - Should be "YYYY-YYYY"
 * @returns {boolean}
 */
export const isValidAcademicYear = (academicYear) => {
  if (!academicYear || typeof academicYear !== 'string') return false;
  
  const parts = academicYear.split('-');
  if (parts.length !== 2) return false;
  
  const [startYear, endYear] = parts.map(y => parseInt(y));
  if (isNaN(startYear) || isNaN(endYear)) return false;
  if (endYear !== startYear + 1) return false; // End year should be start year + 1
  
  return true;
};

/**
 * Format academic year for display
 * @param {string} academicYear - Format: "2025-2026"
 * @returns {string} - Formatted: "2025-26" or "2025-2026"
 */
export const formatAcademicYear = (academicYear, short = false) => {
  if (!academicYear || !academicYear.includes('-')) return academicYear;
  
  if (short) {
    const [startYear, endYear] = academicYear.split('-');
    return `${startYear}-${endYear.slice(-2)}`; // "2025-26"
  }
  
  return academicYear; // "2025-2026"
};

