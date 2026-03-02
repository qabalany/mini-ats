/**
 * Centered empty state with icon, message, and optional action button.
 * Used when a list/board has no data to display.
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="mb-4 opacity-50">{icon}</div>
      <h3 className="text-base font-semibold text-slate-500 mb-1">{title}</h3>
      <p className="text-sm mb-5">{description}</p>
      {action}
    </div>
  );
}
