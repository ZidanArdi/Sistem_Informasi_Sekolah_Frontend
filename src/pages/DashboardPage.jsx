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
      { label: 'Siswa', value: data.siswa?.length || 0 },
      { label: 'Guru', value: data.guru?.length || 0 },
      { label: 'Kelas', value: data.kelas?.length || 0 },
      { label: 'Rata-rata Nilai', value: rataNilai },
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

  if (loading) {
    return <StateBlock title="Memuat dashboard..." />;
  }

  if (error) {
    return <StateBlock title={error} tone="danger" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Ringkasan</p>
        <h2 className="text-2xl font-bold text-slate-950">Dashboard</h2>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Siswa per Kelas</h3>
          <div className="mt-4 space-y-3">
            {siswaPerKelas.length === 0 && <p className="text-sm text-slate-500">Belum ada data.</p>}
            {siswaPerKelas.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Rata-rata Nilai per Mapel</h3>
          <div className="mt-4 space-y-3">
            {rataNilaiMapel.length === 0 && <p className="text-sm text-slate-500">Belum ada data.</p>}
            {rataNilaiMapel.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-cyan-500" style={{ width: item.width }} />
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
