import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Tag, Share2, ExternalLink, AlertCircle } from 'lucide-react';
import { eventAPI } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EventCard from '../components/EventCard';
import BackButton from '../components/BackButton';
import { useToast } from '../context/ToastContext';

function formatDate(dateStr) {
  if (!dateStr) return 'Date TBA';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(timeStr) {
  if (!timeStr) return 'Time TBA';
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);
    setImageError(false);
    try {
      const response = await eventAPI.getById(id);
      setEvent(response.data);
      if (response.data) {
        fetchRelatedEvents(response.data);
      }
    } catch (err) {
      setError(err.response?.status === 404 ? 'Event not found' : 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedEvents = async (currentEvent) => {
    try {
      const response = await eventAPI.getAll({ category: currentEvent.category });
      const related = response.data.filter(e => e.id !== currentEvent.id).slice(0, 3);
      setRelatedEvents(related);
    } catch {
      // silently fail for related events
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton type="detail" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
          <p className="text-dark-400 mb-6">{error || 'Event not found'}</p>
          <button onClick={() => navigate('/events')} className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 animate-fade-in">
      <div className="relative bg-dark-900 flex items-center justify-center" style={{ minHeight: '400px' }}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 skeleton" />
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-900/30 to-accent-900/30" style={{ minHeight: '400px' }}>
            <Calendar className="w-20 h-20 text-dark-600" />
          </div>
        ) : (
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1540575467068-1cf3b9e6273c?w=1600&h=600&fit=crop'}
            alt={event.title}
            className={`w-full max-h-[500px] object-contain transition-all duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-dark-950/30 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <BackButton />
          <button
            onClick={handleShare}
            className="p-2 bg-dark-900/80 backdrop-blur-sm text-white rounded-xl hover:bg-dark-800/80 transition-colors"
            aria-label="Share event"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-white border border-dark-200/80 rounded-2xl p-6 md:p-10 shadow-soft-lg">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/10 text-primary-600 text-sm font-medium rounded-full">
              <Tag className="w-3.5 h-3.5" />
              {event.category}
            </span>
            {event.capacity > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-dark-100/50 text-dark-600 text-sm font-medium rounded-full">
                <Users className="w-3.5 h-3.5" />
                {event.capacity} spots
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 mb-2 leading-tight">
            {event.title}
          </h1>
          <p className="text-dark-500 text-base md:text-lg mb-6">
            Discover. Connect. Experience. — Your gateway to world-class events.
          </p>

          <div className="flex flex-wrap gap-4 md:gap-6 mb-8">
            <div className="flex items-center gap-2 text-dark-600">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Calendar className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-dark-600">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Clock className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium">{formatTime(event.time)}</span>
            </div>
            <div className="flex items-center gap-2 text-dark-600">
              <div className="p-2 bg-primary-50 rounded-lg">
                <MapPin className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium">{event.location}</span>
            </div>
          </div>

          <div className="border-t border-dark-200/80 pt-8">
            <h2 className="text-xl font-bold text-dark-900 mb-4">About This Event</h2>
            <p className="text-dark-600 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-dark-200/80 flex flex-wrap gap-3">
            <Link to={`/register/${event.id}`} className="btn-primary inline-flex items-center gap-2">
              Register Now
            </Link>
            {event.registration_link && (
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                External Registration
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {relatedEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Related Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
