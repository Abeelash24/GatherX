export default function LoadingSkeleton({ type = 'card', count = 6 }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton h-48 md:h-56 w-full" />
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex gap-4">
                <div className="skeleton h-4 w-24 rounded-lg" />
                <div className="skeleton h-4 w-20 rounded-lg" />
              </div>
              <div className="skeleton h-6 w-3/4 rounded-lg" />
              <div className="skeleton h-4 w-full rounded-lg" />
              <div className="skeleton h-4 w-2/3 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="skeleton h-64 md:h-96 w-full rounded-2xl" />
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="skeleton h-10 w-3/4 rounded-lg" />
          <div className="skeleton h-6 w-1/2 rounded-lg" />
          <div className="skeleton h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6 space-y-4">
            <div className="skeleton h-4 w-24 rounded-lg" />
            <div className="skeleton h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return null;
}
