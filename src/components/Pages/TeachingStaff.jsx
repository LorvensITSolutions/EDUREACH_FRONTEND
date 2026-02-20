import React from 'react';
import Layout from "../Layout";
import { GraduationCap, Award, BookOpen, Users } from 'lucide-react';

const TeachingStaff = () => {
  const departments = [
    {
      name: 'English & Literature',
      head: 'Dr. Sarah Johnson',
      qualification: 'PhD Literature, Cambridge',
      experience: '15 years',
      specialization: 'Contemporary Literature & Creative Writing'
    },
    {
      name: 'Mathematics',
      head: 'Prof. Rajesh Gupta',
      qualification: 'MSc Mathematics, IIT Delhi',
      experience: '20 years',
      specialization: 'Advanced Calculus & Statistics'
    },
    {
      name: 'Science',
      head: 'Dr. Priya Sharma',
      qualification: 'PhD Physics, Oxford',
      experience: '18 years',
      specialization: 'Quantum Physics & Research Methods'
    },
    {
      name: 'History & Social Studies',
      head: 'Mr. Vikram Singh',
      qualification: 'MA History, JNU',
      experience: '22 years',
      specialization: 'Indian History & International Relations'
    },
    {
      name: 'Languages',
      head: 'Ms. Anita Verma',
      qualification: 'MA Linguistics, Delhi University',
      experience: '16 years',
      specialization: 'Hindi, Sanskrit & French'
    },
    {
      name: 'Arts & Music',
      head: 'Mr. David Thompson',
      qualification: 'MFA Fine Arts, Yale',
      experience: '12 years',
      specialization: 'Visual Arts & Music Composition'
    }
  ];

  const facultyStats = [
    { label: 'Total Faculty', value: '52', icon: Users },
    { label: 'PhD Holders', value: '28', icon: GraduationCap },
    { label: 'International Faculty', value: '15', icon: Award },
    { label: 'Average Experience', value: '18 yrs', icon: BookOpen }
  ];

  return (
    <Layout 
      title="Teaching Staff" 
      subtitle="Meet our dedicated and experienced educators"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Faculty Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {facultyStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                <IconComponent className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-6">Excellence in Education</h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Our faculty represents the cornerstone of The EduReach's educational excellence. Comprising 
            distinguished educators from prestigious institutions worldwide, our teaching staff brings together 
            academic rigor, innovative pedagogy, and genuine care for student development.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Each faculty member is not just a subject expert but a mentor who guides students through their 
            academic journey and personal growth. Our teachers are committed to fostering critical thinking, 
            creativity, and character development in every student.
          </p>
        </div>

        {/* Department Heads */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-8">Department Heads</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {departments.map((dept, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-bold text-primary mb-3">{dept.name}</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold">Head:</span>
                    <span>{dept.head}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Qualification:</span>
                    <span className="text-right">{dept.qualification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Experience:</span>
                    <span>{dept.experience}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="font-semibold text-accent">Specialization:</span>
                    <p className="text-sm mt-1">{dept.specialization}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Excellence */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-6">Faculty Excellence</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Qualifications & Experience</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  54% of faculty hold doctoral degrees from prestigious universities
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Average teaching experience of 18 years
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  International faculty from UK, USA, Canada, and Australia
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Regular professional development and training programs
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Teaching Philosophy</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Student-centered learning approach
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Integration of technology in classroom instruction
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Emphasis on critical thinking and problem-solving
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Holistic development beyond academics
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Professional Development */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Continuous Learning</h2>
          <p className="text-lg leading-relaxed mb-6">
            Our faculty members are lifelong learners who continuously update their knowledge and teaching 
            methodologies. We invest significantly in professional development to ensure our educators 
            remain at the forefront of educational innovation.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Research & Publications</h3>
              <p className="text-sm">Faculty members actively engage in research and publish in academic journals</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">International Conferences</h3>
              <p className="text-sm">Regular participation in global educational conferences and workshops</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Collaborative Learning</h3>
              <p className="text-sm">Exchange programs with partner schools and universities worldwide</p>
            </div>
          </div>
        </div>

        {/* Join Our Faculty */}
        <div className="bg-accent text-primary rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Faculty</h2>
          <p className="text-lg mb-6 leading-relaxed">
            Are you passionate about education and looking to make a difference? 
            Explore opportunities to join our distinguished faculty team.
          </p>
          <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold">
            View Open Positions
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default TeachingStaff;