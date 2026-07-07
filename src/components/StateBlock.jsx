function StateBlock({ title, tone = 'default', onRetry }) {
  if (tone === 'loading') {
    return (
      <div className="space-y-6 w-full animate-pulse text-left py-4">
        {/* Pulse Skeleton Headers */}
        <div className="h-8 bg-gray-200 rounded-xl w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-1/4 mb-8"></div>
        
        {/* Pulse Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-3xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
              <div className="h-4 bg-gray-200 rounded-xl w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded-xl w-3/4"></div>
              <div className="h-10 bg-gray-150 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const toneClass = tone === 'danger'
    ? 'border-red-200 bg-red-50/50 text-red-700'
    : 'border-gray-200 bg-white text-gray-500';

  return (
    <div className={`rounded-3xl border px-6 py-12 text-center text-sm font-medium flex flex-col items-center justify-center space-y-4 ${toneClass} max-w-xl mx-auto my-8`}>
      <span className="text-2xl">{tone === 'danger' ? '⚠️' : 'info'}</span>
      <p className="font-extrabold text-base text-gray-900">{title || (tone === 'danger' ? 'Terjadi kesalahan sistem' : 'Informasi')}</p>
      {tone === 'danger' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-750 text-white font-bold transition text-xs shadow-sm shadow-red-500/10 cursor-pointer"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

export default StateBlock;
