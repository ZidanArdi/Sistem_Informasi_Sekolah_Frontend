function StateBlock({ title, tone = 'default' }) {
  const toneClass = tone === 'danger'
    ? 'border-red-200 bg-red-50 text-red-755'
    : 'border-gray-200 bg-white text-gray-550';

  return (
    <div className={`rounded-2xl border px-4 py-8 text-center text-sm font-medium ${toneClass}`}>
      {title}
    </div>
  );
}

export default StateBlock;
