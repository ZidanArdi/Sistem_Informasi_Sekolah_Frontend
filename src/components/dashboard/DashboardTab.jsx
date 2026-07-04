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
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
            {[
              { label: 'Total Siswa', value: dashboardStats.total_siswa || 0, desc: 'Siswa terdaftar di sekolah', color: 'from-green-500 to-emerald-600', icon: '👥' },
              { label: 'Perizinan Siswa Pending', value: dashboardStats.total_perizinan_pending || 0, desc: 'Pengajuan menunggu approval Anda', color: 'from-amber-500 to-orange-500', icon: '⚠️' }
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

          {/* Schedule & Actions */}
          <section className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
              <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-2">Jadwal Mengajar Hari Ini ({getIndonesianDayName()})</h3>
              <div className="space-y-3.5">
                {!dashboardStats.jadwal_hari_ini || dashboardStats.jadwal_hari_ini.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center font-medium">Tidak ada jadwal mengajar hari ini.</p>
                ) : (
                  dashboardStats.jadwal_hari_ini.map((sched, idx) => (
                    <div key={idx} className="flex items-center p-4 rounded-xl border-l-4 border-emerald-600 bg-green-50/10 transition duration-150">
                      <div className="w-24 font-extrabold text-sm text-gray-900 pr-2">{sched.jam_mulai} - {sched.jam_selesai}</div>
                      <div className="flex-1 pl-4 border-l border-gray-200/60 text-left">
                        <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{sched.kelas?.nama_kelas || 'Umum'}</p>
                        <h4 className="text-sm font-extrabold text-gray-900 mt-0.5">{sched.mapel?.nama_mapel}</h4>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="md:col-span-1 rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-2">Persetujuan Perizinan</h3>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  Terdapat <strong className="text-amber-600">{dashboardStats.total_perizinan_pending || 0} pengajuan perizinan</strong> siswa yang menunggu persetujuan Anda.
                </p>
              </div>
              <Link
                to="/dashboard?tab=perizinan"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition text-center text-xs block cursor-pointer"
              >
                Proses Perizinan
              </Link>
            </div>
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
                    <h4 className="font-extrabold text-gray-950 text-base">{dashboardStats.profil_siswa.nama}</h4>
                    <p className="text-xs text-gray-500">NIS: {dashboardStats.profil_siswa.nis}</p>
                    <p className="text-xs text-gray-500">Kelas: {dashboardStats.profil_siswa.kelas?.nama_kelas || '-'}</p>
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
                      <div className="w-24 font-extrabold text-sm text-gray-900 pr-2">{sched.jam_mulai} - {sched.jam_seledited || sched.jam_selesai}</div>
                      <div className="flex-1 pl-4 border-l border-gray-200/60 text-left">
                        <h4 className="text-sm font-extrabold text-gray-900">{sched.mapel?.nama_mapel}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 font-semibold">Guru: {sched.guru?.nama || '-'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Recent Permits */}
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-extrabold text-gray-900 text-base">Riwayat Perizinan Terakhir</h3>
              <Link to="/dashboard?tab=perizinan" className="text-xs font-bold text-green-600 hover:text-green-700">Lihat Semua &rarr;</Link>
            </div>
            <div className="space-y-3">
              {!dashboardStats.riwayat_perizinan || dashboardStats.riwayat_perizinan.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center font-medium">Belum ada riwayat permohonan perizinan.</p>
              ) : (
                dashboardStats.riwayat_perizinan.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between animate-fade-in">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.tipe === 'Sakit' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {p.tipe}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold">
                          {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} s.d {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-650 font-medium">{p.alasan}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : p.status === 'Disetujui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default DashboardTab;
