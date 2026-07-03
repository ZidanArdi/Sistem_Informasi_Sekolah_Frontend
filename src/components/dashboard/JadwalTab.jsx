import React from 'react';

function JadwalTab() {
  const scheduleDays = [
    {
      day: 'Senin',
      color: 'border-l-4 border-green-600 bg-green-50/20',
      subjects: [
        { time: '08:00 - 09:30', name: 'Matematika', room: 'R. 101', teacher: 'Dr. Albert' },
        { time: '09:45 - 11:15', name: 'Bahasa Indonesia', room: 'R. 101', teacher: 'Ibu Endang' },
        { time: '11:30 - 13:00', name: 'PPKN', room: 'R. 101', teacher: 'Pak Joko' },
      ]
    },
    {
      day: 'Selasa',
      color: 'border-l-4 border-amber-500 bg-amber-50/20',
      subjects: [
        { time: '08:00 - 09:30', name: 'IPA (Fisika)', room: 'Lab Fisika', teacher: 'Ibu Ratna' },
        { time: '09:45 - 11:15', name: 'IPS (Sejarah)', room: 'R. 101', teacher: 'Pak Budi' },
        { time: '11:30 - 13:00', name: 'Agama Islam', room: 'R. Ibadah', teacher: 'Ustadz Ahmad' },
      ]
    },
    {
      day: 'Rabu',
      color: 'border-l-4 border-blue-500 bg-blue-50/20',
      subjects: [
        { time: '08:00 - 09:30', name: 'Bahasa Inggris', room: 'Lab Bahasa', teacher: 'Miss Clara' },
        { time: '09:45 - 11:15', name: 'Penjasorkes', room: 'Lapangan Olahraga', teacher: 'Budi Santoso' },
        { time: '11:30 - 13:00', name: 'Seni Budaya', room: 'R. Kesenian', teacher: 'M.A Jackson' },
      ]
    },
    {
      day: 'Kamis',
      color: 'border-l-4 border-purple-500 bg-purple-50/20',
      subjects: [
        { time: '08:00 - 09:30', name: 'Informatika', room: 'Lab Komputer', teacher: 'Dr. Albert' },
        { time: '09:45 - 11:15', name: 'Sejarah Indonesia', room: 'R. 101', teacher: 'Miss Clara' },
        { time: '11:30 - 13:00', name: 'Prakarya', room: 'R. Keterampilan', teacher: 'M.A Jackson' },
      ]
    },
    {
      day: 'Jumat',
      color: 'border-l-4 border-teal-600 bg-teal-50/20',
      subjects: [
        { time: '08:00 - 09:30', name: 'Matematika Peminatan', room: 'R. 101', teacher: 'Dr. Albert' },
        { time: '09:45 - 11:15', name: 'Fisika Terapan', room: 'Lab Fisika', teacher: 'Miss Clara' },
        { time: '11:30 - 13:00', name: 'Kimia', room: 'Lab Kimia', teacher: 'M.A Jackson' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Kurikulum</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">Jadwal Mingguan</h2>
        </div>
        <div className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full shadow-sm w-fit">
          📅 5 Hari Sekolah (Senin - Jumat)
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-5">
        {scheduleDays.map((d) => (
          <div key={d.day} className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm space-y-4 text-left">
            <div className="border-b border-gray-150 pb-2 flex justify-between items-center">
              <span className="font-extrabold text-gray-955 text-base">{d.day}</span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="space-y-3">
              {d.subjects.map((sub, sIdx) => (
                <div key={sIdx} className={`p-3 rounded-xl ${d.color} text-left`}>
                  <span className="text-[9px] font-bold text-gray-400 block tracking-wider uppercase">{sub.time}</span>
                  <strong className="text-xs font-extrabold text-gray-900 block mt-0.5">{sub.name}</strong>
                  <span className="text-[10px] text-gray-505 font-semibold block mt-1">🚪 {sub.room}</span>
                  <span className="text-[10px] text-gray-400 font-medium block mt-0.5 truncate">👤 {sub.teacher}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JadwalTab;
