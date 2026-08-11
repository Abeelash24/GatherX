import { useState, useEffect } from 'react';
import { CalendarDays, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { authAPI, eventAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        authAPI.getStats(),
        eventAPI.getAll({ sort: 'date_desc' }),
      ]);
      setStats(statsRes.data);
      setRecentEvents(eventsRes.data.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data');
      addToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Dashboard</h1>
          <LoadingSkeleton type="stat" />
        </div>
      </AdminSidebar>
    );
  }

  if (error) {
    return (
      <AdminSidebar>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Dashboard</h1>
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">{error}</p>
            <button onClick={fetchData} className="btn-primary mt-6">
              Retry
            </button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Welcome back! Here's what's happening.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            title="Total Events"
            value={stats?.totalEvents || 0}
            icon={CalendarDays}
            color="primary"
          />
          <StatCard
            title="Upcoming Events"
            value={stats?.upcomingEvents || 0}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Total Registrations"
            value={stats?.totalRegistrations || 0}
            icon={Users}
            color="accent"
          />
          <StatCard
            title="Pending Payments"
            value={stats?.pendingPayments || 0}
            icon={Clock}
            color="yellow"
          />
        </div>

        <div className="glass-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Recent Events</h2>
          {recentEvents.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No events created yet</p>
          ) : (
            <div className="space-y-4">
              {recentEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800/70 transition-colors"
                >
                  <div>
                    <h3 className="text-white font-medium">{event.title}</h3>
                    <p className="text-dark-400 text-sm">{event.category} • {event.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    new Date(event.date) >= new Date()
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-dark-700/50 text-dark-400'
                  }`}>
                    {new Date(event.date) >= new Date() ? 'Upcoming' : 'Past'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
