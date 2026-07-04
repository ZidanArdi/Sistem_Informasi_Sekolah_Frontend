import EmptyState from '../common/EmptyState';

function PengumumanTab() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Pemberitahuan</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Pengumuman Sekolah</h2>
      </div>
      <EmptyState
        title="Pengumuman Belum Tersedia"
        description="Fitur pengumuman dinonaktifkan sementara."
      />
    </div>
  );
}

export default PengumumanTab;
