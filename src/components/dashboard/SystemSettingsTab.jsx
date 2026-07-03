import React from 'react';
import swalAlert from '../../utils/swal';

function SystemSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Konfigurasi Aplikasi</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h2>
        </div>
        <button 
          onClick={() => swalAlert.success('Pengaturan', 'Semua pengaturan sistem berhasil disimpan!')}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer w-fit"
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

export default SystemSettingsTab;
