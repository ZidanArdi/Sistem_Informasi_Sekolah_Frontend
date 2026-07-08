import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { entityService } from '../services/api';
import StateBlock from '../components/StateBlock';

function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (localUser.role || '').toLowerCase();
  const isSiswa = role === 'siswa';

  if (isSiswa && student && String(student.id) !== String(localUser.id) && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const fetchStudentDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await entityService.get('/siswa', id);
        setStudent(res.data.data);
      } catch (err) {
        // Fallback: list all and search by ID or NIS
        try {
          const res = await entityService.list('/siswa');
          const found = (res.data.data || []).find(
            (s) => String(s.id) === String(id) || s.nis === id
          );
          if (found) {
            setStudent(found);
          } else {
            setError('Siswa tidak ditemukan');
          }
        } catch (innerErr) {
          setError('Gagal memuat profil siswa');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetail();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return <StateBlock title="Memuat profil siswa..." />;
  }

  if (error || !student) {
    return (
      <div className="space-y-6 text-left max-w-3xl mx-auto py-8">
        <StateBlock title={error || 'Profil siswa tidak ditemukan'} tone="danger" />
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white hover:bg-gray-150 border border-gray-250 text-sm font-bold text-gray-700 rounded-xl transition cursor-pointer animate-fade-in-up"
        >
          &larr; Kembali
        </button>
      </div>
    );
  }

  const formattedAddress = student.alamat_detail
    ? `${student.alamat_detail}, ${student.desa || ''}, ${student.kecamatan || ''}, ${student.kabupaten || ''}, ${student.provinsi || ''}`
        .replace(/,\s*,/g, ',')
        .trim()
    : student.alamat || '-';

  // Extract enrollment year from NIS or default to '-'
  const enrollmentYear = student.nis && student.nis.length >= 4 && !isNaN(Number(student.nis.slice(0, 4)))
    ? student.nis.slice(0, 4)
    : '-';

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto py-4 animate-fade-in-up">
      {/* Back Button and Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center h-10 w-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-gray-700 transition cursor-pointer"
          title="Kembali"
        >
          &larr;
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Akademik</p>
          <h2 className="mt-0.5 text-2xl font-extrabold text-gray-900 tracking-tight">Detail Profil Siswa</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Avatar Card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center relative overflow-hidden h-fit md:sticky md:top-6">
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-green-500/5 blur-2xl pointer-events-none" />
          
          <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 p-0.5 shadow-md mb-4 mt-4 overflow-hidden flex items-center justify-center">
            {student.photo_url ? (
              <img
                src={`http://localhost:3000${student.photo_url}`}
                alt={student.nama}
                className="w-full h-full object-cover rounded-full border-2 border-white"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-white text-3xl font-extrabold text-green-700">
                {getInitials(student.nama)}
              </div>
            )}
          </div>

          <h3 className="text-xl font-extrabold text-gray-955 line-clamp-2">{student.nama}</h3>
          <span className="mt-2 inline-flex items-center rounded-full bg-green-50 border border-green-200 text-green-700 px-3.5 py-1 text-xs font-extrabold">
            NIS: {student.nis}
          </span>

          <div className="w-full border-t border-gray-150 mt-6 pt-6 space-y-3 text-xs font-semibold text-gray-500 text-left">
            <div className="flex justify-between">
              <span>Kelas:</span>
              <span className="text-gray-900 font-bold">{student.kelas?.nama_kelas || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status Akademik:</span>
              <span className="text-green-600 font-extrabold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Right Info Sections */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card 1: Personal Details */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
            <h4 className="text-base font-extrabold text-gray-955 border-b border-gray-150 pb-3 mb-5">Data Pribadi</h4>
            
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                <p className="mt-1.5 font-bold text-gray-900">{student.nama || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nomor Induk Siswa (NIS)</p>
                <p className="mt-1.5 font-bold text-gray-900">{student.nis || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jenis Kelamin</p>
                <p className="mt-1.5 font-semibold text-gray-800">{student.jenis_kelamin || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Lahir</p>
                <p className="mt-1.5 font-semibold text-gray-800">
                  {student.tanggal_lahir
                    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(
                        new Date(student.tanggal_lahir)
                      )
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. Telepon / HP</p>
                <p className="mt-1.5 font-semibold text-gray-800">{student.no_hp || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Lengkap</p>
                <p className="mt-1.5 font-semibold text-gray-800 leading-relaxed">{formattedAddress}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Academic Details */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
            <h4 className="text-base font-extrabold text-gray-955 border-b border-gray-150 pb-3 mb-5">Informasi Akademik</h4>
            
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nomor Induk Siswa (NIS)</p>
                <p className="mt-1.5 font-bold text-gray-900">{student.nis || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kelas</p>
                <p className="mt-1.5 font-bold text-gray-900">{student.kelas?.nama_kelas || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jurusan / Kompetensi Keahlian</p>
                <p className="mt-1.5 font-bold text-gray-900">{student.kelas?.jurusan || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tahun Masuk / Angkatan</p>
                <p className="mt-1.5 font-semibold text-gray-800">{enrollmentYear || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Siswa</p>
                <p className="mt-1.5 font-semibold text-green-700">Aktif</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Wali Kelas</p>
                <p className="mt-1.5 font-bold text-gray-900">{student.kelas?.wali_kelas?.nama || '-'}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Parent / Guardian Details */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
            <h4 className="text-base font-extrabold text-gray-955 border-b border-gray-150 pb-3 mb-5">Data Orang Tua / Wali</h4>
            
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Ayah</p>
                <p className="mt-1.5 font-semibold text-gray-800">{student.nama_ayah || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Ibu</p>
                <p className="mt-1.5 font-semibold text-gray-800">{student.nama_ibu || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. HP Orang Tua / Wali</p>
                <p className="mt-1.5 font-semibold text-gray-800">{student.no_hp_orang_tua || student.no_hp_ortu || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Orang Tua / Wali</p>
                <p className="mt-1.5 font-semibold text-gray-800 leading-relaxed">{student.alamat_orang_tua || student.alamat_ortu || '-'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default StudentProfilePage;
