import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Calendar, MapPin, Loader2 } from 'lucide-react';
import { eventAPI, registrationAPI } from '../services/api';
import BackButton from '../components/BackButton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr) {
  if (!dateStr) return 'Date TBA';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function Register() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: '',
    event: '',
    noOfEvents: '',
    participationType: 'individual',
    teamMembers: '',
    departments: '',
    date: '',
    paymentAmount: '0',
    paymentStatus: 'pending',
    paymentMethod: '',
    transactionId: '',
    paymentScreenshot: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getById(eventId);
      setEvent(response.data);
      setFormData(prev => ({ ...prev, event: response.data.title, date: formatDate(response.data.date) }));
    } catch (err) {
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.college.trim()) newErrors.college = 'College is required';
    if (!formData.noOfEvents.trim()) newErrors.noOfEvents = 'Number of events is required';
    if (!formData.departments.trim()) newErrors.departments = 'Department is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    if (formData.paymentMethod === 'upi' && !event.upi_qr_url) {
      newErrors.paymentMethod = 'UPI is not available for this event';
    }
    if (formData.paymentMethod === 'upi' && !formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required for UPI payments';
    }
    if (formData.participationType === 'team' && !formData.teamMembers.trim()) {
      newErrors.teamMembers = 'Team members info is required for team participation';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await registrationAPI.create({ ...formData, eventId });
      setSubmitted(true);
      setRegistrationId(response.data.registrationId || `GX-${String(response.data.registration?.id || Date.now()).padStart(6, '0')}`);
      addToast('Registration submitted successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      addToast('Registration failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
          <p className="text-dark-400 mb-6">The event you're trying to register for doesn't exist.</p>
          <button onClick={() => navigate('/events')} className="btn-primary">
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 animate-scale-in">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Registration Successful!</h1>
          <p className="text-dark-400 mb-2">You are officially registered.</p>
          <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-4 mb-8">
            <p className="text-sm text-dark-400 mb-1">Registration ID</p>
            <p className="text-xl font-bold text-primary-400 font-mono">{registrationId}</p>
          </div>
          <p className="text-dark-400 mb-8">
            Thank you for registering for <span className="text-white font-medium">{event.title}</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/events')} className="btn-primary">
              Browse More Events
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton label="Back to Event" className="mb-8 bg-transparent hover:bg-dark-800/30 text-dark-400 hover:text-white backdrop-blur-none" />

        <div className="glass-card p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600/20 text-primary-400 text-sm font-medium rounded-full mb-4">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(event.date)}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Register for Event</h1>
            <p className="text-dark-400">{event.title}</p>
            <div className="flex items-center justify-center gap-1.5 text-dark-400 text-sm mt-2">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
            <p className="text-dark-400 text-sm mt-3 italic">
              Discover. Connect. Experience. — Your gateway to world-class events.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">College/Institution *</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className={`input-field ${errors.college ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                  placeholder="Enter your college name"
                />
                {errors.college && <p className="mt-1.5 text-sm text-red-400">{errors.college}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Number of Events</label>
                <input
                  type="text"
                  name="noOfEvents"
                  value={formData.noOfEvents}
                  onChange={handleChange}
                  className={`input-field ${errors.noOfEvents ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                  placeholder="e.g., 1, 2, 3..."
                />
                {errors.noOfEvents && <p className="mt-1.5 text-sm text-red-400">{errors.noOfEvents}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Participation Type</label>
                <select
                  name="participationType"
                  value={formData.participationType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </div>
            </div>

            {formData.participationType === 'team' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Team Members *</label>
                <textarea
                  name="teamMembers"
                  value={formData.teamMembers}
                  onChange={handleChange}
                  rows={3}
                  className={`input-field resize-none ${errors.teamMembers ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                  placeholder="List team member names..."
                />
                {errors.teamMembers && <p className="mt-1.5 text-sm text-red-400">{errors.teamMembers}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Department *</label>
              <input
                type="text"
                name="departments"
                value={formData.departments}
                onChange={handleChange}
                className={`input-field ${errors.departments ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                placeholder="Enter your department"
              />
              {errors.departments && <p className="mt-1.5 text-sm text-red-400">{errors.departments}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Payment Amount (₹)</label>
                <input
                  type="number"
                  name="paymentAmount"
                  value={formData.paymentAmount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className={`input-field ${errors.paymentMethod ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                >
                  <option value="">Select payment method</option>
                  <option value="upi" disabled={!event.upi_qr_url}>UPI</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
                {errors.paymentMethod && <p className="mt-1.5 text-sm text-red-400">{errors.paymentMethod}</p>}
              </div>
            </div>

            {formData.paymentMethod === 'upi' && (
              <div className="rounded-xl border border-primary-500/30 bg-primary-500/10 p-5 text-center">
                <p className="font-medium text-primary-400">Scan to pay with UPI</p>
                <p className="mt-1 text-sm text-dark-400">Use your UPI app, then enter the transaction ID below.</p>
                {event.upi_qr_url ? (
                  <img
                    src={event.upi_qr_url}
                    alt={`UPI QR code for ${event.title}`}
                    className="mx-auto mt-4 h-56 w-56 rounded-xl bg-white p-3 object-contain"
                  />
                ) : (
                  <p className="mt-3 text-sm text-red-400">UPI is not configured for this event. Choose another payment method.</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Transaction ID {formData.paymentMethod === 'upi' ? '*' : ''}</label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className={`input-field ${errors.transactionId ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                placeholder="Enter transaction ID if applicable"
              />
              {errors.transactionId && <p className="mt-1.5 text-sm text-red-400">{errors.transactionId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Payment Screenshot URL</label>
              <input
                type="text"
                name="paymentScreenshot"
                value={formData.paymentScreenshot}
                onChange={handleChange}
                className="input-field"
                placeholder="Paste image URL if applicable"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-4 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
