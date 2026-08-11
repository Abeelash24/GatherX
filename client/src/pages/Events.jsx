import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X, CalendarDays } from 'lucide-react';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { eventAPI } from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date_asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventAPI.getAll({
        search: searchQuery,
        category: selectedCategory,
        sort: sortBy
      });
      setEvents(response.data);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await eventAPI.getCategories();
      setCategories(['All', ...response.data]);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('date_asc');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || sortBy !== 'date_asc';

  return (
    <div className="min-h-screen bg-dark-950 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Discover <span className="gradient-text">Events</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto mb-2">
              Find the perfect event to attend, learn, and grow
            </p>
            <p className="text-dark-400 text-sm max-w-2xl mx-auto">
              Discover. Connect. Experience. — Your gateway to world-class events.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-dark-800/80 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-4 md:p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="input-field pl-11"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`md:hidden flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  showFilters ? 'bg-primary-600/10 border-primary-500/30 text-primary-400' : 'bg-dark-700/30 border-dark-600/30 text-dark-300'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field md:w-48"
              >
                <option value="date_asc">Date: Earliest</option>
                <option value="date_desc">Date: Latest</option>
              </select>
            </div>
          </div>

          <div className={`mt-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25 category-active'
                      : 'bg-dark-700/30 text-dark-300 hover:bg-dark-700/50 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">No events found</p>
            <p className="text-dark-500 text-sm mt-2">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary mt-6">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-dark-400 text-sm">
                Showing <span className="text-white font-medium">{events.length}</span> event{events.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
