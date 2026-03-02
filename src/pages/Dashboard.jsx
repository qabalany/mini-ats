import { useMemo } from "react";
import { Briefcase, Users, Activity, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { STAGES, STAGE_COLORS, STAGE_HEX } from "../constants";
import Badge from "../components/ui/Badge";

// main dashboard view
// shows key metrics and recent pipeline activity
export default function Dashboard({ jobs, candidates }) {
  const { profile } = useAuth();

  // derive stats from props instead of an extra api call
  const stats = useMemo(() => {
    const byStage = {};
    STAGES.forEach((s) => (byStage[s] = 0));
    candidates.forEach((c) => {
      if (byStage[c.stage] !== undefined) byStage[c.stage]++;
    });

    return {
      totalJobs: jobs.length,
      openJobs: jobs.filter((j) => j.status === "open").length,
      totalCandidates: candidates.length,
      byStage,
    };
  }, [jobs, candidates]);

  const recentCandidates = useMemo(
    () =>
      [...candidates]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5),
    [candidates]
  );

  const cards = [
    { label: "Open Jobs", value: stats.openJobs, sub: `of ${stats.totalJobs} total`, icon: Briefcase, color: "text-brand-600 bg-brand-50" },
    { label: "Total Candidates", value: stats.totalCandidates, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "In Interview", value: stats.byStage.interview || 0, icon: Activity, color: "text-emerald-600 bg-emerald-50" },
    { label: "Offers Made", value: stats.byStage.offer || 0, icon: Star, color: "text-fuchsia-600 bg-fuchsia-50" },
  ];

  return (
    <div className="animate-fade-in">
      {/* welcome message */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-slate-500">
          Here's your recruitment overview
        </p>
      </div>

      {/* stat cards overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="animate-fade-in rounded-2xl border border-slate-100 bg-white p-5"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon size={18} />
              </div>
            </div>
            <div className="font-mono text-3xl font-bold">{card.value}</div>
            {card.sub && <div className="mt-1 text-xs text-slate-400">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* two columns: pipeline progress + recent candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* pipeline overview */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="text-base font-bold mb-5">Pipeline Overview</h3>
          <div className="flex flex-col gap-3">
            {STAGES.map((stage) => {
              const count = stats.byStage[stage] || 0;
              const pct = stats.totalCandidates
                ? (count / stats.totalCandidates) * 100
                : 0;

              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-medium capitalize text-slate-500">
                    {stage}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: STAGE_HEX[stage] }}
                    />
                  </div>
                  <span className="w-7 text-right font-mono text-xs font-semibold text-slate-600">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* recent candidates list */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="text-base font-bold mb-5">Recent Candidates</h3>
          {recentCandidates.length === 0 ? (
            <p className="text-sm text-slate-400">No candidates yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentCandidates.map((c) => {
                const sc = STAGE_COLORS[c.stage];
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${sc.bg} ${sc.text}`}
                    >
                      {c.full_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{c.full_name}</div>
                      <div className="text-[11px] text-slate-400">{c.email || "No email"}</div>
                    </div>
                    <Badge className={`${sc.bg} ${sc.text} capitalize`}>{c.stage}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
