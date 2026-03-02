import { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { STAGES, STAGE_COLORS } from "../constants";
import Badge from "../components/ui/Badge";
import StarRating from "../components/ui/StarRating";
import EmptyState from "../components/ui/EmptyState";

// list view of all candidates with search and filters
export default function CandidatesPage({ candidates, jobs }) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (stageFilter !== "all" && c.stage !== stageFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.full_name.toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [candidates, stageFilter, search]);

  const getJobTitle = (jobId) =>
    jobs.find((j) => j.id === jobId)?.title || "Unknown";

  return (
    <div className="animate-fade-in">
      {/* page header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Candidates</h1>
        <p className="text-sm text-slate-500">
          {filtered.length} of {candidates.length} candidates
        </p>
      </div>

      {/* search and filter controls */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none cursor-pointer"
        >
          <option value="all">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* candidates table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={48} className="text-slate-300" />}
          title="No candidates found"
          description="Try adjusting your filters or add candidates via the Kanban board"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                {["Name", "Job", "Stage", "Rating", "Contact", "Added"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sc = STAGE_COLORS[c.stage];
                return (
                  <tr key={c.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${sc.bg} ${sc.text}`}>
                          {c.full_name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{c.full_name}</div>
                          {c.linkedin_url && (
                            <a
                              href={c.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-sky-600 hover:underline"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {getJobTitle(c.job_id)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`capitalize ${sc.bg} ${sc.text}`}>
                        {c.stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={c.rating || 0} size={14} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {c.email || c.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
