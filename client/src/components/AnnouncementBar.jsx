import { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { announcementAPI } from '../services/api';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const response = await announcementAPI.getActive();
      setAnnouncement(response.data);
      setError(false);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!announcement) return;
    const dismissed = sessionStorage.getItem('announcement_dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, [announcement]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement_dismissed', 'true');
  };

  if (!isVisible || loading) return null;

  if (error || !announcement) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-accent-600 text-white animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 py-3 md:py-4">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <p className="text-sm md:text-base font-medium text-center">
            {announcement.text}
          </p>
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
