import React from 'react';

function InfoRow({ label, value, badge }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 text-sm font-semibold">
      <span className="text-gray-500">{label}</span>
      {badge ? (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
          value.toLowerCase().includes('online') || value.toLowerCase().includes('aktif')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {value}
        </span>
      ) : (
        <span className="text-gray-900 font-bold">{value}</span>
      )}
    </div>
  );
}

function SettingCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-green-500/5 blur-xl pointer-events-none" />
      <div>
        <h3 className="text-base font-extrabold text-gray-950 border-b border-gray-100 pb-3 mb-4 text-left">
          {title}
        </h3>
        <div className="space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function SystemSettingsTab() {
  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-gray-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Konfigurasi Aplikasi</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">System Settings</h2>
      </div>

      {/* Grid Cards layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: System Information */}
        <SettingCard title="System Information">
          <InfoRow label="Application Name" value="Sistem Informasi Sekolah" />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Environment" value="Production" />
          <InfoRow label="Language" value="Bahasa Indonesia" />
          <InfoRow label="Timezone" value="Asia/Jakarta (WIB)" />
        </SettingCard>

        {/* Card 2: Academic Configuration */}
        <SettingCard title="Academic Configuration">
          <InfoRow label="Academic Year" value="2024/2025" />
          <InfoRow label="Current Semester" value="Ganjil" />
          <InfoRow label="Status" value="🟢 Aktif" badge />
        </SettingCard>

        {/* Card 3: Server Status */}
        <SettingCard title="Server Status">
          <InfoRow label="Backend API" value="🟢 Online" badge />
          <InfoRow label="Database" value="🟢 Online" badge />
          <InfoRow label="Storage" value="🟢 Online" badge />
          <InfoRow label="Upload Directory" value="🟢 Online" badge />
        </SettingCard>

        {/* Card 4: Build Information */}
        <SettingCard title="Build Information">
          <InfoRow label="Frontend" value="Vite + React (Built)" />
          <InfoRow label="Backend" value="Go Fiber (Compiled)" />
          <InfoRow label="Database Engine" value="PostgreSQL 15" />
          <InfoRow label="Build Version" value="v1.0.0-stable" />
        </SettingCard>

        {/* Card 5: Development Information */}
        <SettingCard title="Development Information">
          <InfoRow label="Project Name" value="Sistem Informasi Sekolah" />
          <InfoRow label="Project Type" value="Tugas Pemrograman 3" />
          <InfoRow label="University" value="Universitas Indonesia" />
          <InfoRow label="Developer" value="Tim Pengembang SIS" />
        </SettingCard>
      </div>

      <p className="text-xs text-gray-400 italic text-center mt-6 block">
        This page is intended for informational and auditing purposes only. All settings are read-only.
      </p>
    </div>
  );
}

export default SystemSettingsTab;
