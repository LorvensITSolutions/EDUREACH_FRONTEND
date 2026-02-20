import React from 'react';
import Layout from "../Layout";
import { FileText, Shield, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const SchoolPolicies = () => {
  const policyCategories = [
    {
      icon: Shield,
      title: 'Code of Conduct',
      description: 'Guidelines for student behavior, discipline, and character development.',
      policies: [
        'Student Behavior Standards',
        'Disciplinary Procedures',
        'Honor Code',
        'Anti-Bullying Policy'
      ]
    },
    {
      icon: Users,
      title: 'Academic Policies',
      description: 'Standards and procedures for academic excellence and integrity.',
      policies: [
        'Assessment Guidelines',
        'Academic Integrity',
        'Homework Policy',
        'Examination Rules'
      ]
    },
    {
      icon: Clock,
      title: 'Attendance & Leave',
      description: 'Requirements for attendance, leave applications, and absence procedures.',
      policies: [
        'Attendance Requirements',
        'Leave Application Process',
        'Medical Leave Policy',
        'Emergency Procedures'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Safety & Security',
      description: 'Comprehensive safety measures and emergency protocols.',
      policies: [
        'Campus Security',
        'Emergency Evacuation',
        'Health & Safety',
        'Visitor Guidelines'
      ]
    },
    {
      icon: CheckCircle,
      title: 'Technology Use',
      description: 'Guidelines for responsible use of technology and digital resources.',
      policies: [
        'Internet Usage Policy',
        'Device Management',
        'Digital Citizenship',
        'Privacy Protection'
      ]
    },
    {
      icon: FileText,
      title: 'Administrative',
      description: 'General administrative policies and procedures.',
      policies: [
        'Admission Procedures',
        'Fee Structure',
        'Communication Policy',
        'Grievance Redressal'
      ]
    }
  ];

  const keyPolicies = [
    {
      title: 'Academic Integrity',
      description: 'We maintain the highest standards of academic honesty and expect all students to uphold these values.',
      details: [
        'Zero tolerance for plagiarism and cheating',
        'Proper citation and referencing requirements',
        'Collaborative work guidelines',
        'Consequences for academic dishonesty'
      ]
    },
    {
      title: 'Disciplinary Framework',
      description: 'Our disciplinary system focuses on character development and learning from mistakes.',
      details: [
        'Progressive discipline approach',
        'Restorative justice principles',
        'Counseling and support services',
        'Parent involvement in serious cases'
      ]
    },
    {
      title: 'Health & Wellness',
      description: 'Comprehensive policies to ensure the physical and mental well-being of all students.',
      details: [
        '24/7 medical facility on campus',
        'Mental health support services',
        'Nutrition and dietary guidelines',
        'Regular health check-ups'
      ]
    }
  ];

  return (
    <Layout 
      title="School Policies" 
      subtitle="Guidelines for a safe, supportive, and excellent learning environment"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-6">Our Policy Framework</h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            The EduReach's policies are designed to create a safe, supportive, and academically excellent 
            environment for all members of our community. These guidelines reflect our values and commitment 
            to developing responsible, ethical, and successful individuals.
          </p>
          <p className="text-gray-700 leading-relaxed">
            All policies are regularly reviewed and updated to ensure they remain relevant and effective 
            in supporting our educational mission and the well-being of our students.
          </p>
        </div>

        {/* Policy Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {policyCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <IconComponent className="w-8 h-8 text-primary mr-3" />
                  <h3 className="text-xl font-bold text-primary">{category.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 text-sm">{category.description}</p>
                <ul className="space-y-2">
                  {category.policies.map((policy, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-accent rounded-full mr-3 flex-shrink-0"></span>
                      {policy}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Key Policies Detail */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-8">Key Policy Highlights</h2>
          <div className="space-y-8">
            {keyPolicies.map((policy, index) => (
              <div key={index} className="border-l-4 border-accent pl-6">
                <h3 className="text-xl font-bold text-primary mb-3">{policy.title}</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{policy.description}</p>
                <ul className="space-y-2">
                  {policy.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start text-gray-600">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Student Rights & Responsibilities */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-6">Student Rights & Responsibilities</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Student Rights</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Right to quality education and fair treatment
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Freedom of expression within appropriate bounds
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Access to support services and resources
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Privacy and confidentiality protection
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Due process in disciplinary matters
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Student Responsibilities</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Maintain academic integrity and honesty
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Respect others and school property
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Follow school rules and regulations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Contribute positively to school community
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Take responsibility for personal actions
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Policy Updates */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Policy Updates & Communication</h2>
          <p className="text-lg leading-relaxed mb-6">
            We believe in transparent communication regarding policy changes and updates. All stakeholders 
            are informed promptly about any modifications to ensure everyone remains well-informed about 
            current guidelines and expectations.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Regular Reviews</h3>
              <p className="text-sm">Policies are reviewed annually by faculty, administration, and student representatives</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Community Input</h3>
              <p className="text-sm">Stakeholder feedback is actively sought and considered in policy development</p>
            </div>
          </div>
        </div>

        {/* Contact & Resources */}
        <div className="bg-accent text-primary rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions About Policies?</h2>
          <p className="text-lg mb-6 leading-relaxed">
            If you have questions about any of our policies or need clarification, 
            please don't hesitate to contact our administration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold">
              Download Policy Handbook
            </button>
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 font-semibold">
              Contact Administration
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SchoolPolicies;