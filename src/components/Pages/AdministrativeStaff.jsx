import React from 'react';
import Layout from '../Layout';
import { UserCheck, Phone, Mail, Clock, Award, Users } from 'lucide-react';

const AdministrativeStaff = () => {
  const departments = [
    {
      name: 'Administration Office',
      head: 'Ms. Sunita Kapoor',
      position: 'Registrar',
      contact: 'registrar@doonschool.com',
      phone: '+91-135-2526400',
      responsibilities: ['Student Records', 'Admissions Support', 'Academic Scheduling', 'Official Documentation']
    },
    {
      name: 'Finance & Accounts',
      head: 'Mr. Rohit Sharma',
      position: 'Bursar',
      contact: 'bursar@doonschool.com',
      phone: '+91-135-2526401',
      responsibilities: ['Fee Management', 'Financial Planning', 'Budget Control', 'Vendor Relations']
    },
    {
      name: 'Human Resources',
      head: 'Ms. Kavita Singh',
      position: 'HR Manager',
      contact: 'hr@doonschool.com',
      phone: '+91-135-2526402',
      responsibilities: ['Staff Recruitment', 'Employee Relations', 'Training Programs', 'Policy Implementation']
    },
    {
      name: 'Student Services',
      head: 'Dr. Amit Gupta',
      position: 'Dean of Students',
      contact: 'studentservices@doonschool.com',
      phone: '+91-135-2526403',
      responsibilities: ['Student Welfare', 'Counseling Services', 'Disciplinary Matters', 'Parent Communication']
    },
    {
      name: 'Facilities Management',
      head: 'Mr. Rajesh Kumar',
      position: 'Facilities Manager',
      contact: 'facilities@doonschool.com',
      phone: '+91-135-2526404',
      responsibilities: ['Campus Maintenance', 'Security Operations', 'Utilities Management', 'Infrastructure Planning']
    },
    {
      name: 'Information Technology',
      head: 'Mr. Arjun Patel',
      position: 'IT Director',
      contact: 'it@doonschool.com',
      phone: '+91-135-2526405',
      responsibilities: ['Network Management', 'System Administration', 'Digital Learning Support', 'Tech Infrastructure']
    }
  ];

  const supportServices = [
    {
      service: 'Medical Center',
      staff: 'Dr. Priya Mehta & Nursing Staff',
      availability: '24/7',
      description: 'Comprehensive healthcare services for students and staff'
    },
    {
      service: 'Library Services',
      staff: 'Ms. Ritu Agarwal & Team',
      availability: '6:00 AM - 10:00 PM',
      description: 'Research support, digital resources, and study assistance'
    },
    {
      service: 'Dining Services',
      staff: 'Chef Ramesh & Kitchen Team',
      availability: 'Meal Times',
      description: 'Nutritious meals and dietary accommodation services'
    },
    {
      service: 'Transport Services',
      staff: 'Mr. Suresh & Drivers',
      availability: 'As Scheduled',
      description: 'Safe transportation for school activities and trips'
    },
    {
      service: 'Maintenance Team',
      staff: 'Mr. Mohan & Technical Staff',
      availability: '24/7 Emergency',
      description: 'Campus upkeep, repairs, and emergency maintenance'
    },
    {
      service: 'Security Services',
      staff: 'Security Team',
      availability: '24/7',
      description: 'Campus security, visitor management, and emergency response'
    }
  ];

  const officeHours = [
    { department: 'Administration Office', hours: '8:00 AM - 5:00 PM', days: 'Monday - Friday' },
    { department: 'Finance Office', hours: '9:00 AM - 4:00 PM', days: 'Monday - Friday' },
    { department: 'Student Services', hours: '8:00 AM - 6:00 PM', days: 'Monday - Saturday' },
    { department: 'IT Help Desk', hours: '7:00 AM - 9:00 PM', days: 'Daily' }
  ];

  return (
    <Layout 
      title="Administrative Staff" 
      subtitle="Dedicated professionals supporting our educational mission"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <UserCheck className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl font-bold text-primary">Our Administrative Team</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Behind every successful educational institution is a dedicated team of administrative professionals 
            who ensure smooth operations and exceptional service. Our administrative staff works tirelessly 
            to support students, faculty, and families in achieving their educational goals.
          </p>
          <p className="text-gray-700 leading-relaxed">
            From admissions and student services to facilities management and technology support, 
            our team is committed to providing efficient, friendly, and professional assistance 
            to all members of The EduReach community.
          </p>
        </div>

        {/* Department Heads */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <Users className="w-8 h-8 text-accent mr-4" />
            <h2 className="text-3xl font-bold text-primary">Department Heads</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {departments.map((dept, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-bold text-primary mb-2">{dept.name}</h3>
                <div className="mb-4">
                  <p className="font-semibold text-accent">{dept.head}</p>
                  <p className="text-gray-600 text-sm">{dept.position}</p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {dept.contact}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {dept.phone}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary text-sm mb-2">Key Responsibilities:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {dept.responsibilities.map((resp, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-600">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2 flex-shrink-0"></span>
                        {resp}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Services */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <Award className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl font-bold text-primary">Support Services</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportServices.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-2">{service.service}</h3>
                <p className="text-accent font-semibold text-sm mb-2">{service.staff}</p>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Clock className="w-4 h-4 mr-2" />
                  {service.availability}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Office Hours */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Clock className="w-8 h-8 text-accent mr-4" />
            <h2 className="text-3xl font-bold text-primary">Office Hours</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {officeHours.map((office, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-primary">{office.department}</h3>
                  <p className="text-sm text-gray-600">{office.days}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">{office.hours}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-accent-light rounded-lg">
            <p className="text-primary font-semibold text-sm">
              <strong>Emergency Contact:</strong> For urgent matters outside office hours, 
              please contact the main office at +91-135-2526400 or security at +91-135-2526444
            </p>
          </div>
        </div>

        {/* Service Standards */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-6">Our Service Standards</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Commitment to Excellence</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Prompt and courteous response to all inquiries
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Professional and confidential handling of information
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Efficient processing of requests and applications
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Clear communication and regular updates
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Support Philosophy</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Student-centered approach in all services
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Collaborative support for academic success
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Proactive problem-solving and assistance
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Continuous improvement of services
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Contact Our Team</h2>
          <p className="text-lg leading-relaxed mb-6">
            Our administrative staff is here to assist you with any questions or concerns. 
            Please don't hesitate to reach out to the appropriate department for prompt assistance.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">General Inquiries</h3>
              <p className="text-sm mb-2">Main Office: +91-135-2526400</p>
              <p className="text-sm">info@doonschool.com</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Admissions</h3>
              <p className="text-sm mb-2">Admissions Office: +91-135-2526401</p>
              <p className="text-sm">admissions@doonschool.com</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Emergency</h3>
              <p className="text-sm mb-2">24/7 Emergency: +91-135-2526444</p>
              <p className="text-sm">security@doonschool.com</p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-accent text-primary rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">We Value Your Feedback</h2>
          <p className="text-lg mb-6 leading-relaxed">
            Help us improve our services by sharing your feedback and suggestions. 
            Your input is valuable in our continuous effort to serve you better.
          </p>
          <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold">
            Submit Feedback
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AdministrativeStaff;