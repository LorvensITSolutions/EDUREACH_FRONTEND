import { useState, useCallback } from "react";
import {
  FaUser, FaSchool, FaBirthdayCake, FaPhone,
  FaEnvelope, FaFileUpload, FaAddressCard, FaNotesMedical,
  FaCheckCircle
} from "react-icons/fa";
import useAdmissionStore from "../stores/useAdmissionsStore";
import { toast } from "react-hot-toast";
import NotificationStatus from "../shared/NotificationStatus";

// Move components outside to prevent recreation on every render
const InputField = ({ label, name, type = "text", value, icon, required = false, onChange, min }) => (
  <div className="flex flex-col gap-1">
    <label className="text-text font-medium">{label}</label>
    <div className="flex items-center px-3 py-2 border rounded-md bg-white shadow-sm">
      {icon && <span className="text-primary mr-2">{icon}</span>}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        min={min}
        className="w-full outline-none bg-transparent text-text"
      />
    </div>
  </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-text font-medium">{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      required
      className="border rounded-md px-3 py-2 bg-white shadow-sm text-text"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const ApplicationForm = ({ 
  formData: parentFormData, 
  setFormData: setParentFormData, 
  applicationStatus, 
  setApplicationStatus, 
  errors, 
  setErrors, 
  grades = [] 
}) => {
  // Use parent form data if provided, otherwise use local state
  const [localFormData, setLocalFormData] = useState({
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

  // Use parent form data if available
  const formData = parentFormData || localFormData;
  const setFormData = setParentFormData || setLocalFormData;

  // Get store functions and state
  const submitApplication = useAdmissionStore(state => state.submitApplication);
  const notificationStatus = useAdmissionStore(state => state.notificationStatus);
  const clearNotificationStatus = useAdmissionStore(state => state.clearNotificationStatus);

  // Set minimum date to allow all past years (starting from 1900)
  const minDate = "1900-01-01";

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [name]: files[0]
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  }, [setFormData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitApplication(formData);
      toast.success("Application submitted successfully!");
      
      // Clear the form fields
      const emptyFormData = {
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
      };
      setFormData(emptyFormData);
      
      // Clear notification status after 5 seconds
      setTimeout(() => {
        clearNotificationStatus();
      }, 5000);
      
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit application. Please try again.");
    }
  };

  return (
    <div className="bg-background p-6 md:p-10 max-w-5xl mx-auto rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">
        Admission Application Form
      </h1>

      {/* Notification Status Display */}
      {(notificationStatus.emailSent || notificationStatus.whatsappSent) && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <FaCheckCircle className="mr-2" />
            Notifications Sent Successfully
          </h3>
          <div className="space-y-2">
            <NotificationStatus 
              emailSent={notificationStatus.emailSent}
              whatsappSent={notificationStatus.whatsappSent}
              emailError={notificationStatus.emailError}
              whatsappError={notificationStatus.whatsappError}
              parentEmail={formData.parentEmail}
              parentPhone={formData.parentPhone}
              showDetails={true}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <InputField label="Student Name" name="studentName" value={formData.studentName} icon={<FaUser />} required onChange={handleChange} />
          <InputField 
            label="Date of Birth" 
            name="dateOfBirth" 
            type="date" 
            value={formData.dateOfBirth} 
            icon={<FaBirthdayCake />} 
            required 
            onChange={handleChange}
            min={minDate}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <SelectField label="Gender" name="gender" options={["Male", "Female", "Other"]} value={formData.gender} onChange={handleChange} />
          <SelectField label="Grade Applying For" name="grade" options={grades} value={formData.grade} onChange={handleChange} />
        </div>

        {/* Parent Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <InputField label="Parent/Guardian Name" name="parentName" value={formData.parentName} icon={<FaUser />} required onChange={handleChange} />
          <InputField label="Parent Email" name="parentEmail" type="email" value={formData.parentEmail} icon={<FaEnvelope />} required onChange={handleChange} />
          <InputField label="Parent Phone" name="parentPhone" value={formData.parentPhone} icon={<FaPhone />} required onChange={handleChange} />
          <InputField label="Address" name="address" value={formData.address} icon={<FaAddressCard />} onChange={handleChange} />
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <InputField label="Previous School" name="previousSchool" value={formData.previousSchool} icon={<FaSchool />} onChange={handleChange} />
          <InputField label="Medical Conditions" name="medicalConditions" value={formData.medicalConditions} icon={<FaNotesMedical />} onChange={handleChange} />
        </div>

        {/* Documents */}
        <div className="grid md:grid-cols-2 gap-6">
          {Object.keys(formData.documents).map((docName) => (
            <div key={docName}>
              <label className="block text-text font-medium mb-1 capitalize">
                {docName.replace(/([A-Z])/g, " $1")}
              </label>
              <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-md border shadow-sm">
                <FaFileUpload className="text-primary" />
                <input
                  type="file"
                  name={docName}
                  onChange={handleChange}
                  className="text-sm text-text"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="mt-6 px-8 py-3 text-white font-medium rounded-md transition duration-300 bg-primary hover:bg-primary-dark"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
