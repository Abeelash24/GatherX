import { Link, useLocation } from 'react-router-dom';
import { Menu, X, CalendarDays, LayoutDashboard, Users, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, admin, logoutUser, logoutAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? theme === 'light'
          ? 'bg-white/90 backdrop-blur-xl border-b border-dark-200/80 shadow-md'
          : 'bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50 shadow-lg'
        : theme === 'light'
          ? 'bg-white/70 backdrop-blur-md border-b border-transparent'
          : 'bg-dark-950/60 backdrop-blur-md border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold ${theme === 'light' ? 'text-dark-900' : 'text-white'}`}>
              Gather<span className="text-primary-400">X</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`nav-link ${theme === 'light' ? 'text-dark-600 hover:text-dark-900' : ''}`}>Home</Link>
            <Link to="/events" className={`nav-link ${theme === 'light' ? 'text-dark-600 hover:text-dark-900' : ''}`}>Events</Link>
            <Link to="/about" className={`nav-link ${theme === 'light' ? 'text-dark-600 hover:text-dark-900' : ''}`}>About</Link>
            <Link to="/contact" className={`nav-link ${theme === 'light' ? 'text-dark-600 hover:text-dark-900' : ''}`}>Contact</Link>
            {admin && (
              <Link to="/admin/dashboard" className={`nav-link ${theme === 'light' ? 'text-dark-600 hover:text-dark-900' : ''}`}>Dashboard</Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'text-dark-500 hover:text-dark-900 hover:bg-dark-100'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {admin ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-colors"
                >
                  Dashboard
                </Link>
                <span className={`text-sm ${theme === 'light' ? 'text-dark-600' : 'text-dark-300'}`}>
                  {admin.username}
                </span>
                <button
                  onClick={logoutAdmin}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                    theme === 'light'
                      ? 'bg-dark-100 hover:bg-dark-200 text-dark-900'
                      : 'bg-dark-800 hover:bg-dark-700 text-white'
                  }`}
                  title="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-dark-700' : 'text-dark-200'}`}>
                  {user.name || user.email}
                </span>
                <button
                  onClick={logoutUser}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                    theme === 'light'
                      ? 'bg-dark-100 hover:bg-dark-200 text-dark-900'
                      : 'bg-dark-800 hover:bg-dark-700 text-white'
                  }`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/admin/login"
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                    theme === 'light'
                      ? 'border-dark-300 text-dark-600 hover:bg-dark-100'
                      : 'border-dark-700 text-dark-400 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  Admin
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              theme === 'light'
                ? 'text-dark-900 hover:bg-dark-100'
                : 'text-white hover:bg-dark-800/50'
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={`md:hidden backdrop-blur-xl border-t animate-slide-down ${
          theme === 'light'
            ? 'bg-white/95 border-dark-200/80'
            : 'bg-dark-900/95 border-dark-800/50'
        }`}>
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full ${
                theme === 'light'
                  ? 'text-dark-900 hover:bg-dark-100'
                  : 'text-white hover:bg-dark-800/50'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link to="/" className={`block px-4 py-3 rounded-xl transition-colors ${theme === 'light' ? 'text-dark-900 hover:bg-dark-100' : 'text-white hover:bg-dark-800/50'}`}>
              Home
            </Link>
            <Link to="/events" className={`block px-4 py-3 rounded-xl transition-colors ${theme === 'light' ? 'text-dark-900 hover:bg-dark-100' : 'text-white hover:bg-dark-800/50'}`}>
              Events
            </Link>
            <Link to="/about" className={`block px-4 py-3 rounded-xl transition-colors ${theme === 'light' ? 'text-dark-900 hover:bg-dark-100' : 'text-white hover:bg-dark-800/50'}`}>
              About
            </Link>
            <Link to="/contact" className={`block px-4 py-3 rounded-xl transition-colors ${theme === 'light' ? 'text-dark-900 hover:bg-dark-100' : 'text-white hover:bg-dark-800/50'}`}>
              Contact
            </Link>
            {admin ? (
              <>
                <Link to="/admin/dashboard" className={`block px-4 py-3 rounded-xl transition-colors ${theme === 'light' ? 'text-dark-900 hover:bg-dark-100' : 'text-white hover:bg-dark-800/50'}`}>
                  Admin Dashboard
                </Link>
                <button
                  onClick={logoutAdmin}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    theme === 'light'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  Logout ({admin.username})
                </button>
              </>
            ) : user ? (
              <div className="pt-2 border-t border-dark-800">
                <div className="px-4 py-2 text-sm text-dark-400">
                  Signed in as <span className="text-white font-medium">{user.name || user.email}</span>
                </div>
                <button
                  onClick={logoutUser}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    theme === 'light'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-dark-800 space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-colors font-medium btn-primary"
                >
                  Login / Register
                </Link>
                <Link
                  to="/admin/login"
                  className="block w-full text-center px-4 py-2 text-dark-400 hover:text-white text-sm"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
