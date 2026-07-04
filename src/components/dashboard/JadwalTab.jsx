import EmptyState from '../common/EmptyState';

const schoolDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function JadwalTab({ schedules = [], roleNorm }) {
  const isTeacher = roleNorm === 'guru';
  const emptyDescription = isTeacher
    ? 'Belum ada jadwal mengajar.'
    : 'Jadwal pelajaran belum tersedia.';

  const schedulesByDay = schoolDays
    .map((day) => ({
      day,
      schedules: schedules
        .filter((item) => item.hari?.toLowerCase() === day.toLowerCase())
        .sort((a, b) => (a.jam_mulai || '').localeCompare(b.jam_mulai || '')),
    }))
    .filter((item) => item.schedules.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Kurikulum</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
            {isTeacher ? 'Jadwal Mengajar' : 'Jadwal Pelajaran'}
          </h2>
        </div>
      </div>

      {schedulesByDay.length === 0 ? (
        <EmptyState title="Belum Ada Jadwal" description={emptyDescription} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {schedulesByDay.map(({ day, schedules: daySchedules }) => (
            <section key={day} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-base font-extrabold text-gray-900">{day}</h3>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                  {daySchedules.length} jadwal
                </span>
              </div>
              <div className="space-y-3">
                {daySchedules.map((schedule) => (
                  <article key={schedule.id} className="rounded-xl border-l-4 border-green-600 bg-green-50/50 p-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {schedule.jam_mulai} - {schedule.jam_selesai}
                    </span>
                    <strong className="mt-1 block text-sm font-extrabold text-gray-900">
                      {schedule.mapel?.nama_mapel || 'Mata pelajaran'}
                    </strong>
                    <span className="mt-1 block text-xs font-medium text-gray-500">
                      {isTeacher
                        ? schedule.kelas?.nama_kelas || 'Kelas belum ditentukan'
                        : schedule.guru?.nama || 'Guru belum ditentukan'}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default JadwalTab;
