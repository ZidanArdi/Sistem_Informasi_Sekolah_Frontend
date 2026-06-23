function StateBlock({ title, tone = 'default' }) {
  const toneClass = tone === 'danger'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-slate-200 bg-white text-slate-500';

  return (
    <div className={`rounded-md border px-4 py-8 text-center text-sm font-medium ${toneClass}`}>
      {title}
    </div>
  );
}

export default StateBlock;
