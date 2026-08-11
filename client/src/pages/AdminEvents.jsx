import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import BackButton from '../components/BackButton';
import { eventAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const emptyEvent = {
  title: '',
  date: '',
  time: '',
  location: '',
  description: '',
  category: 'Technical',
  image_url: '',
  upi_qr_url: '',
  capacity: 0,
  registration_link: '',
};

const categories = ['Technical', 'Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Other'];

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(emptyEvent);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [upiQrFile, setUpiQrFile] = useState(null);
  const [upiQrPreviewUrl, setUpiQrPreviewUrl] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  useEffect(() => {
    if (!upiQrFile) {
      setUpiQrPreviewUrl('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(upiQrFile);
    setUpiQrPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [upiQrFile]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData(emptyEvent);
    setImageFile(null);
    setUpiQrFile(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      category: event.category,
      image_url: event.image_url || '',
      upi_qr_url: event.upi_qr_url || '',
      capacity: event.capacity || 0,
      registration_link: event.registration_link || '',
    });
    setImageFile(null);
    setUpiQrFile(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      let eventData = formData;
      if (imageFile) {
        const uploadResponse = await eventAPI.uploadImage(imageFile);
        eventData = { ...formData, image_url: uploadResponse.data.image_url };
      }
      if (upiQrFile) {
        const uploadResponse = await eventAPI.uploadImage(upiQrFile);
        eventData = { ...eventData, upi_qr_url: uploadResponse.data.image_url };
      }
      if (editingEvent) {
        await eventAPI.update(editingEvent.id, eventData);
        addToast('Event updated successfully', 'success');
      } else {
        await eventAPI.create(eventData);
        addToast('Event created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await eventAPI.delete(deleteConfirm.id);
      addToast('Event deleted successfully', 'success');
      setDeleteConfirm(null);
      fetchEvents();
    } catch (err) {
      addToast('Failed to delete event', 'error');
    }
  };

  return (
    <AdminSidebar>
      <div className="p-6 md:p-8">
        <BackButton to="/admin/dashboard" label="Dashboard" className="mb-6" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Events</h1>
            <p className="text-dark-400 mt-1">Manage your events</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </button>
        </div>

        <div className="glass-card p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search events..."
                className="input-field pl-11"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-dark-400 text-lg">No events found</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Event</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-400 hidden md:table-cell">Category</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-400 hidden lg:table-cell">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-400 hidden lg:table-cell">Location</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-dark-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/30">
                  {filteredEvents.map(event => (
                    <tr key={event.id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-dark-400 text-sm md:hidden">{event.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-medium rounded-full">
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-300 text-sm hidden lg:table-cell">{event.date}</td>
                      <td className="px-6 py-4 text-dark-300 text-sm hidden lg:table-cell">{event.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/events/${event.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="View Event"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => openEditModal(event)}
                            className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(event)}
                            className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingEvent ? 'Edit Event' : 'Create Event'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`input-field ${formErrors.title ? 'border-red-500/50' : ''}`}
              />
              {formErrors.title && <p className="mt-1.5 text-sm text-red-400">{formErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={`input-field ${formErrors.date ? 'border-red-500/50' : ''}`}
                />
                {formErrors.date && <p className="mt-1.5 text-sm text-red-400">{formErrors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Time *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className={`input-field ${formErrors.time ? 'border-red-500/50' : ''}`}
                />
                {formErrors.time && <p className="mt-1.5 text-sm text-red-400">{formErrors.time}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">UPI QR Code</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUpiQrFile(e.target.files?.[0] || null)}
                className="input-field"
              />
              <p className="mt-1.5 text-xs text-dark-500">Upload the QR code users should scan for this event's UPI payment.</p>
              {(upiQrPreviewUrl || formData.upi_qr_url) && (
                <img
                  src={upiQrPreviewUrl || formData.upi_qr_url}
                  alt="UPI QR preview"
                  className="mt-3 h-40 w-40 rounded-lg bg-white p-2 object-contain"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className={`input-field ${formErrors.location ? 'border-red-500/50' : ''}`}
              />
              {formErrors.location && <p className="mt-1.5 text-sm text-red-400">{formErrors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`input-field ${formErrors.category ? 'border-red-500/50' : ''}`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`input-field resize-none ${formErrors.description ? 'border-red-500/50' : ''}`}
              />
              {formErrors.description && <p className="mt-1.5 text-sm text-red-400">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Event Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="input-field"
                />
                <p className="mt-1.5 text-xs text-dark-500">PNG, JPG, WEBP, or GIF up to 5 MB.</p>
                {(imagePreviewUrl || formData.image_url) && (
                  <img
                    src={imagePreviewUrl || formData.image_url}
                    alt="Event preview"
                    className="mt-3 h-20 w-full rounded-lg object-cover"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Registration Link</label>
              <input
                type="text"
                name="registration_link"
                value={formData.registration_link}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_link: e.target.value }))}
                className="input-field"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  editingEvent ? 'Update Event' : 'Create Event'
                )}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Event"
          size="sm"
        >
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">Are you sure?</p>
            <p className="text-dark-400 mb-6">
              You're about to delete <span className="text-white font-medium">{deleteConfirm?.title}</span>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger flex-1">
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminSidebar>
  );
}
