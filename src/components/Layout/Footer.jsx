import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* School Info */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">S</span>
              </div>
              <span className="text-lg sm:text-xl font-bold">EduReach</span>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Excellence in education, nurturing minds for tomorrow. Building a brighter future through innovative learning and dedicated teaching.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 p-1">
                <Facebook size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 p-1">
                <Twitter size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 p-1">
                <Instagram size={18} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/admissions" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Admissions
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Announcements
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Academic</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Curriculum
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Faculty
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Library
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Facilities
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Student Life
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Us</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <MapPin size={14} className="text-primary mt-1 flex-shrink-0 sm:w-4 sm:h-4" />
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Road NO.86, 1st Floor, Jubilee hills, <br />
                  Hyderabad, Telangana, India
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Phone size={14} className="text-primary flex-shrink-0 sm:w-4 sm:h-4" />
                <p className="text-gray-300 text-xs sm:text-sm">+91 7013814030</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail size={14} className="text-primary flex-shrink-0 sm:w-4 sm:h-4" />
                <p className="text-gray-300 text-xs sm:text-sm">yeslorvenssolutions@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              © {currentYear} Yes Lorvens. All rights reserved. • <Link to="/privacy-policy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link> • <Link to="/account-deletion" className="hover:text-white transition-colors duration-200">Account Deletion</Link>
            </p>
            <div className="flex items-center space-x-1">
              <span className="text-gray-400 text-xs sm:text-sm">Made with</span>
              <Heart size={14} className="text-red-500 sm:w-4 sm:h-4" />
              <span className="text-gray-400 text-xs sm:text-sm">for education</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;