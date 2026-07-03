import React from 'react';
import swalAlert from '../../utils/swal';

function UserManagementTab() {
  const mockUsers = [
    { email: 'admin@sekolah.com', role: 'administrator', status: 'Aktif' },
    { email: 'guru@sekolah.com', role: 'guru', status: 'Aktif' },
    { email: 'admin2@sekolah.com', role: 'administrator', status: 'Aktif' },
    { email: 'siswa@sekolah.com', role: 'siswa', status: 'Aktif' },
    { email: 'clara@sekolah.com', role: 'guru', status: 'Aktif' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Sistem Akun</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h2>
        </div>
        <button 
          onClick={() => swalAlert.info('Dalam Pengembangan', 'Fitur menambah user baru sedang dalam tahap pengembangan.')}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer w-fit"
        >
          + Tambah Akun Baru
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4.5 font-bold">Email Pengguna</th>
                <th className="px-6 py-4.5 font-bold">Hak Akses (Role)</th>
                <th className="px-6 py-4.5 font-bold">Status Keaktifan</th>
                <th className="px-6 py-4.5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 bg-white/60">
              {mockUsers.map((u, idx) => (
                <tr key={idx} className="hover:bg-green-50/50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900 text-left">{u.email}</td>
                  <td className="px-6 py-4 text-left">
                    <span className="capitalize bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-gray-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => swalAlert.info('Dalam Pengembangan', 'Fitur edit akun dalam pengembangan.')}
                      className="bg-green-50 hover:bg-green-600 hover:text-white border border-green-150 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Ubah
                    </button>
                    <button 
                      onClick={() => swalAlert.info('Dalam Pengembangan', 'Fitur hapus akun dalam pengembangan.')}
                      className="bg-red-50 hover:bg-red-650 hover:text-white border border-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Hapus
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

export default UserManagementTab;
