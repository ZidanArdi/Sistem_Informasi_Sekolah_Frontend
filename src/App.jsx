import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';

function SiswaList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/siswa');
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari server');
      }
      const result = await response.json();
      setStudents(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 w-full min-h-screen">
      <header className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-indigo-600 to-pink-500 bg-clip-text text-transparent mb-2">
          Sistem Informasi Sekolah
        </h1>
        <p className="text-slate-500 text-lg">Halaman Data Siswa (GET All Data)</p>
      </header>

      <main className="animate-fade-in-up">
        {loading && <div className="text-center p-12 bg-white rounded-2xl shadow-md text-slate-500 text-lg">Memuat data...</div>}
        
        {error && <div className="text-center p-12 bg-white rounded-2xl shadow-md text-red-500 text-lg border-l-4 border-red-500">{error}</div>}

        {!loading && !error && students.length === 0 && (
          <div className="text-center p-12 bg-white rounded-2xl shadow-md text-slate-500 text-lg">Belum ada data siswa.</div>
        )}

        {!loading && !error && students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] border border-slate-200 overflow-x-auto transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]">
            <table className="w-full text-left min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-indigo-50/50 text-slate-500 font-semibold p-5 text-sm uppercase tracking-wider border-b border-slate-200">NIS</th>
                  <th className="bg-indigo-50/50 text-slate-500 font-semibold p-5 text-sm uppercase tracking-wider border-b border-slate-200">Nama</th>
                  <th className="bg-indigo-50/50 text-slate-500 font-semibold p-5 text-sm uppercase tracking-wider border-b border-slate-200">Kelas</th>
                  <th className="bg-indigo-50/50 text-slate-500 font-semibold p-5 text-sm uppercase tracking-wider border-b border-slate-200">Alamat</th>
                  <th className="bg-indigo-50/50 text-slate-500 font-semibold p-5 text-sm uppercase tracking-wider border-b border-slate-200">Email</th>
                  <th className="bg-indigo-50/50 text-slate-500 font-semibold p-5 text-sm uppercase tracking-wider border-b border-slate-200">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.nis} className="hover:bg-indigo-50/30 group">
                    <td className="p-5 border-b border-slate-200">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">{student.nis}</span>
                    </td>
                    <td className="p-5 border-b border-slate-200 text-slate-900 font-semibold">{student.nama}</td>
                    <td className="p-5 border-b border-slate-200 text-slate-900">{student.kelas}</td>
                    <td className="p-5 border-b border-slate-200 text-slate-900">{student.alamat}</td>
                    <td className="p-5 border-b border-slate-200 text-slate-900">{student.email}</td>
                    <td className="p-5 border-b border-slate-200">
                      <button 
                        className="bg-transparent text-indigo-600 border border-indigo-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-indigo-600 hover:text-white transition-colors duration-200 cursor-pointer"
                        onClick={() => navigate(`/siswa/${student.nis}`)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function SiswaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/siswa`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari server');
      }
      const result = await response.json();
      const foundStudent = (result.data || []).find((s) => s.nis === id);
      
      if (!foundStudent) {
        throw new Error('Siswa tidak ditemukan');
      }
      
      setStudent(foundStudent);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 w-full min-h-screen">
      <header className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-indigo-600 to-pink-500 bg-clip-text text-transparent mb-2">
          Detail Siswa
        </h1>
        <p className="text-slate-500 text-lg">Halaman Detail Siswa (GET By ID)</p>
      </header>

      <main className="flex justify-center items-center flex-col animate-fade-in-up">
        {loading && <div className="text-center p-12 bg-white rounded-2xl shadow-md text-slate-500 text-lg w-full max-w-2xl">Memuat data detail...</div>}
        
        {error && <div className="text-center p-12 bg-white rounded-2xl shadow-md text-red-500 text-lg border-l-4 border-red-500 w-full max-w-2xl">{error}</div>}

        {!loading && !error && student && (
          <div className="bg-white rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] border border-slate-200 p-10 w-full max-w-2xl text-center">
            <div className="mb-8 pb-6 border-b border-dashed border-slate-200">
               <span className="inline-block bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full text-lg font-bold mb-4">
                 {student.nis}
               </span>
               <h2 className="text-3xl text-slate-900 font-bold">{student.nama}</h2>
            </div>
            
            <div className="text-left mb-10">
              <div className="flex py-4 border-b border-slate-200">
                <span className="flex-none w-36 text-slate-500 font-medium">Kelas</span>
                <span className="flex-1 text-slate-900 font-semibold">{student.kelas}</span>
              </div>
              <div className="flex py-4 border-b border-slate-200">
                <span className="flex-none w-36 text-slate-500 font-medium">Alamat</span>
                <span className="flex-1 text-slate-900 font-semibold">{student.alamat}</span>
              </div>
              <div className="flex py-4 border-b border-slate-200">
                <span className="flex-none w-36 text-slate-500 font-medium">Email</span>
                <span className="flex-1 text-slate-900 font-semibold">{student.email}</span>
              </div>
              <div className="flex py-4">
                <span className="flex-none w-36 text-slate-500 font-medium">Tanggal Dibuat</span>
                <span className="flex-1 text-slate-900 font-semibold">
                  {new Date(student.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            
            <button 
              className="bg-slate-900 text-white border-none px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 w-full hover:bg-slate-700 hover:-translate-y-0.5"
              onClick={() => navigate('/')}
            >
              Kembali ke Daftar Siswa
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SiswaList />} />
        <Route path="/siswa/:id" element={<SiswaDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
