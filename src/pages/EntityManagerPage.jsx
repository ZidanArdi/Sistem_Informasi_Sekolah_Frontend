import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { entityConfigs, getNestedValue, formatValue, buildInitialValues } from '../data/entities';
import { entityService } from '../services/api';
import FormField from '../components/FormField';
import StateBlock from '../components/StateBlock';

function EntityManagerPage() {
  const { entity } = useParams();
  const config = entityConfigs[entity];

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSiswa = user.role === 'siswa';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Kelola Data</p>
          <h2 className="text-2xl font-bold text-slate-950">{config.title}</h2>
        </div>
        {!isSiswa && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
          >
            Tambah {config.shortTitle || config.title}
          </button>
        )}
      </div>

      {/* Search & Filters */}
      {(config.searchPlaceholder || config.filters) && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          {config.searchPlaceholder && (
            <div className="w-full sm:max-w-xs">
              <input
                type="text"
                value={search}
                placeholder={config.searchPlaceholder}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
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
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
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

      {/* Main Content */}
      {loading ? (
        <StateBlock title={`Memuat data ${config.title}...`} />
      ) : error ? (
        <StateBlock title={error} tone="danger" />
      ) : listData.length === 0 ? (
        <StateBlock title={`Belum ada data ${config.title}.`} />
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                {config.columns.map((col) => (
                  <th key={col.key} className="px-6 py-4">
                    {col.label}
                  </th>
                ))}
                {!isSiswa && <th className="px-6 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {listData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  {config.columns.map((col) => {
                    const rawVal = getNestedValue(item, col.key);
                    const formatted = formatValue(rawVal);
                    return (
                      <td key={col.key} className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        {formatted}
                      </td>
                    );
                  })}
                  {!isSiswa && (
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="text-xs font-semibold text-red-600 hover:text-red-900 cursor-pointer"
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
      )}

      {/* Add / Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-md border border-slate-200 bg-white p-6 shadow-lg animate-fade-in">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit' : 'Tambah'} {config.shortTitle || config.title}
              </h3>
            </div>

            {formError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
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

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-400 cursor-pointer"
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
