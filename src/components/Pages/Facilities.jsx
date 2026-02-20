import React from 'react';
import Layout from "../Layout";
import { Building, Wifi, Utensils, Bed, Trophy, Microscope, Palette, Music } from 'lucide-react';

const Facilities = () => {
  const facilities = [
    {
      icon: Building,
      title: 'Academic Buildings',
      description: 'Modern classrooms equipped with smart boards, air conditioning, and advanced audio-visual systems.',
      features: ['40 Smart Classrooms', 'Digital Libraries', 'Conference Rooms', 'Study Halls']
    },
    {
      icon: Microscope,
      title: 'Science Laboratories',
      description: 'State-of-the-art laboratories for Physics, Chemistry, Biology, and Computer Science.',
      features: ['Advanced Equipment', 'Research Facilities', 'Safety Systems', 'Digital Microscopes']
    },
    {
      icon: Trophy,
      title: 'Sports Complex',
      description: 'Comprehensive sports facilities including cricket grounds, football fields, and indoor courts.',
      features: ['Olympic Pool', 'Tennis Courts', 'Gymnasium', 'Athletic Track']
    },
    {
      icon: Bed,
      title: 'Boarding Houses',
      description: 'Comfortable and secure accommodation with modern amenities and 24/7 supervision.',
      features: ['Single Rooms', 'Common Areas', 'Study Spaces', 'Housemasters']
    },
    {
      icon: Utensils,
      title: 'Dining Facilities',
      description: 'Nutritious and diverse meal options prepared by professional chefs in hygienic conditions.',
      features: ['Multi-cuisine Menu', 'Dietary Options', 'Modern Kitchen', 'Dining Halls']
    },
    {
      icon: Palette,
      title: 'Arts & Crafts Center',
      description: 'Creative spaces for visual arts, pottery, sculpture, and various craft activities.',
      features: ['Art Studios', 'Pottery Wheels', 'Exhibition Space', 'Digital Art Lab']
    },
    {
      icon: Music,
      title: 'Music & Drama',
      description: 'Professional-grade facilities for music, drama, and performing arts.',
      features: ['Recording Studio', 'Theater', 'Practice Rooms', 'Instruments']
    },
    {
      icon: Wifi,
      title: 'Technology Infrastructure',
      description: 'Campus-wide high-speed internet, computer labs, and digital learning platforms.',
      features: ['Fiber Optic Network', 'Computer Labs', 'Digital Platforms', 'Tech Support']
    }
  ];

  const campusStats = [
    { label: 'Campus Area', value: '72 Acres' },
    { label: 'Buildings', value: '25+' },
    { label: 'Classrooms', value: '40' },
    { label: 'Laboratories', value: '12' }
  ];

  return (
    <Layout 
      title="Facilities" 
      subtitle="World-class infrastructure for holistic development"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Campus Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-6">Campus Overview</h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Our 72-acre campus in the scenic Doon Valley provides an ideal environment for learning and growth. 
            Set against the backdrop of the Himalayas, our facilities combine modern amenities with the natural 
            beauty of the surroundings, creating an inspiring atmosphere for education.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {campusStats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {facilities.map((facility, index) => {
            const IconComponent = facility.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <IconComponent className="w-8 h-8 text-primary mr-4" />
                  <h3 className="text-xl font-bold text-primary">{facility.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">{facility.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {facility.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-accent rounded-full mr-2 flex-shrink-0"></span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Accommodation Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-6">Boarding Facilities</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">House System</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our boarding houses are more than just accommodation – they are homes away from home. 
                Each house has its own character and traditions, fostering a sense of belonging and community.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  6 boarding houses with unique identities
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Experienced housemasters and tutors
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  24/7 medical and security support
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Regular house activities and competitions
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Room Amenities</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Each student enjoys comfortable and well-equipped accommodation designed to support 
                both study and relaxation.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Individual study desks and storage
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  High-speed internet connectivity
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Climate-controlled environment
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Common recreation and study areas
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sustainability */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Sustainable Campus</h2>
          <p className="text-lg leading-relaxed mb-6">
            We are committed to environmental sustainability and have implemented various green initiatives 
            across our campus to minimize our ecological footprint and teach students about environmental responsibility.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Solar Energy</h3>
              <p className="text-sm">Solar panels provide 40% of campus electricity needs</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Water Conservation</h3>
              <p className="text-sm">Rainwater harvesting and water recycling systems</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Waste Management</h3>
              <p className="text-sm">Comprehensive recycling and composting programs</p>
            </div>
          </div>
        </div>

        {/* Virtual Tour CTA */}
        <div className="bg-accent text-primary rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Experience Our Campus</h2>
          <p className="text-lg mb-6 leading-relaxed">
            Take a virtual tour of our facilities or schedule a visit to see our world-class infrastructure firsthand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold">
              Virtual Tour
            </button>
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 font-semibold">
              Schedule Visit
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Facilities;