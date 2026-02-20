// layout/AdminLayout.jsx
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LogOut, Calendar, Users, Book, Megaphone, ClipboardList, LayoutDashboard, Menu, Clock } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/teachers", label: "Teachers", icon: Users },
  { to: "/admin/teacher-attendance", label: "Teacher Attendance", icon: Clock },
  { to: "/admin/lms", label: "LMS", icon: Book },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/admissions", label: "Admissions", icon: ClipboardList },
];

const AdminLayout = () => {
  const logout = useUserStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed md:relative z-40 md:z-auto w-64 bg-white shadow-lg md:translate-x-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b font-bold text-xl">Admin Panel</div>
        <nav className="flex flex-col gap-1 p-4">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 transition ${isActive ? "bg-blue-200 font-semibold" : "text-gray-700"}`
              }
            >
              <Icon className="w-5 h-5" /> {label}
            </NavLink>
          ))}

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 mt-4 rounded text-red-500 hover:bg-red-100"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Nav */}
        <header className="bg-white shadow px-4 py-3 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg">Admin Dashboard</h1>
          <div />
        </header>

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
