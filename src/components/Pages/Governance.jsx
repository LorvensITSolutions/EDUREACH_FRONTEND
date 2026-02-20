import React from 'react';
import Layout from '../components/Layout';
import { Crown, Users, Award, Target, Building, FileText } from 'lucide-react';

const Governance = () => {
  const boardMembers = [
    {
      name: 'Mr. Rajesh Khanna',
      position: 'Chairman, Board of Governors',
      background: 'Former CEO of Tata Industries, 25+ years in corporate leadership',
      expertise: 'Strategic Planning, Corporate Governance'
    },
    {
      name: 'Dr. Priya Sharma',
      position: 'Vice-Chairman',
      background: 'Former Vice-Chancellor, Delhi University, Education Policy Expert',
      expertise: 'Educational Leadership, Academic Excellence'
    },
    {
      name: 'Mr. Vikram Singh',
      position: 'Treasurer',
      background: 'Chartered Accountant, Former CFO of HDFC Bank',
      expertise: 'Financial Management, Risk Assessment'
    },
    {
      name: 'Ms. Anita Verma',
      position: 'Secretary',
      background: 'Former Principal, Modern School, 30+ years in education',
      expertise: 'School Administration, Curriculum Development'
    }
  ];

  const committees = [
    {
      name: 'Academic Committee',
      purpose: 'Oversees curriculum development, academic standards, and educational policies',
      members: '5 Board Members + Headmaster + Senior Faculty'
    },
    {
      name: 'Finance Committee',
      purpose: 'Manages school finances, budgets, and major financial decisions',
      members: '4 Board Members + Bursar + External Auditor'
    },
    {
      name: 'Infrastructure Committee',
      purpose: 'Plans and oversees campus development and facility improvements',
      members: '4 Board Members + Facilities Manager + Architect'
    },
    {
      name: 'Student Welfare Committee',
      purpose: 'Ensures student well-being, safety, and pastoral care standards',
      members: '3 Board Members + Counselors + House Masters'
    }
  ];

  const governanceStructure = [
    {
      level: 'Board of Governors',
      description: 'Ultimate governing body responsible for strategic direction and oversight',
      responsibilities: ['Strategic Planning', 'Policy Approval', 'Headmaster Selection', 'Financial Oversight']
    },
    {
      level: 'Headmaster',
      description: 'Chief Executive responsible for day-to-day operations and academic leadership',
      responsibilities: ['Academic Leadership', 'Staff Management', 'Student Discipline', 'Community Relations']
    },
    {
      level: 'Senior Management Team',
      description: 'Department heads and senior administrators supporting school operations',
      responsibilities: ['Department Management', 'Curriculum Implementation', 'Student Services', 'Operations']
    },
    {
      level: 'Faculty & Staff',
      description: 'Teachers and support staff delivering education and services',
      responsibilities: ['Teaching Excellence', 'Student Mentoring', 'Co-curricular Activities', 'Support Services']
    }
  ];

  return (
    <Layout 
      title="Governance" 
      subtitle="Leadership structure ensuring excellence and accountability"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Crown className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl font-bold text-primary">Governance Structure</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            The EduReach operates under a robust governance framework that ensures transparency, 
            accountability, and excellence in all aspects of school management. Our governance structure 
            combines experienced educational leaders with distinguished professionals from various fields.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The Board of Governors provides strategic oversight while empowering the Headmaster and 
            senior management team to deliver exceptional educational experiences and maintain the 
            highest standards of institutional excellence.
          </p>
        </div>

        {/* Board of Governors */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <Users className="w-8 h-8 text-accent mr-4" />
            <h2 className="text-3xl font-bold text-primary">Board of Governors</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {boardMembers.map((member, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-bold text-primary mb-2">{member.name}</h3>
                <p className="text-accent font-semibold mb-3">{member.position}</p>
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">{member.background}</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-semibold text-primary text-sm">Expertise: </span>
                  <span className="text-gray-600 text-sm">{member.expertise}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Governance Hierarchy */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <Building className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl font-bold text-primary">Organizational Structure</h2>
          </div>
          <div className="space-y-6">
            {governanceStructure.map((level, index) => (
              <div key={index} className="border-l-4 border-accent pl-6">
                <h3 className="text-xl font-bold text-primary mb-2">{level.level}</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{level.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {level.responsibilities.map((responsibility, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                      <span className="text-sm text-gray-700">{responsibility}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Committees */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <Target className="w-8 h-8 text-accent mr-4" />
            <h2 className="text-3xl font-bold text-primary">Board Committees</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {committees.map((committee, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-3">{committee.name}</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{committee.purpose}</p>
                <div className="bg-white rounded-lg p-3">
                  <span className="font-semibold text-accent text-sm">Composition: </span>
                  <span className="text-gray-600 text-sm">{committee.members}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Governance Principles */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Award className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl font-bold text-primary">Governance Principles</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Core Values</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Transparency in decision-making processes
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Accountability to all stakeholders
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Ethical leadership and integrity
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Continuous improvement and innovation
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Operational Excellence</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Strategic planning and risk management
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Financial stewardship and sustainability
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Quality assurance and compliance
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Stakeholder engagement and communication
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Meetings & Reports */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-accent mr-4" />
            <h2 className="text-3xl font-bold">Meetings & Reporting</h2>
          </div>
          <p className="text-lg leading-relaxed mb-6">
            The Board of Governors meets quarterly to review school performance, approve policies, 
            and make strategic decisions. Regular reporting ensures transparency and accountability 
            to all stakeholders.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Board Meetings</h3>
              <p className="text-sm">Quarterly meetings with detailed agenda and minutes</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Annual Reports</h3>
              <p className="text-sm">Comprehensive annual reports on academic and financial performance</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Stakeholder Updates</h3>
              <p className="text-sm">Regular communication with parents, alumni, and community</p>
            </div>
          </div>
        </div>

        {/* Contact Governance */}
        <div className="bg-accent text-primary rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Governance Inquiries</h2>
          <p className="text-lg mb-6 leading-relaxed">
            For questions about governance, policies, or to access board meeting minutes and reports, 
            please contact our administration office.
          </p>
          <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold">
            Contact Board Secretary
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Governance;