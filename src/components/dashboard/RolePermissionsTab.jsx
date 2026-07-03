import React from 'react';
import swalAlert from '../../utils/swal';

function RolePermissionsTab() {
  const permissionMatrix = [
    { module: 'Data Guru', admin: true, guru: false, siswa: false },
    { module: 'Data Siswa', admin: true, guru: true, siswa: false },
    { module: 'Data Kelas', admin: true, guru: false, siswa: false },
    { module: 'Jadwal Pelajaran', admin: true, guru: false, siswa: false },
    { module: 'Nilai Akademik (Write)', admin: true, guru: true, siswa: false },
    { module: 'Nilai Akademik (Read)', admin: true, guru: true, siswa: true },
    { module: 'Absensi Siswa', admin: true, guru: true, siswa: false },
    { module: 'System Settings', admin: true, guru: false, siswa: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Sistem Keamanan</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Role Permissions</h2>
        </div>
        <button 
          onClick={() => swalAlert.success('Hak Akses', 'Perubahan hak akses berhasil disimpan!')}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer w-fit"
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
                <th className="px-6 py-4.5 font-bold text-center">Guru</th>
                <th className="px-6 py-4.5 font-bold text-center">Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 bg-white/60">
              {permissionMatrix.map((matrix, idx) => (
                <tr key={idx} className="hover:bg-green-50/50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900 text-left">{matrix.module}</td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={matrix.admin} 
                      className="h-4.5 w-4.5 rounded border-gray-305 text-green-650 text-green-600 focus:ring-green-500 cursor-pointer" 
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={matrix.guru} 
                      className="h-4.5 w-4.5 rounded border-gray-305 text-green-650 text-green-600 focus:ring-green-500 cursor-pointer" 
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={matrix.siswa} 
                      className="h-4.5 w-4.5 rounded border-gray-305 text-green-650 text-green-600 focus:ring-green-500 cursor-pointer" 
                    />
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

export default RolePermissionsTab;
