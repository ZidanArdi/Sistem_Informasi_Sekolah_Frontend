import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const LandingPage = () => {
  const [schoolProfile, setSchoolProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/school-profile');
        if (response.data && response.data.data) {
          setSchoolProfile(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch school profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const scrollToTentang = () => {
    const element = document.getElementById('tentang-sekolah');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col animate-fade-in-up">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <span className="text-white font-extrabold text-xl">S</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                Sistem Informasi Sekolah
              </span>
            </div>
            <div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-md shadow-green-500/20 hover:shadow-green-500/30 cursor-pointer"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-white pt-20 pb-32">
          {/* Decorative backgrounds */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-50 blur-3xl opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-green-100 blur-3xl opacity-50 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
              Sistem Informasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">Akademik Sekolah</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Platform pengelolaan data akademik yang membantu administrasi sekolah, guru, dan siswa dalam mengelola kegiatan pembelajaran secara lebih efektif dan terintegrasi.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-1"
              >
                Masuk ke Sistem
              </Link>
              <button
                onClick={scrollToTentang}
                className="inline-flex items-center justify-center bg-white border-2 border-gray-200 hover:border-green-600 hover:text-green-700 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              >
                Tentang Sekolah
              </button>
            </div>
          </div>
        </section>

        {/* SECTION FITUR */}
        <section className="py-24 bg-gray-50 border-t border-gray-100 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Fitur Utama</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">Solusi terintegrasi untuk seluruh civitas akademika</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 hover:-translate-y-2 group">
                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  👨‍💼
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Admin</h3>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Mengelola data guru, siswa, kelas, mata pelajaran, jadwal, dan laporan akademik.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 hover:-translate-y-2 group">
                <div className="h-16 w-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  👩‍🏫
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Guru</h3>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Melihat jadwal mengajar, menginput nilai, serta mengelola informasi akademik siswa.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 hover:-translate-y-2 group">
                <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  🎓
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Siswa</h3>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Melihat nilai, jadwal pelajaran, profil, serta mengajukan perizinan secara online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION TENTANG SEKOLAH */}
        <section id="tentang-sekolah" className="py-24 bg-white relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Tentang Sekolah</h2>
              <p className="text-gray-500 text-lg">Informasi profil institusi pendidikan</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-400"></div>
              <div className="p-8 sm:p-10">
                {loading ? (
                  <div className="animate-pulse space-y-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="h-4 bg-gray-100 rounded w-24"></div>
                          <div className="h-4 bg-gray-100 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                        {schoolProfile?.name || 'Belum tersedia.'}
                      </h3>
                      <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">
                        NPSN: {schoolProfile?.npsn || 'Belum tersedia.'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-6 border-t border-gray-100">
                      <div>
                        <span className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat</span>
                        <span className="text-gray-800 font-semibold">{schoolProfile?.address || 'Belum tersedia.'}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Telepon</span>
                        <span className="text-gray-800 font-semibold">{schoolProfile?.phone || 'Belum tersedia.'}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email</span>
                        <span className="text-gray-800 font-semibold">{schoolProfile?.email || 'Belum tersedia.'}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Website</span>
                        {schoolProfile?.website ? (
                          <a href={schoolProfile.website} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
                            {schoolProfile.website}
                          </a>
                        ) : (
                          <span className="text-gray-800 font-semibold">Belum tersedia.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 py-12 text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-400 font-medium mb-6">
            © 2026 Sistem Informasi Sekolah
          </p>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-3">Dikembangkan menggunakan</span>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm font-semibold shadow-inner border border-gray-700">React</span>
              <span className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm font-semibold shadow-inner border border-gray-700">Golang Fiber</span>
              <span className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm font-semibold shadow-inner border border-gray-700">PostgreSQL</span>
              <span className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm font-semibold shadow-inner border border-gray-700">Supabase</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
