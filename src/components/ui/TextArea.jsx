/**
 * Multi-line text input with label support.
 */
export default function TextArea({ label, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-500">{label}</label>
      )}
      <textarea
        className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white resize-y min-h-[80px] focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
        {...props}
      />
    </div>
  );
}
