import React, { useState } from 'react';
import { authService } from '../../services/api';
import swalAlert from '../../utils/swal';

function ProfileTab({ user, roleNorm }) {
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
      if (roleNorm === 'guru') {
        await authService.changePasswordGuru({
          old_password: oldPassword,
          new_password: newPassword
        });
      } else {
        await authService.changePassword({
          old_password: oldPassword,
          new_password: newPassword
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Akun Pengguna</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Profil Lengkap</h2>
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
              <p className="mt-1.5 font-bold text-gray-900">{roleNorm === 'guru' ? (user.nip || '-') : (user.nis || '-')}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Email</p>
              <p className="mt-1.5 font-semibold text-gray-800">{user.email || 'user@sekolah.sch.id'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. Telepon / HP</p>
              <p className="mt-1.5 font-semibold text-gray-800">{user.no_hp || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jenis Kelamin</p>
              <p className="mt-1.5 font-semibold text-gray-800">{user.jenis_kelamin || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gelar Akademik</p>
              <p className="mt-1.5 font-semibold text-gray-800">{roleNorm === 'guru' ? (user.gelar || '-') : '-'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Rumah</p>
              <p className="mt-1.5 font-semibold text-gray-800">{user.alamat || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ubah Password Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 text-left relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <h4 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-3.5 mb-6">🔒 Keamanan Akun (Ubah Password)</h4>
        
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-bold text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid gap-6 md:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Password Lama</label>
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
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1">
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
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition duration-150 shadow-md shadow-green-500/10 cursor-pointer disabled:bg-gray-400 h-[46px]"
            >
              {loading ? 'Proses...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileTab;
