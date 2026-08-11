import { Link } from 'react-router-dom';
import { CalendarDays, Mail, MapPin, Github, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 border-t border-dark-800/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Gather<span className="text-primary-400">X</span>
              </span>
            </Link>
            <p className="text-dark-400 max-w-md leading-relaxed">
              The premium event management platform for discovering, organizing, and experiencing events that matter.
              {' '}
              <span className="text-dark-300">Discover. Connect. Experience.</span>
              {' '}
              Connect with opportunities that shape your future.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/events" className="text-dark-400 hover:text-primary-400 transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-dark-400 hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-dark-400 hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <span className="text-dark-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-dark-400">Terms of Service</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-dark-400">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>contact@gatherx.io</span>
              </li>
              <li className="flex items-center gap-2 text-dark-400">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>Global Platform</span>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-dark-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-dark-400 hover:text-white transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-800/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-500 text-sm">
              © {currentYear} GatherX. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-dark-400 hover:text-primary-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-dark-400 hover:text-primary-400 transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="text-dark-400 hover:text-primary-400 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
