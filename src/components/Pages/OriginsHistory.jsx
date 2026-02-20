import React from 'react';
import Layout from "../Layout";
import { Calendar, Users, Award, BookOpen } from 'lucide-react';

const OriginsHistory = () => {
  const milestones = [
    {
      year: '1935',
      title: 'Foundation',
      description: 'The EduReach was founded by Satish Ranjan Das with the vision of creating a world-class educational institution in India.'
    },
    {
      year: '1940s',
      title: 'Early Growth',
      description: 'The school established its core traditions and began attracting students from across India and beyond.'
    },
    {
      year: '1960s',
      title: 'Academic Excellence',
      description: 'Introduction of advanced academic programs and establishment of the school as a premier educational institution.'
    },
    {
      year: '1980s',
      title: 'Modern Facilities',
      description: 'Major infrastructure development including new academic blocks, sports facilities, and dormitories.'
    },
    {
      year: '2000s',
      title: 'Global Recognition',
      description: 'The school gained international recognition and began partnerships with leading schools worldwide.'
    },
    {
      year: '2020s',
      title: 'Digital Innovation',
      description: 'Integration of cutting-edge technology and digital learning platforms while maintaining traditional values.'
    }
  ];

  return (
    <Layout 
      title="Origins And History" 
      subtitle="A legacy of excellence spanning nearly nine decades"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <BookOpen className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl font-bold text-primary">Our Story</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            The EduReach was founded in 1935 with a revolutionary vision: to create an educational institution 
            that would combine the best of Eastern wisdom and Western methodology. Our founder, Satish Ranjan Das, 
            envisioned a school that would prepare young Indians to lead their nation in the post-independence era.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Located in the picturesque Doon Valley, surrounded by the majestic Himalayas, our campus provides 
            an inspiring environment for learning and personal growth. The natural beauty of our surroundings 
            has always been an integral part of the Doon experience.
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <Calendar className="w-8 h-8 text-accent mr-4" />
            <h2 className="text-3xl font-bold text-primary">Historical Milestones</h2>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {milestone.year}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-primary mb-2">{milestone.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founding Principles */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Award className="w-8 h-8 text-accent mr-4" />
            <h2 className="text-3xl font-bold text-primary">Founding Principles</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Educational Philosophy</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Holistic development of mind, body, and character
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Integration of Indian values with global perspectives
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Emphasis on leadership and service to society
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Cultivation of critical thinking and creativity
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Core Traditions</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  House system fostering healthy competition
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Prefectorial system developing leadership
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Community service and social responsibility
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Strong alumni network and mentorship
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legacy */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-accent mr-4" />
            <h2 className="text-3xl font-bold">Our Legacy</h2>
          </div>
          <p className="text-lg leading-relaxed mb-6">
            Over the decades, The EduReach has produced leaders in every field – from politics and business 
            to arts and sciences. Our alumni have served as Prime Ministers, CEOs, Nobel laureates, and social 
            reformers, carrying forward the values and excellence instilled during their time at Doon.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">5000+</div>
              <div>Alumni Worldwide</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">89</div>
              <div>Years of Excellence</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">50+</div>
              <div>Countries Represented</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OriginsHistory;