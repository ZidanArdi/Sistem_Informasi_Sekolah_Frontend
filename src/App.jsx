import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import EntityManagerPage from './pages/EntityManagerPage';
import ForceChangePasswordPage from './pages/ForceChangePasswordPage';
import StudentProfilePage from './pages/StudentProfilePage';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import api from './services/api';

function SiswaList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/siswa');
        const result = response.data;
        setStudents(result.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Gagal mengambil data dari server');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 w-full min-h-screen relative animate-fade-in-up">
      {/* Top Header Actions */}
      <div className="flex justify-end mb-6">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-md shadow-green-500/10 hover:shadow-green-500/20 cursor-pointer"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Masuk ke Dashboard
        </Link>
      </div>

      {/* Hero Header */}
      <header className="text-center mb-12 animate-fade-in-down">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-3 text-xs font-bold text-green-700">
          🏫 Portal Informasi Sekolah
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Sistem Informasi Akademik
        </h1>
        <p className="text-gray-500 text-base sm:text-lg font-medium max-w-xl mx-auto">
          Daftar direktori informasi siswa aktif yang terdaftar di database sekolah.
        </p>
      </header>

      {/* Main List Box */}
      <main className="mt-8">
        {loading && (
          <div className="text-center p-16 rounded-2xl glass-card text-gray-500 font-bold text-lg animate-pulse">
            Memuat database siswa...
          </div>
        )}
        
        {error && (
          <div className="text-center p-16 rounded-2xl glass-card text-red-600 font-bold text-lg border-l-4 border-red-500 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <div className="text-center p-16 rounded-2xl glass-card text-gray-450 font-bold text-lg">
            Belum ada data siswa terdaftar.
          </div>
        )}

        {!loading && !error && students.length > 0 && (
          <div className="rounded-2xl glass-card shadow-sm border border-gray-250/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px] border-collapse">
                <thead className="bg-green-50/75 backdrop-blur-sm border-b border-gray-200">
                  <tr>
                    <th className="text-gray-700 font-bold p-5 text-xs uppercase tracking-wider">NIS</th>
                    <th className="text-gray-700 font-bold p-5 text-xs uppercase tracking-wider">Nama Lengkap</th>
                    <th className="text-gray-700 font-bold p-5 text-xs uppercase tracking-wider">Kelas</th>
                    <th className="text-gray-700 font-bold p-5 text-xs uppercase tracking-wider">Alamat Rumah</th>
                    <th className="text-gray-700 font-bold p-5 text-xs uppercase tracking-wider">Email Siswa</th>
                    <th className="text-gray-700 font-bold p-5 text-xs uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white/60">
                  {students.map((student) => (
                    <tr key={student.nis} className="hover:bg-green-50/50 transition duration-150 group">
                      <td className="p-5">
                        <span className="bg-green-50 border border-green-200 text-green-800 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          {student.nis}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-green-50 border border-green-200/50 flex items-center justify-center text-green-700 font-extrabold text-xs">
                            {getInitials(student.nama)}
                          </div>
                          <span className="text-gray-900 font-bold">{student.nama}</span>
                        </div>
                      </td>
                      <td className="p-5 text-gray-700 font-semibold">{student.kelas?.nama_kelas || '-'}</td>
                      <td className="p-5 text-gray-600 font-medium">{student.alamat}</td>
                      <td className="p-5 text-gray-600 font-medium">{student.email}</td>
                      <td className="p-5 text-right">
                        <button 
                          className="inline-flex items-center justify-center rounded-lg bg-green-50 border border-green-150 hover:bg-green-600 hover:text-white px-3.5 py-1.5 text-xs font-bold text-green-700 transition-all duration-150 cursor-pointer"
                          onClick={() => navigate(`/siswa/${student.nis}`)}
                        >
                          Detail Profil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SiswaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        const response = await api.get('/siswa');
        const result = response.data;
        const foundStudent = (result.data || []).find((s) => s.nis === id);

        if (!foundStudent) {
          throw new Error('Siswa tidak ditemukan');
        }

        setStudent(foundStudent);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Gagal mengambil data dari server');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetail();
  }, [id]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 w-full min-h-screen flex flex-col justify-center animate-fade-in-up">
      <main className="flex justify-center items-center flex-col">
        {loading && (
          <div className="text-center p-16 rounded-2xl glass-card text-slate-500 font-bold text-lg w-full max-w-2xl animate-pulse">
            Memuat profil siswa...
          </div>
        )}
        
        {error && (
          <div className="text-center p-16 rounded-2xl glass-card text-red-500 font-bold text-lg border-l-4 border-red-500 w-full max-w-2xl">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && student && (
          <div className="w-full max-w-2xl rounded-3xl glass-card bg-white border border-gray-200 p-8 sm:p-10 shadow-xl relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-green-500/5 blur-2xl animate-pulse-glow" />
            <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl animate-pulse-glow" />

            <div className="flex flex-col items-center mb-8 border-b border-gray-100 pb-8 relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-700 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-green-500/20 mb-4 animate-scale-up">
                {getInitials(student.nama)}
              </div>
              <span className="inline-block bg-green-50 border border-green-150 text-green-700 px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wide mb-3">
                NIS: {student.nis}
              </span>
              <h2 className="text-2xl sm:text-3xl text-gray-900 font-extrabold tracking-tight text-center">{student.nama}</h2>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center py-3 border-b border-gray-100">
                <span className="w-32 text-xs font-bold uppercase tracking-wider text-gray-400">Kelas</span>
                <span className="flex-1 text-gray-900 font-bold">{student.kelas?.nama_kelas || '-'}</span>
              </div>
              <div className="flex items-center py-3 border-b border-gray-100">
                <span className="w-32 text-xs font-bold uppercase tracking-wider text-gray-400">Alamat</span>
                <span className="flex-1 text-gray-800 font-semibold">{student.alamat}</span>
              </div>
              <div className="flex items-center py-3 border-b border-gray-100">
                <span className="w-32 text-xs font-bold uppercase tracking-wider text-gray-400">Email</span>
                <span className="flex-1 text-gray-800 font-semibold">{student.email}</span>
              </div>
              <div className="flex items-center py-3">
                <span className="w-32 text-xs font-bold uppercase tracking-wider text-gray-400">Terdaftar</span>
                <span className="flex-1 text-gray-700 font-semibold">
                  {new Date(student.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <button 
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 border-none px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-0.5 active:scale-98"
              onClick={() => navigate('/')}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Daftar Siswa
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/public/students" element={<SiswaList />} />
        <Route path="/siswa/:id" element={<SiswaDetail />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        {/* Protected Dashboard and Data Management Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ForceChangePasswordPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/siswa/:id" element={<StudentProfilePage />} />
            <Route path="/data/:entity" element={<EntityManagerPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
