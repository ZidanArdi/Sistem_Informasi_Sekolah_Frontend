import { Link } from 'react-router-dom';
import EmptyState from '../common/EmptyState';

function DashboardTab({
  roleNorm,
  user,
  dashboardStats,
  siswaPerKelas,
  rataNilaiMapel,
  getGreeting,
  getInitials,
  getIndonesianDayName
}) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-500/5 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-600">Portal Akademik</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {getGreeting()}, {user.nama || 'Pengguna'}!
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-xl">
              Selamat datang di portal informasi sekolah. Berikut adalah rangkuman data akademik terupdate hari ini.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-xl bg-green-50 border border-green-200/50 px-3.5 py-2 text-sm font-semibold text-green-700">
              Role: <strong className="ml-1 capitalize">{user.role || 'siswa'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Content based on Role */}
      {roleNorm === 'admin' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Total Siswa', value: dashboardStats.total_siswa || 0, desc: 'Siswa aktif terdaftar', color: 'from-green-500 to-emerald-600', icon: '👥' },
              { label: 'Total Guru', value: dashboardStats.total_guru || 0, desc: 'Tenaga pengajar aktif', color: 'from-emerald-500 to-teal-500', icon: '👨‍🏫' },
              { label: 'Total Kelas', value: dashboardStats.total_kelas || 0, desc: 'Ruang kelas belajar', color: 'from-green-600 to-emerald-700', icon: '🏫' },
              { label: 'Total Mapel', value: dashboardStats.total_mapel || 0, desc: 'Mata pelajaran diajarkan', color: 'from-teal-600 to-emerald-600', icon: '📖' },
              { label: 'Perizinan Pending', value: dashboardStats.total_perizinan_pending || 0, desc: 'Surat pending persetujuan', color: 'from-amber-500 to-orange-500', icon: '⚠️' }
            ].map((item) => (
              <div key={item.label} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-200 text-left">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                    <p className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">{item.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm text-xl">
                    {item.icon}
                  </div>
                </div>
                <p className="mt-4 text-xs font-medium text-gray-500">{item.desc}</p>
              </div>
            ))}
          </section>

          {/* Charts Section */}
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left">
              <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-4 mb-6">Sebaran Siswa per Kelas</h3>
              <div className="space-y-4">
                {siswaPerKelas.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex justify-between text-xs font-bold text-gray-700">
                      <span>{item.label}</span>
                      <span>{item.count} Siswa</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000" style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left">
              <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-4 mb-6">Rata-rata Nilai per Mapel</h3>
              {rataNilaiMapel.length === 0 ? (
                <EmptyState title="Belum Ada Nilai" description="Nilai akademik belum tersedia." />
              ) : (
                <div className="space-y-4">
                  {rataNilaiMapel.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex justify-between text-xs font-bold text-gray-700">
                      <span>{item.label}</span>
                      <span>{item.value} / 100</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-1000" style={{ width: item.width }} />
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {roleNorm === 'guru' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Jadwal Hari Ini', value: dashboardStats.today_schedule || 0, desc: 'Jadwal mengajar hari ini', color: 'from-green-500 to-emerald-600', icon: '📅' },
              { label: 'Kelas Diampu', value: dashboardStats.total_classes || 0, desc: 'Kelas diampu aktif', color: 'from-emerald-500 to-teal-500', icon: '🏫' },
              { label: 'Total Siswa', value: dashboardStats.total_students || 0, desc: 'Siswa di kelas diampu', color: 'from-green-600 to-emerald-700', icon: '👥' },
              { label: 'Nilai Belum Diinput', value: dashboardStats.pending_grades || 0, desc: 'Input nilai belum selesai', color: 'from-amber-500 to-orange-500', icon: '📝' }
            ].map((item) => (
              <div key={item.label} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-200 text-left">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                    <p className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">{item.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm text-xl">
                    {item.icon}
                  </div>
                </div>
                <p className="mt-4 text-xs font-medium text-gray-500">{item.desc}</p>
              </div>
            ))}
          </section>

          {/* Today's Teaching Schedule */}
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
            <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-2">Jadwal Mengajar Hari Ini ({getIndonesianDayName()})</h3>
            {!dashboardStats.jadwal_hari_ini || dashboardStats.jadwal_hari_ini.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <span className="text-4xl">📅</span>
                <h4 className="text-base font-bold text-gray-900">Belum ada jadwal mengajar hari ini.</h4>
                <p className="text-xs text-gray-400">Silakan cek kembali jadwal mengajar Anda.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {dashboardStats.jadwal_hari_ini.map((sched, idx) => (
                  <div key={idx} className="flex flex-col justify-between p-5 rounded-2xl border border-gray-150 bg-green-50/10 hover:shadow-md transition-all duration-300">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center rounded-lg bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-bold text-green-700">
                          {sched.jam_mulai} - {sched.jam_selesai}
                        </span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Kelas {sched.kelas?.nama_kelas || 'Umum'}
                        </span>
                      </div>
                      <div className="text-left">
                        <h4 className="text-base font-extrabold text-gray-950 line-clamp-2">{sched.mapel?.nama_mapel}</h4>
                        <div className="flex items-center justify-between mt-2.5">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{sched.mapel?.kode_mapel}</p>
                          <span className="text-xs font-bold text-green-600 bg-green-50/80 px-2 py-0.5 rounded border border-green-100">
                            {sched.kelas?.total_siswa || 0} Siswa
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-6 border-t border-gray-150 pt-4">
                      <Link
                        to={`/dashboard?tab=input-nilai&mapel_id=${sched.mapel_id}&kelas_id=${sched.kelas_id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 shadow-sm shadow-green-500/10 active:scale-95 transition"
                      >
                        Input Nilai
                      </Link>
                      <Link
                        to={`/dashboard?tab=data-siswa&kelas_id=${sched.kelas_id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-gray-50 text-green-700 border border-green-200 text-xs font-bold py-2.5 active:scale-95 transition"
                      >
                        Lihat Siswa
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {roleNorm === 'siswa' && (
        <div className="space-y-8">
          {/* Student Dashboard Grid */}
          <section className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <div className="md:col-span-1 rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
              <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-2">Profil Singkat</h3>
              {dashboardStats.profil_siswa ? (
                <div className="space-y-3">
                  <div className="h-16 w-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-2xl animate-scale-up">
                    {getInitials(dashboardStats.profil_siswa.nama)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-955 text-base">{dashboardStats.profil_siswa.nama}</h4>
                    <p className="text-xs text-gray-505 font-medium">NIS: {dashboardStats.profil_siswa.nis}</p>
                    <p className="text-xs text-gray-550 font-medium">Kelas: {dashboardStats.profil_siswa.kelas?.nama_kelas || '-'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Memuat profil...</p>
              )}
            </div>

            {/* Today's Schedule */}
            <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
              <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-2">Jadwal Pelajaran Hari Ini ({getIndonesianDayName()})</h3>
              <div className="space-y-3">
                {!dashboardStats.jadwal_hari_ini || dashboardStats.jadwal_hari_ini.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center font-medium">Tidak ada jadwal pelajaran hari ini.</p>
                ) : (
                  dashboardStats.jadwal_hari_ini.map((sched, idx) => (
                    <div key={idx} className="flex items-center p-4 rounded-xl border-l-4 border-green-600 bg-green-50/10 transition duration-150">
                      <div className="w-24 font-extrabold text-sm text-gray-900 pr-2">{sched.jam_mulai} - {sched.jam_selesai}</div>
                      <div className="flex-1 pl-4 border-l border-gray-200/60 text-left">
                        <h4 className="text-sm font-extrabold text-gray-900">{sched.mapel?.nama_mapel}</h4>
                        <p className="text-[10px] text-gray-505 mt-1 font-semibold">Guru: {sched.guru?.nama || '-'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* School Announcement Placeholder */}
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-extrabold text-gray-900 text-base">Pengumuman Sekolah</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <span className="text-4xl">📢</span>
              <h4 className="text-base font-bold text-gray-900">Belum ada pengumuman.</h4>
              <p className="text-xs text-gray-400 max-w-sm">
                Silakan kembali lagi nanti untuk melihat informasi terbaru dari sekolah.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default DashboardTab;
