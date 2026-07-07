import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMapelId = searchParams.get('mapel_id');
  const queryKelasId = searchParams.get('kelas_id');

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

  // Siswa specific states
  const [siswaActiveSemester, setSiswaActiveSemester] = useState('');
  const [selectedDetailGrade, setSelectedDetailGrade] = useState(null);

  // Guru specific states
  const [guruProfile, setGuruProfile] = useState(null);
  const [guruSchedules, setGuruSchedules] = useState([]);
  const [selectedMapelId, setSelectedMapelId] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('2024/2025');
  const [students, setStudents] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({}); // studentId -> {tugas, uts, uas}
  const [saving, setSaving] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // 1. Initial Load based on Role
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setError('');
      try {
        if (isAdmin) {
          const [kelasRes, mapelRes, gradesRes] = await Promise.all([
            entityService.list('/kelas'),
            entityService.list('/mapel'),
            entityService.list('/nilai'),
          ]);
          setKelasOptions(kelasRes.data.data || []);
          setMapelOptions(mapelRes.data.data || []);
          setGrades(gradesRes.data.data || []);
        } else if (isSiswa) {
          const [gradesRes, schedulesRes] = await Promise.all([
            entityService.list('/nilai'),
            entityService.list('/jadwal'),
          ]);
          setGrades(gradesRes.data.data || []);
          setGuruSchedules(schedulesRes.data.data || []);
        } else if (isGuru) {
          const profileRes = await api.get('/profile');
          const prof = profileRes.data.data;
          setGuruProfile(prof);

          const scheduleRes = await entityService.list('/jadwal', { guru_id: prof.id });
          const schedules = scheduleRes.data.data || [];
          setGuruSchedules(schedules);

          // Handle url query prefill and validate IDs against schedule
          const isMapelValid = schedules.some((s) => String(s.mapel_id) === String(queryMapelId));
          const isKelasValid = schedules.some(
            (s) => String(s.mapel_id) === String(queryMapelId) && String(s.kelas_id) === String(queryKelasId)
          );

          if (queryMapelId && queryKelasId && isMapelValid && isKelasValid) {
            setSelectedMapelId(queryMapelId);
            setSelectedKelasId(queryKelasId);
            setWizardStep(3);
          } else if (queryMapelId && isMapelValid) {
            setSelectedMapelId(queryMapelId);
            setWizardStep(2);
          } else {
            // Reset search params if invalid fallback triggers
            if (queryMapelId || queryKelasId) {
              searchParams.delete('mapel_id');
              searchParams.delete('kelas_id');
              setSearchParams(searchParams);
            }
            setWizardStep(1);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data nilai');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isAdmin, isGuru, isSiswa, queryMapelId, queryKelasId]);

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

  // Guru: Load students and existing grades when Class & Mapel are selected (Step 3)
  useEffect(() => {
    if (!isGuru || !selectedKelasId || !selectedMapelId || wizardStep !== 3) {
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
  }, [isGuru, selectedKelasId, selectedMapelId, selectedSemester, selectedTahunAjaran, wizardStep]);

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

  // semesters list
  const semestersList = useMemo(() => {
    return [...new Set(grades.map((g) => g.semester).filter(Boolean))].sort();
  }, [grades]);

  // Filter siswa grades list by active semester select
  const activeSiswaSemester = siswaActiveSemester || semestersList[0] || '';
  const filteredSiswaGrades = useMemo(() => {
    return grades.filter((g) => g.semester === activeSiswaSemester);
  }, [grades, activeSiswaSemester]);

  const handleBackToStep1 = () => {
    setSelectedMapelId('');
    setSelectedKelasId('');
    setWizardStep(1);
    searchParams.delete('mapel_id');
    searchParams.delete('kelas_id');
    setSearchParams(searchParams);
  };

  const handleBackToStep2 = () => {
    setSelectedKelasId('');
    setWizardStep(2);
    searchParams.delete('kelas_id');
    setSearchParams(searchParams);
  };

  if (loading && !saving && wizardStep !== 3) {
    return <StateBlock tone="loading" />;
  }

  // --- RENDER SISWA PROFILE CARD REPORT ---
  if (isSiswa) {
    return (
      <div className="space-y-6 text-left relative">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Hasil Evaluasi</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Rapor Nilai Akademik</h2>
          </div>
        </div>

        {/* Semester Tab Switcher */}
        {semestersList.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
            {semestersList.map((sem) => (
              <button
                key={sem}
                type="button"
                onClick={() => setSiswaActiveSemester(sem)}
                className={`px-5 py-2.5 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
                  activeSiswaSemester === sem
                    ? 'bg-green-600 border-green-600 text-white shadow-sm shadow-green-500/10'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        )}

        {filteredSiswaGrades.length === 0 ? (
          <EmptyState title="Belum Ada Nilai" description="Nilai akademik belum tersedia." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSiswaGrades.map((g) => {
              // Find teacher name from schedules matching this mapel
              const match = guruSchedules.find(s => Number(s.mapel_id) === Number(g.mapel_id));
              const teacherName = match?.guru?.nama || '-';

              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedDetailGrade(g)}
                  className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden group text-left"
                >
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-green-500/5 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-350" />
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {g.mapel?.kode_mapel || 'MAPEL'}
                      </span>
                      <h4 className="text-base font-extrabold text-gray-955 mt-1 line-clamp-2">
                        {g.mapel?.nama_mapel}
                      </h4>
                    </div>

                    <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nilai Akhir:</span>
                        <p className="text-2xl font-extrabold text-green-700 mt-0.5">
                          {g.nilai_akhir.toFixed(1)}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-extrabold border ${
                        g.grade_huruf === 'A' ? 'bg-green-50 border-green-200 text-green-700' :
                        g.grade_huruf === 'B' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        g.grade_huruf === 'C' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {g.grade_huruf}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Guru Pengajar:</span>
                      <p className="text-xs font-semibold text-gray-700 truncate">{teacherName}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Modal Overlay */}
        {selectedDetailGrade && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-scale-up text-left">
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-green-500/5 blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-gray-150 pb-3 mb-6">
                <h4 className="text-lg font-extrabold text-gray-955">Rincian Nilai</h4>
                <button
                  type="button"
                  onClick={() => setSelectedDetailGrade(null)}
                  className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-250 text-gray-550 hover:bg-gray-100 transition font-extrabold text-sm cursor-pointer outline-none border-none"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mata Pelajaran</span>
                  <p className="text-base font-extrabold text-gray-900 mt-1">{selectedDetailGrade.mapel?.nama_mapel}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Guru Pengajar</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {guruSchedules.find(s => Number(s.mapel_id) === Number(selectedDetailGrade.mapel_id))?.guru?.nama || '-'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t border-b border-gray-100 py-4 my-4 bg-gray-50/50 p-3 rounded-2xl">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tugas (30%)</span>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{selectedDetailGrade.tugas}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">UTS (30%)</span>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{selectedDetailGrade.uts}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">UAS (40%)</span>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{selectedDetailGrade.uas}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nilai Akhir</span>
                    <p className="text-3xl font-extrabold text-green-700 mt-0.5">
                      {selectedDetailGrade.nilai_akhir.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Grade Huruf</span>
                    <div className="mt-0.5">
                      <span className={`inline-flex rounded-xl px-4 py-2 text-base font-extrabold border ${
                        selectedDetailGrade.grade_huruf === 'A' ? 'bg-green-50 border-green-200 text-green-700' :
                        selectedDetailGrade.grade_huruf === 'B' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        selectedDetailGrade.grade_huruf === 'C' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {selectedDetailGrade.grade_huruf}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailGrade(null)}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition text-center text-xs block cursor-pointer shadow-md shadow-green-500/10 active:scale-98"
              >
                Tutup Rincian
              </button>
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

  // --- RENDER GURU GRADE ENTRY WIZARD WORKFLOW ---
  if (isGuru) {
    const selectedMapel = availableMapels.find(m => String(m.id) === String(selectedMapelId));
    const selectedKelas = availableClasses.find(c => String(c.id) === String(selectedKelasId));

    return (
      <div className="space-y-6 text-left">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Evaluasi Guru</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Input Nilai Siswa</h2>
        </div>

        {/* Wizard Progress Indicator */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between max-w-2xl mx-auto text-xs sm:text-sm font-bold">
            
            {/* Step 1 */}
            <button 
              type="button"
              onClick={wizardStep > 1 ? handleBackToStep1 : undefined}
              className={`flex items-center gap-2 outline-none border-none bg-transparent transition duration-200 ${
                wizardStep === 1 
                  ? 'text-green-700 font-extrabold' 
                  : wizardStep > 1 
                    ? 'text-green-600 font-bold cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className={`h-8 w-8 rounded-full flex items-center justify-center border-2 text-sm transition font-extrabold ${
                wizardStep === 1 
                  ? 'border-green-600 bg-green-600 text-white shadow-sm shadow-green-500/20' 
                  : wizardStep > 1 
                    ? 'border-green-600 bg-green-50 text-green-700' 
                    : 'border-gray-200 bg-gray-50 text-gray-400'
              }`}>
                {wizardStep > 1 ? '✓' : '1'}
              </span>
              <span>Mata Pelajaran</span>
            </button>

            {/* Line 1-2 */}
            <div className={`flex-1 h-0.5 mx-4 rounded transition duration-300 ${
              wizardStep >= 2 ? 'bg-green-600' : 'bg-gray-200'
            }`}></div>

            {/* Step 2 */}
            <button
              type="button"
              onClick={wizardStep > 2 ? handleBackToStep2 : undefined}
              disabled={!selectedMapelId}
              className={`flex items-center gap-2 outline-none border-none bg-transparent transition duration-200 ${
                wizardStep === 2 
                  ? 'text-green-700 font-extrabold' 
                  : wizardStep > 2 
                    ? 'text-green-600 font-bold cursor-pointer' 
                    : 'text-gray-405 cursor-not-allowed'
              }`}
            >
              <span className={`h-8 w-8 rounded-full flex items-center justify-center border-2 text-sm transition font-extrabold ${
                wizardStep === 2 
                  ? 'border-green-600 bg-green-600 text-white shadow-sm shadow-green-500/20' 
                  : wizardStep > 2 
                    ? 'border-green-600 bg-green-50 text-green-700' 
                    : 'border-gray-200 bg-gray-50 text-gray-400'
              }`}>
                {wizardStep > 2 ? '✓' : '2'}
              </span>
              <span>Kelas</span>
            </button>

            {/* Line 2-3 */}
            <div className={`flex-1 h-0.5 mx-4 rounded transition duration-300 ${
              wizardStep >= 3 ? 'bg-green-600' : 'bg-gray-200'
            }`}></div>

            {/* Step 3 */}
            <div className={`flex items-center gap-2 transition duration-200 ${
              wizardStep === 3 ? 'text-green-700 font-extrabold' : 'text-gray-400'
            }`}>
              <span className={`h-8 w-8 rounded-full flex items-center justify-center border-2 text-sm transition font-extrabold ${
                wizardStep === 3 
                  ? 'border-green-600 bg-green-600 text-white shadow-sm shadow-green-500/20' 
                  : 'border-gray-200 bg-gray-50 text-gray-400'
              }`}>
                3
              </span>
              <span>Input Nilai</span>
            </div>
            
          </div>
        </div>

        {/* Wizard Steps */}
        {wizardStep === 1 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in-up">
            <div className="border-b border-gray-150 pb-2.5">
              <h3 className="text-lg font-extrabold text-gray-950">Langkah 1: Pilih Mata Pelajaran</h3>
              <p className="text-xs text-gray-500 mt-1">Pilih mata pelajaran yang ingin Anda input nilainya hari ini.</p>
            </div>
            
            {availableMapels.length === 0 ? (
              <EmptyState title="Tidak Ada Mapel" description="Anda tidak terdaftar mengampu pelajaran di jadwal." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {availableMapels.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMapelId(String(m.id));
                      setWizardStep(2);
                    }}
                    className="border border-gray-200 bg-gray-50/50 hover:bg-green-50/20 hover:border-green-400 p-5 rounded-2xl cursor-pointer transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.kode_mapel}</span>
                      <h4 className="text-base font-extrabold text-gray-900 mt-1">{m.nama_mapel}</h4>
                    </div>
                    <span className="text-xs text-green-600 font-bold mt-4 flex items-center gap-1">
                      Pilih Mapel &rarr;
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {wizardStep === 2 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in-up">
            <div className="border-b border-gray-150 pb-2.5">
              <h3 className="text-lg font-extrabold text-gray-955">Langkah 2: Pilih Kelas & Periode</h3>
              {selectedMapel && (
                <p className="text-xs text-gray-500 mt-1">
                  Mata Pelajaran Terpilih: <strong className="text-green-600 font-extrabold">{selectedMapel.nama_mapel}</strong>
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-3 items-end">
              <label className="block text-left">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Pilih Kelas *</span>
                <select
                  value={selectedKelasId}
                  onChange={(e) => setSelectedKelasId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500"
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
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 outline-none text-sm transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 font-semibold text-gray-800"
                />
              </label>
            </div>

            <div className="flex justify-between items-center border-t border-gray-150 pt-6 mt-6">
              <button
                type="button"
                onClick={handleBackToStep1}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer text-xs"
              >
                &larr; Kembali ke Langkah 1
              </button>
              
              <button
                type="button"
                disabled={!selectedKelasId}
                onClick={() => setWizardStep(3)}
                className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer text-xs shadow-md shadow-green-500/10 transition"
              >
                Lanjutkan &rarr;
              </button>
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Active wizard details banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm font-semibold text-gray-700">
                <p>
                  Mata Pelajaran: <strong className="text-green-800 font-extrabold">{selectedMapel?.nama_mapel}</strong>
                </p>
                <p className="mt-1">
                  Kelas: <strong className="text-green-800 font-extrabold">{selectedKelas?.nama_kelas}</strong>
                </p>
                <p className="mt-1">
                  Periode: <strong className="text-green-800 font-extrabold">Semester {selectedSemester} ({selectedTahunAjaran})</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleBackToStep2}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-green-200 text-green-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Ubah Pilihan &larr;
              </button>
            </div>

            {loading ? (
              <StateBlock title="Memuat daftar siswa..." />
            ) : students.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <EmptyState title="Siswa Tidak Ditemukan" description="Belum ada siswa terdaftar di kelas ini." />
              </div>
            ) : (
              <form onSubmit={handleSaveGrades} className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="border-b border-gray-200 bg-green-50/50 text-xs font-bold uppercase tracking-wider text-gray-700">
                        <tr>
                          <th className="px-6 py-4 font-bold w-36">NIS</th>
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
                              <td className="px-6 py-4 text-gray-500 font-bold">{st.nis}</td>
                              <td className="px-6 py-4 font-extrabold text-gray-900">{st.nama}</td>
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

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition duration-150 disabled:bg-gray-400 cursor-pointer text-sm"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Nilai'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default NilaiTab;
