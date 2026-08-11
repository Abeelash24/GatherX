import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ 
  title = 'Something went wrong',
  description = 'We could not load the requested content. Please try again later.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`text-center py-16 md:py-24 ${className}`}>
      <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-dark-400 max-w-md mx-auto mb-8">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
