import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { entityConfigs, getNestedValue, formatValue, buildInitialValues } from '../data/entities';
import { entityService } from '../services/api';
import FormField from '../components/FormField';
import StateBlock from '../components/StateBlock';

function EntityManagerPage() {
  const { entity } = useParams();
  const config = entityConfigs[entity];

  const isSiswa = user.role === 'siswa';
  const isWritable = (() => {
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'administrator' || role === 'staff_tu' || role === 'staff' || role === 'staff tu') return true;
    if (role === 'guru') {
      return entity === 'nilai';
    }
    return false; // siswa
  })();

  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and Filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  // Lookups for Select options (e.g. listing kelas options in siswa form)
  const [lookups, setLookups] = useState({});

  // Reset filters and search when entity changes
  useEffect(() => {
    setSearch('');
    setFilters({});
    setModalOpen(false);
    setEditingItem(null);
    setFormValues({});
    setFormError('');
  }, [entity]);

  // Fetch lookups required by current entity
  useEffect(() => {
    if (!config) return;

    const fetchLookups = async () => {
      const sources = new Set();
      config.fields?.forEach((f) => {
        if (f.optionsSource) sources.add(f.optionsSource);
      });
      config.filters?.forEach((f) => {
        if (f.optionsSource) sources.add(f.optionsSource);
      });

      if (sources.size === 0) {
        setLookups({});
        return;
      }

      const lookupData = {};
      await Promise.all(
        Array.from(sources).map(async (source) => {
          try {
            const response = await entityService.list('/' + source);
            lookupData[source] = response.data.data || [];
          } catch (err) {
            console.error(`Gagal memuat lookup data untuk ${source}:`, err);
          }
        })
      );
      setLookups(lookupData);
    };

    fetchLookups();
  }, [entity, config]);

  // Fetch list data
  const fetchData = async () => {
    if (!config) return;
    setLoading(true);
    setError('');

    try {
      const params = { ...filters };
      if (search) {
        params.search = search;
      }
      const response = await entityService.list(config.endpoint, params);
      setListData(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || `Gagal memuat data ${config.title}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [entity, config, filters, search]);

  if (!config) {
    return <StateBlock title="Halaman tidak ditemukan" tone="danger" />;
  }

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormValues(buildInitialValues(config.fields));
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormValues(buildInitialValues(config.fields, item));
    setFormError('');
    setModalOpen(true);
  };

  const handleFormFieldChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === '') {
        delete next[name];
      } else {
        next[name] = value;
      }
      return next;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError('');

    try {
      const payload = config.transformSubmit ? config.transformSubmit(formValues) : formValues;
      if (editingItem) {
        await entityService.update(config.endpoint, editingItem.id, payload);
      } else {
        await entityService.create(config.endpoint, payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const message = `Apakah Anda yakin ingin menghapus data ini?`;
    if (!window.confirm(message)) return;

    try {
      await entityService.remove(config.endpoint, item.id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Kelola Akademik</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900 tracking-tight">{config.title}</h2>
        </div>
        {isWritable && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 shadow-sm shadow-green-500/10 active:scale-95 cursor-pointer"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah {config.shortTitle || config.title}
          </button>
        )}
      </div>

      {/* Search & Filters */}
      {(config.searchPlaceholder || config.filters) && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
          {config.searchPlaceholder && (
            <div className="w-full sm:max-w-xs relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                placeholder={config.searchPlaceholder}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
              />
            </div>
          )}

          {config.filters?.map((filter) => {
            const filterValue = filters[filter.name] || '';
            const lookupOptions = filter.optionsSource
              ? (lookups[filter.optionsSource] || []).map((item) => ({
                  value: String(item.id),
                  label: filter.optionSubLabel
                    ? `${item[filter.optionLabel]} - ${item[filter.optionSubLabel]}`
                    : item[filter.optionLabel],
                }))
              : filter.options || [];

            return (
              <div key={filter.name} className="w-full sm:w-auto">
                <select
                  value={filterValue}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 cursor-pointer"
                >
                  <option value="">Semua {filter.label}</option>
                  {lookupOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Table Content */}
      {loading ? (
        <StateBlock title={`Memuat data ${config.title}...`} />
      ) : error ? (
        <StateBlock title={error} tone="danger" />
      ) : listData.length === 0 ? (
        <StateBlock title={`Belum ada data ${config.title}.`} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-green-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                <tr>
                  {config.columns.map((col) => (
                    <th key={col.key} className="px-6 py-4.5 font-bold">
                      {col.label}
                    </th>
                  ))}
                  {isWritable && <th className="px-6 py-4.5 text-right font-bold">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white/60">
                {listData.map((item) => (
                  <tr key={item.id} className="hover:bg-green-50/50 transition-colors duration-150">
                    {config.columns.map((col) => {
                      const rawVal = getNestedValue(item, col.key);
                      const formatted = formatValue(rawVal);
                      
                      // Nice styling for gender badges
                      if (col.key === 'jenis_kelamin') {
                        const isMale = formatted === 'Laki-laki';
                        return (
                          <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isMale 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/50' 
                                : 'bg-pink-50 text-pink-700 border border-pink-200/50'
                            }`}>
                              {formatted}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                          {formatted}
                        </td>
                      );
                    })}
                    {isWritable && (
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center rounded-lg bg-green-50 border border-green-150 hover:bg-green-600 hover:text-white px-3 py-1.5 text-xs font-bold text-green-700 transition-all duration-150 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center rounded-lg bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white px-3 py-1.5 text-xs font-bold text-red-700 transition-all duration-150 cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-950/40 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="mb-4 border-b border-gray-100 pb-3 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                {editingItem ? 'Edit' : 'Tambah'} {config.shortTitle || config.title}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid gap-4 max-h-[60vh] overflow-y-auto px-1 py-1">
                {config.fields.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={formValues[field.name] || ''}
                    lookups={lookups}
                    onChange={handleFormFieldChange}
                  />
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-750 hover:bg-gray-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-5 py-2.5 text-sm font-bold text-white transition shadow-md shadow-green-500/10 cursor-pointer"
                >
                  {formSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntityManagerPage;
