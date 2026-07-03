import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function ForceChangePasswordPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword
      });

      setSuccess('Password berhasil diubah! Mengalihkan ke dashboard...');
      
      // Update local storage user flag
      const updatedUser = { ...user, is_first_login: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-green-50 p-6 sm:p-12">
      {/* Glow Spheres */}
      <div className="absolute -left-16 -top-16 w-72 h-72 rounded-full bg-green-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 border border-gray-200 shadow-2xl relative overflow-hidden text-left animate-scale-up">
        <div className="mb-6 relative">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3.5 py-1 mb-4 text-xs font-bold text-amber-700">
            ⚠️ Login Pertama Kali
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Ganti Password Wajib</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
            Untuk menjaga keamanan akun Anda, silakan ubah password default Anda sebelum dapat mengakses dashboard akademik.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 animate-shake">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-bold text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Password Sementara / Lama</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Password Baru</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition duration-150 active:scale-[0.98] shadow-md shadow-green-500/10 cursor-pointer disabled:bg-gray-400"
          >
            {loading ? 'Mengubah Password...' : 'Simpan & Masuk Ke Dashboard'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-150 pt-5 text-center">
          <button 
            type="button" 
            onClick={handleLogout} 
            className="text-xs font-extrabold text-red-600 hover:text-red-700 hover:underline transition cursor-pointer"
          >
            Batal dan Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForceChangePasswordPage;
