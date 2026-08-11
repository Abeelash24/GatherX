import { CalendarDays, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ 
  icon: Icon = CalendarDays, 
  title = 'No Items Found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionLabel = 'Explore',
  actionLink = '/events',
  secondaryActionLabel,
  secondaryActionLink,
  className = ''
}) {
  return (
    <div className={`text-center py-16 md:py-24 ${className}`}>
      <div className="w-20 h-20 mx-auto mb-6 bg-dark-800/50 rounded-full flex items-center justify-center">
        <Icon className="w-10 h-10 text-dark-600" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-dark-400 max-w-md mx-auto mb-8">{description}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to={actionLink} className="btn-primary">
          {actionLabel}
        </Link>
        {secondaryActionLabel && secondaryActionLink && (
          <Link to={secondaryActionLink} className="btn-secondary">
            {secondaryActionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
