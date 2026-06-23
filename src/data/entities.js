const genderOptions = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' },
];

const dayOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => ({
  value: day,
  label: day,
}));

const nilaiOptions = ['tugas', 'uts', 'uas'].map((jenis) => ({
  value: jenis,
  label: jenis.toUpperCase(),
}));

const semesterOptions = ['1', '2', '3', '4', '5', '6'].map((semester) => ({
  value: semester,
  label: `Semester ${semester}`,
}));

const toNumber = (value) => (value === '' || value === null || value === undefined ? null : Number(value));

const cleanPayload = (values) => Object.fromEntries(
  Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
);

export const entityConfigs = {
  guru: {
    title: 'Guru',
    endpoint: '/guru',
    searchPlaceholder: 'Cari nama atau NIP',
    fields: [
      { name: 'nip', label: 'NIP', required: true },
      { name: 'nama', label: 'Nama', required: true },
      { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: genderOptions, required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'no_hp', label: 'No. HP' },
      { name: 'alamat', label: 'Alamat', type: 'textarea' },
    ],
    columns: [
      { key: 'nip', label: 'NIP' },
      { key: 'nama', label: 'Nama' },
      { key: 'jenis_kelamin', label: 'JK' },
      { key: 'email', label: 'Email' },
      { key: 'no_hp', label: 'No. HP' },
    ],
    transformSubmit: cleanPayload,
  },
  kelas: {
    title: 'Kelas',
    endpoint: '/kelas',
    searchPlaceholder: 'Cari nama kelas',
    filters: [
      { name: 'tingkat', label: 'Tingkat' },
    ],
    fields: [
      { name: 'nama_kelas', label: 'Nama Kelas', required: true },
      { name: 'tingkat', label: 'Tingkat', required: true },
      { name: 'wali_kelas_id', label: 'Wali Kelas', type: 'select', optionsSource: 'guru', optionLabel: 'nama', optionSubLabel: 'nip' },
    ],
    columns: [
      { key: 'nama_kelas', label: 'Nama Kelas' },
      { key: 'tingkat', label: 'Tingkat' },
      { key: 'wali_kelas.nama', label: 'Wali Kelas' },
    ],
    transformSubmit: (values) => ({
      ...cleanPayload(values),
      wali_kelas_id: toNumber(values.wali_kelas_id),
    }),
  },
  siswa: {
    title: 'Siswa',
    endpoint: '/siswa',
    searchPlaceholder: 'Cari nama atau NIS',
    filters: [
      { name: 'kelas_id', label: 'Kelas', type: 'select', optionsSource: 'kelas', optionLabel: 'nama_kelas', optionSubLabel: 'tingkat' },
    ],
    fields: [
      { name: 'nis', label: 'NIS', required: true },
      { name: 'nama', label: 'Nama', required: true },
      { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: genderOptions, required: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', required: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', required: true },
      { name: 'alamat', label: 'Alamat', type: 'textarea', required: true },
      { name: 'kelas_id', label: 'Kelas', type: 'select', optionsSource: 'kelas', optionLabel: 'nama_kelas', optionSubLabel: 'tingkat', required: true },
    ],
    columns: [
      { key: 'nis', label: 'NIS' },
      { key: 'nama', label: 'Nama' },
      { key: 'jenis_kelamin', label: 'JK' },
      { key: 'kelas.nama_kelas', label: 'Kelas' },
      { key: 'alamat', label: 'Alamat' },
    ],
    transformSubmit: (values) => ({
      ...cleanPayload(values),
      kelas_id: Number(values.kelas_id),
    }),
  },
  mapel: {
    title: 'Mata Pelajaran',
    shortTitle: 'Mapel',
    endpoint: '/mapel',
    searchPlaceholder: 'Cari nama atau kode mapel',
    fields: [
      { name: 'kode_mapel', label: 'Kode Mapel', required: true },
      { name: 'nama_mapel', label: 'Nama Mapel', required: true },
      { name: 'jam', label: 'Jam', type: 'number', required: true },
    ],
    columns: [
      { key: 'kode_mapel', label: 'Kode' },
      { key: 'nama_mapel', label: 'Nama Mapel' },
      { key: 'jam', label: 'Jam' },
    ],
    transformSubmit: (values) => ({
      ...cleanPayload(values),
      jam: Number(values.jam),
    }),
  },
  jadwal: {
    title: 'Jadwal',
    endpoint: '/jadwal',
    filters: [
      { name: 'kelas_id', label: 'Kelas', type: 'select', optionsSource: 'kelas', optionLabel: 'nama_kelas', optionSubLabel: 'tingkat' },
      { name: 'mapel_id', label: 'Mapel', type: 'select', optionsSource: 'mapel', optionLabel: 'nama_mapel', optionSubLabel: 'kode_mapel' },
      { name: 'guru_id', label: 'Guru', type: 'select', optionsSource: 'guru', optionLabel: 'nama', optionSubLabel: 'nip' },
      { name: 'hari', label: 'Hari', type: 'select', options: dayOptions },
    ],
    fields: [
      { name: 'kelas_id', label: 'Kelas', type: 'select', optionsSource: 'kelas', optionLabel: 'nama_kelas', optionSubLabel: 'tingkat', required: true },
      { name: 'mapel_id', label: 'Mapel', type: 'select', optionsSource: 'mapel', optionLabel: 'nama_mapel', optionSubLabel: 'kode_mapel', required: true },
      { name: 'guru_id', label: 'Guru', type: 'select', optionsSource: 'guru', optionLabel: 'nama', optionSubLabel: 'nip', required: true },
      { name: 'hari', label: 'Hari', type: 'select', options: dayOptions, required: true },
      { name: 'jam_mulai', label: 'Jam Mulai', type: 'time', required: true },
      { name: 'jam_selesai', label: 'Jam Selesai', type: 'time', required: true },
    ],
    columns: [
      { key: 'hari', label: 'Hari' },
      { key: 'jam_mulai', label: 'Mulai' },
      { key: 'jam_selesai', label: 'Selesai' },
      { key: 'kelas.nama_kelas', label: 'Kelas' },
      { key: 'mapel.nama_mapel', label: 'Mapel' },
      { key: 'guru.nama', label: 'Guru' },
    ],
    transformSubmit: (values) => ({
      ...cleanPayload(values),
      kelas_id: Number(values.kelas_id),
      mapel_id: Number(values.mapel_id),
      guru_id: Number(values.guru_id),
    }),
  },
  nilai: {
    title: 'Nilai',
    endpoint: '/nilai',
    filters: [
      { name: 'siswa_id', label: 'Siswa', type: 'select', optionsSource: 'siswa', optionLabel: 'nama', optionSubLabel: 'nis' },
      { name: 'mapel_id', label: 'Mapel', type: 'select', optionsSource: 'mapel', optionLabel: 'nama_mapel', optionSubLabel: 'kode_mapel' },
      { name: 'semester', label: 'Semester', type: 'select', options: semesterOptions },
      { name: 'jenis_nilai', label: 'Jenis', type: 'select', options: nilaiOptions },
    ],
    fields: [
      { name: 'siswa_id', label: 'Siswa', type: 'select', optionsSource: 'siswa', optionLabel: 'nama', optionSubLabel: 'nis', required: true },
      { name: 'mapel_id', label: 'Mapel', type: 'select', optionsSource: 'mapel', optionLabel: 'nama_mapel', optionSubLabel: 'kode_mapel', required: true },
      { name: 'semester', label: 'Semester', type: 'select', options: semesterOptions, required: true },
      { name: 'jenis_nilai', label: 'Jenis Nilai', type: 'select', options: nilaiOptions, required: true },
      { name: 'nilai', label: 'Nilai', type: 'number', required: true },
    ],
    columns: [
      { key: 'siswa.nama', label: 'Siswa' },
      { key: 'mapel.nama_mapel', label: 'Mapel' },
      { key: 'semester', label: 'Semester' },
      { key: 'jenis_nilai', label: 'Jenis' },
      { key: 'nilai', label: 'Nilai' },
    ],
    transformSubmit: (values) => ({
      ...cleanPayload(values),
      siswa_id: Number(values.siswa_id),
      mapel_id: Number(values.mapel_id),
      nilai: Number(values.nilai),
    }),
  },
};

export const entityNav = [
  { key: 'guru', label: 'Guru' },
  { key: 'kelas', label: 'Kelas' },
  { key: 'siswa', label: 'Siswa' },
  { key: 'mapel', label: 'Mapel' },
  { key: 'jadwal', label: 'Jadwal' },
  { key: 'nilai', label: 'Nilai' },
];

export const getNestedValue = (item, path) => path.split('.').reduce((value, key) => value?.[key], item);

export const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return value;
};

export const buildInitialValues = (fields, data = {}) => fields.reduce((values, field) => {
  const value = data[field.name];
  values[field.name] = value === null || value === undefined ? '' : String(value).slice(0, field.type === 'date' ? 10 : undefined);
  return values;
}, {});
