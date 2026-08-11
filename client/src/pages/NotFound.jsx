import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/10" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-md mx-auto px-4 text-center">
        <div className="w-24 h-24 mx-auto mb-8 bg-dark-800/50 rounded-full flex items-center justify-center">
          <CalendarDays className="w-12 h-12 text-dark-600" />
        </div>
        
        <h1 className="text-6xl md:text-7xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-dark-400 mb-8 max-w-md mx-auto">
          Looks like this page does not exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <BackButton to="/" label="Back Home" className="btn-primary justify-center" />
          <Link to="/events" className="btn-secondary">
            Explore Events
          </Link>
        </div>
      </div>
    </div>
  );
}
