import EmptyState from '../common/EmptyState';

function RolePermissionsTab() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Sistem Keamanan</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Role Permissions</h2>
      </div>
      <EmptyState
        title="Hak Akses Belum Tersedia"
        description="Konfigurasi hak akses belum terhubung ke server."
      />
    </div>
  );
}

export default RolePermissionsTab;
