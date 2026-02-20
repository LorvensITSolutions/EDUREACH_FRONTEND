import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';

// Helper function to sort classes properly
// Handles both numeric classes (1, 2, 3...) and text classes (Nursery, LKG, UKG)
const sortClasses = (classes) => {
  if (!classes || classes.length === 0) return [];
  
  // Define the order for special classes (typically come before numeric classes)
  const classOrder = {
    'Nursery': 1,
    'NURSERY': 1,
    'nursery': 1,
    'LKG': 2,
    'lkg': 2,
    'UKG': 3,
    'ukg': 3,
  };
  
  return [...classes].sort((a, b) => {
    // Get order values (undefined if not in special list)
    const aOrder = classOrder[a];
    const bOrder = classOrder[b];
    
    // If both are special classes, use their defined order
    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }
    
    // If only a is special, it comes first
    if (aOrder !== undefined) {
      return -1;
    }
    
    // If only b is special, it comes first
    if (bOrder !== undefined) {
      return 1;
    }
    
    // Check if both are numeric
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    const aIsNum = !isNaN(aNum) && a.toString() === aNum.toString();
    const bIsNum = !isNaN(bNum) && b.toString() === bNum.toString();
    
    // If both are numeric, sort numerically
    if (aIsNum && bIsNum) {
      return aNum - bNum;
    }
    
    // If only a is numeric, it comes after special classes but before other text
    if (aIsNum && !bIsNum) {
      return -1;
    }
    
    // If only b is numeric, it comes after special classes but before other text
    if (!aIsNum && bIsNum) {
      return 1;
    }
    
    // If both are non-numeric and not special, sort alphabetically
    return a.localeCompare(b);
  });
};

export const useClassesAndSections = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassesAndSections = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl('/students/unique-values'), {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          // If no classes from backend, provide default classes
          const rawClasses = data.classes && data.classes.length > 0 ? data.classes : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'NURSERY'];
          // Sort classes properly (numeric first, then special classes)
          const sortedClasses = sortClasses(rawClasses);
          setClasses(sortedClasses);
          // If no sections from backend, provide default sections
          const sections = data.sections && data.sections.length > 0 ? data.sections : ['A', 'B', 'C', 'D'];
          setSections(sections);
          setError(null);
        } else {
          setError('Failed to fetch classes and sections');
        }
      } catch (err) {
        setError('Network error while fetching classes and sections');
        console.error('Error fetching classes and sections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndSections();
  }, []);

  return { classes, sections, loading, error };
};
