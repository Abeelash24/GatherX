import { useState, useEffect } from 'react';
import { Search, Filter, Eye, X, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import BackButton from '../components/BackButton';
import { registrationAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const ITEMS_PER_PAGE = 10;

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();

  useEffect(() => {
    fetchRegistrations();         
  }, [paymentFilter]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await registrationAPI.search({
        q: searchQuery,
        paymentStatus: paymentFilter
      });
      setRegistrations(response.data);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRegistrations();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const totalPages = Math.ceil(registrations.length / ITEMS_PER_PAGE);
  const paginatedRegistrations = registrations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-dark-700/50 text-dark-400 border-dark-600/30';
    }
  };

  const updatePaymentStatus = async (registration, paymentStatus) => {
    try {
      await registrationAPI.updatePaymentStatus(registration.id, paymentStatus);
      setSelectedRegistration(null);
      addToast(`Registration marked ${paymentStatus}`, 'success');
      fetchRegistrations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update registration', 'error');
    }
  };

  return (
    <AdminSidebar>
      <div className="p-6 md:p-8">
        <BackButton to="/admin/dashboard" label="Dashboard" className="mb-6" />
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Registrations</h1>
          <p className="text-dark-400 mt-1">Manage event registrations</p>
        </div>

        <div className="glass-card p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, college, event, or transaction ID..."
                className="input-field pl-11"
              />
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-dark-400 text-lg">No registrations found</p>
          </div>
        ) : (
          <>
            <div className="glass-card overflow-hidden mb-6 hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700/50">
                      <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Name</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-dark-400 hidden lg:table-cell">College</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-dark-400 hidden lg:table-cell">Event</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-dark-400 hidden sm:table-cell">Payment</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-dark-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/30">
                    {paginatedRegistrations.map(reg => (
                      <tr key={reg.id} className="hover:bg-dark-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{reg.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-dark-300 text-sm hidden lg:table-cell">{reg.college}</td>
                        <td className="px-6 py-4 text-dark-300 text-sm hidden lg:table-cell">{reg.event}</td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reg.paymentStatus)}`}>
                            {reg.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => setSelectedRegistration(reg)}
                              className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-4 mb-6">
              {paginatedRegistrations.map(reg => (
                <div key={reg.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{reg.name}</p>
                      <p className="text-dark-400 text-sm">{reg.college}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reg.paymentStatus)}`}>
                      {reg.paymentStatus}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <p className="text-dark-300"><span className="text-dark-400">Event:</span> {reg.event}</p>
                    <p className="text-dark-300"><span className="text-dark-400">Type:</span> {reg.participationType}</p>
                    <p className="text-dark-300"><span className="text-dark-400">Amount:</span> ₹{reg.paymentAmount || 0}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedRegistration(reg)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600/10 text-primary-400 rounded-lg hover:bg-primary-600/20 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-dark-400 text-sm">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <Modal
          isOpen={!!selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          title="Registration Details"
          size="lg"
        >
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Name', value: selectedRegistration.name },
                  { label: 'College', value: selectedRegistration.college },
                  { label: 'Event', value: selectedRegistration.event },
                  { label: 'Number of Events', value: selectedRegistration.noOfEvents },
                  { label: 'Participation Type', value: selectedRegistration.participationType },
                  { label: 'Department', value: selectedRegistration.departments },
                  { label: 'Date', value: selectedRegistration.date },
                  { label: 'Payment Amount', value: `₹${selectedRegistration.paymentAmount || 0}` },
                  { label: 'Payment Status', value: selectedRegistration.paymentStatus },
                  { label: 'Payment Method', value: selectedRegistration.paymentMethod || 'N/A' },
                  { label: 'Transaction ID', value: selectedRegistration.transactionId || 'N/A' },
                ].map(item => (
                  <div key={item.label} className="bg-dark-800/50 rounded-xl p-4">
                    <p className="text-dark-400 text-sm mb-1">{item.label}</p>
                    <p className="text-white font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedRegistration.teamMembers && (
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <p className="text-dark-400 text-sm mb-2">Team Members</p>
                  <p className="text-white whitespace-pre-wrap">{selectedRegistration.teamMembers}</p>
                </div>
              )}

              {selectedRegistration.paymentScreenshot && (
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <p className="text-dark-400 text-sm mb-2">Payment Screenshot</p>
                  <img
                    src={selectedRegistration.paymentScreenshot}
                    alt="Payment screenshot"
                    className="max-w-full max-h-64 rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => updatePaymentStatus(selectedRegistration, 'completed')}
                  className="btn-primary flex-1"
                >
                  Approve
                </button>
                <button
                  onClick={() => updatePaymentStatus(selectedRegistration, 'failed')}
                  className="btn-danger flex-1"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminSidebar>
  );
}
