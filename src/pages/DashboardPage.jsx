import { useEffect, useMemo, useState } from 'react';
import StateBlock from '../components/StateBlock';
import { entityService } from '../services/api';

const endpoints = {
  guru: '/guru',
  kelas: '/kelas',
  siswa: '/siswa',
  mapel: '/mapel',
  jadwal: '/jadwal',
  nilai: '/nilai',
};

function DashboardPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');

      try {
        const entries = await Promise.all(
          Object.entries(endpoints).map(async ([key, endpoint]) => {
            const response = await entityService.list(endpoint);
            return [key, response.data.data || []];
          }),
        );

        setData(Object.fromEntries(entries));
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = useMemo(() => {
    const nilai = data.nilai || [];
    const totalNilai = nilai.reduce((sum, item) => sum + Number(item.nilai || 0), 0);
    const rataNilai = nilai.length ? (totalNilai / nilai.length).toFixed(1) : '0.0';

    return [
      { 
        label: 'Total Siswa', 
        value: data.siswa?.length || 0,
        desc: 'Siswa aktif terdaftar',
        color: 'from-blue-500 to-indigo-500',
        shadow: 'shadow-blue-500/10',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      },
      { 
        label: 'Total Guru', 
        value: data.guru?.length || 0,
        desc: 'Tenaga pengajar aktif',
        color: 'from-purple-500 to-pink-500',
        shadow: 'shadow-purple-500/10',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-purple-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      },
      { 
        label: 'Total Kelas', 
        value: data.kelas?.length || 0,
        desc: 'Ruang kelas belajar',
        color: 'from-amber-500 to-orange-500',
        shadow: 'shadow-amber-500/10',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-amber-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      },
      { 
        label: 'Rata-rata Nilai', 
        value: rataNilai,
        desc: 'Rerata evaluasi siswa',
        color: 'from-emerald-500 to-teal-500',
        shadow: 'shadow-emerald-500/10',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-emerald-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
    ];
  }, [data]);

  const siswaPerKelas = useMemo(() => {
    const kelas = data.kelas || [];
    const siswa = data.siswa || [];
    const max = Math.max(1, ...kelas.map((item) => siswa.filter((student) => student.kelas_id === item.id).length));

    return kelas.map((item) => {
      const count = siswa.filter((student) => student.kelas_id === item.id).length;
      return {
        label: item.nama_kelas,
        count,
        width: `${(count / max) * 100}%`,
      };
    });
  }, [data]);

  const rataNilaiMapel = useMemo(() => {
    const mapel = data.mapel || [];
    const nilai = data.nilai || [];

    return mapel.map((item) => {
      const rows = nilai.filter((score) => score.mapel_id === item.id);
      const avg = rows.length
        ? rows.reduce((sum, score) => sum + Number(score.nilai || 0), 0) / rows.length
        : 0;

      return {
        label: item.nama_mapel,
        value: avg.toFixed(1),
        width: `${avg}%`,
      };
    });
  }, [data]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  if (loading) {
    return <StateBlock title="Memuat dashboard..." />;
  }

  if (error) {
    return <StateBlock title={error} tone="danger" />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 shadow-xl shadow-slate-950/15 border border-slate-800">
        {/* Glow effect */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">Ringkasan Sistem</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()}, {user.nama || 'Pengguna'}!
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Selamat datang di portal informasi sekolah. Berikut adalah rangkuman data akademik terupdate hari ini.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 text-sm font-semibold text-indigo-300">
              Role: <strong className="ml-1 capitalize">{user.role || 'staff'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div 
            key={item.label} 
            className="group relative overflow-hidden rounded-2xl glass-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Hover card border highlight */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{item.value}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-400">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Charts / Data Analytics Visuals */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Siswa per Kelas */}
        <div className="rounded-2xl glass-card p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Sebaran Siswa per Kelas</h3>
              <p className="text-xs text-slate-400 font-medium">Perbandingan jumlah siswa aktif di setiap ruangan</p>
            </div>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg">Kelas aktif</span>
          </div>

          <div className="space-y-4">
            {siswaPerKelas.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center font-medium">Belum ada data kelas atau siswa.</p>
            )}
            {siswaPerKelas.map((item) => (
              <div key={item.label} className="group">
                <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-700">
                  <span>{item.label}</span>
                  <span className="text-slate-900 group-hover:text-indigo-600 transition">{item.count} Siswa</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 shadow-inner" 
                    style={{ width: item.width }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rata-rata Nilai per Mapel */}
        <div className="rounded-2xl glass-card p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Rata-rata Nilai per Mapel</h3>
              <p className="text-xs text-slate-400 font-medium">Evaluasi hasil prestasi belajar per mata pelajaran</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Evaluasi</span>
          </div>

          <div className="space-y-4">
            {rataNilaiMapel.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center font-medium">Belum ada data mata pelajaran atau nilai.</p>
            )}
            {rataNilaiMapel.map((item) => (
              <div key={item.label} className="group">
                <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-700">
                  <span>{item.label}</span>
                  <span className="text-slate-900 group-hover:text-emerald-600 transition">{item.value} / 100</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 shadow-inner" 
                    style={{ width: item.width }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
