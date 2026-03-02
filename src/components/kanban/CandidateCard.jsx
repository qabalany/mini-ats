import { ExternalLink } from "lucide-react";
import StarRating from "../ui/StarRating";

/**
 * A compact, draggable card representing one candidate.
 *
 * Displays name, job title, rating stars, and a LinkedIn shortcut.
 * Sets the candidate ID in the drag event so the board knows which
 * candidate is being moved.
 */
export default function CandidateCard({ candidate, jobTitle, onClick }) {
  function handleDragStart(e) {
    // Store candidate ID for the drop handler
    e.dataTransfer.setData("candidateId", candidate.id);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="group rounded-lg border border-slate-200 bg-white p-3 cursor-grab shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:cursor-grabbing"
    >
      {/* Name */}
      <div className="text-sm font-semibold text-slate-800 mb-0.5">
        {candidate.full_name}
      </div>

      {/* Job title */}
      <div className="text-xs text-slate-400 truncate mb-2">{jobTitle}</div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <StarRating rating={candidate.rating || 0} size={12} />

        {candidate.linkedin_url && (
          <a
            href={candidate.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink size={11} /> LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}
