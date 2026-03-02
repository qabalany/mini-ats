/**
 * Select dropdown with label support.
 * Options should be: [{ value: string, label: string }]
 */
export default function Select({ label, options = [], className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-500">{label}</label>
      )}
      <select
        className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white cursor-pointer focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
