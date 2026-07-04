import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StateBlock from '../components/StateBlock';
import api, { entityService } from '../services/api';

import DashboardTab from '../components/dashboard/DashboardTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import ChangePasswordTab from '../components/dashboard/ChangePasswordTab';
import JadwalTab from '../components/dashboard/JadwalTab';
import NilaiTab from '../components/dashboard/NilaiTab';
import AbsensiTab from '../components/dashboard/AbsensiTab';
import PerizinanTab from '../components/dashboard/PerizinanTab';
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  const userNip = user.nip;
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';
  const roleNorm = (user.role || '').toLowerCase();

  const [dashboardStats, setDashboardStats] = useState({});

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
            const dashboardData = response.data.data || {};
            setDashboardStats(dashboardData);

            if (roleNorm === 'siswa') {
              const profile = dashboardData.profil_siswa;
              if (!profile?.id || !profile?.kelas_id) {
                setData({ jadwal: [], nilai: [] });
              } else {
                const [scheduleResponse, gradeResponse] = await Promise.all([
                  entityService.list('/jadwal', { kelas_id: profile.kelas_id }),
                  entityService.list('/nilai', { siswa_id: profile.id }),
                ]);
                setData({
                  jadwal: scheduleResponse.data.data || [],
                  nilai: gradeResponse.data.data || [],
                });
              }
            } else if (roleNorm === 'guru') {
              const [teachersResponse, classesResponse] = await Promise.all([
                entityService.list('/guru'),
                entityService.list('/kelas')
              ]);
              const teachers = teachersResponse.data.data || [];
              const teacher = teachers.find((item) =>
                Number(item.user_id) === Number(userId) || item.nip === userNip
              );
              
              let schedules = [];
              let students = [];
              let waliKelasOf = null;
              
              if (teacher?.id) {
                const scheduleResponse = await entityService.list('/jadwal', { guru_id: teacher.id });
                schedules = scheduleResponse.data.data || [];
                
                const classes = classesResponse.data.data || [];
                waliKelasOf = classes.find((c) => c.wali_kelas_id === teacher.id);
                
                if (waliKelasOf) {
                  const siswaResponse = await entityService.list('/siswa', { kelas_id: waliKelasOf.id });
                  students = siswaResponse.data.data || [];
                }
              }
              
              setData({ 
                jadwal: schedules, 
                siswa: students,
                kelasPerwalian: waliKelasOf
              });
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [roleNorm, userId, userNip]);

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
      if (rows.length === 0) return null;
      const avg = rows.reduce((sum, score) => sum + Number(score.nilai || 0), 0) / rows.length;

      return {
        label: item.nama_mapel,
        value: avg.toFixed(1),
        width: `${avg}%`,
      };
    }).filter(Boolean);
  }, [data]);

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
      case 'ubah-password':
        return <ChangePasswordTab roleNorm={roleNorm} />;
      case 'jadwal-pelajaran':
      case 'jadwal-mengajar':
        return <JadwalTab schedules={data.jadwal || []} roleNorm={roleNorm} />;
      case 'nilai-akademik':
        return <NilaiTab grades={data.nilai || []} />;
      case 'absensi':
      case 'absensi-siswa':
        return <AbsensiTab />;
      case 'perizinan':
        return <PerizinanTab roleNorm={roleNorm} />;
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
