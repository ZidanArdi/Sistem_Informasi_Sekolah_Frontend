import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'staff',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await authService.login({
          email: form.email,
          password: form.password,
        });

        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        navigate('/dashboard', { replace: true });
        return;
      }

      await authService.register(form);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Proses autentikasi gagal. Silakan periksa kembali email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-green-50">
      {/* Left Panel: Graphic Branding Banner */}
      <div className="relative w-full md:w-1/2 bg-gradient-to-br from-green-800 via-green-950 to-emerald-950 p-8 sm:p-12 md:p-16 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-green-800/30">
        {/* Glow Spheres */}
        <div className="absolute -left-16 -top-16 w-72 h-72 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Brand Logo Header */}
        <div className="relative flex items-center gap-3">
          <img src="/favicon.svg" alt="Logo" className="h-10 w-10 object-contain filter invert-0 brightness-110" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-green-400">Portal Akademik</span>
            <h1 className="text-sm font-extrabold text-white tracking-wide">Sistem Informasi Sekolah</h1>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative my-auto py-12 md:py-0 max-w-lg animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Sistem Informasi Sekolah
          </h2>
          <p className="mt-4 text-sm sm:text-base text-green-200 leading-relaxed font-medium">
            Mendukung pengelolaan data akademik secara efisien, modern, dan terintegrasi.
          </p>
        </div>

        {/* Footer Notes */}
        <div className="relative text-xs text-green-300 font-medium">
          © {new Date().getFullYear()} Sistem Informasi Sekolah. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Auth Form Screen */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white">
        <div className="w-full max-w-md rounded-2xl glass-card bg-white p-8 border border-gray-200 shadow-xl animate-scale-up">
          <div className="mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-green-600">Portal Akademik</span>
            <h2 className="mt-1 text-2xl font-extrabold text-gray-900 tracking-tight">
              {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
            </h2>
            <p className="mt-1.5 text-xs text-gray-500 font-medium">
              {isLogin ? 'Masukkan email dan password untuk masuk ke dasbor.' : 'Lengkapi formulir di bawah untuk mendaftar.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700 leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.nama}
                  required
                  placeholder="Contoh: Andi Setiawan"
                  onChange={(event) => updateForm('nama', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Alamat Email</label>
              <input
                type="email"
                value={form.email}
                required
                placeholder="operator@sekolah.com"
                onChange={(event) => updateForm('email', event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Kata Sandi (Password)</label>
              <input
                type="password"
                value={form.password}
                minLength={6}
                required
                placeholder="Minimal 6 karakter"
                onChange={(event) => updateForm('password', event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Pilih Hak Akses (Role)</label>
                <select
                  value={form.role}
                  onChange={(event) => updateForm('role', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 cursor-pointer"
                >
                  <option value="staff">Staff Tata Usaha (TU)</option>
                  <option value="guru">Guru Pengajar</option>
                  <option value="siswa">Siswa Akademik</option>
                  <option value="admin">Administrator Sistem</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 py-3.5 text-sm font-bold text-white transition-all duration-300 shadow-md shadow-green-500/20 active:scale-98 cursor-pointer"
            >
              {loading ? 'Memverifikasi...' : isLogin ? 'Masuk ke Dasbor' : 'Daftarkan Akun Baru'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-150 pt-5 text-center text-xs font-semibold text-gray-500">
            {isLogin ? 'Belum terdaftar di sistem?' : 'Sudah terdaftar?'}{' '}
            <Link 
              className="text-green-600 hover:text-green-700 transition underline-offset-4 hover:underline ml-1" 
              to={isLogin ? '/register' : '/login'}
            >
              {isLogin ? 'Buat Akun Di Sini' : 'Masuk Di Sini'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
