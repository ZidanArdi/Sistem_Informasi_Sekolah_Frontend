import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StateBlock from '../StateBlock';
import EmptyState from '../common/EmptyState';

function PerizinanTab({ roleNorm }) {
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPerizinan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/perizinan');
      setListData(res.data.data || []);
    } catch (err) {
      setError('Gagal memuat data monitoring perizinan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerizinan();
  }, []);

  if (loading) {
    return <StateBlock tone="loading" />;
  }

  if (error) {
    return <StateBlock title={error} tone="danger" onRetry={fetchPerizinan} />;
  }

  // Calculate summary statistics
  const pendingCount = listData.filter(p => p.status === 'Pending').length;
  const approvedCount = listData.filter(p => p.status === 'Disetujui' || p.status === 'Approved').length;
  const rejectedCount = listData.filter(p => p.status === 'Ditolak' || p.status === 'Rejected').length;
  const totalCount = listData.length;

  return (
    <div className="space-y-6 text-left animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Operasional Sekolah</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Monitoring Perizinan</h2>
        </div>
      </div>

      {/* Phase 5 Notice Banner */}
      <div className="rounded-2xl border-l-4 border-amber-500 bg-amber-50/50 p-4 text-xs font-bold text-amber-800 flex items-center gap-2">
        <span>🚧</span>
        <span>Approval workflow will be implemented in Phase 5. Approval/rejection buttons are disabled.</span>
      </div>

      {/* Summary Cards Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending Requests', value: pendingCount, desc: 'Menunggu persetujuan guru', color: 'from-amber-500 to-orange-500', icon: '⏳' },
          { label: 'Approved Requests', value: approvedCount, desc: 'Permohonan disetujui', color: 'from-green-500 to-emerald-600', icon: '✅' },
          { label: 'Rejected Requests', value: rejectedCount, desc: 'Permohonan ditolak', color: 'from-red-500 to-rose-600', icon: '❌' },
          { label: 'Total Requests', value: totalCount, desc: 'Total log perizinan masuk', color: 'from-gray-500 to-slate-600', icon: '📋' }
        ].map((item) => (
          <div key={item.label} className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">{item.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-gray-900 tracking-tight">{item.value}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-lg">
                {item.icon}
              </div>
            </div>
            <p className="mt-3 text-[10px] font-medium text-gray-500">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Recent Requests Table */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <h3 className="px-6 py-4 font-extrabold text-gray-950 border-b border-gray-100 text-sm">
          Log Permohonan Terbaru
        </h3>
        
        {listData.length === 0 ? (
          <div className="p-8">
            <EmptyState title="Belum Ada Perizinan" description="Tidak ada riwayat pengajuan perizinan siswa." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 bg-green-50/20 text-xs font-bold uppercase tracking-wider text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-bold">Student</th>
                  <th className="px-6 py-4 font-bold">Request Type</th>
                  <th className="px-6 py-4 font-bold">Submission Date</th>
                  <th className="px-6 py-4 font-bold">Current Status</th>
                  <th className="px-6 py-4 font-bold">Requested By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white font-semibold">
                {listData.map((p) => {
                  const submitDate = p.created_at
                    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(p.created_at))
                    : '-';

                  return (
                    <tr key={p.id} className="transition-colors hover:bg-green-50/10">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {p.siswa?.nama || '-'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="inline-flex rounded-lg bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 font-bold">
                          {p.tipe || 'Izin'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {submitDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          p.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          p.status === 'Disetujui' || p.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-700' :
                          'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {p.siswa?.nama || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PerizinanTab;
