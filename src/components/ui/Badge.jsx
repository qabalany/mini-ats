/**
 * Small colored label for statuses and tags.
 * Pass Tailwind color classes for customization.
 */
export default function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}
