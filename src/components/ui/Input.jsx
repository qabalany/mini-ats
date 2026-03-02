/**
 * Text input with optional label and error state.
 */
export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-500">{label}</label>
      )}
      <input
        className={`
          px-3 py-2 rounded-lg border text-sm outline-none bg-white
          transition-colors duration-150
          focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400
          ${error ? "border-red-400" : "border-slate-200"}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
