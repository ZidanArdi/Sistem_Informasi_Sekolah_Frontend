import swalAlert from '../../utils/swal';
import EmptyState from '../common/EmptyState';

function LaporanTab() {
  const reportTypes = [
    { title: 'Laporan Data Siswa Utama', desc: 'Mencakup NIS, Kelas, Status Administrasi, Kontak Orang Tua.', icon: '📊' },
    { title: 'Laporan Jadwal Pembelajaran & Mengajar', desc: 'Mencakup Jadwal Pelajaran 5 Hari, Beban Mengajar Guru.', icon: '📅' },
    { title: 'Laporan Rekapitulasi Nilai Rapor', desc: 'Mencakup Hasil Nilai Tugas, UTS, UAS per Kelas & Mapel.', icon: '🎓' },
    { title: 'Laporan Kehadiran & Presensi Bulanan', desc: 'Mencakup Persentase Kehadiran Siswa & Keaktifan Mengajar Guru.', icon: '📝' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Dokumentasi</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Pusat Laporan Akademik</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((r, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex gap-4 hover:-translate-y-0.5 hover:shadow-md transition text-left">
            <div className="h-14 w-14 rounded-2xl bg-green-50 border border-green-150 flex items-center justify-center text-2xl shrink-0">
              {r.icon}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-extrabold text-gray-950 text-base">{r.title}</h3>
              <p className="text-xs font-medium text-gray-500 leading-relaxed">{r.desc}</p>
              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => swalAlert.info('Dalam Pengembangan', 'Fitur cetak laporan PDF saat ini sedang dalam tahap pengembangan.')}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Download PDF
                </button>
                <button 
                  onClick={() => swalAlert.info('Dalam Pengembangan', 'Fitur ekspor laporan Excel saat ini sedang dalam tahap pengembangan.')}
                  className="bg-gray-150 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer border border-gray-250"
                >
                  Ekspor Excel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EmptyState
        title="Statistik Belum Tersedia"
        description="Statistik laporan akan tampil setelah data tersedia dari server."
      />
    </div>
  );
}

export default LaporanTab;
