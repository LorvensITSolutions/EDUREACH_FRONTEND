// Enhanced TimetablePage with all new features
import React, { useState, useEffect, useRef } from "react";
import { useTimetableStore } from "../stores/useTimetableStore";
import { useSubjectStore } from "../stores/useSubjectStore";
import { ChevronDown, TrendingUp, TrendingDown, CheckCircle, AlertCircle, BarChart3, Users, BookOpen, Clock } from "lucide-react";

export default function EnhancedTimetablePage() {
  const {
    classes,
    teachers,
    days,
    periodsPerDay,
    timetable,
    quality,
    loading,
    error,
    validationResult,
    progress,
    jobId,
    templates,
    addClass,
    addTeacher,
    setDays,
    setPeriodsPerDay,
    generateTimetable,
    generateTimetableWithProgress,
    resetTimetable,
    validateInput,
    checkProgress,
    importClasses,
    importTeachers,
    autoFillTeachers,
    autoFillClasses,
    fetchTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    updateSlot,
    swapSlots,
    exportTimetable,
    saveClassSubjectsToDatabase,
    teachersList,
    fetchTeachers,
  } = useTimetableStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { setDayNames } = useTimetableStore();

  // Local state
  const [activeTab, setActiveTab] = useState("setup"); // setup, generate, edit, templates
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectPeriods, setSubjectPeriods] = useState(5);
  const [classSubjects, setClassSubjects] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [teacherSubjects, setTeacherSubjects] = useState("");
  const [selectedBackendSubjects, setSelectedBackendSubjects] = useState([]);
  const [dayNames, setDayNamesLocal] = useState([
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ]);
  const [showValidation, setShowValidation] = useState(false);
  const [draggedSlot, setDraggedSlot] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [bulkSubjectMode, setBulkSubjectMode] = useState(false);
  const [selectedClassesForBulk, setSelectedClassesForBulk] = useState([]);
  const [bulkSubjectName, setBulkSubjectName] = useState("");
  const [bulkSubjectPeriods, setBulkSubjectPeriods] = useState(5);
  
  // Manage Classes Tab State
  const [editingClassIndex, setEditingClassIndex] = useState(null);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");
  const [newClassSubjectPeriods, setNewClassSubjectPeriods] = useState(5);
  const [searchClass, setSearchClass] = useState("");
  const [savedConfigurations, setSavedConfigurations] = useState([]);
  const [configName, setConfigName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showClassesWithoutSubjects, setShowClassesWithoutSubjects] = useState(false);
  const [allAvailableClasses, setAllAvailableClasses] = useState([]); // Store all classes from auto-fill

  // Backend classes and sections for dropdowns
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Progress polling
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    fetchSubjects();
    fetchTemplates();
    fetchTeachers(); // Fetch teachers on component mount
    // Load saved configurations from localStorage
    const saved = localStorage.getItem('timetable_class_configurations');
    if (saved) {
      try {
        setSavedConfigurations(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved configurations:", e);
      }
    }
  }, [fetchSubjects, fetchTemplates, fetchTeachers]);

  // Fetch classes and sections from backend
  useEffect(() => {
    const fetchClassesAndSections = async () => {
      try {
        setLoadingOptions(true);
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
        const response = await fetch(`${baseUrl}/students/unique-values`, {
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
          console.error('Failed to fetch classes and sections');
        }
      } catch (error) {
        console.error('Error fetching classes and sections:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchClassesAndSections();
  }, []);

  // Poll for progress when generating
  useEffect(() => {
    if (jobId && progress?.status === "generating") {
      progressIntervalRef.current = setInterval(async () => {
        await checkProgress(jobId);
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [jobId, progress?.status, checkProgress]);

  // Validation
  const handleValidate = async () => {
    const result = await validateInput();
    setShowValidation(true);
  };

  // Bulk Import
  const handleImportClasses = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv', '.json'];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(fileExt)) {
      alert(`❌ Invalid file type. Please use: ${validExtensions.join(', ')}`);
      e.target.value = "";
      return;
    }
    
    try {
      const result = await importClasses(file);
      if (result && result.success) {
        alert(`✅ Successfully imported ${result.count || 0} class${result.count !== 1 ? 'es' : ''}!\n\nClasses have been added to your timetable setup.`);
      } else {
        alert(`❌ Import failed: ${result?.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`❌ Import error: ${err.message || 'Failed to import classes'}`);
    } finally {
      e.target.value = ""; // Reset input
    }
  };

  const handleImportTeachers = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv', '.json'];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(fileExt)) {
      alert(`❌ Invalid file type. Please use: ${validExtensions.join(', ')}`);
      e.target.value = "";
      return;
    }
    
    try {
      const result = await importTeachers(file);
      if (result && result.success) {
        alert(`✅ Successfully imported ${result.count || 0} teacher${result.count !== 1 ? 's' : ''}!\n\nTeachers have been added to your timetable setup.`);
      } else {
        alert(`❌ Import failed: ${result?.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`❌ Import error: ${err.message || 'Failed to import teachers'}`);
    } finally {
      e.target.value = ""; // Reset input
    }
  };

  // Auto-fill
  const handleAutoFillTeachers = async () => {
    const result = await autoFillTeachers();
    if (result && result.success) {
      if (result.count > 0) {
        alert(`✅ Loaded ${result.count} teacher${result.count !== 1 ? 's' : ''} from database!`);
      } else {
        alert("⚠️ No teachers found in database. Please add teachers first.");
      }
    }
  };

  const handleAutoFillClasses = async () => {
    const result = await autoFillClasses();
    if (result && result.success) {
      if (result.count > 0) {
        // Store all classes for later use (remove duplicates)
        const currentClasses = useTimetableStore.getState().classes;
        
        // Remove duplicates by class name
        const seen = new Set();
        const uniqueClasses = [];
        for (const classObj of currentClasses) {
          if (!seen.has(classObj.name)) {
            seen.add(classObj.name);
            uniqueClasses.push(classObj);
          }
        }
        
        setAllAvailableClasses(uniqueClasses);
        
        const classesWithoutSubjects = uniqueClasses.filter(c => !c.subjects || c.subjects.length === 0).length;
        if (classesWithoutSubjects > 0) {
          const proceed = window.confirm(
            `✅ Loaded ${uniqueClasses.length} unique class${uniqueClasses.length !== 1 ? 'es' : ''} from database!\n\n` +
            `⚠️ ${classesWithoutSubjects} class${classesWithoutSubjects !== 1 ? 'es' : ''} have no subjects.\n` +
            `Would you like to enable bulk subject assignment mode?`
          );
          if (proceed) {
            setBulkSubjectMode(true);
          }
        } else {
          alert(`✅ Loaded ${uniqueClasses.length} unique class${uniqueClasses.length !== 1 ? 'es' : ''} from database!\n${result.message || ''}`);
        }
      } else {
        alert("⚠️ No classes found in database. Please add classes first.");
      }
    }
  };

  // Bulk subject assignment
  const handleBulkAddSubject = () => {
    if (!bulkSubjectName || selectedClassesForBulk.length === 0) return;
    
    const updatedClasses = classes.map(cls => {
      if (selectedClassesForBulk.includes(cls.name)) {
        // Check if subject already exists
        const existingSubject = cls.subjects?.find(s => s.name === bulkSubjectName);
        if (existingSubject) {
          return cls; // Don't add duplicate
        }
        
        return {
          ...cls,
          subjects: [
            ...(cls.subjects || []),
            { name: bulkSubjectName, periodsPerWeek: bulkSubjectPeriods }
          ]
        };
      }
      return cls;
    });
    
    useTimetableStore.setState({ classes: updatedClasses });
    setBulkSubjectName("");
    setBulkSubjectPeriods(5);
    alert(`✅ Added "${bulkSubjectName}" to ${selectedClassesForBulk.length} class${selectedClassesForBulk.length !== 1 ? 'es' : ''}!`);
  };

  const toggleClassSelection = (className) => {
    setSelectedClassesForBulk(prev => 
      prev.includes(className) 
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const selectAllClassesWithoutSubjects = () => {
    const classesWithoutSubjects = classes
      .filter(c => !c.subjects || c.subjects.length === 0)
      .map(c => c.name);
    setSelectedClassesForBulk(classesWithoutSubjects);
  };

  const selectAllClasses = () => {
    setSelectedClassesForBulk(classes.map(c => c.name));
  };

  const clearSelection = () => {
    setSelectedClassesForBulk([]);
  };

  // Remove classes without subjects from timetable setup
  const removeClassesWithoutSubjects = () => {
    // Remove duplicates first
    const seen = new Set();
    const uniqueClasses = [];
    for (const classObj of classes) {
      if (!seen.has(classObj.name)) {
        seen.add(classObj.name);
        uniqueClasses.push(classObj);
      }
    }
    
    const classesWithSubjects = uniqueClasses.filter(c => c.subjects && c.subjects.length > 0);
    const removedCount = uniqueClasses.length - classesWithSubjects.length;
    
    if (removedCount === 0) {
      alert("All classes already have subjects!");
      return;
    }
    
    if (window.confirm(`Remove ${removedCount} class${removedCount !== 1 ? 'es' : ''} without subjects from timetable setup?`)) {
      // Store removed classes for later restoration (remove duplicates)
      const removedClasses = uniqueClasses.filter(c => !c.subjects || c.subjects.length === 0);
      
      // Merge with existing allAvailableClasses and remove duplicates
      const merged = [...allAvailableClasses, ...removedClasses];
      const mergedSeen = new Set();
      const mergedUnique = [];
      for (const classObj of merged) {
        if (!mergedSeen.has(classObj.name)) {
          mergedSeen.add(classObj.name);
          mergedUnique.push(classObj);
        }
      }
      
      setAllAvailableClasses(mergedUnique);
      useTimetableStore.setState({ classes: classesWithSubjects });
      alert(`✅ Removed ${removedCount} class${removedCount !== 1 ? 'es' : ''} without subjects. You can add subjects to them later using "Add Subjects to Other Classes" section.`);
    }
  };

  // Restore a class and add it back to the store
  const handleRestoreClass = (className) => {
    const classToRestore = allAvailableClasses.find(c => c.name === className);
    if (!classToRestore) {
      alert("Class not found in available classes!");
      return;
    }
    
    // Check if class already exists
    if (classes.some(c => c.name === className)) {
      alert("Class already exists in your timetable setup!");
      return;
    }
    
    const updatedClasses = [...classes, classToRestore];
    useTimetableStore.setState({ classes: updatedClasses });
    alert(`✅ Class "${className}" restored! Now you can add subjects to it.`);
  };

  // Get classes without subjects (from allAvailableClasses that are not in current classes)
  // Remove duplicates by class name
  const getClassesWithoutSubjects = () => {
    const currentClassNames = new Set(classes.map(c => c.name));
    const filtered = allAvailableClasses.filter(c => !currentClassNames.has(c.name));
    
    // Remove duplicates - keep only unique class names
    const seen = new Set();
    const unique = [];
    for (const classObj of filtered) {
      if (!seen.has(classObj.name)) {
        seen.add(classObj.name);
        unique.push(classObj);
      }
    }
    
    return unique;
  };

  // Manage Classes Tab Functions
  const handleAddNewClass = () => {
    if (!newClassName.trim()) {
      alert("Please enter a class name");
      return;
    }
    
    // Check if class already exists
    if (classes.some(c => c.name === newClassName.trim())) {
      alert("Class already exists!");
      return;
    }
    
    const updatedClasses = [...classes, {
      name: newClassName.trim(),
      subjects: []
    }];
    
    useTimetableStore.setState({ classes: updatedClasses });
    setNewClassName("");
    alert(`✅ Class "${newClassName.trim()}" added successfully!`);
  };

  const handleDeleteClass = (index) => {
    const className = classes[index].name;
    if (window.confirm(`Are you sure you want to delete class "${className}"?`)) {
      const updatedClasses = classes.filter((_, i) => i !== index);
      useTimetableStore.setState({ classes: updatedClasses });
      alert(`✅ Class "${className}" deleted successfully!`);
    }
  };

  const handleAddSubjectToClassInManageTab = (classIndex) => {
    if (!newClassSubject.trim()) {
      alert("Please select or enter a subject name");
      return;
    }
    
    const classObj = classes[classIndex];
    const baseClassName = getBaseClassName(classObj.name);
    
    // Find all sections of this class
    const allSectionsOfClass = classes.filter(c => getBaseClassName(c.name) === baseClassName);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    const updatedClasses = [...classes];
    
    // Add subject to ALL sections of this class
    allSectionsOfClass.forEach((sectionClass) => {
      const actualIndex = updatedClasses.findIndex(c => c.name === sectionClass.name);
      if (actualIndex === -1) return;
      
      const existingSubject = sectionClass.subjects?.find(s => s.name === newClassSubject.trim());
      if (existingSubject) {
        // Subject already exists in this section, skip
        skippedCount++;
        return;
      }
      
      updatedClasses[actualIndex] = {
        ...sectionClass,
        subjects: [
          ...(sectionClass.subjects || []),
          {
            name: newClassSubject.trim(),
            periodsPerWeek: newClassSubjectPeriods
          }
        ]
      };
      
      addedCount++;
    });
    
    useTimetableStore.setState({ classes: updatedClasses });
    setNewClassSubject("");
    setNewClassSubjectPeriods(5);
    
    // Show success message
    let message = `✅ Subject "${newClassSubject.trim()}" `;
    if (addedCount > 1) {
      message += `added to ${addedCount} sections `;
    } else {
      message += `added to ${classObj.name} `;
    }
    if (skippedCount > 0) {
      message += `(${skippedCount} section${skippedCount !== 1 ? 's' : ''} already had this subject) `;
    }
    message += `of Class ${baseClassName}!`;
    
    alert(message);
  };

  // Add subject to ALL sections of a base class (e.g., add to "6" applies to 6A, 6B, 6C, 6D)
  const handleAddSubjectToAllSections = (baseClassName) => {
    if (!newClassSubject.trim()) {
      alert("Please select or enter a subject name");
      return;
    }
    
    const sections = groupedClasses[baseClassName] || [];
    if (sections.length === 0) {
      alert("No sections found for this class!");
      return;
    }
    
    const updatedClasses = classes.map(classObj => {
      const classBaseName = getBaseClassName(classObj.name);
      if (classBaseName === baseClassName) {
        // Check if subject already exists
        const existingSubject = classObj.subjects?.find(s => s.name === newClassSubject.trim());
        if (existingSubject) {
          return classObj; // Skip if already exists
        }
        
        return {
          ...classObj,
          subjects: [
            ...(classObj.subjects || []),
            {
              name: newClassSubject.trim(),
              periodsPerWeek: newClassSubjectPeriods
            }
          ]
        };
      }
      return classObj;
    });
    
    useTimetableStore.setState({ classes: updatedClasses });
    setNewClassSubject("");
    setNewClassSubjectPeriods(5);
    
    const addedCount = sections.filter(s => {
      const existing = s.subjects?.find(sub => sub.name === newClassSubject.trim());
      return !existing;
    }).length;
    
    alert(`✅ Subject "${newClassSubject.trim()}" added to ${addedCount} section${addedCount !== 1 ? 's' : ''} of class "${baseClassName}"!`);
  };

  const handleRemoveSubjectFromClass = (classIndex, subjectIndex) => {
    const classObj = classes[classIndex];
    const subject = classObj.subjects[subjectIndex];
    
    if (window.confirm(`Remove "${subject.name}" from class "${classObj.name}"?`)) {
      const updatedClasses = [...classes];
      updatedClasses[classIndex] = {
        ...classObj,
        subjects: classObj.subjects.filter((_, i) => i !== subjectIndex)
      };
      
      useTimetableStore.setState({ classes: updatedClasses });
      alert(`✅ Subject "${subject.name}" removed from class "${classObj.name}"!`);
    }
  };

  const handleUpdateSubjectPeriods = (classIndex, subjectIndex, newPeriods) => {
    const updatedClasses = [...classes];
    updatedClasses[classIndex] = {
      ...updatedClasses[classIndex],
      subjects: updatedClasses[classIndex].subjects.map((s, i) => 
        i === subjectIndex ? { ...s, periodsPerWeek: newPeriods } : s
      )
    };
    
    useTimetableStore.setState({ classes: updatedClasses });
  };

  const handleEditClassName = (classIndex, newName) => {
    if (!newName.trim()) {
      alert("Class name cannot be empty!");
      return;
    }
    
    // Check if new name already exists
    if (classes.some((c, i) => i !== classIndex && c.name === newName.trim())) {
      alert("Class name already exists!");
      return;
    }
    
    const updatedClasses = [...classes];
    updatedClasses[classIndex] = {
      ...updatedClasses[classIndex],
      name: newName.trim()
    };
    
    useTimetableStore.setState({ classes: updatedClasses });
    setEditingClassIndex(null);
    alert(`✅ Class name updated successfully!`);
  };

  // Helper function to extract base class name (e.g., "6A" -> "6", "NurseryA" -> "Nursery")
  const getBaseClassName = (className) => {
    // Match pattern like "6A", "10B" -> extract "6", "10"
    const gradeMatch = className.match(/^(\d+)([A-Z])$/);
    if (gradeMatch) {
      return gradeMatch[1]; // Return just the number
    }
    // Match pattern like "NurseryA", "LKGA" -> extract "Nursery", "LKG"
    const nameMatch = className.match(/^([A-Za-z]+)([A-Z])$/);
    if (nameMatch) {
      return nameMatch[1]; // Return the name part
    }
    // If no pattern matches, return the full name
    return className;
  };

  // Helper function to extract section (e.g., "6A" -> "A", "NurseryB" -> "B")
  const getSection = (className) => {
    const gradeMatch = className.match(/^\d+([A-Z])$/);
    if (gradeMatch) {
      return gradeMatch[1];
    }
    const nameMatch = className.match(/^[A-Za-z]+([A-Z])$/);
    if (nameMatch) {
      return nameMatch[1];
    }
    return "";
  };

  // Group classes by base class name (remove duplicates first)
  const uniqueClasses = [];
  const seenClassNames = new Set();
  for (const classObj of classes) {
    if (!seenClassNames.has(classObj.name)) {
      seenClassNames.add(classObj.name);
      uniqueClasses.push(classObj);
    }
  }
  
  const groupedClasses = uniqueClasses.reduce((acc, classObj) => {
    const baseClass = getBaseClassName(classObj.name);
    if (!acc[baseClass]) {
      acc[baseClass] = [];
    }
    // Only add if not already in the array (prevent duplicates)
    const exists = acc[baseClass].some(c => c.name === classObj.name);
    if (!exists) {
      acc[baseClass].push(classObj);
    }
    return acc;
  }, {});

  // Sort sections within each group
  Object.keys(groupedClasses).forEach(baseClass => {
    groupedClasses[baseClass].sort((a, b) => {
      const sectionA = getSection(a.name);
      const sectionB = getSection(b.name);
      return sectionA.localeCompare(sectionB);
    });
  });

  // Filter grouped classes based on search
  const filteredGroupedClasses = Object.keys(groupedClasses).filter(baseClass => 
    baseClass.toLowerCase().includes(searchClass.toLowerCase()) ||
    groupedClasses[baseClass].some(c => c.name.toLowerCase().includes(searchClass.toLowerCase()))
  ).reduce((acc, baseClass) => {
    acc[baseClass] = groupedClasses[baseClass];
    return acc;
  }, {});

  // Save current class configuration
  const handleSaveConfiguration = () => {
    if (!configName.trim()) {
      alert("Please enter a configuration name");
      return;
    }
    
    const configuration = {
      id: `config-${Date.now()}`,
      name: configName.trim(),
      classes: classes,
      savedAt: new Date().toISOString(),
      classCount: classes.length,
      subjectCount: classes.reduce((sum, c) => sum + (c.subjects?.length || 0), 0)
    };
    
    const updatedConfigs = [...savedConfigurations, configuration];
    setSavedConfigurations(updatedConfigs);
    localStorage.setItem('timetable_class_configurations', JSON.stringify(updatedConfigs));
    
    setConfigName("");
    setShowSaveDialog(false);
    alert(`✅ Configuration "${configuration.name}" saved successfully!`);
  };

  // Load saved configuration
  const handleLoadConfiguration = (configId) => {
    const config = savedConfigurations.find(c => c.id === configId);
    if (!config) {
      alert("Configuration not found!");
      return;
    }
    
    if (window.confirm(`Load configuration "${config.name}"? This will replace your current classes.`)) {
      useTimetableStore.setState({ classes: config.classes });
      setShowLoadDialog(false);
      alert(`✅ Configuration "${config.name}" loaded successfully!`);
    }
  };

  // Delete saved configuration
  const handleDeleteConfiguration = (configId) => {
    const config = savedConfigurations.find(c => c.id === configId);
    if (!config) return;
    
    if (window.confirm(`Delete configuration "${config.name}"?`)) {
      const updatedConfigs = savedConfigurations.filter(c => c.id !== configId);
      setSavedConfigurations(updatedConfigs);
      localStorage.setItem('timetable_class_configurations', JSON.stringify(updatedConfigs));
      alert(`✅ Configuration "${config.name}" deleted successfully!`);
    }
  };

  // Update saved configuration with current classes
  const handleUpdateConfiguration = (configId) => {
    const config = savedConfigurations.find(c => c.id === configId);
    if (!config) return;
    
    if (window.confirm(`Update configuration "${config.name}" with current classes?`)) {
      const updatedConfig = {
        ...config,
        classes: classes,
        savedAt: new Date().toISOString(),
        classCount: classes.length,
        subjectCount: classes.reduce((sum, c) => sum + (c.subjects?.length || 0), 0)
      };
      
      const updatedConfigs = savedConfigurations.map(c => 
        c.id === configId ? updatedConfig : c
      );
      setSavedConfigurations(updatedConfigs);
      localStorage.setItem('timetable_class_configurations', JSON.stringify(updatedConfigs));
      alert(`✅ Configuration "${config.name}" updated successfully!`);
    }
  };

  // Save class subjects to database
  const handleSaveSubjectsToDatabase = async () => {
    // Get all classes that have subjects (including those added manually)
    const classesWithSubjects = classes.filter(c => c.subjects && c.subjects.length > 0);
    
    if (classesWithSubjects.length === 0) {
      alert("No classes with subjects to save!\n\nPlease add subjects to classes first using:\n- 'Manage Classes' tab\n- 'Bulk Subject Assignment'\n- 'Add Subjects to Other Classes' section");
      return;
    }
    
    // Show which classes will be saved
    const classNames = classesWithSubjects.map(c => c.name).join(", ");
    const preview = classNames.length > 100 ? classNames.substring(0, 100) + "..." : classNames;
    
    if (window.confirm(
      `Save subjects for ${classesWithSubjects.length} class${classesWithSubjects.length !== 1 ? 'es' : ''} to database?\n\n` +
      `Classes: ${preview}\n\n` +
      `This will update the ClassModel in the database. Next time you auto-fill, these classes will automatically have subjects.`
    )) {
      try {
        console.log("Saving classes to database:", classesWithSubjects.map(c => ({
          name: c.name,
          subjectsCount: c.subjects?.length || 0
        })));
        
        const result = await saveClassSubjectsToDatabase(classesWithSubjects);
        if (result && result.success) {
          const saved = result.results.filter(r => r.action === "created" || r.action === "updated");
          const skipped = result.results.filter(r => r.action === "skipped");
          const errors = result.results.filter(r => r.action === "error");
          const noChange = result.results.filter(r => r.action === "no_change");
          
          let message = `✅ Save completed!\n\n`;
          message += `✓ Saved/Updated: ${saved.length} class${saved.length !== 1 ? 'es' : ''}\n`;
          if (noChange.length > 0) {
            message += `○ No change needed: ${noChange.length} class${noChange.length !== 1 ? 'es' : ''}\n`;
          }
          if (skipped.length > 0) {
            message += `⚠ Skipped: ${skipped.length} class${skipped.length !== 1 ? 'es' : ''}\n`;
          }
          if (errors.length > 0) {
            message += `❌ Errors: ${errors.length} class${errors.length !== 1 ? 'es' : ''}\n`;
            message += `\nError details:\n${errors.map(e => `- ${e.className}: ${e.error || e.reason}`).join('\n')}`;
          }
          message += `\nNext time you click "Auto-fill from Database", saved classes will automatically have subjects.`;
          
          alert(message);
        } else {
          alert(`❌ Save failed: ${result?.error || 'Unknown error'}`);
        }
      } catch (err) {
        alert(`❌ Error saving to database: ${err.message}`);
      }
    }
  };

  // Templates
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }
    await saveTemplate({
      name: templateName,
      description: templateDescription,
      classes,
      teachers,
      days: dayNames,
      periodsPerDay,
      options: {}
    });
    setTemplateName("");
    setTemplateDescription("");
    alert("Template saved successfully!");
  };

  const handleLoadTemplate = async (templateId) => {
    await loadTemplate(templateId);
    setActiveTab("setup");
    alert("Template loaded successfully!");
  };

  // Manual Editing
  const handleDragStart = (className, day, period, slot) => {
    setDraggedSlot({ className, day, period, slot });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetClassName, targetDay, targetPeriod) => {
    if (!draggedSlot) return;
    
    // Find the timetable ID from saved timetables or use the current one
    // For now, we'll need to get it from the saved timetables
    // This is a simplified version - you may need to adjust based on your data structure
    if (timetable && timetable._id) {
      const { className: sourceClassName, day: sourceDay, period: sourcePeriod } = draggedSlot;

      // Swap slots
      await swapSlots(timetable._id, 
        { className: sourceClassName, day: sourceDay, period: sourcePeriod },
        { className: targetClassName, day: targetDay, period: targetPeriod }
      );
    }

    setDraggedSlot(null);
  };

  // Export
  const handleExport = async (format) => {
    // For export, we need the saved timetable ID
    // This is a simplified version - you may need to fetch the latest saved timetable
    try {
      const { fetchAllTimetables } = useTimetableStore.getState();
      await fetchAllTimetables();
      const timetables = useTimetableStore.getState().timetable;
      if (timetables && Array.isArray(timetables) && timetables.length > 0) {
        const latestTimetable = timetables[0];
        exportTimetable(latestTimetable._id, format);
      } else {
        alert("No saved timetable found. Please generate and save a timetable first.");
      }
    } catch (err) {
      alert("Error exporting timetable: " + err.message);
    }
  };

  // Class management
  const handleAddSubjectToClass = () => {
    if (!subjectName) return;
    setClassSubjects([
      ...classSubjects,
      { name: subjectName, periodsPerWeek: subjectPeriods },
    ]);
    setSubjectName("");
    setSubjectPeriods(5);
  };

  const handleAddClass = () => {
    if (!className || classSubjects.length === 0) return;
    
    // Get all sections for this class from backend
    const allSections = sectionOptions.map(opt => opt.value) || ['A', 'B', 'C', 'D']; // Default sections if not available
    
    // Create class entries for ALL sections of the selected class
    const newClassEntries = [];
    const updatedClasses = [...classes];
    
    for (const section of allSections) {
      const fullClassName = `${className}${section}`; // e.g., "1A", "1B", etc.
      
      // Check if this section already exists
      const existingClassIdx = updatedClasses.findIndex((c) => c.name === fullClassName);
      
      if (existingClassIdx !== -1) {
        // Section exists - merge subjects
        const existingSubjects = updatedClasses[existingClassIdx].subjects || [];
        const newSubjects = classSubjects.filter(
          (s) => !existingSubjects.some((es) => es.name === s.name)
        );
        if (newSubjects.length > 0) {
          updatedClasses[existingClassIdx] = {
            ...updatedClasses[existingClassIdx],
            subjects: [...existingSubjects, ...newSubjects],
          };
        }
      } else {
        // Section doesn't exist - create new entry
        newClassEntries.push({
          name: fullClassName,
          subjects: [...classSubjects], // Same subjects for all sections
        });
      }
    }
    
    // Add all new class entries
    if (newClassEntries.length > 0) {
      newClassEntries.forEach(entry => addClass(entry));
    }
    
    // Update existing classes
    if (updatedClasses.some((c, idx) => c !== classes[idx])) {
      useTimetableStore.setState({ classes: updatedClasses });
    }
    
    // Show success message
    const totalSections = allSections.length;
    const newSections = newClassEntries.length;
    const updatedSections = totalSections - newSections;
    
    let message = `✅ `;
    if (newSections > 0) {
      message += `Created ${newSections} new section${newSections !== 1 ? 's' : ''} `;
    }
    if (updatedSections > 0) {
      if (newSections > 0) message += `and `;
      message += `updated ${updatedSections} existing section${updatedSections !== 1 ? 's' : ''} `;
    }
    message += `for Class ${className} with ${classSubjects.length} subject${classSubjects.length !== 1 ? 's' : ''}.`;
    
    alert(message);
    
    setClassName("");
    setClassSubjects([]);
  };

  // Handle teacher selection from dropdown
  const handleTeacherSelect = (selectedTeacherName) => {
    setTeacherName(selectedTeacherName);
    if (selectedTeacherName) {
      const backendTeacher = teachersList.find(t => t.name === selectedTeacherName);
      if (backendTeacher) {
        const backendSubjects = backendTeacher.subject
          ? (Array.isArray(backendTeacher.subject) ? backendTeacher.subject : [backendTeacher.subject])
          : [];
        // Auto-populate subjects from backend teacher
        setSelectedBackendSubjects(backendSubjects);
      } else {
        setSelectedBackendSubjects([]);
      }
    } else {
      setSelectedBackendSubjects([]);
    }
  };          

  const handleAddTeacher = () => {
    if (!teacherName || (!teacherSubjects && selectedBackendSubjects.length === 0)) return;
    const backendTeacher = teachersList.find(t => t.name === teacherName);
    const backendSubjects = backendTeacher
      ? (Array.isArray(backendTeacher.subject) ? backendTeacher.subject : [backendTeacher.subject])
      : [];
    const manualSubjects = teacherSubjects.split(",").map(s => s.trim()).filter(Boolean);
    const allSubjects = Array.from(new Set([...backendSubjects, ...selectedBackendSubjects, ...manualSubjects]));
    addTeacher({
      name: teacherName,
      subjects: allSubjects,
    });
    setTeacherName("");
    setTeacherSubjects("");
    setSelectedBackendSubjects([]);
  };

  const handleGenerate = async () => {
    // Auto-validate before generating
    const validation = await validateInput();
    if (!validation || !validation.valid) {
      setShowValidation(true);
      if (validation) {
        setActiveTab("setup"); // Stay on setup tab to fix errors
      }
      return;
    }
    
    await generateTimetableWithProgress();
    // Only switch to generate tab if successful
    if (!error && timetable?.success) {
      setActiveTab("generate");
    }
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-5 md:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Enhanced Timetable Generator</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleValidate}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs sm:text-sm"
            >
              Validate Input
            </button>
            {timetable?._id && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport("pdf")}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-red-500 text-white hover:bg-red-600 text-xs sm:text-sm"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-green-500 text-white hover:bg-green-600 text-xs sm:text-sm"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-5 md:mb-6 border-b overflow-x-auto">
          {["setup", "manage-classes", "generate", "templates"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 capitalize text-xs sm:text-sm whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary font-semibold"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {tab === "manage-classes" ? (
                <>
                  <span className="hidden sm:inline">Manage Classes</span>
                  <span className="sm:hidden">Manage</span>
                </>
              ) : (
                tab
              )}
            </button>
          ))}
        </div>

        {/* Validation Results */}
        {(showValidation || (validationResult && !validationResult.valid)) && validationResult && (
          <div className={`mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 rounded-lg ${
            validationResult.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-base sm:text-lg">
                {validationResult.valid ? "✅ Validation Passed" : "❌ Validation Failed"}
              </h3>
              <button
                onClick={() => {
                  setShowValidation(false);
                  useTimetableStore.setState({ validationResult: null });
                }}
                className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl font-bold"
              >
                ×
              </button>
            </div>
            {validationResult.errors?.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                  <h4 className="font-medium text-red-700 text-sm sm:text-base">Errors:</h4>
                  {validationResult.errors.some(err => err.code === "NO_SUBJECTS") && (
                    <button
                      onClick={removeClassesWithoutSubjects}
                      className="px-2 sm:px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 whitespace-nowrap"
                    >
                      Remove Classes Without Subjects
                    </button>
                  )}
                </div>
                <div className="mb-2 p-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-yellow-800">
                  <strong>ℹ️ Note:</strong> Validation checks <strong>ALL {classes.length} classes</strong> in your timetable setup. 
                  If you don't want to generate timetables for some classes, remove them from the setup.
                </div>
                <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 max-h-64 overflow-y-auto">
                  {validationResult.errors.map((err, idx) => (
                    <li key={idx} className="text-red-600">
                      <strong>{err.message}</strong>
                      {err.suggestion && <span className="block text-red-500 text-xs mt-1">💡 {err.suggestion}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {validationResult.warnings?.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-700 mb-2 text-sm sm:text-base">Warnings:</h4>
                <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
                  {validationResult.warnings.map((warn, idx) => (
                    <li key={idx} className="text-yellow-600">
                      <strong>{warn.message}</strong>
                      {warn.suggestion && <span className="block text-yellow-500 text-xs mt-1">💡 {warn.suggestion}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {progress && progress.status === "generating" && (
          <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-xs sm:text-sm md:text-base">{progress.currentStep || "Generating..."}</span>
              <span className="text-xs sm:text-sm">{progress.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
              <div
                className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress || 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === "setup" && (
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Quick Actions</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAutoFillClasses}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-primary text-white hover:bg-primary-dark text-xs sm:text-sm"
                >
                  Auto-fill Classes
                </button>
                <button
                  onClick={handleAutoFillTeachers}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-primary text-white hover:bg-primary-dark text-xs sm:text-sm"
                >
                  Auto-fill Teachers
                </button>
                <button
                  onClick={() => setBulkSubjectMode(!bulkSubjectMode)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded ${bulkSubjectMode ? 'bg-green-600' : 'bg-blue-500'} text-white hover:opacity-90 text-xs sm:text-sm`}
                >
                  {bulkSubjectMode ? "✓ Bulk Mode ON" : "Bulk Add Subjects"}
                </button>
                <label className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-accent text-white hover:bg-accent-dark cursor-pointer text-xs sm:text-sm">
                  Import Classes
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={handleImportClasses}
                    className="hidden"
                  />
                </label>
                <label className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-accent text-white hover:bg-accent-dark cursor-pointer text-xs sm:text-sm">
                  Import Teachers
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={handleImportTeachers}
                    className="hidden"
                  />
                </label>
                {classes.some(c => !c.subjects || c.subjects.length === 0) && (
                  <button
                    onClick={removeClassesWithoutSubjects}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-orange-500 text-white hover:bg-orange-600 text-xs sm:text-sm"
                    title={`Remove ${classes.filter(c => !c.subjects || c.subjects.length === 0).length} classes without subjects`}
                  >
                    <span className="hidden sm:inline">Remove Classes Without Subjects ({classes.filter(c => !c.subjects || c.subjects.length === 0).length})</span>
                    <span className="sm:hidden">Remove ({classes.filter(c => !c.subjects || c.subjects.length === 0).length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bulk Subject Assignment */}
            {bulkSubjectMode && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-blue-800">📋 Bulk Subject Assignment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={bulkSubjectName}
                      onChange={(e) => setBulkSubjectName(e.target.value)}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subj => (
                        <option key={subj._id} value={subj.name}>{subj.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Periods/Week</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={bulkSubjectPeriods}
                      onChange={(e) => setBulkSubjectPeriods(Number(e.target.value))}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex items-end gap-2 sm:col-span-2 md:col-span-1">
                    <button
                      onClick={handleBulkAddSubject}
                      disabled={!bulkSubjectName || selectedClassesForBulk.length === 0}
                      className="flex-1 px-3 sm:px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      Add to {selectedClassesForBulk.length} Class{selectedClassesForBulk.length !== 1 ? 'es' : ''}
                    </button>
                    <button
                      onClick={() => {
                        setBulkSubjectMode(false);
                        setSelectedClassesForBulk([]);
                      }}
                      className="px-3 sm:px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Select Classes ({selectedClassesForBulk.length} of {classes.length} selected)
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={selectAllClasses}
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Select All
                      </button>
                      <button
                        onClick={selectAllClassesWithoutSubjects}
                        className="text-xs sm:text-sm text-orange-600 hover:text-orange-800 underline"
                      >
                        Select Without Subjects
                      </button>
                      <button
                        onClick={clearSelection}
                        className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  {classes.length === 0 ? (
                    <div className="border rounded p-3 sm:p-4 bg-yellow-50 text-center">
                      <p className="text-xs sm:text-sm text-yellow-700">No classes loaded yet. Click "Auto-fill Classes" first.</p>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto border-2 border-gray-300 rounded-lg p-2 sm:p-3 bg-white">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {classes.map((cls) => {
                          const hasNoSubjects = !cls.subjects || cls.subjects.length === 0;
                          const isSelected = selectedClassesForBulk.includes(cls.name);
                          
                          return (
                            <label
                              key={cls.name}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer border-2 transition-all ${
                                isSelected
                                  ? 'bg-blue-200 border-blue-600 shadow-md'
                                  : hasNoSubjects
                                  ? 'bg-red-50 border-red-400 hover:bg-red-100'
                                  : 'bg-white border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleClassSelection(cls.name)}
                                className="cursor-pointer w-4 h-4 text-blue-600"
                              />
                              <span className={`text-sm font-medium ${
                                isSelected ? 'text-blue-900 font-bold' : 'text-gray-700'
                              }`}>
                                {cls.name}
                                {hasNoSubjects && (
                                  <span className="text-red-500 ml-1" title="No subjects">⚠️</span>
                                )}
                                {isSelected && (
                                  <span className="text-blue-600 ml-1">✓</span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selectedClassesForBulk.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-300 rounded">
                      <p className="text-sm text-green-700">
                        ✓ {selectedClassesForBulk.length} class{selectedClassesForBulk.length !== 1 ? 'es' : ''} selected: {selectedClassesForBulk.slice(0, 5).join(", ")}
                        {selectedClassesForBulk.length > 5 && ` + ${selectedClassesForBulk.length - 5} more`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Class Input */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Add Class</h2>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Class Name</label>
                    <div className="relative">
                      <select
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-primary appearance-none bg-white pr-8 text-sm sm:text-base"
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
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subj => (
                        <option key={subj._id} value={subj.name}>{subj.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Periods/Week</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={subjectPeriods}
                      onChange={(e) => setSubjectPeriods(Number(e.target.value))}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddSubjectToClass}
                  disabled={!subjectName || !className}
                  className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-accent text-white hover:bg-accent-dark disabled:opacity-50 text-xs sm:text-sm"
                >
                  Add Subject to Class
                </button>
              </div>
              {classSubjects.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold mb-2">Subjects Added:</h3>
                  <div className="flex flex-wrap gap-2">
                    {classSubjects.map((s, idx) => (
                      <span key={idx} className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm">
                        {s.name} ({s.periodsPerWeek}/week)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={handleAddClass}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-primary text-white hover:bg-primary-dark text-xs sm:text-sm"
              >
                Add Class
              </button>
            </section>

            {/* Teacher Input */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Add Teacher</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
                  <div className="relative">
                    <select
                      value={teacherName}
                      onChange={(e) => handleTeacherSelect(e.target.value)}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary appearance-none bg-white pr-8 text-sm sm:text-base"
                    >
                      <option value="">Select a teacher</option>
                      {teachersList && teachersList.length > 0 ? (
                        teachersList.map((teacher) => {
                          const teacherSubjects = teacher.subject
                            ? (Array.isArray(teacher.subject) ? teacher.subject : [teacher.subject])
                            : [];
                          const subjectsText = teacherSubjects.length > 0 
                            ? ` (${teacherSubjects.join(", ")})` 
                            : "";
                          return (
                            <option key={teacher._id || teacher.name} value={teacher.name}>
                              {teacher.name}{subjectsText}
                            </option>
                          );
                        })
                      ) : (
                        <option value="" disabled>No teachers available</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {teacherName && (() => {
                    const selectedTeacher = teachersList.find(t => t.name === teacherName);
                    const teacherSubjects = selectedTeacher?.subject
                      ? (Array.isArray(selectedTeacher.subject) ? selectedTeacher.subject : [selectedTeacher.subject])
                      : [];
                    return teacherSubjects.length > 0 ? (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs sm:text-sm">
                        <p className="text-blue-800 font-medium mb-1">Teacher's Subjects:</p>
                        <div className="flex flex-wrap gap-1">
                          {teacherSubjects.map((subj, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {subj}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Subjects (Select Multiple)</label>
                  <select
                    multiple
                    value={selectedBackendSubjects}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedBackendSubjects(options);
                    }}
                    className="w-full border p-2 rounded min-h-[100px] sm:min-h-[120px] focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  >
                    {subjects.map(subj => (
                      <option key={subj._id} value={subj.name}>{subj.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple subjects</p>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Add Extra Subjects (Optional)</label>
                <input
                  type="text"
                  placeholder="Add extra subjects (comma separated)"
                  value={teacherSubjects}
                  onChange={e => setTeacherSubjects(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
              <button
                onClick={handleAddTeacher}
                className="mt-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-primary text-white hover:bg-primary-dark text-xs sm:text-sm"
              >
                Add Teacher
              </button>
            </section>

            {/* Schedule Settings */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Schedule Settings</h2>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-xs sm:text-sm">Days (comma separated)</label>
                  <input
                    type="text"
                    value={dayNames.join(", ")}
                    onChange={(e) => {
                      const newDays = e.target.value.split(",").map(d => d.trim()).filter(Boolean);
                      setDayNamesLocal(newDays);
                      setDayNames(newDays);
                      setDays(newDays.length);
                    }}
                    className="border p-2 rounded w-full sm:w-64 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs sm:text-sm">Periods/Day</label>
                  <input
                    type="number"
                    value={periodsPerDay}
                    onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                    className="border p-2 rounded w-full sm:w-24 text-sm sm:text-base"
                  />
                </div>
              </div>
            </section>

            {/* Preview */}
            {(classes.length > 0 || teachers.length > 0) && (
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Preview</h2>
                {classes.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <h3 className="font-medium mb-2 text-sm sm:text-base">Classes ({classes.length})</h3>
                    <div className="space-y-2">
                      {classes.map((c, i) => (
                        <div key={i} className="p-2 sm:p-3 bg-gray-50 rounded border">
                          <span className="font-medium text-sm sm:text-base">{c.name}</span>
                          <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-1 sm:gap-2 mt-1">
                            {c.subjects.map((s, idx) => (
                              <span key={idx}>
                                {s.name} ({s.periodsPerWeek}/week)
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {teachers.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-sm sm:text-base">Teachers ({teachers.length})</h3>
                    <div className="space-y-2">
                      {teachers.map((t, i) => (
                        <div key={i} className="p-2 sm:p-3 bg-gray-50 rounded border">
                          <span className="font-medium text-sm sm:text-base">{t.name}</span>
                          <div className="text-xs sm:text-sm text-gray-600 break-words">
                            Subjects: {t.subjects.join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={handleGenerate}
                disabled={loading || classes.length === 0 || teachers.length === 0}
                className="px-4 sm:px-6 py-2 rounded bg-accent text-white hover:bg-accent-dark disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? "Generating..." : "Generate Timetable"}
              </button>
              <button
                onClick={resetTimetable}
                className="px-4 sm:px-6 py-2 rounded bg-danger text-white hover:bg-red-700 text-sm sm:text-base"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Manage Classes Tab */}
        {activeTab === "manage-classes" && (
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-blue-800">📚 Manage Classes & Subjects</h2>
              <p className="text-xs sm:text-sm text-blue-700">
                Easily add, edit, or remove classes and their subjects. All changes are saved automatically.
              </p>
            </div>

            {/* Add New Class Section */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">➕ Add New Class</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Enter class name (e.g., 10A, 9B)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewClass()}
                  className="flex-1 border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
                <button
                  onClick={handleAddNewClass}
                  className="px-4 sm:px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm sm:text-base"
                >
                  Add Class
                </button>
              </div>
            </div>

            {/* Search and Stats */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="🔍 Search classes or sections..."
                  value={searchClass}
                  onChange={(e) => setSearchClass(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">{Object.keys(filteredGroupedClasses).length}</span> class{Object.keys(filteredGroupedClasses).length !== 1 ? 'es' : ''} 
                <span className="ml-2">({classes.length} section{classes.length !== 1 ? 's' : ''})</span>
                {searchClass && ` (filtered from ${Object.keys(groupedClasses).length} classes)`}
              </div>
            </div>

            {/* Classes List - Grouped by Base Class */}
            {Object.keys(filteredGroupedClasses).length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">
                  {searchClass ? "No classes found matching your search." : "No classes added yet. Add your first class above!"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(filteredGroupedClasses).map((baseClassName) => {
                  const sections = filteredGroupedClasses[baseClassName];
                  const allSectionsHaveSameSubjects = sections.length > 0 && sections.every(s => {
                    const firstSubjects = sections[0].subjects || [];
                    const currentSubjects = s.subjects || [];
                    return JSON.stringify(firstSubjects.map(sub => sub.name).sort()) === 
                           JSON.stringify(currentSubjects.map(sub => sub.name).sort());
                  });
                  const commonSubjects = sections.length > 0 ? (sections[0].subjects || []) : [];
                  
                  return (
                    <div key={baseClassName} className="border-2 border-blue-300 rounded-lg p-3 sm:p-4 bg-white shadow-md">
                      {/* Base Class Header */}
                      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3">
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-blue-800">Class {baseClassName}</h3>
                            <p className="text-xs sm:text-sm text-blue-600 mt-1">
                              {sections.length} section{sections.length !== 1 ? 's' : ''}: {sections.map(s => s.name).join(", ")}
                            </p>
                          </div>
                          {allSectionsHaveSameSubjects && commonSubjects.length > 0 && (
                            <div className="text-left sm:text-right">
                              <span className="text-xs text-green-600 font-semibold">✓ All sections have same subjects</span>
                            </div>
                          )}
                        </div>

                        {/* Add Subject to ALL Sections */}
                        <div className="bg-white rounded-lg p-2 sm:p-3 border-2 border-blue-400">
                          <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">
                            📚 Add Subject to ALL Sections ({sections.length} section{sections.length !== 1 ? 's' : ''})
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={newClassSubject}
                              onChange={(e) => setNewClassSubject(e.target.value)}
                              className="flex-1 border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                            >
                              <option value="">Select Subject</option>
                              {subjects.map(subj => (
                                <option key={subj._id} value={subj.name}>{subj.name}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={newClassSubjectPeriods}
                              onChange={(e) => setNewClassSubjectPeriods(Number(e.target.value))}
                              placeholder="Periods"
                              className="w-full sm:w-24 border p-2 rounded text-center text-sm sm:text-base"
                            />
                            <button
                              onClick={() => handleAddSubjectToAllSections(baseClassName)}
                              disabled={!newClassSubject.trim()}
                              className="px-3 sm:px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm"
                            >
                              ➕ Add to All Sections
                            </button>
                            {/* <button
                              onClick={() => setShowSaveDialog(true)}
                              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold"
                              title="Save current configuration after adding subjects"
                            >
                              💾 Save Now
                            </button> */}
                          </div>
                        </div>

                        {/* Common Subjects Display (if all sections have same) */}
                        {allSectionsHaveSameSubjects && commonSubjects.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Common Subjects (All Sections):</p>
                            <div className="flex flex-wrap gap-2">
                              {commonSubjects.map((subject, idx) => (
                                <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                  {subject.name} ({subject.periodsPerWeek}/week)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Individual Sections */}
                      <div className="space-y-3">
                        {sections.map((classObj) => {
                          const actualIndex = classes.findIndex(c => c.name === classObj.name);
                          const section = getSection(classObj.name);
                          
                          return (
                            <div key={actualIndex} className="border border-gray-300 rounded-lg p-2 sm:p-3 bg-gray-50">
                              {/* Section Header */}
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <span className="text-base sm:text-lg font-semibold text-gray-700">
                                    Section {section || "N/A"}: {classObj.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({classObj.subjects?.length || 0} subject{(classObj.subjects?.length || 0) !== 1 ? 's' : ''})
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteClass(actualIndex)}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 self-start sm:self-auto"
                                >
                                  🗑️ Delete Section
                                </button>
                              </div>

                              {/* Subjects List for This Section */}
                              <div className="mb-2">
                                {classObj.subjects && classObj.subjects.length > 0 ? (
                                  <div className="space-y-1">
                                    {classObj.subjects.map((subject, subjectIndex) => (
                                      <div key={subjectIndex} className="flex items-center gap-2 p-1.5 bg-white rounded border text-sm">
                                        <span className="flex-1 font-medium">{subject.name}</span>
                                        <div className="flex items-center gap-1">
                                          <label className="text-xs text-gray-600">Periods:</label>
                                          <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={subject.periodsPerWeek}
                                            onChange={(e) => handleUpdateSubjectPeriods(actualIndex, subjectIndex, Number(e.target.value))}
                                            className="w-14 border p-1 rounded text-center text-xs"
                                          />
                                        </div>
                                        <button
                                          onClick={() => handleRemoveSubjectFromClass(actualIndex, subjectIndex)}
                                          className="px-2 py-1 text-xs bg-red-400 text-white rounded hover:bg-red-500"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-yellow-800">
                                    ⚠️ No subjects. Use "Add to All Sections" above or add individually below.
                                  </div>
                                )}
                              </div>

                              {/* Add Subject to This Section Only (Individual) */}
                              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-300">
                                <select
                                  value={newClassSubject}
                                  onChange={(e) => setNewClassSubject(e.target.value)}
                                  className="flex-1 border p-1.5 rounded text-xs sm:text-sm focus:ring-2 focus:ring-primary"
                                >
                                  <option value="">Add subject to this section only</option>
                                  {subjects.map(subj => (
                                    <option key={subj._id} value={subj.name}>{subj.name}</option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={newClassSubjectPeriods}
                                    onChange={(e) => setNewClassSubjectPeriods(Number(e.target.value))}
                                    placeholder="Periods"
                                    className="w-20 border p-1.5 rounded text-center text-xs sm:text-sm"
                                  />
                                  <button
                                    onClick={() => {
                                      handleAddSubjectToClassInManageTab(actualIndex);
                                    }}
                                    disabled={!newClassSubject.trim()}
                                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    ➕ Add
                                  </button>
                                  <button
                                    onClick={() => setShowSaveDialog(true)}
                                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded bg-green-500 text-white hover:bg-green-600"
                                    title="Save after adding subject"
                                  >
                                    💾
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Subjects to Other Classes Section */}
            {getClassesWithoutSubjects().length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 sm:p-4 mt-4 sm:mt-5 md:mt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-yellow-800 mb-1">
                      ➕ Add Subjects to Other Classes
                    </h3>
                    <p className="text-xs sm:text-sm text-yellow-700">
                      {getClassesWithoutSubjects().length} class{getClassesWithoutSubjects().length !== 1 ? 'es' : ''} without subjects. 
                      Restore them and add subjects to include in timetable generation.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowClassesWithoutSubjects(!showClassesWithoutSubjects)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded font-semibold text-xs sm:text-sm ${
                      showClassesWithoutSubjects 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    {showClassesWithoutSubjects ? '▼ Hide' : '▶ Show'} ({getClassesWithoutSubjects().length})
                  </button>
                </div>

                {showClassesWithoutSubjects && (
                  <div className="space-y-4">
                    {/* Group classes without subjects by base class */}
                    {Object.entries(
                      getClassesWithoutSubjects().reduce((acc, classObj) => {
                        const baseClass = getBaseClassName(classObj.name);
                        if (!acc[baseClass]) {
                          acc[baseClass] = [];
                        }
                        // Only add if not already in the array (prevent duplicates)
                        const exists = acc[baseClass].some(c => c.name === classObj.name);
                        if (!exists) {
                          acc[baseClass].push(classObj);
                        }
                        return acc;
                      }, {})
                    ).map(([baseClassName, sections]) => {
                      // Sort sections and remove duplicates
                      const uniqueSections = [];
                      const seenSections = new Set();
                      sections.forEach(section => {
                        if (!seenSections.has(section.name)) {
                          seenSections.add(section.name);
                          uniqueSections.push(section);
                        }
                      });
                      // Sort by section letter
                      uniqueSections.sort((a, b) => {
                        const sectionA = getSection(a.name);
                        const sectionB = getSection(b.name);
                        return sectionA.localeCompare(sectionB);
                      });
                      
                      return (
                        <div key={baseClassName} className="bg-white rounded-lg p-3 sm:p-4 border-2 border-yellow-300">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-base sm:text-lg text-gray-800">Class {baseClassName}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {uniqueSections.length} section{uniqueSections.length !== 1 ? 's' : ''}: {uniqueSections.map(s => s.name).join(", ")}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              uniqueSections.forEach(section => handleRestoreClass(section.name));
                            }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold text-xs sm:text-sm self-start sm:self-auto"
                          >
                            ➕ Restore All Sections
                          </button>
                        </div>

                        {/* Add Subject to ALL Sections */}
                        <div className="bg-yellow-50 rounded-lg p-2 sm:p-3 border-2 border-yellow-400 mb-3">
                          <p className="text-xs sm:text-sm font-semibold text-yellow-800 mb-2">
                            📚 Add Subject to ALL Sections ({uniqueSections.length} section{uniqueSections.length !== 1 ? 's' : ''})
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={newClassSubject}
                              onChange={(e) => setNewClassSubject(e.target.value)}
                              className="flex-1 border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                            >
                              <option value="">Select Subject</option>
                              {subjects.map(subj => (
                                <option key={subj._id} value={subj.name}>{subj.name}</option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={newClassSubjectPeriods}
                                onChange={(e) => setNewClassSubjectPeriods(Number(e.target.value))}
                                placeholder="Periods"
                                className="w-full sm:w-24 border p-2 rounded text-center text-sm sm:text-base"
                              />
                              <button
                                onClick={() => {
                                  // First restore all sections
                                  uniqueSections.forEach(section => {
                                    if (!classes.some(c => c.name === section.name)) {
                                      handleRestoreClass(section.name);
                                    }
                                  });
                                  // Then add subject to all sections
                                  setTimeout(() => {
                                    handleAddSubjectToAllSections(baseClassName);
                                  }, 100);
                                }}
                                disabled={!newClassSubject.trim()}
                                className="px-3 sm:px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm"
                              >
                                ➕ Add & Restore
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Individual Sections */}
                        <div className="space-y-2">
                          {uniqueSections.map((classObj) => {
                            const section = getSection(classObj.name);
                            return (
                              <div key={classObj.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-gray-50 rounded border">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <span className="font-medium text-gray-700 text-sm sm:text-base">
                                    Section {section || "N/A"}: {classObj.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    (0 subjects)
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleRestoreClass(classObj.name)}
                                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    ➕ Restore
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-4 sm:mt-5 md:mt-6">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">⚡ Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAutoFillClasses}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-primary text-white hover:bg-primary-dark text-xs sm:text-sm"
                >
                  Auto-fill from Database
                </button>
                <label className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-accent text-white hover:bg-accent-dark cursor-pointer text-xs sm:text-sm">
                  Import from File
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={handleImportClasses}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleSaveSubjectsToDatabase}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-purple-600 text-white hover:bg-purple-700 text-xs sm:text-sm"
                  title="Save current class subjects to database so they persist for next auto-fill"
                >
                  <span className="hidden sm:inline">💾 Save Subjects to Database</span>
                  <span className="sm:hidden">💾 Save</span>
                </button>
                {/* <button
                  onClick={() => setShowSaveDialog(true)}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  💾 Save Configuration
                </button>
                <button
                  onClick={() => setShowLoadDialog(true)}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  📂 Load Configuration
                </button> */}
                {classes.some(c => !c.subjects || c.subjects.length === 0) && (
                  <button
                    onClick={removeClassesWithoutSubjects}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-orange-500 text-white hover:bg-orange-600 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Remove Classes Without Subjects ({classes.filter(c => !c.subjects || c.subjects.length === 0).length})</span>
                    <span className="sm:hidden">Remove ({classes.filter(c => !c.subjects || c.subjects.length === 0).length})</span>
                  </button>
                )}
              </div>
              {classes.some(c => c.subjects && c.subjects.length > 0) && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-300 rounded text-xs sm:text-sm text-blue-800">
                  💡 <strong>Tip:</strong> After adding subjects to classes, click "💾 Save Subjects to Database" to make them persist. 
                  Next time you auto-fill, these classes will automatically have subjects!
                </div>
              )}
            </div>

            {/* Save Configuration Dialog */}
            {showSaveDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">💾 Save Configuration</h3>
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Configuration Name
                    </label>
                    <input
                      type="text"
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      placeholder="e.g., Spring 2024, All Classes, etc."
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary text-sm sm:text-base"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveConfiguration()}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {classes.length} classes, {classes.reduce((sum, c) => sum + (c.subjects?.length || 0), 0)} subjects
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleSaveConfiguration}
                      disabled={!configName.trim()}
                      className="flex-1 px-3 sm:px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveDialog(false);
                        setConfigName("");
                      }}
                      className="flex-1 px-3 sm:px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Load Configuration Dialog */}
            {showLoadDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full mx-4 max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">📂 Load Configuration</h3>
                  {savedConfigurations.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">No saved configurations found.</p>
                      <button
                        onClick={() => {
                          setShowLoadDialog(false);
                          setShowSaveDialog(true);
                        }}
                        className="px-3 sm:px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm sm:text-base"
                      >
                        Save Current Configuration
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {savedConfigurations.map((config) => (
                        <div key={config.id} className="border-2 border-gray-300 rounded-lg p-3 sm:p-4 hover:border-blue-400 transition">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-base sm:text-lg text-gray-800">{config.name}</h4>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {config.classCount} classes • {config.subjectCount} subjects
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Saved: {new Date(config.savedAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleLoadConfiguration(config.id)}
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                📂 Load
                              </button>
                              <button
                                onClick={() => handleUpdateConfiguration(config.id)}
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                title="Update this saved configuration with current classes"
                              >
                                ✏️ Update
                              </button>
                              <button
                                onClick={() => handleDeleteConfiguration(config.id)}
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 sm:mt-4 flex justify-end">
                    <button
                      onClick={() => setShowLoadDialog(false)}
                      className="px-3 sm:px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate/Edit Tab */}
        {activeTab === "generate" && timetable && timetable.success && (
          <div className="space-y-6">
            {/* Quality Metrics Display */}
            {quality && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                    Timetable Quality Report
                  </h3>
                  <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-sm sm:text-base md:text-lg ${
                    quality.overallScore >= 90 ? 'bg-green-100 text-green-800' :
                    quality.overallScore >= 75 ? 'bg-blue-100 text-blue-800' :
                    quality.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quality.overallScore.toFixed(1)}% - {quality.grade || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  {/* Teacher Workload Balance */}
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Workload Balance</span>
                      </div>
                      <span className={`text-base sm:text-lg font-bold ${
                        quality.teacherWorkloadBalance >= 80 ? 'text-green-600' :
                        quality.teacherWorkloadBalance >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {quality.teacherWorkloadBalance.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className={`h-1.5 sm:h-2 rounded-full ${
                          quality.teacherWorkloadBalance >= 80 ? 'bg-green-500' :
                          quality.teacherWorkloadBalance >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${quality.teacherWorkloadBalance}%` }}
                      ></div>
                    </div>
                    {quality.details?.avgTeacherLoad && (
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {quality.details.avgTeacherLoad} periods/week
                      </p>
                    )}
                  </div>

                  {/* Subject Distribution */}
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Subject Distribution</span>
                      </div>
                      <span className={`text-base sm:text-lg font-bold ${
                        quality.subjectDistribution >= 80 ? 'text-green-600' :
                        quality.subjectDistribution >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {quality.subjectDistribution.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className={`h-1.5 sm:h-2 rounded-full ${
                          quality.subjectDistribution >= 80 ? 'bg-green-500' :
                          quality.subjectDistribution >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${quality.subjectDistribution}%` }}
                      ></div>
                    </div>
                    {quality.details?.subjectDistributionDetails && (
                      <p className="text-xs text-gray-500 mt-1">
                        {quality.details.subjectDistributionDetails.duplicateSubjectDays} days with duplicates
                      </p>
                    )}
                  </div>

                  {/* Constraint Satisfaction */}
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Constraints</span>
                      </div>
                      <span className={`text-base sm:text-lg font-bold ${
                        quality.constraintSatisfaction >= 95 ? 'text-green-600' :
                        quality.constraintSatisfaction >= 85 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {quality.constraintSatisfaction.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className={`h-1.5 sm:h-2 rounded-full ${
                          quality.constraintSatisfaction >= 95 ? 'bg-green-500' :
                          quality.constraintSatisfaction >= 85 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${quality.constraintSatisfaction}%` }}
                      ></div>
                    </div>
                    {quality.details?.constraintViolations !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {quality.details.constraintViolations} violations
                      </p>
                    )}
                  </div>

                  {/* Free Periods */}
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Free Periods</span>
                      </div>
                      <span className={`text-base sm:text-lg font-bold ${
                        quality.freePeriods >= 80 ? 'text-green-600' :
                        quality.freePeriods >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {quality.freePeriods.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className={`h-1.5 sm:h-2 rounded-full ${
                          quality.freePeriods >= 80 ? 'bg-green-500' :
                          quality.freePeriods >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${quality.freePeriods}%` }}
                      ></div>
                    </div>
                    {quality.details?.freePeriodPercentage && (
                      <p className="text-xs text-gray-500 mt-1">
                        {quality.details.freePeriodPercentage}% free slots
                      </p>
                    )}
                  </div>
                </div>

                {/* Detailed Metrics */}
                {quality.details && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                        View Detailed Metrics
                      </summary>
                      <div className="mt-3 space-y-2 text-xs text-gray-600">
                        {quality.details.teacherLoads && (
                          <div>
                            <p className="font-semibold mb-1">Teacher Workloads:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {Object.entries(quality.details.teacherLoads).map(([teacher, load]) => (
                                <div key={teacher} className="bg-gray-100 rounded px-2 py-1">
                                  <span className="font-medium">{teacher}:</span> {load} periods/week
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}

            {timetable.classes.map((cls, idx) => (
              <div key={idx} className="mb-6 sm:mb-8 md:mb-10">
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Class: {cls.name}</h3>
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="min-w-full border border-gray-300 rounded-lg shadow">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="border px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">Day / Period</th>
                        {Array.from({ length: periodsPerDay }).map((_, pIdx) => (
                          <th key={pIdx} className="border px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">Period {pIdx + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(timetable.days || dayNames).map((day, dIdx) => (
                        <tr key={dIdx} className={dIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="border px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-medium text-xs sm:text-sm">{day}</td>
                          {Array.from({ length: periodsPerDay }).map((_, pIdx) => {
                            const dayTimetable = cls.timetable?.[day];
                            const slot = Array.isArray(dayTimetable) ? dayTimetable[pIdx] : null;
                            return (
                              <td
                                key={pIdx}
                                className="border px-1 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 text-center cursor-move"
                                draggable={!!slot}
                                onDragStart={() => handleDragStart(cls.name, day, pIdx + 1, slot)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(cls.name, day, pIdx + 1)}
                              >
                                {slot && slot.subject ? (
                                  <>
                                    <div className="font-semibold text-xs sm:text-sm">{slot.subject}</div>
                                    <div className="text-xs text-gray-600">{slot.teacher}</div>
                                  </>
                                ) : (
                                  <span className="text-xs">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Save Current Configuration as Template</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Template Name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="border p-2 rounded text-sm sm:text-base"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="border p-2 rounded text-sm sm:text-base"
                />
              </div>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim() || classes.length === 0}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-50 text-xs sm:text-sm"
              >
                Save Template
              </button>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Saved Templates</h2>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div key={template._id} className="p-3 sm:p-4 bg-gray-50 rounded border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">{template.name}</h3>
                      {template.description && (
                        <p className="text-xs sm:text-sm text-gray-600">{template.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {template.classes?.length || 0} classes, {template.teachers?.length || 0} teachers
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadTemplate(template._id)}
                        className="px-2 sm:px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs sm:text-sm"
                      >
                        Load
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm("Delete this template?")) {
                            await deleteTemplate(template._id);
                          }
                        }}
                        className="px-2 sm:px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No templates saved yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !validationResult && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-start gap-2">
              <p className="text-red-700 font-medium text-sm sm:text-base flex-1">{error}</p>
              <button
                onClick={() => useTimetableStore.setState({ error: null })}
                className="text-red-500 hover:text-red-700 text-lg sm:text-xl font-bold flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

