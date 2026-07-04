import { useState, useEffect } from 'react';
import { entityService } from '../../services/api';
import api from '../../services/api';
import EmptyState from '../common/EmptyState';
import swalAlert from '../../utils/swal';

function UserManagementTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null); // to track ongoing toggle/reset loading per user

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await entityService.list('/users');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data pengguna dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;
    const actionText = newStatus ? 'mengaktifkan' : 'menonaktifkan';
    
    const confirmResult = await swalAlert.confirm(
      `Apakah Anda yakin?`,
      `Anda akan ${actionText} akun ${user.name}.`,
      `Ya, ${newStatus ? 'Aktifkan' : 'Nonaktifkan'}`,
      'Batal'
    );

    if (!confirmResult.isConfirmed) return;

    setActionId(user.id);
    try {
      await api.put(`/users/${user.id}/status`, { is_active: newStatus });
      swalAlert.toast('success', `Akun ${user.name} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
      );
    } catch (err) {
      console.error(err);
      swalAlert.error('Gagal', err.response?.data?.message || `Gagal mengubah status akun ${user.name}.`);
    } finally {
      setActionId(null);
    }
  };

  const handleResetPassword = async (user) => {
    const confirmResult = await swalAlert.confirm(
      `Reset Password?`,
      `Apakah Anda yakin ingin mereset password untuk akun ${user.name}? Password lama akan terhapus.`,
      'Ya, Reset',
      'Batal'
    );

    if (!confirmResult.isConfirmed) return;

    setActionId(user.id);
    try {
      const response = await api.put(`/users/${user.id}/reset-password`);
      const newPassword = response.data.data.password;
      
      await swalAlert.success(
        'Password Berhasil Direset',
        `Password baru untuk ${user.name} adalah:\n\n${newPassword}\n\nSilakan salin dan berikan password ini kepada pengguna.`
      );
    } catch (err) {
      console.error(err);
      swalAlert.error('Gagal', err.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setActionId(null);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-gray-200 pb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Sistem Akun</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">User Management</h2>
        </div>
        <button
          onClick={fetchUsers}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer"
        >
          🔄 Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500">Memuat data pengguna...</p>
        </div>
      ) : error ? (
        <EmptyState title="Terjadi Kesalahan" description={error} />
      ) : totalUsers === 0 ? (
        <EmptyState title="Belum Ada Data Pengguna" description="Tidak ada data pengguna terdaftar di sistem." />
      ) : (
        <div className="space-y-6 animate-fade-in-up">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Pengguna</span>
              <p className="mt-1 text-2xl font-extrabold text-gray-900">{totalUsers}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-green-600">Akun Aktif</span>
              <p className="mt-1 text-2xl font-extrabold text-green-700">{activeUsers}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Akun Nonaktif</span>
              <p className="mt-1 text-2xl font-extrabold text-red-600">{inactiveUsers}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Nama Pengguna</th>
                    <th className="px-6 py-4 font-bold">Hak Akses (Role)</th>
                    <th className="px-6 py-4 font-bold">Login Identifier</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white/60">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-green-50/30 transition">
                      <td className="px-6 py-4.5 font-bold text-gray-900">{user.name}</td>
                      <td className="px-6 py-4.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            user.role === 'admin'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : user.role === 'guru'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-gray-700">{user.identifier}</td>
                      <td className="px-6 py-4.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            user.is_active
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-red-50 border-red-200 text-red-700'
                          }`}
                        >
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right flex justify-end gap-2.5">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={actionId === user.id}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-bold cursor-pointer transition ${
                            user.is_active
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {user.is_active ? 'Deaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          disabled={actionId === user.id}
                          className="rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-55/20 px-3 py-1.5 text-xs font-bold cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🔑 Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementTab;
