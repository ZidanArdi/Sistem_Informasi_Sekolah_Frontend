import React from 'react';

function PengumumanTab() {
  const announcements = [
    { title: 'Math Olympiad Competition 2026', date: '24 Juni 2026', author: 'M.A Jackson (Math Teacher)', content: 'Pendaftaran Kompetisi Matematika Nasional tingkat sekolah akan dibuka mulai minggu depan. Semua siswa diharap mempersiapkan diri.', tag: 'Akademik', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { title: 'Science Fair Registration Open', date: '22 Juni 2026', author: 'Science Department', content: 'Silakan dadaftarkan tim dan topik proyek sains Anda melalui link pendaftaran di sekretariat TU sebelum tanggal 30 Juni.', tag: 'Kegiatan', color: 'bg-green-50 text-green-700 border-green-200' },
    { title: 'Pengambilan Kartu Hasil Belajar (KHB)', date: '18 Juni 2026', author: 'Admin Kurikulum', content: 'KHB Semester Ganjil dapat diambil di ruang TU mulai Senin depan dengan syarat telah menyelesaikan seluruh administrasi perpustakaan.', tag: 'Penting', color: 'bg-red-50 text-red-700 border-red-200' },
    { title: 'Jadwal Libur Akhir Semester Ganjil', date: '15 Juni 2026', author: 'Kepala Sekolah', content: 'Berdasarkan kalender akademik sekolah, libur akhir semester ganjil akan berlangsung mulai 1 Juli sampai dengan 15 Juli 2026.', tag: 'Penting', color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Pemberitahuan</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Pengumuman Sekolah</h2>
        </div>
        <div className="w-full sm:max-w-xs relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari pengumuman..."
            className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((a, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition text-left">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-green-600" />
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-150 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${a.color}`}>
                  {a.tag}
                </span>
                <h3 className="text-base font-extrabold text-gray-900">{a.title}</h3>
              </div>
              <span className="text-xs font-semibold text-gray-400">{a.date}</span>
            </div>
            <p className="text-sm text-gray-650 leading-relaxed font-medium mb-3">{a.content}</p>
            <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
              <span>Dibuat oleh: {a.author}</span>
              <button type="button" className="text-green-700 font-extrabold hover:underline cursor-pointer">Selengkapnya &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PengumumanTab;
