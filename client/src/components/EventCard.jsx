import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Tag } from 'lucide-react';
import { useState } from 'react';

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

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function EventCard({ event, index = 0 }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      to={`/events/${event.id}`}
      className="card card-hover group flex flex-col h-full animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-48 md:h-56 overflow-hidden bg-dark-800">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 skeleton" />
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-900/30 to-accent-900/30">
            <Calendar className="w-12 h-12 text-dark-600" />
          </div>
        ) : (
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1540575467068-1cf3b9e6273c?w=800&h=500&fit=crop'}
            alt={event.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-4 left-4">
          <span className="category-active inline-flex items-center gap-1 px-3 py-1 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            <Tag className="w-3 h-3" />
            {event.category}
          </span>
        </div>

        {event.capacity > 0 && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-dark-900/80 backdrop-blur-sm text-dark-200 text-xs font-medium rounded-full">
              <Users className="w-3 h-3" />
              {event.capacity}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 md:p-6">
        <div className="flex items-center gap-4 text-dark-400 text-sm mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary-400" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary-400" />
            {formatTime(event.time)}
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {event.title}
        </h3>

        <p className="flex items-start gap-1.5 text-dark-400 text-sm mb-4">
          <MapPin className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </p>

        <p className="text-dark-400 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {event.description}
        </p>

        <div className="mt-auto pt-4 border-t border-dark-700/50">
          <span className="inline-flex items-center gap-1 text-primary-400 text-sm font-medium group-hover:gap-2 transition-all">
            View Details
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
