import React from 'react';

const permissionsMatrix = [
  { module: 'Dashboard', admin: 'allowed', teacher: 'allowed', student: 'allowed' },
  { module: 'Profile', admin: 'allowed', teacher: 'allowed', student: 'allowed' },
  { module: 'Change Password', admin: 'allowed', teacher: 'allowed', student: 'allowed' },
  { module: 'Teacher Data', admin: 'allowed', teacher: 'denied', student: 'denied' },
  { module: 'Student Data', admin: 'allowed', teacher: 'allowed', student: 'denied' },
  { module: 'Subjects', admin: 'allowed', teacher: 'denied', student: 'denied' },
  { module: 'Classes', admin: 'allowed', teacher: 'denied', student: 'denied' },
  { module: 'Schedules', admin: 'allowed', teacher: 'allowed', student: 'allowed' },
  { module: 'Academic Grades', admin: 'allowed', teacher: 'allowed', student: 'allowed' },
  { module: 'User Management', admin: 'allowed', teacher: 'denied', student: 'denied' },
  { module: 'Role Permission', admin: 'allowed', teacher: 'denied', student: 'denied' },
  { module: 'System Setting', admin: 'allowed', teacher: 'denied', student: 'denied' },
  { module: 'Attendance', admin: 'soon', teacher: 'soon', student: 'soon' },
  { module: 'Permission', admin: 'soon', teacher: 'soon', student: 'soon' },
];

function RenderStatusBadge({ status }) {
  if (status === 'allowed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-200">
        ✅ Allowed
      </span>
    );
  }
  if (status === 'denied') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
        ❌ Not Allowed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700 border border-yellow-200">
      🚧 Coming Soon
    </span>
  );
}

function RolePermissionsTab() {
  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-gray-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Dokumentasi Akses</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Role Permission</h2>
        <p className="mt-2 text-sm text-gray-500 font-semibold leading-relaxed">
          View-only documentation of all system access rights.
          Permissions are enforced by the backend and cannot be modified through the application.
        </p>
      </div>

      {/* Permission Matrix Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-green-50/30 text-xs font-bold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="px-6 py-4 font-bold">Module</th>
                <th className="px-6 py-4 font-bold text-center">Administrator</th>
                <th className="px-6 py-4 font-bold text-center">Teacher</th>
                <th className="px-6 py-4 font-bold text-center">Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white font-semibold">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="transition-colors hover:bg-green-50/10">
                  <td className="px-6 py-4 font-bold text-gray-900">{item.module}</td>
                  <td className="px-6 py-4 text-center">
                    <RenderStatusBadge status={item.admin} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RenderStatusBadge status={item.teacher} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RenderStatusBadge status={item.student} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend Block */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-sm font-extrabold text-gray-950 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-lg bg-green-50 border border-green-200 text-green-700 px-2.5 py-1">✅</span>
            <span className="text-gray-600">Allowed / Diizinkan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-lg bg-red-50 border border-red-200 text-red-700 px-2.5 py-1">❌</span>
            <span className="text-gray-600">Not Allowed / Ditolak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-lg bg-yellow-50 border border-yellow-250 text-yellow-700 px-2.5 py-1">🚧</span>
            <span className="text-gray-600">Coming Soon / Tahap Pengembangan</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RolePermissionsTab;
