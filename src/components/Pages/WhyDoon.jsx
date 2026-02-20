import React from 'react';
import Layout from "../Layout";
import { Trophy, Star, Globe, Users, BookOpen, Heart } from 'lucide-react';
import NavigationCards from "../NavigationCards"

const WhyDoon = () => {
  const advantages = [
    {
      icon: Trophy,
      title: 'Academic Excellence',
      description: 'Consistently ranked among India\'s top schools with outstanding academic results and university placements.',
      stats: '98% University Acceptance Rate'
    },
    {
      icon: Users,
      title: 'World-Class Faculty',
      description: 'Highly qualified teachers from prestigious institutions worldwide, dedicated to nurturing each student.',
      stats: '1:8 Teacher-Student Ratio'
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'International partnerships and exchange programs that broaden horizons and cultural understanding.',
      stats: '25+ Partner Schools Globally'
    },
    {
      icon: BookOpen,
      title: 'Holistic Development',
      description: 'Comprehensive programs covering academics, sports, arts, and character development.',
      stats: '50+ Co-curricular Activities'
    },
    {
      icon: Star,
      title: 'Leadership Training',
      description: 'Structured leadership development through prefectorial system and student governance.',
      stats: '100% Leadership Opportunities'
    },
    {
      icon: Heart,
      title: 'Strong Alumni Network',
      description: 'Lifelong connections with successful alumni across various fields and industries.',
      stats: '5000+ Global Alumni'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      batch: 'Class of 2010',
      profession: 'CEO, Tech Innovations',
      quote: 'Doon taught me not just academics, but how to think critically and lead with integrity. The values I learned here guide me every day.'
    },
    {
      name: 'Arjun Mehta',
      batch: 'Class of 2015',
      profession: 'Rhodes Scholar, Oxford',
      quote: 'The rigorous academic environment and supportive community at Doon prepared me for success at the world\'s best universities.'
    },
    {
      name: 'Vikram Singh',
      batch: 'Class of 2008',
      profession: 'Social Entrepreneur',
      quote: 'Doon instilled in me a sense of social responsibility that drives my work in education and community development.'
    }
  ];

  return (
    <Layout 
      title="Why Doon?" 
      subtitle="Discover what makes The EduReach exceptional"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">The Doon Advantage</h2>
          <p className="text-gray-700 leading-relaxed text-lg max-w-3xl mx-auto">
            For nearly nine decades, The EduReach has been synonymous with excellence in education. 
            Our unique approach combines rigorous academics with character development, creating leaders 
            who make a positive impact on the world.
          </p>
        </div>

        {/* Key Advantages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <IconComponent className="w-8 h-8 text-primary mr-3" />
                  <h3 className="text-xl font-bold text-primary">{advantage.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">{advantage.description}</p>
                <div className="bg-accent-light text-primary px-4 py-2 rounded-lg font-semibold text-sm">
                  {advantage.stats}
                </div>
              </div>
            );
          })}
        </div>

        {/* What Sets Us Apart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">What Sets Us Apart</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Academic Rigor</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Challenging curriculum aligned with international standards
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Small class sizes ensuring personalized attention
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Advanced placement and international certification programs
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  State-of-the-art laboratories and research facilities
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Character Development</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Strong emphasis on ethics and moral values
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Community service and social responsibility programs
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Leadership opportunities through student government
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Mentorship programs with faculty and alumni
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Alumni Testimonials */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">What Our Alumni Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white bg-opacity-10 rounded-xl p-6">
                <p className="italic mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div className="border-t border-white border-opacity-20 pt-4">
                  <div className="font-bold text-accent">{testimonial.name}</div>
                  <div className="text-sm opacity-80">{testimonial.batch}</div>
                  <div className="text-sm opacity-80">{testimonial.profession}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-accent text-primary rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Doon Family?</h2>
          <p className="text-lg mb-6 leading-relaxed">
            Discover how The EduReach can shape your child's future and unlock their full potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold">
              Schedule a Visit
            </button>
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 font-semibold">
              Download Prospectus
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WhyDoon;