function EmptyState({ title, description, icon }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-green-700">
        {icon || (
          <svg
            aria-hidden="true"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h7m3-11l2 2m0 0l2-2m-2 2V3"
            />
          </svg>
        )}
      </div>
      <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm font-medium leading-6 text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default EmptyState;
