import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Search, Filter, Sparkles, Users, Trophy, Mic2, Code } from 'lucide-react';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { eventAPI } from '../services/api';

const categories = [
  { name: 'Technical', icon: Code, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400' },
  { name: 'Workshop', icon: Sparkles, color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400' },
  { name: 'Seminar', icon: Mic2, color: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400' },
  { name: 'Competition', icon: Trophy, color: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400' },
  { name: 'Cultural', icon: Users, color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20 text-yellow-400' },
];

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAll({ sort: 'date_asc' });
      const events = response.data.filter(e => new Date(e.date) >= new Date()).slice(0, 6);
      setFeaturedEvents(events);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-dark-950 to-accent-900/20" />
        <div className="absolute inset-0 hero-radial-1" />
        <div className="absolute inset-0 hero-radial-2" />

        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-dark-300 mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span>Premium Event Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
            Discover Events
            <br />
            <span className="gradient-text">That Matter</span>
          </h1>

          <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
            Discover. Connect. Experience. — Your gateway to world-class events.
          </p>

          <p className="text-base text-dark-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            Join workshops, seminars, competitions, and cultural events. Connect with opportunities that shape your future and expand your horizons.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <Link to="/events" className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
              Explore Events
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/events" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
              View All Events
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 md:gap-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-dark-400">Events Hosted</p>
            </div>
            <div className="w-px h-12 bg-dark-700/50" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-dark-400">Participants</p>
            </div>
            <div className="w-px h-12 bg-dark-700/50 hidden sm:block" />
            <div className="text-center hidden sm:block">
              <p className="text-2xl md:text-3xl font-bold text-white">50+</p>
              <p className="text-sm text-dark-400">Institutions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="section-title">Featured Events</h2>
            <p className="section-subtitle">Handpicked events designed to inspire, educate, and connect</p>
          </div>

          {loading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDays className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400 text-lg">No upcoming events at the moment</p>
              <Link to="/events" className="btn-primary mt-6 inline-flex">
                Browse All Events
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {featuredEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/events" className="btn-secondary">
                  View All Events
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-20 md:py-28 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="section-title">Event Categories</h2>
            <p className="section-subtitle">Explore events across diverse domains and interests</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/events?category=${encodeURIComponent(category.name)}`}
                className={`glass-card p-6 text-center hover:scale-105 transition-all duration-300 group bg-gradient-to-br ${category.color}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-dark-800/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-sm md:text-base">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="section-title">Why Attend GatherX Events</h2>
            <p className="section-subtitle">Unlock opportunities and build connections that last a lifetime</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Users,
                title: 'Network with Peers',
                description: 'Connect with like-minded individuals, industry professionals, and potential collaborators from diverse backgrounds.'
              },
              {
                icon: Trophy,
                title: 'Learn from Experts',
                description: 'Gain insights from seasoned professionals through workshops, seminars, and hands-on sessions led by industry leaders.'
              },
              {
                icon: Sparkles,
                title: 'Grow Your Skills',
                description: 'Develop practical skills through competitions and interactive sessions designed to challenge and elevate your capabilities.'
              },
            ].map((benefit, index) => (
              <div
                key={benefit.title}
                className="glass-card p-8 text-center hover:border-primary-500/20 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-dark-400 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience Something <span className="gradient-text">Extraordinary</span>?
          </h2>
          <p className="text-lg text-dark-400 mb-10 max-w-2xl mx-auto">
            Don't miss out on events that could transform your perspective and career. Explore our curated collection today.
          </p>
          <Link to="/events" className="btn-primary text-base px-10 py-4">
            Explore Events Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
