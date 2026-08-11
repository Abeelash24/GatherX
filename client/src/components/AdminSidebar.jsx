import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/registrations', icon: Users, label: 'Registrations' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <aside className={`admin-sidebar bg-dark-900 border-r border-dark-800/50 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800/50">
          {!collapsed && (
            <span className="text-lg font-bold text-white">
              Gather<span className="text-primary-400">X</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors ml-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-dark-800/50">
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm text-dark-400">Signed in as</p>
              <p className="text-white font-medium truncate">{admin?.username}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
