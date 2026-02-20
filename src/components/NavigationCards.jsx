import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Send, 
  Info, 
  Trophy, 
  Users, 
  Building, 
  FileText, 
  Shield, 
  UserCheck, 
  MapPin, 
  Briefcase 
} from 'lucide-react';

const navigationItems = [
  { 
    id: 'headmaster', 
    label: "Headmaster's Message", 
    route: '/about/headmaster', 
    icon: Mic,
    description: "Read inspiring words from our school's leader"
  },
   { 
    id: 'mission', 
    label: 'Mission And Vision', 
    route: '/about/mission-vision', 
    icon: Send,
    description: "Discover our core values and future aspirations"
  },
    { 
    id: 'origins', 
    label: 'Origins And History', 
    route: '/about/origins-history', 
    icon: Info,
    description: "Learn about our rich heritage and founding story"
  },
   { 
    id: 'why', 
    label: 'Why Doon?', 
    route: '/about/why-doon', 
    icon: Trophy,
    description: "Understand what makes our school exceptional"
  },
  { 
    id: 'teaching', 
    label: 'Teaching Staff', 
    route: '/about/teaching-staff', 
    icon: Users,
    description: "Meet our dedicated and experienced educators"
  },
  { 
    id: 'facilities', 
    label: 'Facilities', 
    route: '/about/facilities', 
    icon: Building,
    description: "Explore our world-class campus and amenities"
  },
  { 
    id: 'policies', 
    label: 'School Policies', 
    route: '/about/school-policies', 
    icon: FileText,
    description: "Review our comprehensive school guidelines"
  },
    { 
    id: 'admin', 
    label: 'Administrative Staff', 
    route: '/about/administrative-staff', 
    icon: UserCheck,
    description: "Meet our supportive administrative team"
  },


];

const NavigationCards = () => {
  const navigate = useNavigate();

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-primary text-center mb-8">Explore Our School</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.route)}
              className="group bg-white hover:bg-accent transition-all duration-300 transform hover:scale-105 cursor-pointer rounded-xl p-4 lg:p-6 text-center shadow-lg hover:shadow-2xl border border-gray-100 hover:border-accent relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent opacity-10 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
              
              <IconComponent className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 text-primary group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
              <h3 className="text-base lg:text-lg font-bold text-gray-800 group-hover:text-primary mb-2 transition-colors duration-300">
                {item.label}
              </h3>
              <p className="text-xs lg:text-sm text-gray-600 group-hover:text-primary-dark leading-relaxed transition-colors duration-300">
                {item.description}
              </p>
              
              {/* Hover indicator */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationCards;