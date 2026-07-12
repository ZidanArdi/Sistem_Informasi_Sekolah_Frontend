const genderOptions = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' },
];

const dayOptions = [
  { value: 'Senin', label: 'Senin' },
  { value: 'Selasa', label: 'Selasa' },
  { value: 'Rabu', label: 'Rabu' },
  { value: 'Kamis', label: 'Kamis' },
  { value: 'Jumat', label: 'Jumat' },
  { value: 'Sabtu', label: 'Sabtu' },
];

const semesterOptions = [
  { value: 'Ganjil', label: 'Ganjil' },
  { value: 'Genap', label: 'Genap' },
];

const nilaiOptions = [
  { value: 'Tugas', label: 'Tugas' },
  { value: 'UTS', label: 'UTS' },
  { value: 'UAS', label: 'UAS' },
];

const jurusanOptions = [
  { value: 'RPL', label: 'Rekayasa Perangkat Lunak (RPL)' },
  { value: 'TKJ', label: 'Teknik Komputer & Jaringan (TKJ)' },
  { value: 'AKL', label: 'Akuntansi & Keuangan Lembaga (AKL)' },
  { value: 'DKV', label: 'Desain Komunikasi Visual (DKV)' },
];

const cleanPayload = (values) => Object.entries(values).reduce((cleaned, [key, val]) => {
  if (val !== '') {
    cleaned[key] = val;
  }
  return cleaned;
}, {});

export const entityConfigs = {
  guru: {
    title: 'Guru',
    endpoint: '/guru',
    searchPlaceholder: 'Cari nama atau NIG',
    fields: [
      { name: 'nama', label: 'Nama', required: true, gridSpan: 2 },
      { 
        name: 'gelar', 
        label: 'Gelar', 
        type: 'select', 
        options: [
          { value: 'S.Pd', label: 'S.Pd' },
          { value: 'S.Pd., M.Pd', label: 'S.Pd., M.Pd' },
          { value: 'S.Kom', label: 'S.Kom' },
          { value: 'S.Kom., M.Kom', label: 'S.Kom., M.Kom' },
          { value: 'M.Pd', label: 'M.Pd' },
          { value: 'M.Kom', label: 'M.Kom' },
          { value: 'Dr.', label: 'Dr.' },
          { value: 'Prof.', label: 'Prof.' }
        ], 
        required: true,
        gridSpan: 1
      },
      { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: genderOptions, required: true, gridSpan: 1 },
      { name: 'no_hp', label: 'No. HP', gridSpan: 2 },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'address', gridSpan: 2 },
      { name: 'mapel_ids', label: 'Mapel Diampu', type: 'checkbox_group', optionsSource: 'mapel', optionLabel: 'nama_mapel', optionSubLabel: 'kode_mapel', gridSpan: 2 },
    ],
    columns: [
      { key: 'nip', label: 'Nomor Induk Guru (NIG)' },
      { key: 'nama', label: 'Nama' },
      { key: 'gelar', label: 'Gelar' },
      { key: 'jenis_kelamin', label: 'JK' },
      { key: 'user.email', label: 'Email' },
      { key: 'no_hp', label: 'No. HP' },
    ],
    transformSubmit: (values) => ({
      ...cleanPayload(values),
      mapel_ids: Array.isArray(values.mapel_ids) ? values.mapel_ids.map(Number) : [],
    }),
  },
  kelas: {
    title: 'Kelas',
    endpoint: '/kelas',
    searchPlaceholder: 'Cari nama kelas',
    filters: [
      { name: 'tingkat', label: 'Tingkat' },
    ],
    fields: [
      { name: 'nama_kelas', label: 'Nama Kelas', required: true, gridSpan: 2 },
      { name: 'tingkat', label: 'Tingkat', required: true, gridSpan: 1 },
      { name: 'jurusan', label: 'Jurusan', type: 'select', options: jurusanOptions, required: true, gridSpan: 1 },
      { name: 'kapasitas', label: 'Kapasitas', type: 'number', required: true, gridSpan: 2 },
      { name: 'wali_kelas_id', label: 'Wali Kelas', type: 'select', optionsSource: 'guru', optionLabel: 'nama', optionSubLabel: 'nip', gridSpan: 2 },
    ],
    columns: [
      { key: 'nama_kelas', label: 'Nama Kelas' },
      { key: 'tingkat', label: 'Tingkat' },
      { key: 'jurusan', label: 'Jurusan' },
      { key: 'kapasitas', label: 'Kapasitas' },
      { key: 'total_siswa', label: 'Total Siswa' },
      { key: 'wali_kelas.nama', label: 'Wali Kelas' },
    ],
    transformSubmit: (values) => ({
      ...cleanPayload(values),
      kapasitas: Number(values.kapasitas),
      wali_kelas_id: values.wali_kelas_id === '' ? null : Number(values.wali_kelas_id),
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
      { name: 'nama', label: 'Nama', required: true, gridSpan: 2 },
      { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: genderOptions, required: true, gridSpan: 1 },
      { name: 'kelas_id', label: 'Kelas', type: 'select', optionsSource: 'kelas', optionLabel: 'nama_kelas', optionSubLabel: 'tingkat', required: true, gridSpan: 1 },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', required: true, gridSpan: 1 },
      { name: 'no_hp', label: 'No. HP', gridSpan: 1 },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'address', gridSpan: 2 },
    ],
    columns: [
      { key: 'nis', label: 'NIS' },
      { key: 'nama', label: 'Nama' },
      { key: 'jenis_kelamin', label: 'JK' },
      { key: 'kelas.nama_kelas', label: 'Kelas' },
      { key: 'no_hp', label: 'No. HP' },
      { key: 'alamat_detail', label: 'Alamat' },
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
    searchPlaceholder: 'Cari nama, kode atau jurusan mapel',
    fields: [
      { name: 'kode_mapel', label: 'Kode Mapel', required: true, gridSpan: 1 },
      { name: 'jam', label: 'Jam', type: 'number', required: true, gridSpan: 1 },
      { name: 'nama_mapel', label: 'Nama Mapel', required: true, gridSpan: 2 },
      { 
        name: 'is_umum', 
        label: 'Tipe Pelajaran', 
        type: 'select', 
        options: [
          { value: 'true', label: 'Umum (Semua Jurusan)' },
          { value: 'false', label: 'Spesifik Jurusan' }
        ], 
        required: true, 
        gridSpan: 1 
      },
      { name: 'jurusan', label: 'Jurusan', type: 'select', options: jurusanOptions, required: false, gridSpan: 1 },
    ],
    columns: [
      { key: 'kode_mapel', label: 'Kode' },
      { key: 'nama_mapel', label: 'Nama Mapel' },
      { key: 'jam', label: 'Jam' },
      { key: 'is_umum', label: 'Tipe' },
      { key: 'jurusan', label: 'Jurusan' },
    ],
    transformSubmit: (values) => ({
      ...cleanPayload(values),
      jam: Number(values.jam),
      is_umum: values.is_umum === 'true',
      jurusan: values.is_umum === 'true' ? '' : values.jurusan,
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
      { name: 'semester', label: 'Semester', type: 'select', options: semesterOptions },
      { name: 'tahun_ajaran', label: 'Tahun Ajaran' },
    ],
    fields: [
      { name: 'kelas_id', label: 'Kelas', type: 'select', optionsSource: 'kelas', optionLabel: 'nama_kelas', optionSubLabel: 'tingkat', required: true, gridSpan: 1 },
      { name: 'mapel_id', label: 'Mapel', type: 'select', optionsSource: 'mapel', optionLabel: 'nama_mapel', optionSubLabel: 'kode_mapel', required: true, gridSpan: 1 },
      { name: 'guru_id', label: 'Guru', type: 'select', optionsSource: 'guru', optionLabel: 'nama', optionSubLabel: 'nip', required: true, gridSpan: 2 },
      { name: 'hari', label: 'Hari', type: 'select', options: dayOptions, required: true, gridSpan: 2 },
      { name: 'jam_mulai', label: 'Jam Mulai', type: 'time', required: true, gridSpan: 1 },
      { name: 'jam_selesai', label: 'Jam Selesai', type: 'time', required: true, gridSpan: 1 },
      { name: 'tahun_ajaran', label: 'Tahun Ajaran', required: true, gridSpan: 1 },
      { name: 'semester', label: 'Semester', type: 'select', options: semesterOptions, required: true, gridSpan: 1 },
    ],
    columns: [
      { key: 'hari', label: 'Hari' },
      { key: 'jam_mulai', label: 'Mulai' },
      { key: 'jam_selesai', label: 'Selesai' },
      { key: 'kelas.nama_kelas', label: 'Kelas' },
      { key: 'mapel.nama_mapel', label: 'Mapel' },
      { key: 'guru.nama', label: 'Guru' },
      { key: 'tahun_ajaran', label: 'Tahun Ajaran' },
      { key: 'semester', label: 'Semester' },
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
      { name: 'siswa_id', label: 'Siswa', type: 'select', optionsSource: 'siswa', optionLabel: 'nama', optionSubLabel: 'nis', required: true, gridSpan: 2 },
      { name: 'mapel_id', label: 'Mapel', type: 'select', optionsSource: 'mapel', optionLabel: 'nama_mapel', optionSubLabel: 'kode_mapel', required: true, gridSpan: 2 },
      { name: 'semester', label: 'Semester', type: 'select', options: semesterOptions, required: true, gridSpan: 1 },
      { name: 'jenis_nilai', label: 'Jenis Nilai', type: 'select', options: nilaiOptions, required: true, gridSpan: 1 },
      { name: 'nilai', label: 'Nilai', type: 'number', required: true, gridSpan: 2 },
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
  if (value === true) return 'Umum';
  if (value === false) return 'Kejuruan';

  return value;
};

export const buildInitialValues = (fields, data = {}) => fields.reduce((values, field) => {
  if (field.type === 'address') {
    values.provinsi = data.provinsi || '';
    values.kabupaten = data.kabupaten || '';
    values.kecamatan = data.kecamatan || '';
    values.desa = data.desa || '';
    values.alamat_detail = data.alamat_detail || '';
  } else if (field.type === 'checkbox_group') {
    values[field.name] = Array.isArray(data[field.name]) ? data[field.name].map(String) : [];
  } else {
    const value = data[field.name];
    values[field.name] = value === null || value === undefined ? '' : String(value).slice(0, field.type === 'date' ? 10 : undefined);
  }
  return values;
}, {});
