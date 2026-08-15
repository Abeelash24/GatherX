import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, DollarSign, Calendar, MapPin, Download,
  TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import BackButton from '../components/BackButton';
import { dashboardAPI, registrationAPI, eventAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AdminEventDashboard() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const { addToast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchDashboard();
    }
  }, [eventId]);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data);
    } catch (err) {
      // silent
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardAPI.getEventDashboard(eventId);
      setData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Event not found');
      } else if (err.response?.status === 403) {
        setError('Access denied');
      } else {
        setError('Failed to load dashboard data');
      }
      addToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!data || data.registrations.length === 0) {
      addToast('No data to export', 'error');
      return;
    }
    setExporting(true);
    try {
      const response = await dashboardAPI.exportEventData(eventId, exportFormat);
      const blob = new Blob([response.data], {
        type: exportFormat === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = data.event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `event_${eventId}_${safeTitle}_${Date.now()}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast(`Export downloaded as ${exportFormat.toUpperCase()}`, 'success');
    } catch (err) {
      addToast('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  const updatePaymentStatus = async (registrationId, paymentStatus) => {
    try {
      await registrationAPI.updatePaymentStatus(registrationId, paymentStatus);
      addToast(`Registration marked ${paymentStatus}`, 'success');
      fetchDashboard();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update registration', 'error');
    }
  };

  const handleEventChange = (e) => {
    const newEventId = e.target.value;
    navigate(`/admin/events/${newEventId}/dashboard`);
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Event Dashboard</h1>
          <LoadingSkeleton type="stat" />
        </div>
      </AdminSidebar>
    );
  }

  if (error || !data) {
    return (
      <AdminSidebar>
        <div className="p-6 md:p-8">
          <BackButton to="/admin/events" label="Events" className="mb-6" />
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Event Dashboard</h1>
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">{error || 'Event not found'}</p>
            <button onClick={fetchDashboard} className="btn-primary mt-6">
              Retry
            </button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  const { event, summary } = data;

  return (
    <AdminSidebar>
      <div className="p-6 md:p-8">
        <BackButton to="/admin/events" label="Events" className="mb-6" />

        {/* Event Selector */}
        <div className="glass-card p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-dark-400 text-sm font-medium whitespace-nowrap">Select Event:</label>
            <select
              value={eventId}
              onChange={handleEventChange}
              className="input-field flex-1"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} — {ev.date}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Event Header */}
        <div className="glass-card p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full lg:w-48 h-32 lg:h-32 object-cover rounded-xl"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-medium rounded-full">
                  {event.category}
                </span>
                {summary.isFullyBooked && (
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full">
                    Fully Booked
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-dark-300 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> {event.date} at {event.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {event.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Capacity: {event.capacity}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={`/events/${event.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Event
              </a>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Users className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-dark-400 text-sm">Total Registrations</p>
            </div>
            <p className="text-3xl font-bold text-white">{summary.totalRegistrations}</p>
            <p className="text-dark-400 text-xs mt-1">{summary.capacityUtilization}% capacity utilized</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-dark-400 text-sm">Completed</p>
            </div>
            <p className="text-3xl font-bold text-white">{summary.completedCount}</p>
            <p className="text-dark-400 text-xs mt-1">{summary.completionRate}% completion rate</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-dark-400 text-sm">Pending</p>
            </div>
            <p className="text-3xl font-bold text-white">{summary.pendingCount}</p>
            <p className="text-dark-400 text-xs mt-1">Awaiting payment</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-accent-400" />
              </div>
              <p className="text-dark-400 text-sm">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold text-white">₹{summary.totalRevenue.toLocaleString()}</p>
            <p className="text-dark-400 text-xs mt-1">Avg: ₹{summary.averageRegistrationAmount} per reg</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="glass-card p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" /> Export Data
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="input-field sm:w-48"
            >
              <option value="csv">CSV Format</option>
              <option value="json">JSON Format</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exporting || data.registrations.length === 0}
              className="btn-primary flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Export
                </>
              )}
            </button>
          </div>
          {data.registrations.length === 0 && (
            <p className="text-dark-400 text-sm mt-2">No registrations to export</p>
          )}
        </div>

        {/* Registrations Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-dark-700/50">
            <h2 className="text-xl font-bold text-white">Registrations</h2>
            <p className="text-dark-400 text-sm mt-1">{data.registrations.length} total registrations</p>
          </div>

          {data.registrations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-dark-500 mx-auto mb-3" />
              <p className="text-dark-400">No registrations yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-400 hidden md:table-cell">College</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-400 hidden lg:table-cell">Type</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Payment</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-dark-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/30">
                  {data.registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="px-6 py-4 text-dark-300 text-sm">
                        GX-{String(reg.id).padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{reg.name}</p>
                          <p className="text-dark-400 text-sm md:hidden">{reg.college}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-300 text-sm hidden md:table-cell">{reg.college}</td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="px-2 py-1 bg-dark-700/50 text-dark-300 text-xs rounded-full">
                          {reg.participationType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          reg.paymentStatus === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          reg.paymentStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {reg.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {reg.paymentStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => updatePaymentStatus(reg.id, 'completed')}
                                className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Approve Payment"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(reg.id, 'failed')}
                                className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Reject Payment"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Additional Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Payment Methods */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Payment Methods
            </h3>
            <div className="space-y-3">
              {Object.keys(summary.paymentMethods || {}).length === 0 ? (
                <p className="text-dark-400 text-sm">No payment data available</p>
              ) : (
                Object.entries(summary.paymentMethods || {}).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-dark-300 capitalize">{method}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Colleges */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Top Colleges
            </h3>
            <div className="space-y-3">
              {Object.keys(summary.colleges || {}).length === 0 ? (
                <p className="text-dark-400 text-sm">No college data available</p>
              ) : (
                Object.entries(summary.colleges || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([college, count]) => (
                    <div key={college} className="flex items-center justify-between">
                      <span className="text-dark-300 truncate flex-1 mr-4">{college}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Departments */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Departments
            </h3>
            <div className="space-y-3">
              {Object.keys(summary.departments || {}).length === 0 ? (
                <p className="text-dark-400 text-sm">No department data available</p>
              ) : (
                Object.entries(summary.departments || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-dark-300 truncate flex-1 mr-4">{dept}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Participation Types */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Participation Types
            </h3>
            <div className="space-y-3">
              {Object.keys(summary.participationTypes || {}).length === 0 ? (
                <p className="text-dark-400 text-sm">No participation data available</p>
              ) : (
                Object.entries(summary.participationTypes || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-dark-300 capitalize">{type}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
