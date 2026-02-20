
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
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
  Briefcase,
  ChevronRight 
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

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (route) => {
    navigate(route);
    setIsSidebarOpen(false);
  };

  const isActive = (route) => {
    return location.pathname === route;
  };

  return (
    <>
      {/* Mobile Menu Button - always visible and prominent */}
      <div className="lg:hidden fixed top-16 sm:top-20 left-3 sm:left-4 z-[60]">
        <button
          onClick={toggleSidebar}
          className="bg-primary text-white p-2.5 sm:p-3 rounded-lg shadow-xl hover:bg-primary-dark transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-accent touch-manipulation"
          aria-label="Open sidebar menu"
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[55] transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar (desktop only, does not scroll) */}
      <aside className="hidden lg:flex flex-col h-screen bg-white shadow-2xl z-40 w-80 xl:w-96 sticky top-0 border-r border-gray-200">
        {/* About Us Header */}
        <div className="bg-gradient-to-r from-accent to-accent-light text-primary p-6 border-b border-gray-200">
          <h2 className="text-2xl xl:text-3xl font-bold text-center">About Us</h2>
          <p className="text-center text-sm mt-2 opacity-80">Discover Our Excellence</p>
        </div>
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto pb-20 p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.route);
            const hovered = hoveredItem === item.id;
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => handleNavigation(item.route)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-left group transform hover:scale-[1.02] ${
                    active 
                      ? 'bg-primary text-white shadow-lg scale-[1.02]' 
                      : hovered
                      ? 'bg-accent text-primary shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-5 h-5 transition-transform duration-300 ${hovered ? 'scale-110' : ''}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                    active || hovered ? 'opacity-100 translate-x-1' : 'opacity-0'
                  }`} />
                </button>
                {/* Hover Description */}
                {hovered && window.innerWidth >= 1024 && (
                  <div className="absolute left-full top-0 ml-2 bg-accent text-primary p-3 rounded-lg shadow-lg z-50 w-64 animate-fade-in">
                    <p className="text-sm font-medium">{item.description}</p>
                    <div className="absolute left-0 top-4 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-accent -ml-1"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar (slide-in) */}
      <div className={`lg:hidden fixed left-0 top-0 h-full bg-white shadow-2xl z-[60] transform transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-72 sm:w-80 md:w-96`}>
        {/* About Us Header */}
        <div className="bg-gradient-to-r from-accent to-accent-light text-primary p-4 sm:p-5 md:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">About Us</h2>
          <p className="text-center text-xs sm:text-sm mt-1 sm:mt-2 opacity-80">Discover Our Excellence</p>
        </div>
        {/* Navigation Menu */}
        <nav className="h-full overflow-y-auto pb-20 p-3 sm:p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.route);
            const hovered = hoveredItem === item.id;
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => handleNavigation(item.route)}
                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-left group transform active:scale-[0.98] touch-manipulation ${
                    active 
                      ? 'bg-primary text-white shadow-lg' 
                      : hovered
                      ? 'bg-accent text-primary shadow-md'
                      : 'bg-gray-50 text-gray-700 active:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 flex-shrink-0 ${hovered ? 'scale-110' : ''}`} />
                    <span className="font-medium text-xs sm:text-sm">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 flex-shrink-0 ${
                    active || hovered ? 'opacity-100 translate-x-1' : 'opacity-0'
                  }`} />
                </button>
                {/* Hover Description (not shown on mobile) */}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;