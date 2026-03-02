import { useState } from "react";
import { STAGE_COLORS } from "../../constants";
import CandidateCard from "./CandidateCard";

/**
 * A single column in the Kanban board representing one pipeline stage.
 *
 * Supports drag-and-drop: highlights on dragOver, fires onDrop with the
 * stage name so the parent can update the candidate's stage.
 */
export default function KanbanColumn({ stage, candidates, onDrop, onCardClick, jobs }) {
  const [dragOver, setDragOver] = useState(false);
  const colors = STAGE_COLORS[stage];

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    onDrop(stage);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex flex-col flex-shrink-0 w-[260px] rounded-xl border transition-colors
        ${dragOver ? `${colors.bg} ${colors.border}` : "bg-slate-50/80 border-slate-100"}
      `}
      style={{ maxHeight: "calc(100vh - 240px)" }}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-3.5 py-3 border-b border-slate-100/60">
        <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
        <span className="text-xs font-semibold capitalize text-slate-600">
          {stage}
        </span>
        <span
          className={`ml-auto font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
        >
          {candidates.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2 overflow-y-auto flex-1">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            jobTitle={jobs.find((j) => j.id === candidate.job_id)?.title || "Unknown"}
            onClick={() => onCardClick(candidate)}
          />
        ))}

        {candidates.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-300">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
