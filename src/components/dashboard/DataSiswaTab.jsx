import EmptyState from '../common/EmptyState';

function DataSiswaTab({ user, data }) {
  const isWaliKelas = !!data?.kelasPerwalian;
  const titleText = isWaliKelas
    ? `Daftar Siswa Kelas ${data.kelasPerwalian.nama_kelas}`
    : 'Daftar Siswa';

  const students = data?.siswa || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">
            {isWaliKelas ? 'Perwalian Kelas' : 'Akademik'}
          </p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">{titleText}</h2>
        </div>
        {isWaliKelas && (
          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full shadow-sm w-fit">
            Wali Kelas: {user.nama}
          </span>
        )}
      </div>

      {students.length === 0 ? (
        <EmptyState 
          title="Tidak Ada Siswa" 
          description="Belum ada data siswa yang dapat ditampilkan." 
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200 animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4.5 font-bold">NIS</th>
                  <th className="px-6 py-4.5 font-bold">Nama Siswa</th>
                  <th className="px-6 py-4.5 font-bold">Jenis Kelamin</th>
                  <th className="px-6 py-4.5 font-bold">Rata-rata Nilai</th>
                  <th className="px-6 py-4.5 font-bold">Kehadiran</th>
                  <th className="px-6 py-4.5 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white/60">
                {students.map((student, idx) => (
                  <tr key={idx} className="hover:bg-green-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 text-left">{student.nis}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800 text-left">{student.nama}</td>
                    <td className="px-6 py-4 font-medium text-left">{student.jenis_kelamin}</td>
                    <td className="px-6 py-4 font-extrabold text-green-700 text-left">-</td>
                    <td className="px-6 py-4 font-semibold text-left">-</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700">
                        Aktif
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

export default DataSiswaTab;
