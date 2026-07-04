import { useState, useEffect, useMemo } from 'react';
import api, { entityService } from '../../services/api';
import swalAlert from '../../utils/swal';
import EmptyState from '../common/EmptyState';
import StateBlock from '../StateBlock';

const scoreWeights = { tugas: 0.3, uts: 0.3, uas: 0.4 };

function deriveGradeHuruf(score) {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  return 'D';
}

function NilaiTab() {
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const roleNorm = (localUser.role || '').toLowerCase();
  const isAdmin = roleNorm === 'admin' || roleNorm === 'administrator';
  const isGuru = roleNorm === 'guru';
  const isSiswa = roleNorm === 'siswa';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Common data
  const [grades, setGrades] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);

  // Filter States (Admin & Siswa)
  const [filterKelasId, setFilterKelasId] = useState('');
  const [filterMapelId, setFilterMapelId] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterTahunAjaran, setFilterTahunAjaran] = useState('2024/2025');

  // Siswa specific semesters list
  const semestersList = useMemo(() => {
    return [...new Set(grades.map((g) => g.semester).filter(Boolean))].sort();
  }, [grades]);
  const [siswaActiveSemester, setSiswaActiveSemester] = useState('');

  // Guru specific states for Step flow: Mapel -> Kelas -> Input
  const [guruProfile, setGuruProfile] = useState(null);
  const [guruSchedules, setGuruSchedules] = useState([]);
  const [selectedMapelId, setSelectedMapelId] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('2024/2025');
  const [students, setStudents] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({}); // mapping: studentId -> {tugas, uts, uas}
  const [saving, setSaving] = useState(false);

  // 1. Initial Load based on Role
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setError('');
      try {
        if (isAdmin) {
          // Admin: fetch dropdown options
          const [kelasRes, mapelRes, gradesRes] = await Promise.all([
            entityService.list('/kelas'),
            entityService.list('/mapel'),
            entityService.list('/nilai'),
          ]);
          setKelasOptions(kelasRes.data.data || []);
          setMapelOptions(mapelRes.data.data || []);
          setGrades(gradesRes.data.data || []);
        } else if (isSiswa) {
          // Siswa: fetch report grades
          const gradesRes = await entityService.list('/nilai');
          setGrades(gradesRes.data.data || []);
        } else if (isGuru) {
          // Guru: fetch profile and schedules
          const profileRes = await api.get('/profile');
          const prof = profileRes.data.data;
          setGuruProfile(prof);

          const scheduleRes = await entityService.list('/jadwal', { guru_id: prof.id });
          setGuruSchedules(scheduleRes.data.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data nilai');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isAdmin, isGuru, isSiswa]);

  // Admin filter trigger
  const handleAdminFilter = async () => {
    setLoading(true);
    try {
      const response = await entityService.list('/nilai', {
        kelas_id: filterKelasId,
        mapel_id: filterMapelId,
        semester: filterSemester,
        tahun_ajaran: filterTahunAjaran,
      });
      setGrades(response.data.data || []);
    } catch (err) {
      swalAlert.error('Gagal', 'Gagal memfilter data nilai');
    } finally {
      setLoading(false);
    }
  };

  // Guru: derive available mapels from schedule
  const availableMapels = useMemo(() => {
    const mapped = guruSchedules.map((s) => s.mapel).filter(Boolean);
    return [...new Map(mapped.map((m) => [m.id, m])).values()];
  }, [guruSchedules]);

  // Guru: derive available classes based on selected Mapel
  const availableClasses = useMemo(() => {
    if (!selectedMapelId) return [];
    const filtered = guruSchedules
      .filter((s) => s.mapel_id === Number(selectedMapelId))
      .map((s) => s.kelas)
      .filter(Boolean);
    return [...new Map(filtered.map((c) => [c.id, c])).values()];
  }, [selectedMapelId, guruSchedules]);

  // Guru: Load students and existing grades when Class & Mapel are selected
  useEffect(() => {
    if (!isGuru || !selectedKelasId || !selectedMapelId) {
      setStudents([]);
      setGradeInputs({});
      return;
    }

    const loadClassGrades = async () => {
      setLoading(true);
      try {
        const [studentsRes, gradesRes] = await Promise.all([
          entityService.list('/siswa', { kelas_id: selectedKelasId }),
          entityService.list('/nilai', {
            kelas_id: selectedKelasId,
            mapel_id: selectedMapelId,
            semester: selectedSemester,
            tahun_ajaran: selectedTahunAjaran,
          }),
        ]);

        const activeStudents = studentsRes.data.data || [];
        const existingGrades = gradesRes.data.data || [];
        setStudents(activeStudents);

        // Prepopulate grade inputs
        const inputs = {};
        activeStudents.forEach((st) => {
          const eg = existingGrades.find((g) => g.siswa_id === st.id) || {};
          inputs[st.id] = {
            tugas: eg.tugas !== undefined ? String(eg.tugas) : '',
            uts: eg.uts !== undefined ? String(eg.uts) : '',
            uas: eg.uas !== undefined ? String(eg.uas) : '',
          };
        });
        setGradeInputs(inputs);
      } catch (err) {
        swalAlert.error('Gagal', 'Gagal memuat daftar siswa atau nilai');
      } finally {
        setLoading(false);
      }
    };

    loadClassGrades();
  }, [isGuru, selectedKelasId, selectedMapelId, selectedSemester, selectedTahunAjaran]);

  const handleGradeInputChange = (studentId, field, value) => {
    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
      return; // restrict input range strictly to numeric 0-100
    }
    setGradeInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrades = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Send sequential requests for each student to the upsert API
      for (const st of students) {
        const input = gradeInputs[st.id] || {};
        const tugasNum = input.tugas === '' ? 0 : Number(input.tugas);
        const utsNum = input.uts === '' ? 0 : Number(input.uts);
        const uasNum = input.uas === '' ? 0 : Number(input.uas);

        await entityService.create('/nilai', {
          siswa_id: st.id,
          mapel_id: Number(selectedMapelId),
          kelas_id: Number(selectedKelasId),
          semester: selectedSemester,
          tahun_ajaran: selectedTahunAjaran,
          tugas: tugasNum,
          uts: utsNum,
          uas: uasNum,
        });
      }
      swalAlert.success('Berhasil', 'Seluruh nilai berhasil disimpan!');
    } catch (err) {
      swalAlert.error('Gagal', err.response?.data?.message || 'Gagal menyimpan nilai');
    } finally {
      setSaving(false);
    }
  };

  // Filter siswa grades list by active semester select
  const activeSiswaSemester = siswaActiveSemester || semestersList[0] || '';
  const filteredSiswaGrades = useMemo(() => {
    return grades.filter((g) => !activeSiswaSemester || g.semester === activeSiswaSemester);
  }, [grades, activeSiswaSemester]);

  if (loading && !saving) {
    return <StateBlock title="Memuat data..." />;
  }

  // --- RENDER SISWA PROFILE CARD REPORT ---
  if (isSiswa) {
    return (
      <div className="space-y-6 text-left">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Hasil Evaluasi</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Rapor Nilai Akademik</h2>
          </div>
          {semestersList.length > 0 && (
            <select
              value={activeSiswaSemester}
              onChange={(e) => setSiswaActiveSemester(e.target.value)}
              className="w-fit cursor-pointer rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
            >
              {semestersList.map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          )}
        </div>

        {filteredSiswaGrades.length === 0 ? (
          <EmptyState title="Belum Ada Nilai" description="Nilai akademik belum tersedia." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="border-b border-gray-200 bg-green-50/50 text-xs font-bold uppercase tracking-wider text-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-bold">Mata Pelajaran</th>
                    <th className="px-6 py-4 font-bold">Tugas</th>
                    <th className="px-6 py-4 font-bold">UTS</th>
                    <th className="px-6 py-4 font-bold">UAS</th>
                    <th className="px-6 py-4 font-bold">Nilai Akhir</th>
                    <th className="px-6 py-4 text-center font-bold">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-semibold">
                  {filteredSiswaGrades.map((g) => (
                    <tr key={g.id} className="transition-colors hover:bg-green-50/20">
                      <td className="px-6 py-4 font-bold text-gray-900">{g.mapel?.nama_mapel}</td>
                      <td className="px-6 py-4">{g.tugas}</td>
                      <td className="px-6 py-4">{g.uts}</td>
                      <td className="px-6 py-4">{g.uas}</td>
                      <td className="px-6 py-4 font-extrabold text-green-700">{g.nilai_akhir.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-extrabold border ${
                          g.grade_huruf === 'A' ? 'bg-green-50 border-green-200 text-green-700' :
                          g.grade_huruf === 'B' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          g.grade_huruf === 'C' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                          'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {g.grade_huruf}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER ADMIN GRADE MONITORING ---
  if (isAdmin) {
    return (
      <div className="space-y-6 text-left">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Pemantauan Akademik</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Monitoring Nilai Siswa</h2>
        </div>

        {/* Filter Cards */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <label className="block flex-1 text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Kelas</span>
            <select
              value={filterKelasId}
              onChange={(e) => setFilterKelasId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500"
            >
              <option value="">Semua Kelas</option>
              {kelasOptions.map((k) => (
                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
              ))}
            </select>
          </label>

          <label className="block flex-1 text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Mata Pelajaran</span>
            <select
              value={filterMapelId}
              onChange={(e) => setFilterMapelId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500"
            >
              <option value="">Semua Mapel</option>
              {mapelOptions.map((m) => (
                <option key={m.id} value={m.id}>{m.nama_mapel}</option>
              ))}
            </select>
          </label>

          <label className="block flex-1 text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Semester</span>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500"
            >
              <option value="">Semua Semester</option>
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </label>

          <label className="block flex-1 text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Tahun Ajaran</span>
            <input
              type="text"
              value={filterTahunAjaran}
              onChange={(e) => setFilterTahunAjaran(e.target.value)}
              placeholder="e.g. 2024/2025"
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
            />
          </label>

          <button
            onClick={handleAdminFilter}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition duration-150 cursor-pointer text-sm h-[45px]"
          >
            Terapkan Filter
          </button>
        </div>

        {grades.length === 0 ? (
          <EmptyState title="Belum Ada Nilai" description="Nilai akademik belum tersedia." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="border-b border-gray-200 bg-green-50/50 text-xs font-bold uppercase tracking-wider text-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-bold">Nama Siswa</th>
                    <th className="px-6 py-4 font-bold">Kelas</th>
                    <th className="px-6 py-4 font-bold">Mata Pelajaran</th>
                    <th className="px-6 py-4 font-bold">Tugas</th>
                    <th className="px-6 py-4 font-bold">UTS</th>
                    <th className="px-6 py-4 font-bold">UAS</th>
                    <th className="px-6 py-4 font-bold">Nilai Akhir</th>
                    <th className="px-6 py-4 text-center font-bold">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-semibold">
                  {grades.map((g) => (
                    <tr key={g.id} className="transition-colors hover:bg-green-50/10">
                      <td className="px-6 py-4 font-bold text-gray-900">{g.siswa?.nama}</td>
                      <td className="px-6 py-4">{g.kelas?.nama_kelas || '-'}</td>
                      <td className="px-6 py-4">{g.mapel?.nama_mapel}</td>
                      <td className="px-6 py-4">{g.tugas}</td>
                      <td className="px-6 py-4">{g.uts}</td>
                      <td className="px-6 py-4">{g.uas}</td>
                      <td className="px-6 py-4 font-extrabold text-green-700">{g.nilai_akhir.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-extrabold border ${
                          g.grade_huruf === 'A' ? 'bg-green-50 border-green-200 text-green-700' :
                          g.grade_huruf === 'B' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          g.grade_huruf === 'C' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                          'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {g.grade_huruf}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER GURU GRADE ENTRY WORKFLOW ---
  if (isGuru) {
    return (
      <div className="space-y-6 text-left">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Evaluasi Guru</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Input Nilai Siswa</h2>
        </div>

        {/* Dynamic Class & Mapel Selectors Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm grid gap-5 sm:grid-cols-4">
          <label className="block text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">1. Pilih Mata Pelajaran *</span>
            <select
              value={selectedMapelId}
              onChange={(e) => {
                setSelectedMapelId(e.target.value);
                setSelectedKelasId('');
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500"
            >
              <option value="">Pilih Mapel</option>
              {availableMapels.map((m) => (
                <option key={m.id} value={m.id}>{m.nama_mapel}</option>
              ))}
            </select>
          </label>

          <label className="block text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">2. Pilih Kelas *</span>
            <select
              value={selectedKelasId}
              disabled={!selectedMapelId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">Pilih Kelas</option>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.nama_kelas}</option>
              ))}
            </select>
          </label>

          <label className="block text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Semester</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500"
            >
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </label>

          <label className="block text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Tahun Ajaran</span>
            <input
              type="text"
              value={selectedTahunAjaran}
              onChange={(e) => setSelectedTahunAjaran(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
            />
          </label>
        </div>

        {/* Input Table Grid */}
        {selectedKelasId && selectedMapelId && (
          <form onSubmit={handleSaveGrades} className="space-y-6">
            {students.length === 0 ? (
              <EmptyState title="Siswa Tidak Ditemukan" description="Belum ada siswa terdaftar di kelas ini." />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="border-b border-gray-200 bg-green-50/50 text-xs font-bold uppercase tracking-wider text-gray-700">
                      <tr>
                        <th className="px-6 py-4 font-bold">NIS</th>
                        <th className="px-6 py-4 font-bold">Nama Siswa</th>
                        <th className="px-6 py-4 font-bold w-24">Tugas (30%)</th>
                        <th className="px-6 py-4 font-bold w-24">UTS (30%)</th>
                        <th className="px-6 py-4 font-bold w-24">UAS (40%)</th>
                        <th className="px-6 py-4 font-bold w-32">Nilai Akhir</th>
                        <th className="px-6 py-4 text-center font-bold w-24">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white font-semibold">
                      {students.map((st) => {
                        const inputs = gradeInputs[st.id] || { tugas: '', uts: '', uas: '' };
                        const tVal = inputs.tugas === '' ? 0 : Number(inputs.tugas);
                        const uVal = inputs.uts === '' ? 0 : Number(inputs.uts);
                        const aVal = inputs.uas === '' ? 0 : Number(inputs.uas);
                        const currentFinalScore = (tVal * 0.3) + (uVal * 0.3) + (aVal * 0.4);
                        const currentGradeLetter = deriveGradeHuruf(currentFinalScore);

                        return (
                          <tr key={st.id} className="transition-colors hover:bg-green-50/20">
                            <td className="px-6 py-4 text-gray-500 text-xs">{st.nis}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{st.nama}</td>
                            <td className="px-6 py-3">
                              <input
                                type="text"
                                value={inputs.tugas}
                                onChange={(e) => handleGradeInputChange(st.id, 'tugas', e.target.value)}
                                className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/10 font-bold"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <input
                                type="text"
                                value={inputs.uts}
                                onChange={(e) => handleGradeInputChange(st.id, 'uts', e.target.value)}
                                className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/10 font-bold"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <input
                                type="text"
                                value={inputs.uas}
                                onChange={(e) => handleGradeInputChange(st.id, 'uas', e.target.value)}
                                className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/10 font-bold"
                              />
                            </td>
                            <td className="px-6 py-4 font-extrabold text-green-700">
                              {currentFinalScore.toFixed(1)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-extrabold border ${
                                currentGradeLetter === 'A' ? 'bg-green-50 border-green-200 text-green-700' :
                                currentGradeLetter === 'B' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                currentGradeLetter === 'C' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                'bg-red-50 border-red-200 text-red-700'
                              }`}>
                                {currentGradeLetter}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {students.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition duration-150 disabled:bg-gray-400 cursor-pointer text-sm"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Nilai'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    );
  }

  return null;
}

export default NilaiTab;
