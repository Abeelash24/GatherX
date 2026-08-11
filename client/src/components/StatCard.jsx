import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/10 border-accent-500/20 text-accent-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20 text-yellow-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
  };

  const ChangeIcon = changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : Minus;

  return (
    <div className={`glass-card p-6 bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-dark-800/50 rounded-xl">
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            changeType === 'up' ? 'bg-green-500/10 text-green-400' :
            changeType === 'down' ? 'bg-red-500/10 text-red-400' :
            'bg-dark-700/50 text-dark-400'
          }`}>
            <ChangeIcon className="w-3 h-3" />
            {change}
          </div>
        )}
      </div>
      <p className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-dark-400">{title}</p>
    </div>
  );
}
