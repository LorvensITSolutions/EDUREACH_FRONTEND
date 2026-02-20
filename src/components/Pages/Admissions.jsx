import { useState } from 'react';
import TabsNav from '../Applications/TabNav';
import InfoTab from '../Applications/InfoTab';
import RequirementsTab from '../Applications/RequirementsTab';
import ApplicationForm from '../Applications/ApplicationForm';
import { useClassesAndSections } from '../../hooks/useClassesAndSections';
import {
  BookOpen, FileText, DollarSign, Clock
} from 'lucide-react';

const Admissions = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    studentName: "",
    dateOfBirth: "",
    gender: "",
    grade: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    address: "",
    previousSchool: "",
    medicalConditions: "",
    documents: {
      birthCertificate: "",
      previousRecords: "",
      medicalRecords: "",
      passport: ""
    }
  });
  const [errors, setErrors] = useState({});
  const [applicationStatus, setApplicationStatus] = useState('draft');

  // Get dynamic classes from backend
  const { classes, sections, loading: classesLoading } = useClassesAndSections();
  
  // Use dynamic classes or fallback to default grades
  const grades = classes.length > 0 ? classes : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "NURSERY", "LKG", "UKG"];
  const admissionRequirements = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Academic Records",
      description: "Previous school transcripts and report cards"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Required Documents",
      description: "Birth certificate, immunization records, and identification"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Application Fee",
      description: "Non-refundable application processing fee"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Application Timeline",
      description: "Applications processed within 2-3 weeks"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">School Admissions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Welcome to EduReach! Start your admission journey here.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-8">
          <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-6">
            {activeTab === 'info' && <InfoTab setActiveTab={setActiveTab} grades={grades} />}
            {activeTab === 'requirements' && (
              <RequirementsTab admissionRequirements={admissionRequirements} />
            )}
            {activeTab === 'application' && (
              <ApplicationForm
                formData={formData}
                setFormData={setFormData}
                applicationStatus={applicationStatus}
                setApplicationStatus={setApplicationStatus}
                errors={errors}
                setErrors={setErrors}
                grades={grades}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admissions;
