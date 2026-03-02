/**
 * Pipeline stages that a candidate moves through.
 * Order matters — it defines the Kanban column sequence.
 */
export const STAGES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
];

/**
 * Visual theme for each pipeline stage.
 * Used across Kanban columns, badges, and charts.
 */
export const STAGE_COLORS = {
  applied: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400", border: "border-indigo-200" },
  screening: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", border: "border-orange-200" },
  interview: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400", border: "border-green-200" },
  offer: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400", border: "border-purple-200" },
  hired: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "border-emerald-200" },
  rejected: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400", border: "border-red-200" },
};

/**
 * Hex colors for inline styles where Tailwind classes aren't practical
 * (e.g., progress bars, chart colors).
 */
export const STAGE_HEX = {
  applied: "#818CF8",
  screening: "#FB923C",
  interview: "#4ADE80",
  offer: "#C084FC",
  hired: "#34D399",
  rejected: "#F87171",
};

export const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export const JOB_STATUSES = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "draft", label: "Draft" },
];

export const JOB_STATUS_COLORS = {
  open: "text-emerald-600 bg-emerald-50",
  closed: "text-red-600 bg-red-50",
  draft: "text-slate-500 bg-slate-100",
};
