import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const FALLBACK_PROVINCES = [
  { id: '33', name: 'JAWA TENGAH' },
  { id: '31', name: 'DKI JAKARTA' },
  { id: '32', name: 'JAWA BARAT' },
  { id: '35', name: 'JAWA TIMUR' },
];

const FALLBACK_REGENCIES = {
  '33': [{ id: '3374', name: 'KOTA SEMARANG' }],
  '31': [{ id: '3171', name: 'KOTA JAKARTA SELATAN' }],
  '32': [{ id: '3273', name: 'KOTA BANDUNG' }],
  '35': [{ id: '3578', name: 'KOTA SURABAYA' }],
};

const FALLBACK_DISTRICTS = {
  '3374': [
    { id: '3374110', name: 'SEMARANG SELATAN' },
    { id: '3374120', name: 'SEMARANG TIMUR' },
  ],
  '3171': [{ id: '3171010', name: 'KEBAYORAN BARU' }],
  '3273': [{ id: '3273010', name: 'COBLONG' }],
  '3578': [{ id: '3578010', name: 'GUBENG' }],
};

const FALLBACK_VILLAGES = {
  '3374110': [{ id: '3374110001', name: 'LAMPER KIDUL' }],
  '3374120': [{ id: '3374120001', name: 'REJOSARI' }],
  '3171010': [{ id: '3171010001', name: 'SELOVAL' }],
  '3273010': [{ id: '3273010001', name: 'DAGO' }],
  '3578010': [{ id: '3578010001', name: 'AIRLANGGA' }],
};

function buildOptions(field, lookups) {
  if (field.options) {
    return field.options;
  }

  const source = lookups[field.optionsSource] || [];

  return source.map((item) => ({
    value: String(item.id),
    label: field.optionSubLabel
      ? `${item[field.optionLabel]} - ${item[field.optionSubLabel]}`
      : item[field.optionLabel],
  }));
}

function AddressDropdowns({ value, onChange }) {
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  // 1. Fetch Provinces on Mount (with fail-safe fallback)
  useEffect(() => {
    fetch(`${API_BASE_URL}/regions/provinces.json`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setProvinces(data))
      .catch(() => {
        console.warn('Menggunakan fallback data provinsi.');
        setProvinces(FALLBACK_PROVINCES);
      });
  }, []);

  // 2. Load Regencies when value.provinsi changes
  useEffect(() => {
    if (!value.provinsi || provinces.length === 0) {
      const timer = setTimeout(() => {
        setRegencies([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    const found = provinces.find((p) => p.name.toLowerCase() === value.provinsi.toLowerCase());
    if (found) {
      fetch(`${API_BASE_URL}/regions/regencies/${found.id}.json`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => setRegencies(data))
        .catch(() => {
          console.warn('Menggunakan fallback data kabupaten.');
          setRegencies(FALLBACK_REGENCIES[found.id] || []);
        });
    }
  }, [value.provinsi, provinces]);

  // 3. Load Districts when value.kabupaten changes
  useEffect(() => {
    if (!value.kabupaten || regencies.length === 0) {
      const timer = setTimeout(() => {
        setDistricts([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    const found = regencies.find((r) => r.name.toLowerCase() === value.kabupaten.toLowerCase());
    if (found) {
      fetch(`${API_BASE_URL}/regions/districts/${found.id}.json`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => setDistricts(data))
        .catch(() => {
          console.warn('Menggunakan fallback data kecamatan.');
          setDistricts(FALLBACK_DISTRICTS[found.id] || []);
        });
    }
  }, [value.kabupaten, regencies]);

  // 4. Load Villages when value.kecamatan changes
  useEffect(() => {
    if (!value.kecamatan || districts.length === 0) {
      const timer = setTimeout(() => {
        setVillages([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    const found = districts.find((d) => d.name.toLowerCase() === value.kecamatan.toLowerCase());
    if (found) {
      fetch(`${API_BASE_URL}/regions/villages/${found.id}.json`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => setVillages(data))
        .catch(() => {
          console.warn('Menggunakan fallback data desa.');
          setVillages(FALLBACK_VILLAGES[found.id] || []);
        });
    }
  }, [value.kecamatan, districts]);

  const selectClass = 'w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-200 bg-green-50/10 p-5 rounded-2xl">
      {/* Provinsi */}
      <div className="col-span-1">
        <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 text-left">
          Provinsi <span className="text-red-500 ml-1">*</span>
        </span>
        <select
          value={value.provinsi || ''}
          required
          onChange={(e) => {
            onChange('provinsi', e.target.value);
            onChange('kabupaten', '');
            onChange('kecamatan', '');
            onChange('desa', '');
          }}
          className={selectClass}
        >
          <option value="">Pilih Provinsi</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Kabupaten / Kota */}
      <div className="col-span-1">
        <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 text-left">
          Kabupaten / Kota <span className="text-red-500 ml-1">*</span>
        </span>
        <select
          value={value.kabupaten || ''}
          required
          disabled={!value.provinsi}
          onChange={(e) => {
            onChange('kabupaten', e.target.value);
            onChange('kecamatan', '');
            onChange('desa', '');
          }}
          className={`${selectClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
        >
          <option value="">Pilih Kabupaten / Kota</option>
          {regencies.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Kecamatan */}
      <div className="col-span-1">
        <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 text-left">
          Kecamatan <span className="text-red-500 ml-1">*</span>
        </span>
        <select
          value={value.kecamatan || ''}
          required
          disabled={!value.kabupaten}
          onChange={(e) => {
            onChange('kecamatan', e.target.value);
            onChange('desa', '');
          }}
          className={`${selectClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
        >
          <option value="">Pilih Kecamatan</option>
          {districts.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desa / Kelurahan */}
      <div className="col-span-1">
        <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 text-left">
          Desa / Kelurahan <span className="text-red-500 ml-1">*</span>
        </span>
        <select
          value={value.desa || ''}
          required
          disabled={!value.kecamatan}
          onChange={(e) => onChange('desa', e.target.value)}
          className={`${selectClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
        >
          <option value="">Pilih Desa / Kelurahan</option>
          {villages.map((v) => (
            <option key={v.id} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* Alamat Detail */}
      <div className="sm:col-span-2">
        <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 text-left">
          Alamat Detail <span className="text-red-500 ml-1">*</span>
        </span>
        <textarea
          value={value.alamat_detail || ''}
          required
          rows={3}
          onChange={(e) => onChange('alamat_detail', e.target.value)}
          placeholder="Nama jalan, RT/RW, nomor rumah, dsb..."
          className={`${selectClass} min-h-[80px]`}
        />
      </div>
    </div>
  );
}

function FormField({ field, value, onChange, lookups = {} }) {
  const commonClass = 'w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 normal-case';

  if (field.type === 'address') {
    return <AddressDropdowns value={value} onChange={onChange} />;
  }

  const labelText = (
    <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 text-left">
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </span>
  );

  if (field.type === 'textarea') {
    return (
      <label className="block">
        {labelText}
        <textarea
          value={value}
          required={field.required}
          rows={3}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={commonClass}
        />
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className="block">
        {labelText}
        <select
          value={value}
          required={field.required}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={commonClass}
        >
          <option value="">Pilih {field.label}</option>
          {buildOptions(field, lookups).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'checkbox_group') {
    const options = buildOptions(field, lookups);
    const selectedValues = Array.isArray(value) ? value.map(String) : (value ? String(value).split(',') : []);

    const handleCheckboxChange = (optValue, checked) => {
      let nextValues;
      if (checked) {
        nextValues = [...selectedValues, optValue];
      } else {
        nextValues = selectedValues.filter((v) => v !== optValue);
      }
      onChange(field.name, nextValues);
    };

    return (
      <div className="block text-left">
        {labelText}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-300 rounded-xl p-4 bg-white">
          {options.length === 0 ? (
            <span className="text-xs text-gray-400 font-medium">Belum ada pilihan tersedia.</span>
          ) : (
            options.map((opt) => {
              const isChecked = selectedValues.includes(opt.value);
              return (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700 hover:text-green-700 select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(opt.value, e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <label className="block">
      {labelText}
      <input
        type={field.type || 'text'}
        value={value}
        required={field.required}
        min={field.type === 'number' ? 0 : undefined}
        max={field.name === 'nilai' ? 100 : undefined}
        onChange={(event) => onChange(field.name, event.target.value)}
        className={commonClass}
      />
    </label>
  );
}

export default FormField;
