import { useState } from 'react';
import { authService } from '../../services/api';
import swalAlert from '../../utils/swal';

function ChangePasswordTab({ roleNorm }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (newPassword.length < 8 || !hasUpper || !hasLower || !hasNumber) {
      setError('Password baru harus minimal 8 karakter, mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      if (roleNorm === 'guru') {
        await authService.changePasswordGuru({
          old_password: oldPassword,
          new_password: newPassword,
        });
      } else {
        await authService.changePassword({
          old_password: oldPassword,
          new_password: newPassword,
        });
      }
      setSuccess('Password berhasil diubah!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      swalAlert.success('Berhasil', 'Password berhasil diubah!');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 text-left relative overflow-hidden">
      <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
      
      <div className="border-b border-gray-150 pb-3.5 mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Keamanan Akun</p>
        <h2 className="mt-1 text-2xl font-extrabold text-gray-950 tracking-tight">Ubah Password</h2>
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

      <form onSubmit={handleChangePassword} className="grid gap-6 max-w-xl">
        <label className="block text-left">
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Password Lama *</span>
          <input
            type="password"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Masukkan password saat ini"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
          />
        </label>

        <label className="block text-left">
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Password Baru *</span>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 karakter (harus mengandung A-Z, a-z, 0-9)"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
          />
        </label>

        <label className="block text-left">
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Konfirmasi Password Baru *</span>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password baru"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
          />
        </label>

        <div className="flex justify-start pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition duration-150 shadow-md shadow-green-500/10 cursor-pointer disabled:bg-gray-400 text-sm"
          >
            {loading ? 'Proses...' : 'Ubah Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePasswordTab;
