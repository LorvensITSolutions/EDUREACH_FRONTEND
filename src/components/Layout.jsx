import React from 'react';
import Sidebar from "./Sidebar";
import NavigationCards from './NavigationCards';

const Layout = ({ children, title, subtitle, showNavigationCards = false }) => {
  return (
    <div className="flex bg-background min-h-screen">
      {/* Sidebar - handles its own visibility (mobile button + desktop sidebar) */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-auto lg:ml-0">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-12 sm:pb-16">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 sm:mb-3 px-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 px-4">{subtitle}</p>
            )}
            <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-accent mx-auto rounded-full"></div>
          </div>

          {/* Content */}
          <div className="animate-slide-up">
            {children}
          </div>

          {/* Navigation Cards (optional) */}
          {showNavigationCards && (
            <div className="mt-8 sm:mt-10 md:mt-12">
              <NavigationCards />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Layout;
