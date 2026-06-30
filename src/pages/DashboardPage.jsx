import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import StateBlock from '../components/StateBlock';
import api, { entityService } from '../services/api';
import swalAlert from '../utils/swal';

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

function DashboardPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  // Real database-driven Absensi states
  const [studentLogs, setStudentLogs] = useState([]);
  const [pendingPermits, setPendingPermits] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceMap, setAttendanceMap] = useState({});

  const [newPermitDate, setNewPermitDate] = useState('');
  const [newPermitType, setNewPermitType] = useState('Sakit');
  const [newPermitReason, setNewPermitReason] = useState('');

  const [dashboardStats, setDashboardStats] = useState({});
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [perizinanList, setPerizinanList] = useState([]);
  const [loadingPerizinan, setLoadingPerizinan] = useState(false);

  // Form states for Siswa submitting perizinan
  const [newPermitStartDate, setNewPermitStartDate] = useState('');
  const [newPermitEndDate, setNewPermitEndDate] = useState('');
  const [newPermitAttachment, setNewPermitAttachment] = useState('');

  // States for Guru processing perizinan
  const [guruNotesMap, setGuruNotesMap] = useState({}); // mapping ID to note string

  const roleNorm = (user.role || '').toLowerCase();

  const fetchDashboardStats = async () => {
    setLoadingDashboard(true);
    try {
      let url = '';
      if (roleNorm === 'admin') url = '/admin/dashboard';
      else if (roleNorm === 'guru') url = '/guru/dashboard';
      else if (roleNorm === 'siswa') url = '/siswa/dashboard';

      if (url) {
        const response = await api.get(url);
        setDashboardStats(response.data.data || {});
      }
    } catch (err) {
      console.error('Gagal memuat dasbor statistik:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchPerizinan = async () => {
    setLoadingPerizinan(true);
    try {
      const response = await api.get('/perizinan');
      setPerizinanList(response.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data perizinan:', err);
    } finally {
      setLoadingPerizinan(false);
    }
  };

  const handleCreatePerizinan = async (e) => {
    e.preventDefault();
    if (!newPermitStartDate || !newPermitEndDate || !newPermitReason) {
      swalAlert.error('Form Tidak Lengkap', 'Silakan isi seluruh kolom tanggal dan alasan.');
      return;
    }

    try {
      const payload = {
        tanggal_mulai: new Date(newPermitStartDate).toISOString(),
        tanggal_selesai: new Date(newPermitEndDate).toISOString(),
        tipe: newPermitType,
        alasan: newPermitReason,
        attachment_url: newPermitAttachment ? newPermitAttachment : null
      };

      await api.post('/perizinan', payload);
      swalAlert.success('Berhasil Diajukan', 'Permohonan perizinan Anda telah berhasil dikirim ke guru.');
      
      // Clear form
      setNewPermitStartDate('');
      setNewPermitEndDate('');
      setNewPermitReason('');
      setNewPermitAttachment('');
      
      // Refresh list
      fetchPerizinan();
    } catch (err) {
      swalAlert.error('Gagal Mengajukan', err.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
    }
  };

  const handleProcessPerizinan = async (id, status) => {
    try {
      const note = guruNotesMap[id] || '';
      await api.put(`/perizinan/${id}/approve`, {
        status: status,
        keterangan_guru: note
      });
      swalAlert.success('Berhasil', `Permohonan perizinan berhasil ${status.toLowerCase()}.`);
      
      // Clear note
      setGuruNotesMap(prev => ({ ...prev, [id]: '' }));
      
      // Refresh list
      fetchPerizinan();
    } catch (err) {
      swalAlert.error('Gagal', err.response?.data?.message || 'Terjadi kesalahan saat memproses.');
    }
  };

  const fetchStudentAbsensiLogs = async () => {
    try {
      const response = await entityService.list('/absensi');
      setStudentLogs(response.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil riwayat absensi:', err);
    }
  };

  const fetchPendingPermits = async () => {
    try {
      const response = await entityService.list('/absensi', { status_persetujuan: 'Pending' });
      setPendingPermits(response.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data permohonan izin:', err);
    }
  };

  const fetchClassAttendance = async (kelasId, tanggal) => {
    if (!kelasId || !tanggal) return;
    try {
      const response = await entityService.list('/absensi', { kelas_id: kelasId, tanggal });
      const records = response.data.data || [];
      const map = {};
      records.forEach(r => {
        map[r.siswa_id] = r.status;
      });
      setAttendanceMap(map);
    } catch (err) {
      console.error('Gagal mengambil absensi kelas:', err);
    }
  };

  const handleApproveReject = async (absensiId, statusPersetujuan) => {
    try {
      await api.put(`/absensi/${absensiId}/approve`, {
        status_persetujuan: statusPersetujuan
      });
      swalAlert.success(
        statusPersetujuan === 'Disetujui' ? 'Disetujui' : 'Ditolak',
        `Permohonan izin berhasil ${statusPersetujuan.toLowerCase()}.`
      );
      fetchPendingPermits();
      if (selectedKelas) {
        fetchClassAttendance(selectedKelas, selectedTanggal);
      }
    } catch (err) {
      swalAlert.error('Gagal', err.response?.data?.message || 'Terjadi kesalahan saat memproses.');
    }
  };

  const handleRadioChange = (siswaId, status) => {
    setAttendanceMap(prev => ({ ...prev, [siswaId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedKelas) {
      swalAlert.error('Pilih Kelas', 'Silakan pilih kelas terlebih dahulu.');
      return;
    }
    const studentsInClass = data.siswa?.filter(s => s.kelas_id === Number(selectedKelas)) || [];
    if (studentsInClass.length === 0) {
      swalAlert.error('Tidak Ada Siswa', 'Tidak ada siswa terdaftar di kelas yang dipilih.');
      return;
    }

    const records = studentsInClass.map(student => ({
      siswa_id: student.id,
      status: attendanceMap[student.id] || 'Hadir',
      status_persetujuan: 'Disetujui'
    }));

    try {
      await api.post('/absensi/bulk', {
        tanggal: selectedTanggal,
        records: records
      });
      swalAlert.success('Berhasil Disimpan', 'Absensi kelas hari ini berhasil disimpan!');
      fetchClassAttendance(selectedKelas, selectedTanggal);
    } catch (err) {
      swalAlert.error('Gagal Menyimpan', err.response?.data?.message || 'Gagal menyimpan absensi kelas.');
    }
  };

  useEffect(() => {
    if (tab === 'absensi' || tab === 'absensi-siswa') {
      if (roleNorm === 'siswa') {
        fetchStudentAbsensiLogs();
      } else {
        fetchPendingPermits();
        fetchClassAttendance(selectedKelas, selectedTanggal);
      }
    } else if (tab === 'dashboard') {
      fetchDashboardStats();
    } else if (tab === 'perizinan') {
      fetchPerizinan();
    }
  }, [tab, roleNorm, selectedKelas, selectedTanggal]);

  const studentStats = useMemo(() => {
    const totalDays = studentLogs.filter(log => log.status_persetujuan === 'Disetujui').length;
    const hadir = studentLogs.filter(log => log.status === 'Hadir' && log.status_persetujuan === 'Disetujui').length;
    const sakit = studentLogs.filter(log => log.status === 'Sakit' && log.status_persetujuan === 'Disetujui').length;
    const izin = studentLogs.filter(log => log.status === 'Izin' && log.status_persetujuan === 'Disetujui').length;
    const alpa = studentLogs.filter(log => log.status === 'Alpa' && log.status_persetujuan === 'Disetujui').length;

    const rate = totalDays > 0 ? Math.round((hadir / totalDays) * 100) : 100;
    return {
      rate: `${rate}%`,
      sakit: `${sakit} Hari`,
      izin: `${izin} Hari`,
      alpa: `${alpa} Hari`,
    };
  }, [studentLogs]);

  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const day = current.getDay();
    // Adjust back to Monday (1). If Sunday (0), go back 6 days.
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday (5 days)
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
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDaySchedules = useMemo(() => {
    const selectedDayIndo = dayNamesIndo[selectedDate.getDay()];
    const list = data.jadwal || [];
    const filtered = list.filter(item => 
      item.hari && item.hari.toLowerCase() === selectedDayIndo.toLowerCase()
    );

    if (filtered.length === 0) {
      if (selectedDayIndo === 'Senin') {
        return [
          {
            jam_mulai: '08:00',
            jam_selesai: '09:30',
            mapel: { nama_mapel: 'Matematika' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Dr. Albert' }
          },
          {
            jam_mulai: '09:45',
            jam_selesai: '11:15',
            mapel: { nama_mapel: 'Bahasa Indonesia' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Miss Clara' }
          },
          {
            jam_mulai: '11:30',
            jam_selesai: '13:00',
            mapel: { nama_mapel: 'PPKN' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'M.A Jackson' }
          }
        ];
      } else if (selectedDayIndo === 'Selasa') {
        return [
          {
            jam_mulai: '08:00',
            jam_selesai: '09:30',
            mapel: { nama_mapel: 'IPA' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Dr. Albert' }
          },
          {
            jam_mulai: '09:45',
            jam_selesai: '11:15',
            mapel: { nama_mapel: 'IPS' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Miss Clara' }
          },
          {
            jam_mulai: '11:30',
            jam_selesai: '13:00',
            mapel: { nama_mapel: 'Agama' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Ustadz Malik' }
          }
        ];
      } else if (selectedDayIndo === 'Rabu') {
        return [
          {
            jam_mulai: '08:00',
            jam_selesai: '09:30',
            mapel: { nama_mapel: 'Bahasa Inggris' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Miss Clara' }
          },
          {
            jam_mulai: '09:45',
            jam_selesai: '11:15',
            mapel: { nama_mapel: 'Penjasorkes' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Budi Santoso' }
          },
          {
            jam_mulai: '11:30',
            jam_selesai: '13:00',
            mapel: { nama_mapel: 'Seni Budaya' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'M.A Jackson' }
          }
        ];
      } else if (selectedDayIndo === 'Kamis') {
        return [
          {
            jam_mulai: '08:00',
            jam_selesai: '09:30',
            mapel: { nama_mapel: 'Informatika' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Dr. Albert' }
          },
          {
            jam_mulai: '09:45',
            jam_selesai: '11:15',
            mapel: { nama_mapel: 'Sejarah' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Miss Clara' }
          },
          {
            jam_mulai: '11:30',
            jam_selesai: '13:00',
            mapel: { nama_mapel: 'Prakarya' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'M.A Jackson' }
          }
        ];
      } else if (selectedDayIndo === 'Jumat') {
        return [
          {
            jam_mulai: '08:00',
            jam_selesai: '09:30',
            mapel: { nama_mapel: 'Matematika Peminatan' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Dr. Albert' }
          },
          {
            jam_mulai: '09:45',
            jam_selesai: '11:15',
            mapel: { nama_mapel: 'Fisika' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'Miss Clara' }
          },
          {
            jam_mulai: '11:30',
            jam_selesai: '13:00',
            mapel: { nama_mapel: 'Kimia' },
            kelas: { nama_kelas: 'Kelas Siswa' },
            guru: { nama: 'M.A Jackson' }
          }
        ];
      } else {
        return [];
      }
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
        if (roleNorm === 'admin') {
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
          // Guru or Siswa: only fetch their specific dashboard
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



  const handleAddPermit = async (e) => {
    e.preventDefault();
    if (!newPermitDate || !newPermitReason) return;
    try {
      await entityService.create('/absensi', {
        tanggal: newPermitDate,
        status: newPermitType, // Sakit or Izin
        keterangan: newPermitReason,
        status_persetujuan: 'Pending'
      });
      setNewPermitDate('');
      setNewPermitReason('');
      swalAlert.success('Permohonan Terkirim', 'Permohonan izin Anda berhasil dikirim ke wali kelas.');
      fetchStudentAbsensiLogs();
    } catch (err) {
      swalAlert.error('Gagal Mengajukan Izin', err.response?.data?.message || 'Terjadi kesalahan pada server.');
    }
  };

  const renderTabContent = () => {
    const roleNorm = (user.role || '').toLowerCase();
    
    // ----------------------------------------------------
    // TAB: PROFIL SAYA / PROFIL GURU
    // ----------------------------------------------------
    if (tab === 'profil-saya' || tab === 'profil-guru') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Akun Pengguna</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">Profil Lengkap</h2>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Card: Avatar & Status */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-green-500/5 blur-2xl" />
              <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 p-1 shadow-md mb-4 mt-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" 
                  alt={user.nama} 
                  className="h-full w-full object-cover rounded-full border-2 border-white" 
                />
              </div>
              <h3 className="text-xl font-extrabold text-gray-950">{user.nama}</h3>
              <span className="mt-2 inline-flex items-center rounded-full bg-green-50 border border-green-200 text-green-700 px-3.5 py-1 text-xs font-extrabold capitalize">
                {user.role}
              </span>
              
              <div className="w-full border-t border-gray-150 mt-6 pt-6 space-y-3.5 text-left text-xs font-semibold text-gray-500">
                <div className="flex justify-between">
                  <span>Status Akun:</span>
                  <span className="text-green-600 font-extrabold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Aktif
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tahun Ajaran:</span>
                  <span className="text-gray-900 font-bold">2026/2027 Ganjil</span>
                </div>
                <div className="flex justify-between">
                  <span>Terdaftar Sejak:</span>
                  <span className="text-gray-900 font-bold">Juli 2024</span>
                </div>
              </div>
            </div>

            {/* Right Card: Details */}
            <div className="md:col-span-2 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 relative overflow-hidden text-left">
              <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl" />
              <h4 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-3.5 mb-6">Informasi Personal</h4>
              
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                  <p className="mt-1.5 font-bold text-gray-900">{user.nama}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{roleNorm === 'guru' ? 'NIP' : 'Nomor Induk Siswa (NIS)'}</p>
                  <p className="mt-1.5 font-bold text-gray-900">{roleNorm === 'guru' ? '198804152011011002' : '10122045'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Email</p>
                  <p className="mt-1.5 font-semibold text-gray-800">{user.email || 'user@sekolah.sch.id'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. Telepon / HP</p>
                  <p className="mt-1.5 font-semibold text-gray-800">+62 821-4567-8901</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jenis Kelamin</p>
                  <p className="mt-1.5 font-semibold text-gray-800">Perempuan</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tempat, Tanggal Lahir</p>
                  <p className="mt-1.5 font-semibold text-gray-800">Semarang, 12 April 2008</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Rumah</p>
                  <p className="mt-1.5 font-semibold text-gray-800">Jl. Cempaka Raya No. 45, RT 02/RW 05, Kel. Sekaran, Kec. Gunungpati, Semarang</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: JADWAL PELAJARAN / JADWAL MENGAJAR
    // ----------------------------------------------------
    if (tab === 'jadwal-pelajaran' || tab === 'jadwal-mengajar') {
      const scheduleDays = [
        {
          day: 'Senin',
          color: 'border-l-4 border-green-600 bg-green-50/20',
          subjects: [
            { time: '08:00 - 09:30', name: 'Matematika', room: 'R. 101', teacher: 'Dr. Albert' },
            { time: '09:45 - 11:15', name: 'Bahasa Indonesia', room: 'R. 101', teacher: 'Ibu Endang' },
            { time: '11:30 - 13:00', name: 'PPKN', room: 'R. 101', teacher: 'Pak Joko' },
          ]
        },
        {
          day: 'Selasa',
          color: 'border-l-4 border-amber-500 bg-amber-50/20',
          subjects: [
            { time: '08:00 - 09:30', name: 'IPA (Fisika)', room: 'Lab Fisika', teacher: 'Ibu Ratna' },
            { time: '09:45 - 11:15', name: 'IPS (Sejarah)', room: 'R. 101', teacher: 'Pak Budi' },
            { time: '11:30 - 13:00', name: 'Agama Islam', room: 'R. Ibadah', teacher: 'Ustadz Ahmad' },
          ]
        },
        {
          day: 'Rabu',
          color: 'border-l-4 border-blue-500 bg-blue-50/20',
          subjects: [
            { time: '08:00 - 09:30', name: 'Bahasa Inggris', room: 'Lab Bahasa', teacher: 'Miss Clara' },
            { time: '09:45 - 11:15', name: 'Penjasorkes', room: 'Lapangan Olahraga', teacher: 'Budi Santoso' },
            { time: '11:30 - 13:00', name: 'Seni Budaya', room: 'R. Kesenian', teacher: 'M.A Jackson' },
          ]
        },
        {
          day: 'Kamis',
          color: 'border-l-4 border-purple-500 bg-purple-50/20',
          subjects: [
            { time: '08:00 - 09:30', name: 'Informatika', room: 'Lab Komputer', teacher: 'Dr. Albert' },
            { time: '09:45 - 11:15', name: 'Sejarah Indonesia', room: 'R. 101', teacher: 'Miss Clara' },
            { time: '11:30 - 13:00', name: 'Prakarya', room: 'R. Keterampilan', teacher: 'M.A Jackson' },
          ]
        },
        {
          day: 'Jumat',
          color: 'border-l-4 border-teal-600 bg-teal-50/20',
          subjects: [
            { time: '08:00 - 09:30', name: 'Matematika Peminatan', room: 'R. 101', teacher: 'Dr. Albert' },
            { time: '09:45 - 11:15', name: 'Fisika Terapan', room: 'Lab Fisika', teacher: 'Miss Clara' },
            { time: '11:30 - 13:00', name: 'Kimia', room: 'Lab Kimia', teacher: 'M.A Jackson' },
          ]
        }
      ];

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Kurikulum</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">Jadwal Mingguan</h2>
            </div>
            <div className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full shadow-sm">
              📅 5 Hari Sekolah (Senin - Jumat)
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-5">
            {scheduleDays.map((d) => (
              <div key={d.day} className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm space-y-4 text-left">
                <div className="border-b border-gray-150 pb-2 flex justify-between items-center">
                  <span className="font-extrabold text-gray-950 text-base">{d.day}</span>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <div className="space-y-3">
                  {d.subjects.map((sub, sIdx) => (
                    <div key={sIdx} className={`p-3 rounded-xl ${d.color} text-left`}>
                      <span className="text-[9px] font-bold text-gray-400 block tracking-wider uppercase">{sub.time}</span>
                      <strong className="text-xs font-extrabold text-gray-900 block mt-0.5">{sub.name}</strong>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-1">🚪 {sub.room}</span>
                      <span className="text-[10px] text-gray-400 font-medium block mt-0.5 truncate">👤 {sub.teacher}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: NILAI AKADEMIK
    // ----------------------------------------------------
    if (tab === 'nilai-akademik') {
      const grades = [
        { mapel: 'Matematika', tugas: 85, uts: 80, uas: 90, akhir: 85.5, semester: '1', status: 'Lulus' },
        { mapel: 'Bahasa Indonesia', tugas: 90, uts: 85, uas: 88, akhir: 87.8, semester: '1', status: 'Lulus' },
        { mapel: 'PPKN', tugas: 80, uts: 78, uas: 85, akhir: 81.2, semester: '1', status: 'Lulus' },
        { mapel: 'Fisika', tugas: 88, uts: 92, uas: 85, akhir: 88.1, semester: '1', status: 'Lulus' },
        { mapel: 'Kimia', tugas: 85, uts: 80, uas: 88, akhir: 84.8, semester: '1', status: 'Lulus' },
        { mapel: 'Bahasa Inggris', tugas: 92, uts: 88, uas: 95, akhir: 92.1, semester: '1', status: 'Lulus' },
      ];

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Hasil Evaluasi</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">Nilai Akademik</h2>
            </div>
            <div className="flex gap-2">
              <select className="rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 outline-none transition focus:border-green-500 cursor-pointer">
                <option value="1">Semester 1 (Ganjil)</option>
                <option value="2">Semester 2 (Genap)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-200/50">
                📚
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Mapel</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">6 Pelajaran</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/50">
                📈
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rata-rata Kelas</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">86.6</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-200/50">
                🎓
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Kelulusan</p>
                <p className="text-2xl font-extrabold text-green-700 mt-1">LUNTAS (LULUS)</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4.5 font-bold">Mata Pelajaran</th>
                    <th className="px-6 py-4.5 font-bold">Tugas (30%)</th>
                    <th className="px-6 py-4.5 font-bold">UTS (30%)</th>
                    <th className="px-6 py-4.5 font-bold">UAS (40%)</th>
                    <th className="px-6 py-4.5 font-bold">Nilai Akhir</th>
                    <th className="px-6 py-4.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white/60">
                  {grades.map((g, idx) => (
                    <tr key={idx} className="hover:bg-green-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 font-bold text-gray-900 text-left">{g.mapel}</td>
                      <td className="px-6 py-4 font-semibold">{g.tugas}</td>
                      <td className="px-6 py-4 font-semibold">{g.uts}</td>
                      <td className="px-6 py-4 font-semibold">{g.uas}</td>
                      <td className="px-6 py-4 font-extrabold text-green-700 bg-green-50/10">{g.akhir}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700">
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: ABSENSI / ABSENSI SISWA
    // ----------------------------------------------------
    if (tab === 'absensi' || tab === 'absensi-siswa') {
      const isGuru = roleNorm === 'guru' || roleNorm === 'admin' || roleNorm === 'staff' || roleNorm === 'administrator';
      return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Presensi</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">Kehadiran & Absensi</h2>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-left">
            <span className="text-xl shrink-0 mt-0.5">⚠️</span>
            <div>
              <h4 className="text-sm font-bold text-amber-800">Fitur dalam Tahap Pengembangan</h4>
              <p className="text-xs text-amber-750 mt-1 leading-relaxed">Fitur absensi siswa dan rekapitulasi data kehadiran saat ini sedang dalam tahap pengembangan dan sinkronisasi database.</p>
            </div>
          </div>

          {!isGuru ? (
            // Siswa view
            <div className="grid gap-6 md:grid-cols-3">
              {/* Summary and Form */}
              <div className="space-y-6 text-left">
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
                  <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Rangkuman Kehadiran</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50/50 border border-green-150 p-4 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Hadir</span>
                      <strong className="text-2xl font-extrabold text-green-700 block mt-1">{studentStats.rate}</strong>
                    </div>
                    <div className="bg-blue-50/50 border border-blue-150 p-4 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sakit</span>
                      <strong className="text-2xl font-extrabold text-blue-700 block mt-1">{studentStats.sakit}</strong>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-150 p-4 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Izin</span>
                      <strong className="text-2xl font-extrabold text-amber-600 block mt-1">{studentStats.izin}</strong>
                    </div>
                    <div className="bg-red-50/50 border border-red-150 p-4 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Alpa</span>
                      <strong className="text-2xl font-extrabold text-red-700 block mt-1">{studentStats.alpa}</strong>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2 mb-4">Ajukan Surat Sakit / Izin</h3>
                  <form onSubmit={handleAddPermit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal</label>
                      <input 
                        type="date" 
                        required 
                        value={newPermitDate}
                        onChange={(e) => setNewPermitDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tipe</label>
                      <select 
                        value={newPermitType}
                        onChange={(e) => setNewPermitType(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500 cursor-pointer"
                      >
                        <option value="Sakit">Sakit</option>
                        <option value="Izin">Izin (Keperluan Khusus)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Alasan</label>
                      <textarea 
                        required 
                        rows={2}
                        value={newPermitReason}
                        onChange={(e) => setNewPermitReason(e.target.value)}
                        placeholder="Contoh: Demam tinggi, ada urusan keluarga mendesak"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500" 
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
                    >
                      Kirim Permohonan
                    </button>
                  </form>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="md:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4 text-left">
                <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Log Permohonan Izin / Sakit</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 border-collapse">
                    <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="p-4 font-bold">Tanggal</th>
                        <th className="p-4 font-bold">Tipe</th>
                        <th className="p-4 font-bold">Alasan / Keterangan</th>
                        <th className="p-4 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 bg-white/60">
                      {studentLogs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">Belum ada riwayat permohonan izin/sakit.</td>
                        </tr>
                      ) : (
                        studentLogs.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-green-50/50 transition">
                            <td className="p-4 font-semibold text-gray-900">{p.tanggal}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                p.status === 'Sakit' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 font-medium text-gray-700">{p.keterangan}</td>
                            <td className="p-4 text-right">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                                p.status_persetujuan === 'Disetujui' ? 'bg-green-50 text-green-700 border border-green-200' :
                                p.status_persetujuan === 'Ditolak' ? 'bg-red-50 text-red-750 border border-red-150' :
                                'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}>
                                {p.status_persetujuan}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Guru & Admin view
            <div className="space-y-6">
              {/* Approval Table Section */}
              {pendingPermits.length > 0 && (
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4 text-left">
                  <h3 className="text-lg font-extrabold text-amber-800 border-b border-gray-150 pb-2">
                    Menunggu Persetujuan Izin / Sakit ({pendingPermits.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-650 border-collapse">
                      <thead className="bg-amber-50/55 text-xs font-bold uppercase tracking-wider text-amber-800 border-b border-gray-200">
                        <tr>
                          <th className="p-4 font-bold">Tanggal</th>
                          <th className="p-4 font-bold">Siswa</th>
                          <th className="p-4 font-bold">Kelas</th>
                          <th className="p-4 font-bold">Tipe</th>
                          <th className="p-4 font-bold">Alasan</th>
                          <th className="p-4 font-bold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 bg-white/60">
                        {pendingPermits.map((p) => (
                          <tr key={p.id} className="hover:bg-amber-50/10 transition">
                            <td className="p-4 font-semibold text-gray-900">{p.tanggal}</td>
                            <td className="p-4 font-bold text-gray-800">{p.siswa?.nama}</td>
                            <td className="p-4 font-semibold text-gray-700">{p.siswa?.kelas?.nama_kelas || '-'}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                p.status === 'Sakit' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 font-medium text-gray-700">{p.keterangan}</td>
                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                              <button 
                                onClick={() => handleApproveReject(p.id, 'Disetujui')}
                                className="bg-green-50 hover:bg-green-600 hover:text-white border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                Setujui
                              </button>
                              <button 
                                onClick={() => handleApproveReject(p.id, 'Ditolak')}
                                className="bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-750 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                Tolak
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Input Absensi Siswa */}
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-6 text-left">
                <div className="flex flex-wrap items-center gap-4 justify-between border-b border-gray-150 pb-4">
                  <div className="flex gap-4">
                    <select 
                      value={selectedKelas}
                      onChange={(e) => setSelectedKelas(e.target.value)}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 outline-none transition focus:border-green-500 cursor-pointer"
                    >
                      <option value="">Pilih Kelas</option>
                      {data.kelas?.map((k) => (
                        <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                      ))}
                    </select>
                    <input 
                      type="date" 
                      value={selectedTanggal}
                      onChange={(e) => setSelectedTanggal(e.target.value)}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 outline-none transition focus:border-green-500 cursor-pointer" 
                    />
                  </div>
                  <button 
                    onClick={handleSaveAttendance}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
                  >
                    Simpan Absensi Kelas
                  </button>
                </div>

                {!selectedKelas ? (
                  <div className="p-8 text-center text-gray-400 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    Silakan pilih kelas terlebih dahulu untuk mengisi absensi.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 border-collapse">
                      <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4.5 font-bold">NIS</th>
                          <th className="px-6 py-4.5 font-bold">Nama Lengkap</th>
                          <th className="px-6 py-4.5 font-bold text-center">Hadir</th>
                          <th className="px-6 py-4.5 font-bold text-center">Sakit</th>
                          <th className="px-6 py-4.5 font-bold text-center">Izin</th>
                          <th className="px-6 py-4.5 font-bold text-center">Alpa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 bg-white/60">
                        {data.siswa?.filter(student => student.kelas_id === Number(selectedKelas)).length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">Belum ada siswa terdaftar di kelas ini.</td>
                          </tr>
                        ) : (
                          data.siswa?.filter(student => student.kelas_id === Number(selectedKelas)).map((student, idx) => {
                            const currentStatus = attendanceMap[student.id] || 'Hadir';
                            return (
                              <tr key={student.id || idx} className="hover:bg-green-50/50 transition">
                                <td className="px-6 py-4 font-bold text-gray-900">{student.nis}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800">{student.nama}</td>
                                <td className="px-6 py-4 text-center">
                                  <input 
                                    type="radio" 
                                    name={`att-${student.id}`} 
                                    checked={currentStatus === 'Hadir'}
                                    onChange={() => handleRadioChange(student.id, 'Hadir')}
                                    className="h-4.5 w-4.5 text-green-600 border-gray-300 focus:ring-green-500 cursor-pointer" 
                                  />
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <input 
                                    type="radio" 
                                    name={`att-${student.id}`} 
                                    checked={currentStatus === 'Sakit'}
                                    onChange={() => handleRadioChange(student.id, 'Sakit')}
                                    className="h-4.5 w-4.5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" 
                                  />
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <input 
                                    type="radio" 
                                    name={`att-${student.id}`} 
                                    checked={currentStatus === 'Izin'}
                                    onChange={() => handleRadioChange(student.id, 'Izin')}
                                    className="h-4.5 w-4.5 text-amber-600 border-gray-300 focus:ring-amber-500 cursor-pointer" 
                                  />
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <input 
                                    type="radio" 
                                    name={`att-${student.id}`} 
                                    checked={currentStatus === 'Alpa'}
                                    onChange={() => handleRadioChange(student.id, 'Alpa')}
                                    className="h-4.5 w-4.5 text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer" 
                                  />
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: PENGUMUMAN
    // ----------------------------------------------------
    if (tab === 'pengumuman') {
      const announcements = [
        { title: 'Math Olympiad Competition 2026', date: '24 Juni 2026', author: 'M.A Jackson (Math Teacher)', content: 'Pendaftaran Kompetisi Matematika Nasional tingkat sekolah akan dibuka mulai minggu depan. Semua siswa diharap mempersiapkan diri.', tag: 'Akademik', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { title: 'Science Fair Registration Open', date: '22 Juni 2026', author: 'Science Department', content: 'Silakan daftarkan tim dan topik proyek sains Anda melalui link pendaftaran di sekretariat TU sebelum tanggal 30 Juni.', tag: 'Kegiatan', color: 'bg-green-50 text-green-700 border-green-200' },
        { title: 'Pengambilan Kartu Hasil Belajar (KHB)', date: '18 Juni 2026', author: 'Admin Kurikulum', content: 'KHB Semester Ganjil dapat diambil di ruang TU mulai Senin depan dengan syarat telah menyelesaikan seluruh administrasi perpustakaan.', tag: 'Penting', color: 'bg-red-50 text-red-700 border-red-200' },
        { title: 'Jadwal Libur Akhir Semester Ganjil', date: '15 Juni 2026', author: 'Kepala Sekolah', content: 'Berdasarkan kalender akademik sekolah, libur akhir semester ganjil akan berlangsung mulai 1 Juli sampai dengan 15 Juli 2026.', tag: 'Penting', color: 'bg-red-50 text-red-700 border-red-200' },
      ];

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Pemberitahuan</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">Pengumuman Sekolah</h2>
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
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-250 shadow-sm relative overflow-hidden group hover:shadow-md transition text-left">
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
                <p className="text-sm text-gray-600 leading-relaxed font-medium mb-3">{a.content}</p>
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

    // ----------------------------------------------------
    // TAB: DATA SISWA (For Guru)
    // ----------------------------------------------------
    if (tab === 'data-siswa') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Perwalian Kelas</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">Daftar Siswa Kelas XI-MIPA-1</h2>
            </div>
            <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full shadow-sm">
              Wali Kelas: {user.nama}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4.5 font-bold">NIS</th>
                    <th className="px-6 py-4.5 font-bold">Nama Siswa</th>
                    <th className="px-6 py-4.5 font-bold">Jenis Kelamin</th>
                    <th className="px-6 py-4.5 font-bold">Rata-rata Nilai</th>
                    <th className="px-6 py-4.5 font-bold">Kehadiran</th>
                    <th className="px-6 py-4.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white/60">
                  {data.siswa?.map((student, idx) => (
                    <tr key={idx} className="hover:bg-green-50/50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900 text-left">{student.nis}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800 text-left">{student.nama}</td>
                      <td className="px-6 py-4 font-medium text-left">{student.jenis_kelamin}</td>
                      <td className="px-6 py-4 font-extrabold text-green-700 text-left">86.4 / 100</td>
                      <td className="px-6 py-4 font-semibold text-left">96.8%</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: LAPORAN (For Admin & Staff TU)
    // ----------------------------------------------------
    if (tab === 'laporan') {
      const reportTypes = [
        { title: 'Laporan Data Siswa Aktif', desc: 'Mencakup NIS, Kelas, Status Administrasi, Kontak Orang Tua.', icon: '📊' },
        { title: 'Laporan Jadwal Mengajar & Mengajar', desc: 'Mencakup Jadwal Pelajaran 5 Hari, Beban Mengajar Guru.', icon: '📅' },
        { title: 'Laporan Rekapitulasi Nilai Rapor', desc: 'Mencakup Hasil Nilai Tugas, UTS, UAS per Kelas & Mapel.', icon: '🎓' },
        { title: 'Laporan Kehadiran & Presensi Bulanan', desc: 'Mencakup Persentase Kehadiran Siswa & Keaktifan Mengajar Guru.', icon: '📝' },
      ];

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Dokumentasi</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">Pusat Laporan Akademik</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {reportTypes.map((r, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-250 shadow-sm flex gap-4 hover:-translate-y-0.5 hover:shadow-md transition text-left">
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
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer border border-gray-250"
                    >
                      Ekspor Excel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* School Statistics Visual Mockup */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 space-y-6 text-left">
            <h3 className="font-extrabold text-gray-950 text-lg border-b border-gray-150 pb-3">Statistik Distribusi Grade Sekolah</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs font-bold text-gray-700">
                  <span>Grade A (Nilai Akhir &gt;= 85)</span>
                  <span className="text-green-700 font-extrabold">48.2%</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" style={{ width: '48.2%' }}></div>
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs font-bold text-gray-700">
                  <span>Grade B (Nilai Akhir 75 - 84)</span>
                  <span className="text-amber-600 font-extrabold">42.5%</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: '42.5%' }}></div>
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs font-bold text-gray-700">
                  <span>Grade C (Nilai Akhir 60 - 74)</span>
                  <span className="text-red-600 font-extrabold">9.3%</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: '9.3%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: USER MANAGEMENT (For Admin)
    // ----------------------------------------------------
    if (tab === 'user-management') {
      const usersList = [
        { email: 'admin@sekolah.com', role: 'administrator', status: 'Aktif' },
        { email: 'guru@sekolah.com', role: 'guru', status: 'Aktif' },
        { email: 'staff@sekolah.com', role: 'staff_tu', status: 'Aktif' },
        { email: 'siswa@sekolah.com', role: 'siswa', status: 'Aktif' },
        { email: 'clara@sekolah.com', role: 'guru', status: 'Aktif' },
      ];

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Sistem Keamanan</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">User Management</h2>
            </div>
            <button 
              onClick={() => swalAlert.error('Dalam Pengembangan', 'Fungsi ini membutuhkan integrasi backend lebih lanjut.')}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
            >
              Tambah Pengguna Baru
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4.5 font-bold">Email</th>
                    <th className="px-6 py-4.5 font-bold">Role Sistem</th>
                    <th className="px-6 py-4.5 font-bold">Status Akun</th>
                    <th className="px-6 py-4.5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white/60">
                  {usersList.map((usr, idx) => (
                    <tr key={idx} className="hover:bg-green-50/50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900 text-left">{usr.email}</td>
                      <td className="px-6 py-4 text-left">
                        <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700 capitalize">
                          {usr.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-700 text-left">{usr.status}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => swalAlert.success('Ubah Role', 'Fitur ubah role berhasil dibuka.')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-250 transition cursor-pointer">
                          Edit Role
                        </button>
                        <button onClick={() => swalAlert.success('Reset Password', `Reset password untuk ${usr.email} berhasil dikirim ke email terkait.`)} className="bg-red-50 hover:bg-red-650 hover:text-white text-red-750 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-100 transition cursor-pointer">
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: ROLE PERMISSIONS (For Admin)
    // ----------------------------------------------------
    if (tab === 'role-permissions') {
      const permissionMatrix = [
        { module: 'Data Guru', admin: true, staff: true, guru: false, siswa: false },
        { module: 'Data Siswa', admin: true, staff: true, guru: true, siswa: false },
        { module: 'Data Kelas', admin: true, staff: true, guru: false, siswa: false },
        { module: 'Jadwal Pelajaran', admin: true, staff: true, guru: false, siswa: false },
        { module: 'Nilai Akademik (Write)', admin: true, staff: false, guru: true, siswa: false },
        { module: 'Nilai Akademik (Read)', admin: true, staff: true, guru: true, siswa: true },
        { module: 'Absensi Siswa', admin: true, staff: true, guru: true, siswa: false },
        { module: 'System Settings', admin: true, staff: false, guru: false, siswa: false },
      ];

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Sistem Keamanan</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">Role Permissions</h2>
            </div>
            <button 
              onClick={() => swalAlert.success('Hak Akses', 'Perubahan hak akses berhasil disimpan!')}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 border-collapse">
                <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4.5 font-bold">Modul / Menu</th>
                    <th className="px-6 py-4.5 font-bold text-center">Administrator</th>
                    <th className="px-6 py-4.5 font-bold text-center">Staff TU</th>
                    <th className="px-6 py-4.5 font-bold text-center">Guru</th>
                    <th className="px-6 py-4.5 font-bold text-center">Siswa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white/60">
                  {permissionMatrix.map((matrix, idx) => (
                    <tr key={idx} className="hover:bg-green-50/50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900 text-left">{matrix.module}</td>
                      <td className="px-6 py-4 text-center">
                        <input type="checkbox" defaultChecked={matrix.admin} className="h-4.5 w-4.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input type="checkbox" defaultChecked={matrix.staff} className="h-4.5 w-4.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input type="checkbox" defaultChecked={matrix.guru} className="h-4.5 w-4.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input type="checkbox" defaultChecked={matrix.siswa} className="h-4.5 w-4.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: SYSTEM SETTINGS (For Admin)
    // ----------------------------------------------------
    if (tab === 'system-settings') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Konfigurasi Aplikasi</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">System Settings</h2>
            </div>
            <button 
              onClick={() => swalAlert.success('Pengaturan', 'Semua pengaturan sistem berhasil disimpan!')}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
            >
              Simpan Pengaturan
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 text-left">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Profil Sekolah</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama Instansi Sekolah</label>
                  <input type="text" defaultValue="SMA Negeri 1 Semarang" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Alamat Lengkap</label>
                  <textarea rows={2} defaultValue="Jl. Taman Menteri Supeno No. 1, Semarang" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tahun Ajaran</label>
                    <input type="text" defaultValue="2026/2027" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Semester Aktif</label>
                    <select className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500 cursor-pointer">
                      <option value="ganjil">Ganjil</option>
                      <option value="genap">Genap</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-6 text-left">
              <div>
                <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2 mb-4">Pemeliharaan & Backup</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-red-50/30 border border-red-100">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">Maintenance Mode</h4>
                      <p className="text-xs text-gray-400 font-medium">Batasi akses siswa/guru ke aplikasi</p>
                    </div>
                    <input type="checkbox" className="h-5 w-10 text-green-600 focus:ring-green-500 rounded-full cursor-pointer" />
                  </div>
                  <div className="p-4 bg-green-50/20 border border-green-100 rounded-2xl space-y-3">
                    <h4 className="text-sm font-extrabold text-gray-900">Backup Database</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Ekspor seluruh database sekolah dalam format SQL (.sql) untuk keperluan backup berkala.</p>
                    <button 
                      onClick={() => swalAlert.success('Backup Database', 'SQL backup berhasil dibuat! Mengunduh backup_sekolah_2026.sql...')}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      🚀 Jalankan Backup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: PERIZINAN (Sakit / Izin)
    // ----------------------------------------------------
    if (tab === 'perizinan') {
      return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Layanan Siswa</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight text-left">Permohonan Izin & Sakit</h2>
            </div>
          </div>

          {roleNorm === 'siswa' && (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Form Pengajuan */}
              <div className="md:col-span-1 rounded-3xl bg-white p-6 shadow-sm border border-gray-200 text-left h-fit space-y-4">
                <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Ajukan Surat Sakit / Izin</h3>
                <form onSubmit={handleCreatePerizinan} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tipe Perizinan</label>
                    <select
                      value={newPermitType}
                      onChange={(e) => setNewPermitType(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-medium text-gray-950 focus:border-green-500 focus:outline-none"
                    >
                      <option value="Sakit">Sakit</option>
                      <option value="Izin">Izin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={newPermitStartDate}
                      onChange={(e) => setNewPermitStartDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-medium text-gray-950 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={newPermitEndDate}
                      onChange={(e) => setNewPermitEndDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-medium text-gray-950 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Alasan Perizinan</label>
                    <textarea
                      value={newPermitReason}
                      onChange={(e) => setNewPermitReason(e.target.value)}
                      required
                      rows={3}
                      placeholder="Masukkan alasan detail..."
                      className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-medium text-gray-950 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">URL Dokumen Pendukung (Opsional)</label>
                    <input
                      type="url"
                      value={newPermitAttachment}
                      onChange={(e) => setNewPermitAttachment(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-medium text-gray-950 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition duration-150 active:scale-[0.98] cursor-pointer"
                  >
                    Ajukan Sekarang
                  </button>
                </form>
              </div>

              {/* Riwayat Pengajuan */}
              <div className="md:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
                <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Riwayat Pengajuan Izin Anda</h3>
                {loadingPerizinan ? (
                  <p className="text-sm text-gray-400 py-12 text-center">Memuat riwayat perizinan...</p>
                ) : perizinanList.length === 0 ? (
                  <p className="text-sm text-gray-400 py-12 text-center font-medium">Belum ada pengajuan izin/sakit.</p>
                ) : (
                  <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                    {perizinanList.map((p) => (
                      <div key={p.id} className="p-4 rounded-2xl border border-gray-200 space-y-3 bg-gray-50/50 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.tipe === 'Sakit' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {p.tipe}
                            </span>
                            <span className="text-xs text-gray-400 font-semibold">
                              {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} s.d {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : p.status === 'Disetujui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-gray-950">Alasan:</h4>
                          <p className="text-xs font-medium text-gray-600 leading-relaxed">{p.alasan}</p>
                        </div>
                        {p.attachment_url && (
                          <a
                            href={p.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:text-green-700 font-bold inline-flex items-center gap-1.5"
                          >
                            📎 Lihat Dokumen Pendukung
                          </a>
                        )}
                        {p.status !== 'Pending' && (
                          <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-500 font-semibold space-y-1">
                            <p>Diproses oleh: <strong className="text-gray-800">{p.guru?.nama || 'Guru'}</strong></p>
                            {p.keterangan_guru && <p>Catatan Guru: <span className="italic text-gray-600">"{p.keterangan_guru}"</span></p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {roleNorm === 'guru' && (
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
              <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Pengajuan Perizinan Siswa (Menunggu Persetujuan)</h3>
              {loadingPerizinan ? (
                <p className="text-sm text-gray-400 py-12 text-center">Memuat data perizinan...</p>
              ) : perizinanList.length === 0 ? (
                <p className="text-sm text-gray-400 py-12 text-center font-medium">Tidak ada permohonan pending saat ini.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {perizinanList.map((p) => (
                    <div key={p.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-extrabold text-gray-950 text-base">{p.siswa?.nama}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">NIS: {p.siswa?.nis} | Kelas: {p.siswa?.kelas?.nama_kelas || '-'}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            p.tipe === 'Sakit' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {p.tipe}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-gray-500">
                          Rentang Tanggal: {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} s.d {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-gray-150 text-xs text-gray-600 font-medium leading-relaxed">
                          <strong className="block text-gray-950 mb-1">Alasan:</strong>
                          {p.alasan}
                        </div>
                        {p.attachment_url && (
                          <a
                            href={p.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:text-green-700 font-bold inline-flex items-center gap-1.5 pt-1"
                          >
                            📎 Lihat Dokumen Pendukung
                          </a>
                        )}
                      </div>
                      
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Catatan Guru (Opsional)</label>
                          <input
                            type="text"
                            value={guruNotesMap[p.id] || ''}
                            onChange={(e) => setGuruNotesMap(prev => ({ ...prev, [p.id]: e.target.value }))}
                            placeholder="Tulis alasan jika menolak, atau catatan persetujuan..."
                            className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-950 focus:border-green-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleProcessPerizinan(p.id, 'Disetujui')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => handleProcessPerizinan(p.id, 'Ditolak')}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {roleNorm === 'admin' && (
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
              <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Monitoring Seluruh Perizinan Siswa</h3>
              {loadingPerizinan ? (
                <p className="text-sm text-gray-400 py-12 text-center">Memuat data perizinan...</p>
              ) : perizinanList.length === 0 ? (
                <p className="text-sm text-gray-400 py-12 text-center font-medium">Belum ada data permohonan perizinan di sistem.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="w-full border-collapse bg-white text-left text-xs text-gray-500">
                    <thead className="bg-gray-50 font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Siswa</th>
                        <th className="px-6 py-4">Kelas</th>
                        <th className="px-6 py-4">Tanggal Izin</th>
                        <th className="px-6 py-4">Tipe</th>
                        <th className="px-6 py-4">Alasan</th>
                        <th className="px-6 py-4">Berkas</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Guru Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-medium">
                      {perizinanList.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-bold text-gray-900">{p.siswa?.nama}</td>
                          <td className="px-6 py-4">{p.siswa?.kelas?.nama_kelas || '-'}</td>
                          <td className="px-6 py-4">
                            {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} s.d {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.tipe === 'Sakit' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {p.tipe}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate" title={p.alasan}>{p.alasan}</td>
                          <td className="px-6 py-4">
                            {p.attachment_url ? (
                              <a href={p.attachment_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-bold">Lihat Berkas</a>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : p.status === 'Disetujui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {p.guru?.nama ? (
                              <div>
                                <p className="font-bold text-gray-800">{p.guru.nama}</p>
                                {p.keterangan_guru && <p className="text-[10px] text-gray-400 italic">"{p.keterangan_guru}"</p>}
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB: DEFAULT DASHBOARD (Admin, Guru, Siswa Role-based)
    // ----------------------------------------------------
    return (
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-500/5 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-600">Portal Akademik</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {getGreeting()}, {user.nama || 'Pengguna'}!
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-xl">
                Selamat datang di portal informasi sekolah. Berikut adalah rangkuman data akademik terupdate hari ini.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-xl bg-green-50 border border-green-200/50 px-3.5 py-2 text-sm font-semibold text-green-700">
                Role: <strong className="ml-1 capitalize">{user.role || 'siswa'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Content based on Role */}
        {roleNorm === 'admin' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: 'Total Siswa', value: dashboardStats.total_siswa || 0, desc: 'Siswa aktif terdaftar', color: 'from-green-500 to-emerald-600', icon: '👥' },
                { label: 'Total Guru', value: dashboardStats.total_guru || 0, desc: 'Tenaga pengajar aktif', color: 'from-emerald-500 to-teal-500', icon: '👨‍🏫' },
                { label: 'Total Kelas', value: dashboardStats.total_kelas || 0, desc: 'Ruang kelas belajar', color: 'from-green-600 to-emerald-700', icon: '🏫' },
                { label: 'Total Mapel', value: dashboardStats.total_mapel || 0, desc: 'Mata pelajaran diajarkan', color: 'from-teal-600 to-emerald-600', icon: '📖' },
                { label: 'Perizinan Pending', value: dashboardStats.total_perizinan_pending || 0, desc: 'Surat pending persetujuan', color: 'from-amber-500 to-orange-500', icon: '⚠️' }
              ].map((item) => (
                <div key={item.label} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-200 text-left">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                      <p className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">{item.value}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm text-xl">
                      {item.icon}
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-medium text-gray-500">{item.desc}</p>
                </div>
              ))}
            </section>

            {/* Charts Section */}
            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left">
                <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-4 mb-6">Sebaran Siswa per Kelas</h3>
                <div className="space-y-4">
                  {siswaPerKelas.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1.5 flex justify-between text-xs font-bold text-gray-700">
                        <span>{item.label}</span>
                        <span>{item.count} Siswa</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000" style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left">
                <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-4 mb-6">Rata-rata Nilai per Mapel</h3>
                <div className="space-y-4">
                  {rataNilaiMapel.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1.5 flex justify-between text-xs font-bold text-gray-700">
                        <span>{item.label}</span>
                        <span>{item.value} / 100</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-1000" style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {roleNorm === 'guru' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
              {[
                { label: 'Total Siswa', value: dashboardStats.total_siswa || 0, desc: 'Siswa terdaftar di sekolah', color: 'from-green-500 to-emerald-600', icon: '👥' },
                { label: 'Perizinan Siswa Pending', value: dashboardStats.total_perizinan_pending || 0, desc: 'Pengajuan menunggu approval Anda', color: 'from-amber-500 to-orange-500', icon: '⚠️' }
              ].map((item) => (
                <div key={item.label} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-200 text-left">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                      <p className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">{item.value}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm text-xl">
                      {item.icon}
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-medium text-gray-500">{item.desc}</p>
                </div>
              ))}
            </section>

            {/* Schedule & Actions */}
            <section className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
                <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-2">Jadwal Mengajar Hari Ini ({getIndonesianDayName()})</h3>
                <div className="space-y-3.5">
                  {!dashboardStats.jadwal_hari_ini || dashboardStats.jadwal_hari_ini.length === 0 ? (
                    <p className="text-sm text-gray-400 py-8 text-center font-medium">Tidak ada jadwal mengajar hari ini.</p>
                  ) : (
                    dashboardStats.jadwal_hari_ini.map((sched, idx) => (
                      <div key={idx} className="flex items-center p-4 rounded-xl border-l-4 border-emerald-600 bg-green-50/10 transition duration-150">
                        <div className="w-24 font-extrabold text-sm text-gray-900 pr-2">{sched.jam_mulai} - {sched.jam_selesai}</div>
                        <div className="flex-1 pl-4 border-l border-gray-200/60 text-left">
                          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{sched.kelas?.nama_kelas || 'Umum'}</p>
                          <h4 className="text-sm font-extrabold text-gray-900 mt-0.5">{sched.mapel?.nama_mapel}</h4>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="md:col-span-1 rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-2">Persetujuan Perizinan</h3>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Terdapat <strong className="text-amber-600">{dashboardStats.total_perizinan_pending || 0} pengajuan perizinan</strong> siswa yang menunggu persetujuan Anda.
                  </p>
                </div>
                <Link
                  to="/dashboard?tab=perizinan"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition text-center text-xs block cursor-pointer"
                >
                  Proses Perizinan
                </Link>
              </div>
            </section>
          </div>
        )}

        {roleNorm === 'siswa' && (
          <div className="space-y-8">
            {/* Student Dashboard Grid */}
            <section className="grid gap-6 md:grid-cols-3">
              {/* Profile Card */}
              <div className="md:col-span-1 rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
                <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-2">Profil Singkat</h3>
                {dashboardStats.profil_siswa ? (
                  <div className="space-y-3">
                    <div className="h-16 w-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-2xl">
                      {getInitials(dashboardStats.profil_siswa.nama)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-950 text-base">{dashboardStats.profil_siswa.nama}</h4>
                      <p className="text-xs text-gray-500">NIS: {dashboardStats.profil_siswa.nis}</p>
                      <p className="text-xs text-gray-500">Kelas: {dashboardStats.profil_siswa.kelas?.nama_kelas || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Memuat profil...</p>
                )}
              </div>

              {/* Today's Schedule */}
              <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
                <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-2">Jadwal Pelajaran Hari Ini ({getIndonesianDayName()})</h3>
                <div className="space-y-3">
                  {!dashboardStats.jadwal_hari_ini || dashboardStats.jadwal_hari_ini.length === 0 ? (
                    <p className="text-sm text-gray-400 py-8 text-center font-medium">Tidak ada jadwal pelajaran hari ini.</p>
                  ) : (
                    dashboardStats.jadwal_hari_ini.map((sched, idx) => (
                      <div key={idx} className="flex items-center p-4 rounded-xl border-l-4 border-green-600 bg-green-50/10 transition duration-150">
                        <div className="w-24 font-extrabold text-sm text-gray-900 pr-2">{sched.jam_mulai} - {sched.jam_selesai}</div>
                        <div className="flex-1 pl-4 border-l border-gray-200/60 text-left">
                          <h4 className="text-sm font-extrabold text-gray-900">{sched.mapel?.nama_mapel}</h4>
                          <p className="text-[10px] text-gray-500 mt-1 font-semibold">Guru: {sched.guru?.nama || '-'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Recent Permits */}
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="font-extrabold text-gray-900 text-base">Riwayat Perizinan Terakhir</h3>
                <Link to="/dashboard?tab=perizinan" className="text-xs font-bold text-green-600 hover:text-green-700">Lihat Semua &rarr;</Link>
              </div>
              <div className="space-y-3">
                {!dashboardStats.riwayat_perizinan || dashboardStats.riwayat_perizinan.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center font-medium">Belum ada riwayat permohonan perizinan.</p>
                ) : (
                  dashboardStats.riwayat_perizinan.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            p.tipe === 'Sakit' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {p.tipe}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">
                            {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} s.d {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">{p.alasan}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : p.status === 'Disetujui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {renderTabContent()}
    </div>
  );
}

export default DashboardPage;
