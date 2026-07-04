import { useState } from 'react';
import EmptyState from '../common/EmptyState';

function PerizinanTab({ roleNorm }) {
  // Local state for form inputs (currently inactive / disabled)
  const [newPermitType, setNewPermitType] = useState('Sakit');
  const [newPermitStartDate, setNewPermitStartDate] = useState('');
  const [newPermitEndDate, setNewPermitEndDate] = useState('');
  const [newPermitReason, setNewPermitReason] = useState('');
  const [newPermitAttachment, setNewPermitAttachment] = useState('');

  const handleFakeSubmit = (e) => {
    e.preventDefault();
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
          <h4 className="text-sm font-bold text-amber-800">Fitur dalam Tahap Pengembangan</h4>
          <p className="text-xs text-amber-750 mt-1 leading-relaxed">Fitur perizinan sedang dalam tahap pengembangan.</p>
        </div>
      </div>

      {roleNorm === 'siswa' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Inactive Form Card */}
          <div className="md:col-span-1 rounded-3xl bg-white p-6 shadow-sm border border-gray-200 h-fit space-y-4 opacity-80">
            <h3 className="text-lg font-extrabold text-gray-955 border-b border-gray-150 pb-2">Ajukan Surat Sakit / Izin</h3>
            <form onSubmit={handleFakeSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tipe Perizinan</label>
                <select
                  disabled
                  value={newPermitType}
                  onChange={(e) => setNewPermitType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                >
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Mulai</label>
                <input
                  disabled
                  type="date"
                  value={newPermitStartDate}
                  onChange={(e) => setNewPermitStartDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Selesai</label>
                <input
                  disabled
                  type="date"
                  value={newPermitEndDate}
                  onChange={(e) => setNewPermitEndDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Alasan Perizinan</label>
                <textarea
                  disabled
                  value={newPermitReason}
                  onChange={(e) => setNewPermitReason(e.target.value)}
                  rows={3}
                  placeholder="Masukkan alasan detail ketidakhadiran..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">URL Dokumen Pendukung (Opsional)</label>
                <input
                  disabled
                  type="url"
                  value={newPermitAttachment}
                  onChange={(e) => setNewPermitAttachment(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled
                className="w-full bg-gray-200 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed opacity-70 shadow-sm"
              >
                Kirim Permohonan (Coming Soon)
              </button>
            </form>
          </div>

          {/* Standardized Empty State View */}
          <div className="md:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-lg font-extrabold text-gray-950 border-b border-gray-150 pb-2">Riwayat Pengajuan Izin Anda</h3>
            <EmptyState 
              title="Belum Ada Perizinan" 
              description="Belum ada data perizinan." 
            />
          </div>
        </div>
      )}

      {roleNorm === 'guru' && (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-extrabold text-gray-955 border-b border-gray-150 pb-2">Pengajuan Perizinan Siswa (Menunggu Persetujuan)</h3>
          <EmptyState 
            title="Belum Ada Perizinan" 
            description="Belum ada data perizinan." 
          />
        </div>
      )}

      {roleNorm === 'admin' && (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-extrabold text-gray-955 border-b border-gray-150 pb-2">Monitoring Seluruh Perizinan Siswa</h3>
          <EmptyState 
            title="Belum Ada Perizinan" 
            description="Belum ada data perizinan." 
          />
        </div>
      )}
    </div>
  );
}

export default PerizinanTab;
