/**
 * Reusable button with multiple visual variants and sizes.
 *
 * Variants: primary | secondary | danger | ghost | success
 * Sizes:    sm | md | lg
 */
const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
  ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
  success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-semibold
        transition-all duration-150 cursor-pointer whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
