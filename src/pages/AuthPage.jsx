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
      setError(err.response?.data?.message || 'Proses autentikasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sistem Informasi Sekolah</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {isLogin ? 'Login' : 'Register'}
          </h1>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <label className="block text-sm font-medium text-slate-700">
              Nama
              <input
                value={form.nama}
                required
                onChange={(event) => updateForm('nama', event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={form.email}
              required
              onChange={(event) => updateForm('email', event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              value={form.password}
              minLength={6}
              required
              onChange={(event) => updateForm('password', event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {!isLogin && (
            <label className="block text-sm font-medium text-slate-700">
              Role
              <select
                value={form.role}
                onChange={(event) => updateForm('role', event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                <option value="staff">Staff</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Memproses...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <Link className="font-semibold text-slate-950 underline-offset-4 hover:underline" to={isLogin ? '/register' : '/login'}>
            {isLogin ? 'Register' : 'Login'}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
