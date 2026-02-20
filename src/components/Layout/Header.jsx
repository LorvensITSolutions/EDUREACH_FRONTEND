
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Bell, Settings, PanelLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import EduReach from "../../assets/edu.svg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const user = useUserStore((s) => s.user);
  const isAuthenticated = !!user;
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const navigation = [
    { name: t('nav.home'), href: "/", current: location.pathname === "/" },
    { name: t('nav.about'), href: "/about", current: location.pathname.startsWith("/about") },
    { name: t('nav.events'), href: "/events", current: location.pathname === "/events" },
    { name: t('nav.admissions'), href: "/admissions", current: location.pathname === "/admissions" },
    { name: t('nav.announcements'), href: "/announcements", current: location.pathname === "/announcements" },
  ];

  const handleLogout = async () => {
    const logout = useUserStore.getState().logout;
    await logout();
    setIsProfileDropdownOpen(false);
    navigate("/");
  };
console.log(user);
  const handleDashboardClick = () => {
    if (!user || !user.role) return;

    let dashboardPath = "/";
    switch (user?.role) {
      case "admin":
        dashboardPath = "/admin-dashboard";
        break;
      case "teacher":
        dashboardPath = "/teacher-dashboard";
        break;
      case "student":
        dashboardPath = "/student-dashboard";
        break;
      case "parent":
        dashboardPath = "/parent-dashboard";
        break;
      case "librarian":
        dashboardPath = "/library-dashboard";
        break;
      default:
        dashboardPath = "/";
    }

    navigate(dashboardPath);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 touch-manipulation">
            <motion.img
              src={EduReach}
              alt="EduReach Logo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="h-8 sm:h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-all duration-200 px-2 py-1 border-b-2 ${
                  item.current
                    ? "text-primary border-primary"
                    : "text-gray-700 border-transparent hover:text-primary hover:border-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* Dashboard Sidebar Toggle (Hidden on desktop - only on admin dashboard) */}
            {location.pathname.startsWith('/admin-dashboard') && (
              <button
                onClick={() => {
                  const event = new CustomEvent('toggleDashboardSidebar');
                  window.dispatchEvent(event);
                }}
                className="hidden items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Toggle Dashboard Sidebar"
              >
                <PanelLeft size={18} className="mr-2" />
                Dashboard Menu
              </button>
            )}
            {isAuthenticated ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDashboardClick}
                  className="hidden sm:inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-primary border border-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200 touch-manipulation"
                >
                  {t('auth.dashboard')}
                </motion.button>

                <button 
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-primary transition duration-200 touch-manipulation"
                  aria-label="Notifications"
                >
                  <Bell size={18} className="sm:w-5 sm:h-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-1 sm:space-x-2 p-0.5 sm:p-1 rounded-full hover:ring-2 ring-primary transition touch-manipulation"
                    aria-label="User profile menu"
                  >
                    <img
                      src={
                        user?.avatar?.url || 
                        user?.avatar || 
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=007bff&color=fff&size=32&bold=true`
                      }
                      alt={`${user?.name || 'User'} Avatar`}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        // ✅ Fallback to generated avatar if image fails to load
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=007bff&color=fff&size=32&bold=true`;
                      }}
                    />
                    <span className="hidden sm:block text-xs sm:text-sm font-medium text-gray-700 max-w-[80px] md:max-w-none truncate">
                      {user?.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-40 sm:w-48 bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 py-2 border-b">
                          <p className="text-xs sm:text-sm font-semibold truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        {/* <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <User size={16} className="mr-2" />
                          {t('auth.profile')}
                        </Link> */}
                        {/* <Link
                          to="/settings"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings size={16} className="mr-2" />
                          {t('auth.settings')}
                        </Link> */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100 touch-manipulation"
                        >
                          <LogOut size={16} className="mr-2 flex-shrink-0" />
                          {t('auth.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Language Switcher */}
                <select
                  value={i18n.resolvedLanguage}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="border rounded-md px-1.5 sm:px-2 py-1 text-xs sm:text-sm touch-manipulation"
                  aria-label="Language selector"
                >
                  <option value="en">EN</option>
                  <option value="hi">हिं</option>
                  <option value="te">తె</option>
                </select>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium text-sm sm:text-base px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-primary/10 transition-colors touch-manipulation"
              >
                {t('auth.login')}
              </Link>
            )}

            {/* Dashboard Sidebar Toggle (only on admin dashboard) */}
            {location.pathname.startsWith('/admin-dashboard') && (
              <button
                onClick={() => {
                  const event = new CustomEvent('toggleDashboardSidebar');
                  window.dispatchEvent(event);
                }}
                className="md:hidden p-1.5 sm:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition duration-200 touch-manipulation"
                title="Toggle Dashboard Sidebar"
                aria-label="Toggle Dashboard Sidebar"
              >
                <PanelLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="md:hidden p-1.5 sm:p-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition duration-200 touch-manipulation"
              title="Site Navigation Menu"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white shadow-inner border-t overflow-hidden"
          >
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1 sm:space-y-2">
              {/* Main Site Navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-sm sm:text-base font-medium rounded-md px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-200 touch-manipulation ${
                    item.current
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:text-primary hover:bg-primary/10 active:bg-primary/20"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Dashboard Navigation (only on admin dashboard) */}
              {location.pathname.startsWith('/admin-dashboard') && (
                <>
                  <div className="border-t border-gray-200 my-2 sm:my-3"></div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 sm:px-4 py-1.5 sm:py-2">
                    Dashboard Menu
                  </div>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('toggleDashboardSidebar');
                      window.dispatchEvent(event);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-md transition touch-manipulation"
                  >
                    <PanelLeft size={18} className="mr-2 flex-shrink-0" />
                    Open Dashboard Sidebar
                  </button>
                </>
              )}
              
              {/* Dashboard Access (for authenticated users) */}
              {isAuthenticated && !location.pathname.includes('-dashboard') && (
                <button
                  onClick={() => {
                    handleDashboardClick();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-primary hover:bg-primary/10 active:bg-primary/20 rounded-md transition touch-manipulation"
                >
                  Go to Dashboard
                </button>
              )}
              
              {/* Mobile Auth Actions */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-2 sm:my-3"></div>
                  <div className="px-3 sm:px-4 py-2">
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={
                          user?.avatar?.url || 
                          user?.avatar || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=007bff&color=fff&size=32&bold=true`
                        }
                        alt={`${user?.name || 'User'} Avatar`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=007bff&color=fff&size=32&bold=true`;
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 active:bg-red-100 rounded-md transition touch-manipulation"
                    >
                      <LogOut size={18} className="mr-2 flex-shrink-0" />
                      {t('auth.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
