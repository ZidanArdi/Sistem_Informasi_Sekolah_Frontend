import React, { useState } from 'react';

function PerizinanTab({ roleNorm, user }) {
  // Local state for the interactive form inputs (active and ready)
  const [newPermitType, setNewPermitType] = useState('Sakit');
  const [newPermitStartDate, setNewPermitStartDate] = useState('');
  const [newPermitEndDate, setNewPermitEndDate] = useState('');
  const [newPermitReason, setNewPermitReason] = useState('');
  const [newPermitAttachment, setNewPermitAttachment] = useState('');

  // Dummy empty list to represent empty state
  const perizinanList = [];

  const handleFakeSubmit = (e) => {
    e.preventDefault();
    // Do nothing since submit is visually coming soon / disabled
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-left">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Layanan Kehadiran</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Permohonan Izin & Sakit</h2>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5">
        <span className="text-xl shrink-0 mt-0.5">⚠️</span>
        <div>
          <h4 className="text-sm font-bold text-amber-800">Fitur dalam Tahap Integrasi</h4>
          <p className="text-xs text-amber-750 mt-1 leading-relaxed">Fitur perizinan sedang dalam tahap pengembangan. Formulir dapat diuji secara lokal namun pengiriman belum tersambung ke server.</p>
        </div>
      </div>

      {roleNorm === 'siswa' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Active Interactive Form */}
          <div className="md:col-span-1 rounded-3xl bg-white p-6 shadow-sm border border-gray-200 h-fit space-y-4">
            <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Ajukan Surat Sakit / Izin</h3>
            <form onSubmit={handleFakeSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tipe Perizinan</label>
                <select
                  value={newPermitType}
                  onChange={(e) => setNewPermitType(e.target.value)}
                  className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-medium text-gray-955 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/10 transition"
                >
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={newPermitStartDate}
                  onChange={(e) => setNewPermitStartDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-medium text-gray-955 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/10 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={newPermitEndDate}
                  onChange={(e) => setNewPermitEndDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-255 bg-white px-4 py-2.5 text-sm font-medium text-gray-955 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/10 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Alasan Perizinan</label>
                <textarea
                  value={newPermitReason}
                  onChange={(e) => setNewPermitReason(e.target.value)}
                  rows={3}
                  placeholder="Masukkan alasan detail ketidakhadiran..."
                  className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-medium text-gray-955 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/10 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">URL Dokumen Pendukung (Opsional)</label>
                <input
                  type="url"
                  value={newPermitAttachment}
                  onChange={(e) => setNewPermitAttachment(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-medium text-gray-955 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/10 transition"
                />
              </div>

              <button
                type="submit"
                disabled={true}
                className="w-full bg-green-600/55 text-white font-bold py-3 rounded-xl cursor-not-allowed opacity-75 shadow-sm transition"
              >
                Kirim Permohonan (Coming Soon)
              </button>
            </form>
          </div>

          {/* Riwayat Table (with empty state) */}
          <div className="md:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Riwayat Pengajuan Izin Anda</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-650 border-collapse">
                <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold">Tanggal</th>
                    <th className="p-4 font-bold">Tipe</th>
                    <th className="p-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white/60">
                  <tr>
                    <td colSpan="3" className="p-12 text-center text-gray-400 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-3xl">📁</span>
                        <p>Belum ada riwayat pengajuan.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {roleNorm === 'guru' && (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-extrabold text-gray-955 border-b border-gray-150 pb-2">Pengajuan Perizinan Siswa (Menunggu Persetujuan)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 border-collapse">
              <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold">Tanggal</th>
                  <th className="p-4 font-bold">Siswa</th>
                  <th className="p-4 font-bold">Kelas</th>
                  <th className="p-4 font-bold">Tipe</th>
                  <th className="p-4 font-bold">Alasan</th>
                  <th className="p-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white/60">
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">📁</span>
                      <p>Belum ada pengajuan izin/sakit yang perlu diproses.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {roleNorm === 'admin' && (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-extrabold text-gray-955 border-b border-gray-150 pb-2">Monitoring Seluruh Perizinan Siswa</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full border-collapse bg-white text-left text-xs text-gray-500">
              <thead className="bg-gray-50 font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Siswa</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Tanggal Izin</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Alasan</th>
                  <th className="px-6 py-4">Berkas</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Guru Approval</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">📁</span>
                      <p>Belum ada data permohonan perizinan di sistem.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerizinanTab;
