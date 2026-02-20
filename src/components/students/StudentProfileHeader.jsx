import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { User, Mail, GraduationCap, Shield, Calendar } from "lucide-react";

const StudentProfileHeader = () => {
  const { t } = useTranslation();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
        const response = await fetch(`${baseUrl}/auth/profile`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const userData = await response.json();
        
        // Fetch additional student data if user is a student
        if (userData.role === 'student' && userData.studentId) {
          const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
          const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
          const studentResponse = await fetch(`${baseUrl}/students/profile/${userData.studentId}`, {
            credentials: 'include'
          });
          
          if (studentResponse.ok) {
            const studentInfo = await studentResponse.json();
            setStudentData({ ...userData, ...studentInfo });
          } else {
            setStudentData(userData);
          }
        } else {
          setStudentData(userData);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        // If it's an authentication error, show demo data for preview
        if (err.message.includes('Authentication required')) {
          console.log('Showing demo profile header data...');
          setStudentData({
            name: "Student2 Demo",
            email: "student2@demo.com",
            role: "student",
            studentId: "REG2",
            class: "IX",
            section: "A",
            birthDate: "2005-05-05",
            address: "Demo Current Address",
            parent: {
              name: "Parent2",
              phone: "9930106513"
            }
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            {studentData?.image?.url ? (
              <img 
                src={studentData.image.url} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User size={24} className="text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{studentData?.name || "Student"}</h2>
            <p className="text-sm text-gray-600">{studentData?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <GraduationCap size={16} className="text-gray-400" />
            <span className="text-gray-600">
              {studentData?.class || "N/A"} - {studentData?.section || "N/A"}
            </span>
          </div>
          
          {studentData?.studentId && (
            <div className="flex items-center space-x-2">
              <Shield size={16} className="text-gray-400" />
              <span className="text-gray-600">ID: {studentData.studentId}</span>
            </div>
          )}
          
          {studentData?.birthDate && (
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-600">{formatDate(studentData.birthDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileHeader;
