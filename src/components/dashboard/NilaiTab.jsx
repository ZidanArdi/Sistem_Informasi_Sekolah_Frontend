import React from 'react';

function NilaiTab() {
  const grades = [
    { mapel: 'Matematika', tugas: 85, uts: 80, uas: 90, akhir: 85.5, semester: '1', status: 'Lulus' },
    { mapel: 'Bahasa Indonesia', tugas: 90, uts: 85, uas: 88, akhir: 87.8, semester: '1', status: 'Lulus' },
    { mapel: 'PPKN', tugas: 80, uts: 78, uas: 85, akhir: 81.2, semester: '1', status: 'Lulus' },
    { mapel: 'Fisika', tugas: 88, uts: 92, uas: 85, akhir: 88.1, semester: '1', status: 'Lulus' },
    { mapel: 'Kimia', tugas: 85, uts: 80, uas: 88, akhir: 84.8, semester: '1', status: 'Lulus' },
    { mapel: 'Bahasa Inggris', tugas: 92, uts: 88, uas: 95, akhir: 92.1, semester: '1', status: 'Lulus' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Hasil Evaluasi</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Nilai Akademik</h2>
        </div>
        <div className="flex gap-2">
          <select className="rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 outline-none transition focus:border-green-500 cursor-pointer">
            <option value="1">Semester 1 (Ganjil)</option>
            <option value="2">Semester 2 (Genap)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm flex items-center gap-4 text-left">
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-200/50">
            📚
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Mapel</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">6 Pelajaran</p>
          </div>
        </div>
        
        <div className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm flex items-center gap-4 text-left">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/50">
            📈
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rata-rata Kelas</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">86.6</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm flex items-center gap-4 text-left">
          <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-200/50">
            🎓
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Kelulusan</p>
            <p className="text-2xl font-extrabold text-green-700 mt-1">TUNTAS (LULUS)</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4.5 font-bold">Mata Pelajaran</th>
                <th className="px-6 py-4.5 font-bold">Tugas (30%)</th>
                <th className="px-6 py-4.5 font-bold">UTS (30%)</th>
                <th className="px-6 py-4.5 font-bold">UAS (40%)</th>
                <th className="px-6 py-4.5 font-bold">Nilai Akhir</th>
                <th className="px-6 py-4.5 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 bg-white/60">
              {grades.map((g, idx) => (
                <tr key={idx} className="hover:bg-green-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 font-bold text-gray-900 text-left">{g.mapel}</td>
                  <td className="px-6 py-4 font-semibold">{g.tugas}</td>
                  <td className="px-6 py-4 font-semibold">{g.uts}</td>
                  <td className="px-6 py-4 font-semibold">{g.uas}</td>
                  <td className="px-6 py-4 font-extrabold text-green-700 bg-green-50/10">{g.akhir}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default NilaiTab;
