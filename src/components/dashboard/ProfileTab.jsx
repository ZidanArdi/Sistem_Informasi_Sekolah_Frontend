import { useState, useEffect } from 'react';
import api, { API_BASE_URL, getAssetUrl } from '../../services/api';
import swalAlert from '../../utils/swal';
import StateBlock from '../StateBlock';

function ProfileTab({ user: localUser, roleNorm }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Edit form states
  const [noHp, setNoHp] = useState('');
  const [provinsi, setProvinsi] = useState('');
  const [kabupaten, setKabupaten] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [desa, setDesa] = useState('');
  const [alamatDetail, setAlamatDetail] = useState('');

  // Dropdown options
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);


  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profile');
      const data = response.data.data;
      setProfile(data);
      
      // Initialize edit fields
      setNoHp(data.no_hp || '');
      setProvinsi(data.provinsi || '');
      setKabupaten(data.kabupaten || '');
      setKecamatan(data.kecamatan || '');
      setDesa(data.desa || '');
      setAlamatDetail(data.alamat_detail || '');
    } catch (err) {
      swalAlert.error('Gagal', 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 1. Fetch Provinces
  useEffect(() => {
    if (!editing) return;
    fetch(`${API_BASE_URL}/regions/provinces.json`)
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch(() => console.warn('Gagal memuat provinsi'));
  }, [editing]);

  // 2. Fetch Regencies
  useEffect(() => {
    if (!provinsi || provinces.length === 0 || !editing) {
      setRegencies([]);
      return;
    }
    const found = provinces.find((p) => p.name.toLowerCase() === provinsi.toLowerCase());
    if (found) {
      fetch(`${API_BASE_URL}/regions/regencies/${found.id}.json`)
        .then((res) => res.json())
        .then((data) => setRegencies(data))
        .catch(() => console.warn('Gagal memuat kabupaten'));
    }
  }, [provinsi, provinces, editing]);

  // 3. Fetch Districts
  useEffect(() => {
    if (!kabupaten || regencies.length === 0 || !editing) {
      setDistricts([]);
      return;
    }
    const found = regencies.find((r) => r.name.toLowerCase() === kabupaten.toLowerCase());
    if (found) {
      fetch(`${API_BASE_URL}/regions/districts/${found.id}.json`)
        .then((res) => res.json())
        .then((data) => setDistricts(data))
        .catch(() => console.warn('Gagal memuat kecamatan'));
    }
  }, [kabupaten, regencies, editing]);

  // 4. Fetch Villages
  useEffect(() => {
    if (!kecamatan || districts.length === 0 || !editing) {
      setVillages([]);
      return;
    }
    const found = districts.find((d) => d.name.toLowerCase() === kecamatan.toLowerCase());
    if (found) {
      fetch(`${API_BASE_URL}/regions/villages/${found.id}.json`)
        .then((res) => res.json())
        .then((data) => setVillages(data))
        .catch(() => console.warn('Gagal memuat desa'));
    }
  }, [kecamatan, districts, editing]);

  if (loading) {
    return <StateBlock tone="loading" />;
  }

  const initials = (profile?.nama || 'User')
    .split(' ')
    .map((name) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      swalAlert.error('Gagal', 'Format file tidak didukung atau ukuran file terlalu besar.');
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      swalAlert.error('Gagal', 'Format file tidak didukung atau ukuran file terlalu besar.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await api.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newPhotoURL = res.data.data.photo_url;
      setProfile((prev) => ({ ...prev, photo_url: newPhotoURL }));
      
      const localUserObj = JSON.parse(localStorage.getItem('user') || '{}');
      localUserObj.photo_url = newPhotoURL;
      localStorage.setItem('user', JSON.stringify(localUserObj));

      swalAlert.success('Berhasil', 'Foto profil berhasil diperbarui!');
    } catch (err) {
      swalAlert.error('Gagal', err.response?.data?.message || 'Gagal mengupload foto');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profile', {
        no_hp: noHp,
        provinsi,
        kabupaten,
        kecamatan,
        desa,
        alamat_detail: alamatDetail,
      });

      setProfile((prev) => ({
        ...prev,
        no_hp: noHp,
        provinsi,
        kabupaten,
        kecamatan,
        desa,
        alamat_detail: alamatDetail,
      }));
      setEditing(false);
      swalAlert.success('Berhasil', 'Profil berhasil disimpan!');
    } catch (err) {
      swalAlert.error('Gagal', err.response?.data?.message || 'Gagal menyimpan profil');
    }
  };


  const formattedAddress = profile.alamat_detail
    ? `${profile.alamat_detail}, ${profile.desa || ''}, ${profile.kecamatan || ''}, ${profile.kabupaten || ''}, ${profile.provinsi || ''}`.replace(/,\s*,/g, ',').trim()
    : '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Akun Pengguna</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Profil Lengkap</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Card: Avatar & Status */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-green-500/5 blur-2xl pointer-events-none" />
          
          {/* Circular image with hover upload effect */}
          <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 p-0.5 shadow-md mb-4 mt-4 relative group overflow-hidden">
            {profile.photo_url ? (
              <img
                src={getAssetUrl(profile.photo_url)}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full border-2 border-white"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-white text-2xl font-extrabold text-green-700">
                {initials}
              </div>
            )}
            <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer select-none">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5 mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>UBAH FOTO</span>
              <input type="file" accept=".jpg,.jpeg,.png" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <h3 className="text-xl font-extrabold text-gray-950">{profile.nama}</h3>
          <span className="mt-2 inline-flex items-center rounded-full bg-green-50 border border-green-200 text-green-700 px-3.5 py-1 text-xs font-extrabold capitalize">
            {profile.role || roleNorm}
          </span>

          <div className="w-full border-t border-gray-150 mt-6 pt-6 space-y-3.5 text-left text-xs font-semibold text-gray-500">
            <div className="flex justify-between">
              <span>Status Akun:</span>
              <span className="text-green-600 font-extrabold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Aktif
              </span>
            </div>
            <div className="flex justify-between">
              <span>Aktivitas Login:</span>
              <span className="text-gray-900 font-bold">
                {profile.last_login_at
                  ? new Date(profile.last_login_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  : '-'}
              </span>
            </div>
            {profile.role === 'siswa' && (
              <div className="flex justify-between">
                <span>Kelas:</span>
                <span className="text-gray-900 font-bold">{profile.kelas || '-'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Details / Edit Form */}
        <div className="md:col-span-2 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 relative overflow-hidden text-left">
          <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-gray-150 pb-3.5 mb-6">
            <h4 className="text-lg font-extrabold text-gray-950">Informasi Personal</h4>
            {(roleNorm === 'guru' || roleNorm === 'siswa') && (
              <button
                type="button"
                onClick={() => setEditing(!editing)}
                className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 cursor-pointer select-none"
              >
                {editing ? (
                  <span>❌ Batal</span>
                ) : (
                  <>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Profil</span>
                  </>
                )}
              </button>
            )}
          </div>

          {!editing ? (
            /* Read-only View */
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                <p className="mt-1.5 font-bold text-gray-900">{profile.nama}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {roleNorm === 'guru' ? 'Nomor Induk Guru (NIG)' : 'Nomor Induk Siswa (NIS)'}
                </p>
                <p className="mt-1.5 font-bold text-gray-900">
                  {roleNorm === 'guru' ? (profile.nip || '-') : (profile.nis || '-')}
                </p>
              </div>
              {roleNorm === 'guru' ? (
                <>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gelar Akademik</p>
                    <p className="mt-1.5 font-semibold text-gray-800">{profile.gelar || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Email</p>
                    <p className="mt-1.5 font-semibold text-gray-800">{profile.email || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mata Pelajaran Diampu</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.subjects_taught && profile.subjects_taught.length > 0 ? (
                        profile.subjects_taught.map((m, idx) => (
                          <span key={idx} className="inline-flex rounded-lg bg-green-50 border border-green-100 text-green-700 px-2.5 py-1 text-xs font-bold">
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Belum ada mata pelajaran yang diampu.</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jenis Kelamin</p>
                    <p className="mt-1.5 font-semibold text-gray-800">{profile.jenis_kelamin || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Lahir</p>
                    <p className="mt-1.5 font-semibold text-gray-800">
                      {profile.tanggal_lahir ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(profile.tanggal_lahir)) : '-'}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. Telepon / HP</p>
                <p className="mt-1.5 font-semibold text-gray-800">{profile.no_hp || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Rumah</p>
                <p className="mt-1.5 font-semibold text-gray-800">{formattedAddress}</p>
              </div>

              {/* Siswa Academic & Parent Info */}
              {roleNorm === 'siswa' && (
                <>
                  <div className="sm:col-span-2 border-t border-gray-150 pt-5 mt-4">
                    <h5 className="font-extrabold text-gray-955 text-base mb-4">Informasi Akademik</h5>
                    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nomor Induk Siswa (NIS)</p>
                        <p className="mt-1.5 font-bold text-gray-900">{profile.nis || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kelas</p>
                        <p className="mt-1.5 font-bold text-gray-900">{profile.kelas?.nama_kelas || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jurusan / Kompetensi Keahlian</p>
                        <p className="mt-1.5 font-bold text-gray-900">{profile.kelas?.jurusan || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tahun Masuk / Angkatan</p>
                        <p className="mt-1.5 font-semibold text-gray-800">
                          {profile.nis && profile.nis.length >= 4 && !isNaN(Number(profile.nis.slice(0, 4)))
                            ? profile.nis.slice(0, 4)
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Siswa</p>
                        <p className="mt-1.5 font-semibold text-green-700">Aktif</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Wali Kelas</p>
                        <p className="mt-1.5 font-bold text-gray-900">{profile.kelas?.wali_kelas?.nama || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 border-t border-gray-150 pt-5 mt-4">
                    <h5 className="font-extrabold text-gray-955 text-base mb-4">Data Orang Tua / Wali</h5>
                    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Ayah</p>
                        <p className="mt-1.5 font-semibold text-gray-800">{profile.nama_ayah || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Ibu</p>
                        <p className="mt-1.5 font-semibold text-gray-800">{profile.nama_ibu || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. HP Orang Tua / Wali</p>
                        <p className="mt-1.5 font-semibold text-gray-800">{profile.no_hp_orang_tua || profile.no_hp_ortu || '-'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Orang Tua / Wali</p>
                        <p className="mt-1.5 font-semibold text-gray-800 leading-relaxed">{profile.alamat_orang_tua || profile.alamat_ortu || '-'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Editing Form View */
            <form onSubmit={handleUpdateProfile} className="space-y-5 text-sm">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2 text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">No. HP / Telepon *</span>
                  <input
                    type="text"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                  />
                </label>

                <label className="block text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Provinsi *</span>
                  <select
                    value={provinsi}
                    required
                    onChange={(e) => {
                      setProvinsi(e.target.value);
                      setKabupaten('');
                      setKecamatan('');
                      setDesa('');
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Kabupaten / Kota *</span>
                  <select
                    value={kabupaten}
                    required
                    disabled={!provinsi}
                    onChange={(e) => {
                      setKabupaten(e.target.value);
                      setKecamatan('');
                      setDesa('');
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Pilih Kabupaten / Kota</option>
                    {regencies.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Kecamatan *</span>
                  <select
                    value={kecamatan}
                    required
                    disabled={!kabupaten}
                    onChange={(e) => {
                      setKecamatan(e.target.value);
                      setDesa('');
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Pilih Kecamatan</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Desa / Kelurahan *</span>
                  <select
                    value={desa}
                    required
                    disabled={!kecamatan}
                    onChange={(e) => setDesa(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Pilih Desa / Kelurahan</option>
                    {villages.map((v) => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </label>

                <label className="block sm:col-span-2 text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Alamat Detail *</span>
                  <textarea
                    required
                    rows={3}
                    value={alamatDetail}
                    onChange={(e) => setAlamatDetail(e.target.value)}
                    placeholder="Nama jalan, RT/RW, nomor rumah, dsb..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer select-none text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold cursor-pointer select-none text-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}

export default ProfileTab;
