import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useRef, useEffect } from 'react';

const ROUTES_WITH_FALLBACK = {
  '/register': '/events',
  '/events': '/',
};

function getFallbackPath(pathname) {
  for (const [prefix, fallback] of Object.entries(ROUTES_WITH_FALLBACK)) {
    if (pathname.startsWith(prefix)) return fallback;
  }
  return '/';
}

export default function BackButton({
  to,
  label = 'Back',
  fallback,
  className = '',
  ariaLabel,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);

  const handleClick = useCallback(() => {
    if (timeoutRef.current) return;

    if (to) {
      navigate(to);
      return;
    }

    const fallbackTarget = fallback || getFallbackPath(location.pathname);

    try {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate(fallbackTarget, { replace: true });
      }
    } catch {
      navigate(fallbackTarget, { replace: true });
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
    }, 1000);
  }, [navigate, to, fallback, location.pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel || `Go back${to ? ` to ${to}` : ''}`}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-colors relative z-10
        bg-dark-900/80 backdrop-blur-sm text-white
        hover:bg-dark-800/80
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-950
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <ArrowLeft className="w-4 h-4" />
      {label && <span>{label}</span>}
    </button>
  );
}
