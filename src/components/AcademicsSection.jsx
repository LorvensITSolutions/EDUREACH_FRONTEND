import React from 'react';
import { BookOpen, Users, Laptop, GraduationCap, Star, Award, Brain, Rocket } from 'lucide-react';

const AcademicsSection = () => {
  const academicPrograms = [
    {
      id: 1,
      title: 'eKidz',
      frontImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      frontContent: {
        title: 'eKidz',
        subtitle: 'Early Learning Foundation',
        age: 'Ages 3-6'
      },
      backContent: {
        title: 'eKidz Program',
        description: 'Our eKidz program builds a strong foundation for lifelong learning, fostering curiosity and creativity in young minds through play-based learning and interactive activities.',
        features: [
          'Play-based Learning',
          'Creative Activities',
          'Social Development',
          'Basic Skills Building'
        ]
      },
      icon: <BookOpen className="w-6 h-6" />,
      gradient: 'from-pink-400 via-pink-500 to-pink-600',
      accentColor: 'bg-pink-500'
    },
    {
      id: 2,
      title: 'eChamps',
      frontImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      frontContent: {
        title: 'eChamps',
        subtitle: 'Excellence in Learning',
        age: 'Ages 7-12'
      },
      backContent: {
        title: 'eChamps Program',
        description: 'Our eChamps programme builds a strong foundation for lifelong learning, fostering curiosity and creativity through comprehensive academic excellence.',
        features: [
          'Academic Excellence',
          'Critical Thinking',
          'Problem Solving',
          'Leadership Skills'
        ]
      },
      icon: <Award className="w-6 h-6" />,
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      accentColor: 'bg-blue-500'
    },
    {
      id: 3,
      title: 'eTechno',
      frontImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      frontContent: {
        title: 'eTechno',
        subtitle: 'Technology Integration',
        age: 'Ages 13-16'
      },
      backContent: {
        title: 'eTechno Program',
        description: 'Advanced technology integration program preparing students for the digital future with hands-on experience in modern technological tools and applications.',
        features: [
          'Digital Literacy',
          'STEM Education',
          'Innovation Lab',
          'Future Skills'
        ]
      },
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-primary via-primary-light to-primary',
      accentColor: 'bg-primary'
    },
    {
      id: 4,
      title: 'Sr.Secondary',
      frontImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      frontContent: {
        title: 'Sr.Secondary',
        subtitle: 'Advanced Studies',
        age: 'Ages 17-18'
      },
      backContent: {
        title: 'Senior Secondary',
        description: 'Comprehensive senior secondary education focusing on academic excellence, career preparation, and holistic development for future success.',
        features: [
          'Board Preparation',
          'Career Guidance',
          'Higher Education',
          'Life Skills'
        ]
      },
      icon: <Rocket className="w-6 h-6" />,
      gradient: 'from-accent via-accent-light to-accent',
      accentColor: 'bg-accent'
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6 animate-fade-in">
            ACADEMICS
          </h1>
          <div className="w-20 sm:w-24 lg:w-32 h-1 bg-accent mx-auto rounded-full animate-scale-in"></div>
          <p className="mt-6 text-base sm:text-lg text-text opacity-80 max-w-2xl mx-auto animate-slide-up">
            Comprehensive educational programs designed to nurture young minds and prepare them for future success
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
          {academicPrograms.map((program, index) => (
            <div
              key={program.id}
              className="group relative h-80 sm:h-96 lg:h-[420px] perspective-1000 animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative w-full h-full duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="relative h-full">
                    {/* Image Container */}
                    <div className="relative h-48 sm:h-52 lg:h-56 overflow-hidden">
                      <img
                        src={program.frontImage}
                        alt={program.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      
                      {/* Age Badge */}
                      <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-text text-xs font-semibold px-3 py-1 rounded-full">
                        {program.frontContent.age}
                      </div>
                      
                      {/* Icon Badge */}
                      <div className={`absolute top-4 left-4 ${program.accentColor} text-white p-2 rounded-full shadow-lg`}>
                        {program.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 h-32 sm:h-44 lg:h-48 flex flex-col justify-between">
                      <div className="text-center">
                        <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                          {program.frontContent.title}
                        </h3>
                        <p className="text-sm sm:text-base text-text opacity-70 mb-3 sm:mb-4">
                          {program.frontContent.subtitle}
                        </p>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-accent-dark to-accent text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:from-accent hover:to-accent-light hover:shadow-lg transform hover:scale-105 active:scale-95">
                        Know More
                      </button>
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className={`h-full bg-gradient-to-br ${program.gradient} p-4 sm:p-6 text-white relative`}>
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="inline-block p-3 bg-white bg-opacity-20 rounded-full mb-3 backdrop-blur-sm">
                          {program.icon}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">
                          {program.backContent.title}
                        </h3>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <p className="text-xs sm:text-sm text-white text-opacity-95 leading-relaxed">
                          {program.backContent.description}
                        </p>
                        
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            Key Features:
                          </h4>
                          <ul className="text-xs sm:text-sm space-y-1.5">
                            {program.backContent.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 flex-shrink-0"></span>
                                <span className="leading-tight">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <button className="w-full bg-white bg-opacity-20 text-white py-2 sm:py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-opacity-30 border border-white border-opacity-30 hover:border-opacity-50 backdrop-blur-sm">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-12 sm:mt-16 lg:mt-20 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              Ready to Begin Your Academic Journey?
            </h2>
            <p className="text-text opacity-70 mb-6 sm:mb-8">
              Discover the perfect program for your child's educational development
            </p>
            <button className="bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3 rounded-xl font-semibold text-lg hover:from-primary-dark hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Explore All Programs
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .group:hover .group-hover\\:rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default AcademicsSection;