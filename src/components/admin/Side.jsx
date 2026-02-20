// components/admin/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Calendar, Users, BookOpen, Megaphone, FileText, Menu, X } from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { label: "Dashboard", icon: Home, to: "/admin" },
    { label: "Events", icon: Calendar, to: "/admin/events" },
    { label: "Students", icon: Users, to: "/admin/students" },
    { label: "Teachers", icon: Users, to: "/admin/teachers" },
    { label: "LMS", icon: BookOpen, to: "/admin/lms" },
    { label: "Announcements", icon: Megaphone, to: "/admin/announcements" },
    { label: "Admissions", icon: FileText, to: "/admin/admissions" },
    { label: "Fee Management", icon: BookOpen, to: "/admin/fee-management" },
  ];

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-white shadow px-4 py-3">
        <button onClick={() => setOpen(true)} className="p-2 rounded hover:bg-gray-100">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-bold text-lg text-gray-800">Admin Panel</h1>
        <div className="w-6" />
      </div>

      {/* Sidebar drawer */}
      <div className={`fixed md:static left-0 top-0 z-40 h-full ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300`}>
        <aside className="bg-gray-800 text-white h-screen p-4 w-64">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}
    </>
  );
};

export default Sidebar;
