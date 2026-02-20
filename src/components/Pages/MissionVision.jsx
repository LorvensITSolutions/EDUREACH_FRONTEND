import React from 'react';
import Layout from "../Layout";
 import { Target, Eye, Heart, Star } from 'lucide-react';

const MissionVision = () => {
  return (
    <Layout 
      title="Mission And Vision" 
      subtitle="Our guiding principles and aspirations"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Target className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
          </div>
          <div className="bg-gradient-to-r from-primary-light to-primary text-white rounded-xl p-6 mb-6">
            <p className="text-lg leading-relaxed italic">
              "To attract and develop exceptional boys and teachers from all backgrounds to serve a meritocratic India; 
              inspire them to be just and ethical citizens; train them to be wise and principled leaders; and prepare 
              them to enter one of the strongest alumni fraternities – for life."
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Our mission reflects our commitment to excellence, diversity, and character development. We believe in 
            nurturing young minds from all walks of life, providing them with the tools and values necessary to 
            become leaders who will make a positive impact on society.
          </p>
        </div>

        {/* Vision Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Eye className="w-8 h-8 text-accent mr-4" />
            <h2 className="text-3xl font-bold text-primary">Our Vision</h2>
          </div>
          <div className="bg-gradient-to-r from-accent to-accent-light text-primary rounded-xl p-6 mb-6">
            <p className="text-lg leading-relaxed italic font-semibold">
              "India's top school joining the ranks of the world's great schools."
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            We aspire to be recognized globally as one of the finest educational institutions, setting standards 
            for academic excellence, character development, and holistic education that inspire schools worldwide.
          </p>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Heart className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl font-bold text-primary">Our Core Values</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-bold text-primary mb-3">Integrity</h3>
              <p className="text-gray-700">
                We believe in honesty, transparency, and moral courage in all our actions and decisions.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-bold text-primary mb-3">Excellence</h3>
              <p className="text-gray-700">
                We strive for the highest standards in academics, character, and personal development.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-bold text-primary mb-3">Service</h3>
              <p className="text-gray-700">
                We encourage our students to serve their communities and contribute to society.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-bold text-primary mb-3">Leadership</h3>
              <p className="text-gray-700">
                We develop principled leaders who can make positive changes in the world.
              </p>
            </div>
          </div>
        </div>

        {/* BBC Reference */}
        <div className="bg-gradient-to-r from-accent-light to-accent text-primary rounded-2xl p-8">
          <div className="flex items-center mb-4">
            <Star className="w-6 h-6 mr-3" />
            <h3 className="text-xl font-bold">Recognition</h3>
          </div>
          <p className="text-lg mb-4">
            <strong>The BBC World Service:</strong> India's Eton in conversation with Old Boy and journalist George Verghese
          </p>
          <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold">
            Listen to Interview
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default MissionVision;