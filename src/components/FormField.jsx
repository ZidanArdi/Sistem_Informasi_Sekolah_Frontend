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

function FormField({ field, value, onChange, lookups = {} }) {
  const commonClass = 'mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10';

  if (field.type === 'textarea') {
    return (
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
        {field.label}
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
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
        {field.label}
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

  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
      {field.label}
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
