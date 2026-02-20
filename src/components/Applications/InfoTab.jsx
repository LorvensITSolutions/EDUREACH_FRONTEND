import { Award, User, BookOpen, CheckCircle } from 'lucide-react';

const InfoTab = ({ setActiveTab, grades }) => {
  const features = [
    { title: 'Academic Excellence', description: 'Top-rated curriculum...', icon: Award },
    { title: 'Experienced Faculty', description: 'Dedicated teachers...', icon: User },
    { title: 'Modern Facilities', description: 'State-of-the-art...', icon: BookOpen },
    { title: 'Holistic Development', description: 'Focus on academic, social...', icon: CheckCircle },
    { title: 'Small Class Sizes', description: 'Personalized attention...', icon: User },
    { title: 'Extracurricular Activities', description: 'Sports, arts, and more...', icon: Award }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Join Our School Family</h2>
        <p className="text-lg mb-6">At EduReach, we provide world-class education...</p>
        <button onClick={() => setActiveTab('application')} className="btn-accent">
          Start Your Application
        </button>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose EduReach?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-white" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Grades We Offer</h3>
        <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {grades.map((grade, i) => (
            <div key={i} className="bg-white rounded-lg p-3 text-center shadow-sm">
              <span className="font-medium text-gray-900">{grade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoTab;
