import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmptyState from '../common/EmptyState';

function DataSiswaTab({ user, data }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryKelasId = searchParams.get('kelas_id');

  // Extract unique classes taught by the teacher from data.jadwal
  const classesTaught = [];
  const seenClassIds = new Set();
  (data?.jadwal || []).forEach((j) => {
    if (j.kelas && !seenClassIds.has(j.kelas_id)) {
      seenClassIds.add(j.kelas_id);
      classesTaught.push(j.kelas);
    }
  });

  const students = data?.siswa || [];

  // State for filter selection
  const [selectedKelasId, setSelectedKelasId] = useState('semua');

  // Sync selectedKelasId state with URL query parameter
  useEffect(() => {
    if (queryKelasId) {
      setSelectedKelasId(queryKelasId);
    } else {
      setSelectedKelasId('semua');
    }
  }, [queryKelasId]);

  const handleSelectKelas = (kelasId) => {
    if (kelasId === 'semua') {
      searchParams.delete('kelas_id');
    } else {
      searchParams.set('kelas_id', kelasId);
    }
    setSearchParams(searchParams);
    setSelectedKelasId(kelasId);
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Find class details if a specific class is selected
  const activeClass = classesTaught.find(
    (c) => String(c.id) === String(selectedKelasId)
  );

  // Filter students belonging to the selected class
  const classStudents = selectedKelasId === 'semua'
    ? students
    : students.filter((s) => String(s.kelas_id) === String(selectedKelasId));

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Akademik</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Data Siswa</h2>
        </div>
        {data.kelasPerwalian && (
          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full shadow-sm w-fit">
            Wali Kelas: {data.kelasPerwalian.nama_kelas}
          </span>
        )}
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">Filter Kelas:</span>
          <select 
            value={selectedKelasId} 
            onChange={(e) => handleSelectKelas(e.target.value)}
            className="text-sm font-bold text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition cursor-pointer"
          >
            <option value="semua">Semua Kelas</option>
            {classesTaught.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.nama_kelas}
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-gray-505 font-semibold">
          Total Mengajar: <span className="text-green-600 font-extrabold">{classesTaught.length} Kelas</span>
        </div>
      </div>

      {/* Conditional View */}
      {selectedKelasId === 'semua' ? (
        /* Class Cards Grid View */
        classesTaught.length === 0 ? (
          <EmptyState 
            title="Tidak Ada Kelas Taught" 
            description="Anda belum memiliki jadwal mengajar aktif di kelas manapun." 
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classesTaught.map((cls) => {
              const count = students.filter((s) => Number(s.kelas_id) === Number(cls.id)).length;
              
              // Extract unique subjects taught in this class by the current teacher
              const subjects = (data?.jadwal || [])
                .filter((j) => Number(j.kelas_id) === Number(cls.id) && j.mapel)
                .map((j) => j.mapel.nama_mapel);
              const uniqueSubjects = [...new Set(subjects)];

              return (
                <div 
                  key={cls.id} 
                  className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-green-500/5 blur-xl pointer-events-none" />
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Kelas {cls.nama_kelas}</h3>
                      <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">{cls.jurusan || 'Kejuruan'}</p>
                    </div>
                    
                    <div className="space-y-3.5 text-sm text-gray-650 font-semibold">
                      <div className="flex justify-between">
                        <span>Total Siswa:</span>
                        <span className="text-green-700 font-extrabold">{count} Siswa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wali Kelas:</span>
                        <span className="text-gray-800 font-bold">{cls.wali_kelas?.nama || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-1 border-t border-gray-100 pt-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mata Pelajaran Diajar:</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {uniqueSubjects.map((subj, sIdx) => (
                            <span key={sIdx} className="inline-flex items-center rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 border border-green-200">
                              {subj}
                            </span>
                          ))}
                          {uniqueSubjects.length === 0 && (
                            <span className="text-gray-500 font-medium">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectKelas(String(cls.id))}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition text-center text-xs block cursor-pointer"
                  >
                    Lihat Daftar
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Student List Table View */
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleSelectKelas('semua')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-green-600 transition cursor-pointer"
            >
              &larr; Kembali ke Daftar Kelas
            </button>
            {activeClass && (
              <h3 className="text-lg font-extrabold text-gray-900">
                Daftar Siswa Kelas {activeClass.nama_kelas}
              </h3>
            )}
          </div>

          {classStudents.length === 0 ? (
            <EmptyState 
              title="Tidak Ada Siswa" 
              description="Belum ada data siswa terdaftar di kelas ini." 
            />
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4.5 font-bold w-16">Foto</th>
                      <th className="px-6 py-4.5 font-bold">NIS</th>
                      <th className="px-6 py-4.5 font-bold">Nama Lengkap</th>
                      <th className="px-6 py-4.5 font-bold">Jenis Kelamin</th>
                      <th className="px-6 py-4.5 font-bold">No. HP</th>
                      <th className="px-6 py-4.5 font-bold">Status</th>
                      <th className="px-6 py-4.5 text-right font-bold w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 bg-white/60">
                    {classStudents.map((student, idx) => (
                      <tr key={idx} className="hover:bg-green-50/50 transition">
                        <td className="px-6 py-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-green-500/10 to-emerald-500/10 border border-green-200 flex items-center justify-center text-green-700 font-bold text-sm overflow-hidden shadow-sm">
                            {student.photo_url ? (
                              <img
                                src={`http://localhost:3000${student.photo_url}`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(student.nama)
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{student.nis}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{student.nama}</td>
                        <td className="px-6 py-4 font-medium">{student.jenis_kelamin || '-'}</td>
                        <td className="px-6 py-4 font-medium">{student.no_hp || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700">
                            Aktif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/dashboard/siswa/${student.id}`)}
                            className="inline-flex items-center justify-center rounded-lg bg-green-50 border border-green-150 hover:bg-green-600 hover:text-white px-3 py-1.5 text-xs font-bold text-green-700 transition cursor-pointer"
                          >
                            Lihat Profil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataSiswaTab;
