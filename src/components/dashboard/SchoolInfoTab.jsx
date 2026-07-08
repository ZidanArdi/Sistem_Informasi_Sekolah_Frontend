import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StateBlock from '../StateBlock';
import swalAlert from '../../utils/swal';

const DEFAULT_PROFILE = {
  logo: '',
  name: 'SMK Negeri 1 Jakarta',
  npsn: '20103289',
  status: 'Negeri',
  level: 'SMK / Sekolah Menengah Kejuruan',
  accreditation: 'A (Sangat Baik)',
  established_year: '1965',
  address: 'Jl. Budi Utomo No.7, Pasar Baru, Sawah Besar, Jakarta Pusat',
  postal_code: '10710',
  phone: '+62 21 3813622',
  email: 'info@smkn1jakarta.sch.id',
  website: 'www.smkn1jakarta.sch.id',
  principal_name: 'Dr. H. Purwosusilo, M.Pd.',
  principal_nip: '197205121998031002',
  principal_position: 'Kepala Sekolah',
  appointment_period: '2021 - 2025',
  academic_year: '2024/2025',
  current_semester: 'Ganjil',
  academic_status: '🟢 Aktif',
  school_type: 'Sekolah Menengah Kejuruan (SMK)',
  curriculum: 'Kurikulum Merdeka',
  shift: 'Pagi',
  operational_status: 'Aktif',
  vision: 'Menjadi lembaga pendidikan kejuruan yang unggul, berkarakter, dan berdaya saing global di era digital.',
  mission: 'Menyelenggarakan pembelajaran berbasis kompetensi teknologi industri dan keahlian terkini.\nMembina karakter siswa berlandaskan iman, taqwa, nilai Pancasila, dan budi pekerti luhur.\nMenjalin kemitraan erat dengan dunia usaha, dunia industri, dan asosiasi profesi (DUDI).\nMengembangkan semangat kewirausahaan, daya saing, dan kemandirian siswa.',
  facilities: 'Library, Computer Laboratory, Mosque, Workshop, Sports Field'
};

function InfoRow({ label, value, editing, onChange, type = 'text', textareaRows }) {
  if (editing) {
    return (
      <div className="flex flex-col gap-1 py-2 border-b border-gray-100 last:border-0 text-left text-sm font-semibold">
        <span className="text-gray-400 text-xs">{label}</span>
        {type === 'textarea' ? (
          <textarea
            rows={textareaRows || 2}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xs font-bold text-gray-900 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-green-500 focus:outline-none bg-white"
          />
        ) : (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xs font-bold text-gray-900 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-green-500 focus:outline-none bg-white"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 text-sm font-semibold">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-bold text-right ml-2">{value || '-'}</span>
    </div>
  );
}

function SettingCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-green-500/5 blur-xl pointer-events-none" />
      <div>
        <h3 className="text-base font-extrabold text-gray-955 border-b border-gray-100 pb-3 mb-4 text-left">
          {title}
        </h3>
        <div className="space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function SchoolInfoTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [tempProfile, setTempProfile] = useState(DEFAULT_PROFILE);

  const fetchSchoolStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data || {});
    } catch (err) {
      console.warn('Gagal memuat statistik sekolah:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolStats();
    
    // Load profile from localStorage
    const saved = localStorage.getItem('school_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure default properties are present
        const merged = { ...DEFAULT_PROFILE, ...parsed };
        setProfile(merged);
        setTempProfile(merged);
      } catch (err) {
        console.warn('Gagal memuat data profil sekolah dari localStorage:', err);
      }
    }
  }, []);

  const handleEditClick = () => {
    setTempProfile({ ...profile });
    setEditing(true);
  };

  const handleCancelClick = () => {
    setProfile({ ...tempProfile });
    setEditing(false);
  };

  const handleSaveClick = () => {
    localStorage.setItem('school_profile', JSON.stringify(profile));
    setTempProfile({ ...profile });
    setEditing(false);
    swalAlert.success('Berhasil', 'Profil Sekolah berhasil disimpan!');
  };

  if (loading) {
    return <StateBlock tone="loading" />;
  }

  // Split missions by newline
  const missionList = (profile.mission || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  // Split facilities by comma
  const facilityList = (profile.facilities || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Profil Lembaga</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Profil Sekolah</h2>
        </div>
        <div>
          {editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelClick}
                className="px-4 py-2 border border-gray-300 text-xs font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition cursor-pointer select-none bg-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-xs font-bold text-white rounded-xl transition cursor-pointer shadow-md shadow-green-500/10 active:scale-98 select-none"
              >
                Simpan Perubahan
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEditClick}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-xs font-bold text-white rounded-xl transition cursor-pointer shadow-md shadow-green-500/10 active:scale-98 flex items-center gap-1.5 select-none"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Profil</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row text-center sm:text-left">
          {/* Logo Circle */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-green-700 shadow-md">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          {/* School Identity */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {profile.name}
              </h1>
              <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white border border-white/10">
                Akreditasi {profile.accreditation?.split(' ')[0] || 'A'}
              </span>
              <span className="inline-flex rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white border border-green-400 shadow-sm">
                🟢 Aktif
              </span>
            </div>
            <p className="text-green-100 text-sm font-semibold max-w-xl">
              Sekolah Menengah Kejuruan Negeri 1 Jakarta - Menghasilkan lulusan yang siap kerja, mandiri, dan berkarakter mulia.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-1 text-xs font-bold text-green-50/90 pt-1">
              <span>NPSN: {profile.npsn}</span>
              <span>•</span>
              <span>Status: {profile.status}</span>
              <span>•</span>
              <span>Wilayah: DKI Jakarta</span>
            </div>
          </div>
        </div>
      </section>

      {/* responsive grid cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: School Identity */}
        <SettingCard title="School Identity">
          <InfoRow label="School Name" value={profile.name} editing={editing} onChange={(val) => setProfile({ ...profile, name: val })} />
          <InfoRow label="NPSN" value={profile.npsn} editing={editing} onChange={(val) => setProfile({ ...profile, npsn: val })} />
          <InfoRow label="Status" value={profile.status} editing={editing} onChange={(val) => setProfile({ ...profile, status: val })} />
          <InfoRow label="Level" value={profile.level} editing={editing} onChange={(val) => setProfile({ ...profile, level: val })} />
          <InfoRow label="Accreditation" value={profile.accreditation} editing={editing} onChange={(val) => setProfile({ ...profile, accreditation: val })} />
          <InfoRow label="Established Year" value={profile.established_year} editing={editing} onChange={(val) => setProfile({ ...profile, established_year: val })} />
        </SettingCard>

        {/* Card 2: Contact Information */}
        <SettingCard title="Contact Information">
          <InfoRow label="Address" value={profile.address} editing={editing} onChange={(val) => setProfile({ ...profile, address: val })} />
          <InfoRow label="Postal Code" value={profile.postal_code} editing={editing} onChange={(val) => setProfile({ ...profile, postal_code: val })} />
          <InfoRow label="Phone" value={profile.phone} editing={editing} onChange={(val) => setProfile({ ...profile, phone: val })} />
          <InfoRow label="Email" value={profile.email} editing={editing} onChange={(val) => setProfile({ ...profile, email: val })} />
          <InfoRow label="Website" value={profile.website} editing={editing} onChange={(val) => setProfile({ ...profile, website: val })} />
        </SettingCard>

        {/* Card 3: Principal */}
        <SettingCard title="Principal">
          <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-gray-100">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-green-500/10 to-emerald-500/10 border border-green-200 flex items-center justify-center overflow-hidden">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-green-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{profile.principal_name}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{profile.principal_position}</p>
            </div>
          </div>
          <InfoRow label="Name" value={profile.principal_name} editing={editing} onChange={(val) => setProfile({ ...profile, principal_name: val })} />
          <InfoRow label="Employee ID (NIP)" value={profile.principal_nip} editing={editing} onChange={(val) => setProfile({ ...profile, principal_nip: val })} />
          <InfoRow label="Position" value={profile.principal_position} editing={editing} onChange={(val) => setProfile({ ...profile, principal_position: val })} />
          <InfoRow label="Appointment Period" value={profile.appointment_period} editing={editing} onChange={(val) => setProfile({ ...profile, appointment_period: val })} />
        </SettingCard>

        {/* Card 4: School Statistics (Read-Only) */}
        <SettingCard title="School Statistics">
          <InfoRow label="Total Teachers" value={`${stats?.total_guru || 0} orang`} />
          <InfoRow label="Total Students" value={`${stats?.total_siswa || 0} orang`} />
          <InfoRow label="Total Classes" value={`${stats?.total_kelas || 0} kelas`} />
          <InfoRow label="Total Subjects" value={`${stats?.total_mapel || 0} mapel`} />
        </SettingCard>

        {/* Card 5: Academic Configuration */}
        <SettingCard title="Academic Configuration">
          <InfoRow label="Academic Year" value={profile.academic_year} editing={editing} onChange={(val) => setProfile({ ...profile, academic_year: val })} />
          <InfoRow label="Current Semester" value={profile.current_semester} editing={editing} onChange={(val) => setProfile({ ...profile, current_semester: val })} />
          <InfoRow label="Status" value={profile.academic_status} editing={editing} onChange={(val) => setProfile({ ...profile, academic_status: val })} />
        </SettingCard>

        {/* Card 6: Quick Facts */}
        <SettingCard title="Quick Facts">
          <InfoRow label="School Type" value={profile.school_type} editing={editing} onChange={(val) => setProfile({ ...profile, school_type: val })} />
          <InfoRow label="Curriculum" value={profile.curriculum} editing={editing} onChange={(val) => setProfile({ ...profile, curriculum: val })} />
          <InfoRow label="Shift" value={profile.shift} editing={editing} onChange={(val) => setProfile({ ...profile, shift: val })} />
          <InfoRow label="Operational Status" value={profile.operational_status} editing={editing} onChange={(val) => setProfile({ ...profile, operational_status: val })} />
        </SettingCard>

        {/* Card 9: Facilities */}
        <SettingCard title="Facilities">
          {editing ? (
            <div className="flex flex-col gap-1 text-left">
              <span className="text-gray-400 text-xs font-semibold">Facilities (pisahkan dengan koma)</span>
              <input
                type="text"
                value={profile.facilities || ''}
                onChange={(e) => setProfile({ ...profile, facilities: e.target.value })}
                className="w-full text-xs font-bold text-gray-900 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-green-500 focus:outline-none bg-white"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1 text-left">
              {facilityList.length === 0 ? (
                <span className="text-xs text-gray-400 italic">Belum ada fasilitas dimasukkan.</span>
              ) : (
                facilityList.map((fac) => (
                  <span
                    key={fac}
                    className="inline-flex rounded-xl bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 text-xs font-bold shadow-sm"
                  >
                    {fac}
                  </span>
                ))
              )}
            </div>
          )}
        </SettingCard>

        {/* Card 7: Vision (Span-2) */}
        <div className="md:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-green-500/5 blur-xl pointer-events-none" />
          <h3 className="text-base font-extrabold text-gray-955 border-b border-gray-100 pb-3 mb-4 text-left">
            Vision
          </h3>
          {editing ? (
            <textarea
              rows={2}
              value={profile.vision || ''}
              onChange={(e) => setProfile({ ...profile, vision: e.target.value })}
              className="w-full text-xs font-bold text-gray-900 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-green-500 focus:outline-none bg-white text-left"
            />
          ) : (
            <p className="text-sm font-semibold text-gray-700 italic leading-relaxed text-left">
              "{profile.vision}"
            </p>
          )}
        </div>

        {/* Card 8: Mission (Span-3) */}
        <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-green-500/5 blur-xl pointer-events-none" />
          <h3 className="text-base font-extrabold text-gray-955 border-b border-gray-100 pb-3 mb-4 text-left">
            Mission
          </h3>
          {editing ? (
            <textarea
              rows={4}
              value={profile.mission || ''}
              onChange={(e) => setProfile({ ...profile, mission: e.target.value })}
              className="w-full text-xs font-bold text-gray-900 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-green-500 focus:outline-none bg-white text-left"
              placeholder="Masukkan misi sekolah, pisahkan baris baru untuk tiap poin"
            />
          ) : (
            <ul className="space-y-3.5 text-sm font-semibold text-gray-700 text-left">
              {missionList.length === 0 ? (
                <span className="text-xs text-gray-400 italic">Belum ada misi dimasukkan.</span>
              ) : (
                missionList.map((mis, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-[10px] font-bold text-green-700 border border-green-200 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{mis}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </section>

      <p className="text-xs text-gray-400 italic text-center mt-6 block">
        This page is intended for informational and documentation purposes only. All profile settings are read-only.
      </p>
    </div>
  );
}

export default SchoolInfoTab;
