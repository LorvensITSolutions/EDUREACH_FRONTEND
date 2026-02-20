import React from 'react';
import Layout from "../Layout";

const AboutPage = () => {
  return (
    <Layout 
      title="About The EduReach" 
      subtitle="Discover excellence in education and character building"
      showNavigationCards={true}
    >
      {/* Welcome Section */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8 md:mb-12">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 px-2">
              Welcome to The EduReach
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg px-2 sm:px-4">
              Established in 1935, The EduReach has been at the forefront of educational excellence in India. 
              Our institution is committed to nurturing young minds and developing future leaders who will serve 
              society with integrity and wisdom.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div className="p-3 sm:p-4 border-b sm:border-b-0 sm:border-r border-gray-200 last:border-0">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1 sm:mb-2">1935</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Founded</div>
            </div>
            <div className="p-3 sm:p-4 border-b sm:border-b-0 sm:border-r border-gray-200 last:border-0">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1 sm:mb-2">500+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Students</div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1 sm:mb-2">50+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Faculty Members</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;