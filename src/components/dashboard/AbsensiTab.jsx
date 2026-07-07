function AbsensiTab() {
  return (
    <div className="space-y-6 animate-fade-in-up text-left">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Presensi Kehadiran</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Absensi</h2>
        </div>
      </div>

      {/* Central Under Construction Card */}
      <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-3xl bg-white border border-gray-200 shadow-sm relative overflow-hidden text-center max-w-2xl mx-auto my-8">
        {/* Glow Spheres */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-green-500/5 blur-3xl animate-pulse" />
        <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl animate-pulse" />

        {/* Construction Icon */}
        <div className="text-5xl mb-4 animate-bounce">🚧</div>

        {/* Title & Subtitle */}
        <h3 className="text-2xl font-extrabold text-gray-950 tracking-tight">
          Absensi
        </h3>
        <p className="text-sm font-extrabold text-green-600 tracking-wide uppercase mt-1 mb-6">
          Sedang Dalam Tahap Pengembangan
        </p>

        {/* Supported bullet list */}
        <div className="text-left bg-gray-50 border border-gray-200/80 rounded-2xl p-6 w-full max-w-md mb-6">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Fitur ini akan mendukung:</p>
          <ul className="space-y-2 text-sm text-gray-600 font-semibold list-disc pl-5">
            <li>Absensi Harian</li>
            <li>Rekap Kehadiran</li>
            <li>Integrasi dengan Perizinan</li>
          </ul>
        </div>

        {/* Action / Warning Notice */}
        <p className="text-gray-450 text-xs font-bold">
          Silakan tunggu pengembangan berikutnya.
        </p>
      </div>
    </div>
  );
}

export default AbsensiTab;
