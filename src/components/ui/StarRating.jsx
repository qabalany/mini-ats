import { Star } from "lucide-react";

/**
 * Interactive 5-star rating selector.
 * Click a star to set rating; click the same star to clear it.
 * Pass onChange={null} for read-only display.
 */
export default function StarRating({ rating = 0, onChange, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i === rating ? 0 : i)}
          disabled={!onChange}
          className={`p-0 border-none bg-transparent transition-colors ${
            onChange ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <Star
            size={size}
            className={i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
          />
        </button>
      ))}
    </div>
  );
}
