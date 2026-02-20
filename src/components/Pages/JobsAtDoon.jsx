import React from 'react';
import Layout from "../llayout"
import { Briefcase, GraduationCap, Users, Award, Clock, MapPin, Mail, Phone } from 'lucide-react';

const JobsAtDoon = () => {
  const currentOpenings = [
    {
      title: 'Mathematics Teacher',
      department: 'Academic',
      type: 'Full-time',
      experience: '3-5 years',
      qualifications: 'MSc Mathematics, B.Ed preferred',
      location: 'Dehradun Campus',
      description: 'Seeking an enthusiastic mathematics teacher to join our secondary school team.',
      responsibilities: [
        'Teach mathematics to grades 9-12',
        'Develop engaging lesson plans and assessments',
        'Mentor students in academic and personal development',
        'Participate in co-curricular activities'
      ]
    },
    {
      title: 'Residential House Master',
      department: 'Student Life',
      type: 'Full-time Residential',
      experience: '5+ years',
      qualifications: 'Masters degree, experience in boarding schools',
      location: 'Dehradun Campus',
      description: 'Lead and manage a boarding house, ensuring student welfare and development.',
      responsibilities: [
        'Oversee daily operations of boarding house',
        'Provide pastoral care and guidance to students',
        'Coordinate with parents and academic staff',
        'Organize house activities and events'
      ]
    },
    {
      title: 'IT Systems Administrator',
      department: 'Technology',
      type: 'Full-time',
      experience: '2-4 years',
      qualifications: 'BTech/MCA in Computer Science or related field',
      location: 'Dehradun Campus',
      description: 'Manage and maintain school\'s IT infrastructure and support digital learning.',
      responsibilities: [
        'Maintain network infrastructure and servers',
        'Support faculty and students with technology',
        'Implement cybersecurity measures',
        'Manage educational software and platforms'
      ]
    },
    {
      title: 'Sports Coach - Cricket',
      department: 'Sports',
      type: 'Full-time',
      experience: '3+ years',
      qualifications: 'Sports coaching certification, playing experience',
      location: 'Dehradun Campus',
      description: 'Train and develop cricket teams at various levels within the school.',
      responsibilities: [
        'Coach cricket teams for different age groups',
        'Develop training programs and strategies',
        'Organize inter-school competitions',
        'Maintain sports equipment and facilities'
      ]
    }
  ];

  const benefits = [
    {
      icon: GraduationCap,
      title: 'Professional Development',
      description: 'Continuous learning opportunities, workshops, and conference attendance',
      details: ['Annual training budget', 'Conference participation', 'Skill development programs', 'Career advancement paths']
    },
    {
      icon: Users,
      title: 'Community & Culture',
      description: 'Join a vibrant community of educators and professionals',
      details: ['Collaborative work environment', 'Faculty social events', 'Mentorship programs', 'Work-life balance']
    },
    {
      icon: Award,
      title: 'Compensation & Benefits',
      description: 'Competitive salary package with comprehensive benefits',
      details: ['Competitive salary', 'Health insurance', 'Retirement benefits', 'Performance bonuses']
    },
    {
      icon: MapPin,
      title: 'Campus Living',
      description: 'Beautiful campus accommodation and facilities',
      details: ['On-campus housing', 'Dining facilities', 'Recreation amenities', 'Scenic location']
    }
  ];

  const departments = [
    {
      name: 'Academic Faculty',
      description: 'Teaching positions across all subjects and grade levels',
      roles: ['Subject Teachers', 'Department Heads', 'Academic Coordinators', 'Learning Support']
    },
    {
      name: 'Student Life',
      description: 'Residential and pastoral care roles',
      roles: ['House Masters', 'Counselors', 'Student Activities', 'Residential Supervisors']
    },
    {
      name: 'Administration',
      description: 'Support roles ensuring smooth school operations',
      roles: ['Admissions', 'Finance', 'Human Resources', 'Communications']
    },
    {
      name: 'Support Services',
      description: 'Specialized services supporting the school community',
      roles: ['IT Support', 'Library Services', 'Health Services', 'Facilities Management']
    },
    {
      name: 'Sports & Activities',
      description: 'Coaching and activity leadership positions',
      roles: ['Sports Coaches', 'Activity Coordinators', 'Fitness Instructors', 'Outdoor Education']
    }
  ];

  const applicationProcess = [
    {
      step: 1,
      title: 'Submit Application',
      description: 'Send your resume and cover letter through our online portal or email'
    },
    {
      step: 2,
      title: 'Initial Screening',
      description: 'HR team reviews applications and conducts preliminary screening'
    },
    {
      step: 3,
      title: 'Interview Process',
      description: 'Multiple rounds including panel interviews and teaching demonstrations'
    },
    {
      step: 4,
      title: 'Reference Check',
      description: 'Verification of qualifications and professional references'
    },
    {
      step: 5,
      title: 'Offer & Onboarding',
      description: 'Job offer extended and comprehensive orientation program'
    }
  ];

  return (
    <Layout 
      title="Jobs At Doon" 
      subtitle="Join our community of dedicated educators and professionals"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Briefcase className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl font-bold text-primary">Career Opportunities</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            The EduReach offers exceptional career opportunities for passionate educators and 
            professionals who want to make a meaningful impact on young lives. Join our community 
            of dedicated individuals committed to excellence in education and character development.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We seek individuals who share our values of integrity, excellence, and service, and 
            who are excited about contributing to one of India's most prestigious educational institutions.
          </p>
        </div>

        {/* Current Openings */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-8">Current Openings</h2>
          <div className="space-y-6">
            {currentOpenings.map((job, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                        {job.department}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {job.type}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold lg:flex-shrink-0">
                    Apply Now
                  </button>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4">{job.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Requirements:</h4>
                    <p className="text-sm text-gray-600 mb-2">Experience: {job.experience}</p>
                    <p className="text-sm text-gray-600">Qualifications: {job.qualifications}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Key Responsibilities:</h4>
                    <ul className="space-y-1">
                      {job.responsibilities.slice(0, 3).map((resp, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-8">Why Work With Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <IconComponent className="w-8 h-8 text-primary mr-3" />
                    <h3 className="text-xl font-bold text-primary">{benefit.title}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{benefit.description}</p>
                  <ul className="space-y-2">
                    {benefit.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 flex-shrink-0"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-8">Departments & Roles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-3">{dept.name}</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{dept.description}</p>
                <div className="space-y-2">
                  {dept.roles.map((role, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2 flex-shrink-0"></span>
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-8">Application Process</h2>
          <div className="space-y-6">
            {applicationProcess.map((step, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-primary mb-2">{step.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Ready to Apply?</h2>
          <p className="text-lg leading-relaxed mb-6">
            Take the next step in your career and join The EduReach community. 
            We look forward to hearing from passionate individuals who want to make a difference.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Mail className="w-5 h-5 text-accent mr-2" />
                <h3 className="font-bold text-accent">Email Applications</h3>
              </div>
              <p className="text-sm">careers@doonschool.com</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Phone className="w-5 h-5 text-accent mr-2" />
                <h3 className="font-bold text-accent">HR Department</h3>
              </div>
              <p className="text-sm">+91-135-2526402</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-accent text-primary px-8 py-3 rounded-lg hover:bg-accent-dark transition-colors duration-300 font-semibold">
              View All Openings
            </button>
            <button className="border-2 border-accent text-accent px-8 py-3 rounded-lg hover:bg-accent hover:text-primary transition-colors duration-300 font-semibold">
              Submit Resume
            </button>
          </div>
        </div>

        {/* Equal Opportunity */}
        <div className="bg-accent text-primary rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Equal Opportunity Employer</h2>
          <p className="leading-relaxed">
            The EduReach is committed to creating an inclusive environment where all individuals 
            are treated with respect and dignity. We welcome applications from qualified candidates 
            regardless of race, gender, religion, or background.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default JobsAtDoon;