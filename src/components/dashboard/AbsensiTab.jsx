function AbsensiTab() {
  return (
    <div className="space-y-6 animate-fade-in-up text-left">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Presensi Siswa</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Kehadiran & Absensi</h2>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5">
        <span className="text-xl shrink-0 mt-0.5">⚠️</span>
        <div>
          <h4 className="text-sm font-bold text-amber-800">Fitur dalam Tahap Pengembangan</h4>
          <p className="text-xs text-amber-750 mt-1 leading-relaxed">Fitur absensi sedang dalam tahap pengembangan.</p>
        </div>
      </div>

      {/* Central Placeholder Card */}
      <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-3xl bg-white border border-gray-200 shadow-sm relative overflow-hidden text-center max-w-2xl mx-auto my-8">
        {/* Glow Spheres */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-green-500/5 blur-3xl animate-pulse" />
        <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl animate-pulse" />

        {/* Calendar/Clock Icon */}
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-green-500/10 to-emerald-500/10 border border-green-200 flex items-center justify-center text-green-700 font-extrabold text-4xl shadow-sm mb-6 animate-bounce">
          📅
        </div>

        {/* Coming Soon Badge */}
        <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3.5 py-1 text-xs font-extrabold tracking-wide text-green-700 uppercase mb-4 shadow-sm">
          ⏳ Coming Soon
        </span>

        {/* Title */}
        <h3 className="text-2xl font-extrabold text-gray-950 tracking-tight mb-3">
          Feature Under Development
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium max-w-md">
          Absensi siswa, rekapitulasi kehadiran, dan monitoring presensi akan tersedia pada update berikutnya.
        </p>
      </div>
    </div>
  );
}

export default AbsensiTab;
