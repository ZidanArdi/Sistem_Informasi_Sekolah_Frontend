import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StateBlock from '../components/StateBlock';
import api, { entityService } from '../services/api';

// Import modular tab components
import DashboardTab from '../components/dashboard/DashboardTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import JadwalTab from '../components/dashboard/JadwalTab';
import NilaiTab from '../components/dashboard/NilaiTab';
import AbsensiTab from '../components/dashboard/AbsensiTab';
import PerizinanTab from '../components/dashboard/PerizinanTab';
import PengumumanTab from '../components/dashboard/PengumumanTab';
import DataSiswaTab from '../components/dashboard/DataSiswaTab';
import LaporanTab from '../components/dashboard/LaporanTab';
import UserManagementTab from '../components/dashboard/UserManagementTab';
import RolePermissionsTab from '../components/dashboard/RolePermissionsTab';
import SystemSettingsTab from '../components/dashboard/SystemSettingsTab';

const endpoints = {
  guru: '/guru',
  kelas: '/kelas',
  siswa: '/siswa',
  mapel: '/mapel',
  jadwal: '/jadwal',
  nilai: '/nilai',
};

const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getIndonesianDayName = () => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[new Date().getDay()];
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 19) return 'Selamat Sore';
  return 'Selamat Malam';
};

function DashboardPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';
  const roleNorm = (user.role || '').toLowerCase();

  const [dashboardStats, setDashboardStats] = useState({});

  useEffect(() => {
    const day = selectedDate.getDay();
    if (day === 0) { // Sunday
      const monday = new Date(selectedDate);
      monday.setDate(selectedDate.getDate() + 1);
      setSelectedDate(monday);
    } else if (day === 6) { // Saturday
      const monday = new Date(selectedDate);
      monday.setDate(selectedDate.getDate() + 2);
      setSelectedDate(monday);
    }
  }, [selectedDate]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');

      try {
        if (roleNorm === 'admin' || roleNorm === 'administrator') {
          // Admin: fetch all entities lists for charts/stats
          const entries = await Promise.all(
            Object.entries(endpoints).map(async ([key, endpoint]) => {
              const response = await entityService.list(endpoint);
              return [key, response.data.data || []];
            }),
          );
          setData(Object.fromEntries(entries));

          // Also fetch admin dashboard stats
          const dbResponse = await api.get('/admin/dashboard');
          setDashboardStats(dbResponse.data.data || {});
        } else {
          // Guru or Siswa: fetch their specific dashboard stats
          let url = '';
          if (roleNorm === 'guru') url = '/guru/dashboard';
          else if (roleNorm === 'siswa') url = '/siswa/dashboard';

          if (url) {
            const response = await api.get(url);
            setDashboardStats(response.data.data || {});
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [roleNorm]);

  const stats = useMemo(() => {
    const nilai = data.nilai || [];
    const totalNilai = nilai.reduce((sum, item) => sum + Number(item.nilai || 0), 0);
    const rataNilai = nilai.length ? (totalNilai / nilai.length).toFixed(1) : '0.0';

    return [
      { 
        label: 'Total Siswa', 
        value: data.siswa?.length || 0,
        desc: 'Siswa aktif terdaftar',
        color: 'from-green-500 to-emerald-600',
        shadow: 'shadow-green-500/10',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      },
      { 
        label: 'Total Guru', 
        value: data.guru?.length || 0,
        desc: 'Tenaga pengajar aktif',
        color: 'from-emerald-500 to-teal-500',
        shadow: 'shadow-emerald-500/10',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-emerald-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      },
      { 
        label: 'Total Kelas', 
        value: data.kelas?.length || 0,
        desc: 'Ruang kelas belajar',
        color: 'from-green-600 to-emerald-700',
        shadow: 'shadow-green-600/10',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-green-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      },
      { 
        label: 'Rata-rata Nilai', 
        value: rataNilai,
        desc: 'Rerata evaluasi siswa',
        color: 'from-emerald-600 to-green-600',
        shadow: 'shadow-emerald-550/10',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-emerald-700">
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

  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 5; i++) {
      const temp = new Date(monday);
      temp.setDate(monday.getDate() + i);
      days.push(temp);
    }
    return days;
  }, [selectedDate]);

  const formattedMonthYear = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  }, [selectedDate]);

  const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const selectedDaySchedules = useMemo(() => {
    const selectedDayIndo = dayNamesIndo[selectedDate.getDay()];
    const list = data.jadwal || [];
    const filtered = list.filter(item => 
      item.hari && item.hari.toLowerCase() === selectedDayIndo.toLowerCase()
    );

    if (filtered.length === 0) {
      if (selectedDayIndo === 'Senin') {
        return [
          { jam_mulai: '08:00', jam_selesai: '09:30', mapel: { nama_mapel: 'Matematika' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Dr. Albert' } },
          { jam_mulai: '09:45', jam_selesai: '11:15', mapel: { nama_mapel: 'Bahasa Indonesia' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Miss Clara' } },
          { jam_mulai: '11:30', jam_selesai: '13:00', mapel: { nama_mapel: 'PPKN' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'M.A Jackson' } }
        ];
      } else if (selectedDayIndo === 'Selasa') {
        return [
          { jam_mulai: '08:00', jam_selesai: '09:30', mapel: { nama_mapel: 'IPA' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Dr. Albert' } },
          { jam_mulai: '09:45', jam_selesai: '11:15', mapel: { nama_mapel: 'IPS' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Miss Clara' } },
          { jam_mulai: '11:30', jam_selesai: '13:00', mapel: { nama_mapel: 'Agama' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Ustadz Malik' } }
        ];
      } else if (selectedDayIndo === 'Rabu') {
        return [
          { jam_mulai: '08:00', jam_selesai: '09:30', mapel: { nama_mapel: 'Bahasa Inggris' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Miss Clara' } },
          { jam_mulai: '09:45', jam_selesai: '11:15', mapel: { nama_mapel: 'Penjasorkes' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Budi Santoso' } },
          { jam_mulai: '11:30', jam_selesai: '13:00', mapel: { nama_mapel: 'Seni Budaya' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'M.A Jackson' } }
        ];
      } else if (selectedDayIndo === 'Kamis') {
        return [
          { jam_mulai: '08:00', jam_selesai: '09:30', mapel: { nama_mapel: 'Informatika' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Dr. Albert' } },
          { jam_mulai: '09:45', jam_selesai: '11:15', mapel: { nama_mapel: 'Sejarah' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Miss Clara' } },
          { jam_mulai: '11:30', jam_selesai: '13:00', mapel: { nama_mapel: 'Prakarya' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'M.A Jackson' } }
        ];
      } else if (selectedDayIndo === 'Jumat') {
        return [
          { jam_mulai: '08:00', jam_selesai: '09:30', mapel: { nama_mapel: 'Matematika Peminatan' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Dr. Albert' } },
          { jam_mulai: '09:45', jam_selesai: '11:15', mapel: { nama_mapel: 'Fisika' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'Miss Clara' } },
          { jam_mulai: '11:30', jam_selesai: '13:00', mapel: { nama_mapel: 'Kimia' }, kelas: { nama_kelas: 'Kelas Siswa' }, guru: { nama: 'M.A Jackson' } }
        ];
      }
      return [];
    }

    return filtered.sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
  }, [data.jadwal, selectedDate]);

  const handlePrevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(selectedDate.getDate() - 7);
    setSelectedDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 7);
    setSelectedDate(next);
  };

  const isSelectedDay = (day) => {
    return day.getDate() === selectedDate.getDate() && 
           day.getMonth() === selectedDate.getMonth() &&
           day.getFullYear() === selectedDate.getFullYear();
  };

  if (loading) {
    return <StateBlock title="Memuat dashboard..." />;
  }

  if (error) {
    return <StateBlock title={error} tone="danger" />;
  }

  const renderTabContent = () => {
    switch (tab) {
      case 'profil-saya':
      case 'profil-guru':
        return <ProfileTab user={user} roleNorm={roleNorm} />;
      case 'jadwal-pelajaran':
      case 'jadwal-mengajar':
        return <JadwalTab />;
      case 'nilai-akademik':
        return <NilaiTab />;
      case 'absensi':
      case 'absensi-siswa':
        return <AbsensiTab />;
      case 'perizinan':
        return <PerizinanTab roleNorm={roleNorm} user={user} />;
      case 'pengumuman':
        return <PengumumanTab />;
      case 'data-siswa':
        return <DataSiswaTab user={user} data={data} />;
      case 'laporan':
        return <LaporanTab />;
      case 'user-management':
        return <UserManagementTab />;
      case 'role-permissions':
        return <RolePermissionsTab />;
      case 'system-settings':
        return <SystemSettingsTab />;
      case 'dashboard':
      default:
        return (
          <DashboardTab
            roleNorm={roleNorm}
            user={user}
            dashboardStats={dashboardStats}
            siswaPerKelas={siswaPerKelas}
            rataNilaiMapel={rataNilaiMapel}
            getGreeting={getGreeting}
            getInitials={getInitials}
            getIndonesianDayName={getIndonesianDayName}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            weekDays={weekDays}
            isSelectedDay={isSelectedDay}
            handlePrevWeek={handlePrevWeek}
            handleNextWeek={handleNextWeek}
            formattedMonthYear={formattedMonthYear}
            selectedDaySchedules={selectedDaySchedules}
            stats={stats}
          />
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {renderTabContent()}
    </div>
  );
}

export default DashboardPage;
