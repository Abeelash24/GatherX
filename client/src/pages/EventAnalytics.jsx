import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, DollarSign, TrendingUp, TrendingDown, 
  Search, Filter, Download, BarChart2, PieChart, LineChart,
  ChevronDown, ChevronUp, AlertCircle, Loader2, CalendarDays,
  Users as TeamIcon, CreditCard, Clock, CheckCircle, XCircle,
  Info, Eye, FileText, Share2, ChevronRight
} from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import BackButton from '../components/BackButton';
import StatCard from '../components/StatCard';

export default function EventAnalytics() {
  const navigate = useNavigate();
  const { admin, hasPermission } = useAuth();
  const { addToast } = useToast();

  // State management
  const [accessibleEvents, setAccessibleEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loadingAccessibleEvents, setLoadingAccessibleEvents] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [errorAccessibleEvents, setErrorAccessibleEvents] = useState(null);
  const [errorAnalytics, setErrorAnalytics] = useState(null);
  const [errorRegistrations, setErrorRegistrations] = useState(null);

  // UI state
  const [showComparison, setShowComparison] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState('all');

  // Previous analytics for trends
  const [previousAnalytics, setPreviousAnalytics] = useState(null);
  const [todayRegistrations, setTodayRegistrations] = useState(0);

  // Fetch accessible events on component mount
  useEffect(() => {
    if (hasPermission) {
      fetchAccessibleEvents();
      fetchComparisonData();
    }
  }, [hasPermission]);

  // Fetch analytics data when selected event changes
  useEffect(() => {
    if (selectedEventId) {
      fetchAnalyticsData(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchAccessibleEvents = async () => {
    setLoadingAccessibleEvents(true);
    setErrorAccessibleEvents(null);
    try {
      const response = await analyticsAPI.getAccessibleEvents();
      setAccessibleEvents(response.data || []);
    } catch (err) {
      setErrorAccessibleEvents(err.response?.data?.message || 'Failed to load accessible events');
      addToast('Failed to load accessible events', 'error');
    } finally {
      setLoadingAccessibleEvents(false);
    }
  };

  const fetchAnalyticsData = async (eventId) => {
    setLoadingAnalytics(true);
    setErrorAnalytics(null);
    try {
      const response = await analyticsAPI.getEventAnalytics(eventId);
      const { event, analytics, registrations } = response.data;
      setSelectedEvent(event);
      setAnalyticsData(analytics);
      setRegistrations(registrations || []);

      // Store previous analytics for trend comparison (if available)
      if (previousAnalytics) {
        setPreviousAnalytics(previousAnalytics);
      }

      // Calculate today's registrations
      const today = new Date().toDateString();
      const todayCount = (registrations || []).filter(reg => 
        new Date(reg.created_at).toDateString() === today
      ).length;
      setTodayRegistrations(todayCount);

    } catch (err) {
      setErrorAnalytics(err.response?.data?.message || 'Failed to fetch analytics data');
      addToast('Failed to fetch analytics data', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchComparisonData = async () => {
    setLoadingComparison(true);
    try {
      const response = await analyticsAPI.getEventComparison();
      setComparisonData(response.data || []);
    } catch (err) {
      addToast('Failed to fetch comparison data', 'error');
    } finally {
      setLoadingComparison(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-dark-700/50 text-dark-400 border-dark-600/30';
    }
  };

  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, isPositive: true, label: 'N/A' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      label: change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
    };
  };

  const filteredRegistrations = (registrations || []).filter(reg => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(registrationSearch.toLowerCase()) ||
      reg.college.toLowerCase().includes(registrationSearch.toLowerCase()) ||
      reg.event.toLowerCase().includes(registrationSearch.toLowerCase());
    
    const matchesFilter = registrationFilter === 'all' || reg.paymentStatus === registrationFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleEventSelection = (eventId) => {
    setSelectedEventId(eventId);
    // Scroll to analytics section for better UX
    setTimeout(() => {
      const element = document.getElementById('analytics-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const exportData = () => {
    if (!analyticsData || !selectedEvent) return;
    
    const exportData = {
      event: selectedEvent,
      analytics: analyticsData,
      registrations: registrations,
      exportDate: new Date().toISOString(),
      exportedBy: admin?.username
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportName = `${selectedEvent.title}-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
    
    addToast('Analytics data exported successfully', 'success');
    setShowExport(false);
  };

  return (
    <div className="p-6 md:p-8">
      <BackButton to="/admin/events" label="Events" className="mb-6" />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Event Analytics Dashboard</h1>
          <p className="text-dark-400">Comprehensive analysis of event performance and registration data</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <button
            onClick={() => setShowComparison(!showComparison)}
            disabled={!hasPermission || loadingAccessibleEvents}
            className={`btn-secondary flex items-center gap-2 ${!hasPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <BarChart2 className="w-4 h-4" />
            {showComparison ? 'Hide' : 'Show'} Comparison
          </button>
          <button
            onClick={() => setShowExport(!showExport)}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Event Selector */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Event Selection</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Dropdown */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-dark-300 mb-2">Select Event</label>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => handleEventSelection(e.target.value)}
                disabled={!hasPermission || loadingAccessibleEvents}
                className="w-full appearance-none bg-dark-800 border border-dark-700 text-white px-4 py-3 pr-10 rounded-xl focus:outline-none focus:border-primary-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose an event...</option>
                {accessibleEvents.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
            </div>
            {loadingAccessibleEvents && (
              <div className="mt-2 flex items-center text-sm text-dark-400">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading accessible events...
              </div>
            )}
            {!hasPermission && (
              <div className="mt-2 flex items-center text-sm text-yellow-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                You need admin or event permissions to access analytics
              </div>
            )}
          </div>

          {/* Event Info Cards */}
          {selectedEvent && (
            <div className="space-y-3">
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-dark-400 mb-1">Event Details</h3>
                <p className="text-white font-medium truncate">{selectedEvent.title}</p>
                <p className="text-dark-400 text-sm mt-1">{selectedEvent.location}</p>
                <p className="text-dark-400 text-sm">{selectedEvent.date} at {selectedEvent.time}</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Category</h3>
                <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-medium rounded-full">
                  {selectedEvent.category}
                </span>
              </div>
              {selectedEvent.capacity > 0 && (
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Capacity</h3>
                  <p className="text-white font-medium">
                    {registrations.length || 0} / {selectedEvent.capacity}
                    <span className="text-dark-400 ml-1">
                      ({Math.round(((registrations.length || 0) / selectedEvent.capacity) * 100)}%)
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {selectedEventId && analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Teams"
            value={analyticsData.totalTeams}
            icon={TeamIcon}
            color="primary"
            trend={getTrend(analyticsData.totalTeams, previousAnalytics?.totalTeams)}
          />
          <StatCard
            title="Total Members"
            value={analyticsData.totalMembers}
            icon={Users}
            color="accent"
            trend={getTrend(analyticsData.totalMembers, previousAnalytics?.totalMembers)}
          />
          <StatCard
            title="Total Expected"
            value={`₹${analyticsData.totalExpectedAmount.toLocaleString()}`}
            icon={DollarSign}
            color="yellow"
            trend={getTrend(analyticsData.totalExpectedAmount, previousAnalytics?.totalExpectedAmount)}
          />
          <StatCard
            title="Total Collected"
            value={`₹${analyticsData.totalPaidAmount.toLocaleString()}`}
            icon={CreditCard}
            color="green"
            trend={getTrend(analyticsData.totalPaidAmount, previousAnalytics?.totalPaidAmount)}
          />
          <StatCard
            title="Total Pending"
            value={`₹${analyticsData.totalPendingAmount.toLocaleString()}`}
            icon={Clock}
            color="red"
            trend={getTrend(analyticsData.totalPendingAmount, previousAnalytics?.totalPendingAmount)}
          />
          <StatCard
            title="Payment Completed"
            value={`${analyticsData.paidPercentage.toFixed(1)}%`}
            icon={CheckCircle}
            color="emerald"
          />
          <StatCard
            title="Payment Pending"
            value={`${analyticsData.pendingPercentage.toFixed(1)}%`}
            icon={XCircle}
            color="orange"
          />
          <StatCard
            title="Registrations Today"
            value={todayRegistrations || 0}
            icon={CalendarDays}
            color="purple"
          />
        </div>
      )}

      {/* Cross-Event Comparison View */}
      {showComparison && hasPermission && accessibleEvents.length > 1 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Event Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Event</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Teams</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Members</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Collected</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Pending</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {accessibleEvents.map(event => {
                  const eventAnalytics = comparisonData.find(ed => ed.id === event.id)?.stats;
                  return (
                    <tr key={event.id} className="hover:bg-dark-800/30 transition-colors cursor-pointer" onClick={() => setSelectedEventId(event.id)}>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-dark-400 text-sm">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-dark-300">
                        {eventAnalytics?.totalRegistrations || 0}
                      </td>
                      <td className="px-4 py-4 text-dark-300">
                        {(eventAnalytics?.completedRegistrations || 0) + (eventAnalytics?.pendingRegistrations || 0)}
                      </td>
                      <td className="px-4 py-4 text-dark-300">
                        ₹{eventAnalytics?.totalPaid || 0}
                      </td>
                      <td className="px-4 py-4 text-dark-300">
                        ₹{eventAnalytics?.totalPending || 0}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-dark-800 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ 
                                width: `${((eventAnalytics?.totalPaid || 0) / Math.max((eventAnalytics?.totalPaid || 0) + (eventAnalytics?.totalPending || 0), 1)) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-dark-300">
                            {((eventAnalytics?.totalPaid || 0) / Math.max((eventAnalytics?.totalPaid || 0) + (eventAnalytics?.totalPending || 0), 1)) * 100 > 0 ?
                              `${Math.round(((eventAnalytics?.totalPaid || 0) / Math.max((eventAnalytics?.totalPaid || 0) + (eventAnalytics?.totalPending || 0), 1)) * 100)}%` :
                              '0%'
                            }
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {selectedEventId && analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Distribution Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#374151" strokeWidth="8" fill="none"/>
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${analyticsData.paidPercentage} ${100 - analyticsData.paidPercentage}`}
                    strokeLinecap="round"
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{analyticsData.paidPercentage.toFixed(1)}%</p>
                    <p className="text-sm text-dark-400">Paid</p>
                  </div>
                </div>
              </div>
              <div className="ml-6 space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-dark-300">Paid: ₹{analyticsData.totalPaidAmount}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-dark-300">Pending: ₹{analyticsData.totalPendingAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Status</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-dark-300">Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-dark-800 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(analyticsData.completedPayments / (analyticsData.completedPayments + analyticsData.pendingPayments + analyticsData.failedPayments || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium">
                      {analyticsData.completedPayments}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-yellow-400 mr-2" />
                    <span className="text-dark-300">Pending</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-dark-800 rounded-full h-2 mr-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(analyticsData.pendingPayments / (analyticsData.completedPayments + analyticsData.pendingPayments + analyticsData.failedPayments || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium">
                      {analyticsData.pendingPayments}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 text-red-400 mr-2" />
                    <span className="text-dark-300">Failed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-dark-800 rounded-full h-2 mr-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(analyticsData.failedPayments / (analyticsData.completedPayments + analyticsData.pendingPayments + analyticsData.failedPayments || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium">
                      {analyticsData.failedPayments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Trend (Placeholder for historical data) */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Registration Trend</h3>
            <div className="h-64 flex items-center justify-center text-dark-400">
              <div className="text-center">
                <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Historical registration data would appear here</p>
                <p className="text-sm mt-1">(Integrate with time-series chart library)</p>
              </div>
            </div>
          </div>

          {/* Event Performance Metrics */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Event Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-dark-300">Event Date</span>
                </div>
                <span className="text-white font-medium">
                  {new Date(selectedEvent?.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-purple-400 mr-2" />
                  <span className="text-dark-300">Average Members per Team</span>
                </div>
                <span className="text-white font-medium">
                  {(analyticsData.totalMembers / (analyticsData.totalTeams || 1)).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-emerald-400 mr-2" />
                  <span className="text-dark-300">Average Amount per Team</span>
                </div>
                <span className="text-white font-medium">
                  ₹{((analyticsData.totalExpectedAmount || 0) / (analyticsData.totalTeams || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-orange-400 mr-2" />
                  <span className="text-dark-300">Fill Rate</span>
                </div>
                <span className="text-white font-medium">
                  {selectedEvent?.capacity > 0 ? Math.round((analyticsData.totalTeams / selectedEvent.capacity) * 100) : 'N/A'}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Registrations Table */}
      {selectedEventId && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Detailed Registrations</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={registrationSearch}
                  onChange={(e) => setRegistrationSearch(e.target.value)}
                  placeholder="Search registrations..."
                  className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50"
                />
              </div>
              <select
                value={registrationFilter}
                onChange={(e) => setRegistrationFilter(e.target.value)}
                className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {loadingRegistrations ? (
            <LoadingSkeleton type="table" count={5} />
          ) : errorRegistrations ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">{errorRegistrations}</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-dark-400">No registrations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">College</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Team Members</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Contact</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Payment</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/30">
                  {filteredRegistrations.map((reg, index) => (
                    <tr key={reg.id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-white font-medium">{reg.name}</p>
                          <p className="text-dark-400 text-sm">ID: {reg.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-dark-300">{reg.college}</td>
                      <td className="px-4 py-4 text-dark-300">
                        {(() => {
                          try {
                            const members = JSON.parse(reg.teamMembers || '[]');
                            return members.length;
                          } catch {
                            return 1;
                          }
                        })()}
                      </td>
                      <td className="px-4 py-4 text-dark-300">
                        <div>
                          <p className="text-sm">{reg.college}</p>
                          {reg.email && <p className="text-xs text-dark-400">{reg.email}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reg.paymentStatus)}`}>
                          {reg.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-dark-300 text-sm">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}