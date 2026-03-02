import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { STAGES, STAGE_COLORS } from "../constants";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import TextArea from "../components/ui/TextArea";
import Modal from "../components/ui/Modal";
import StarRating from "../components/ui/StarRating";
import Badge from "../components/ui/Badge";
import KanbanColumn from "../components/kanban/KanbanColumn";

const EMPTY_CANDIDATE = {
  full_name: "",
  email: "",
  phone: "",
  linkedin_url: "",
  job_id: "",
  notes: "",
  stage: "applied",
};

// main kanban board for moving candidates between stages
export default function KanbanPage({
  candidates,
  jobs,
  addCandidate,
  updateCandidate,
  moveToStage,
  deleteCandidate,
  showToast,
}) {
  const [filterJob, setFilterJob] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_CANDIDATE);
  const [saving, setSaving] = useState(false);

  // filter candidate list
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (filterJob !== "all" && c.job_id !== filterJob) return false;
      if (searchTerm && !c.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      return true;
    });
  }, [candidates, filterJob, searchTerm]);

  // group candidates by stage
  const columns = useMemo(() => {
    const cols = {};
    STAGES.forEach((s) => (cols[s] = []));
    filtered.forEach((c) => {
      if (cols[c.stage]) cols[c.stage].push(c);
    });
    return cols;
  }, [filtered]);

  // handle drag and drop
  // CandidateCard stores the candidate ID via dataTransfer.
  // KanbanColumn calls onDrop(stage) when a card is dropped.
  // We read the ID from the last dragStart event.
  const [draggedId, setDraggedId] = useState(null);

  async function handleDrop(newStage) {
    // Find the candidate from the event data set in CandidateCard
    // We use a ref-like state since dataTransfer isn't accessible in all handlers
    if (!draggedId) return;
    const candidate = candidates.find((c) => c.id === draggedId);
    if (!candidate || candidate.stage === newStage) {
      setDraggedId(null);
      return;
    }

    try {
      await moveToStage(candidate.id, newStage);
      showToast(`Moved to ${newStage}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
    setDraggedId(null);
  }

  // Listen for dragstart events at the board level to capture candidate ID
  function handleBoardDragStart(e) {
    const id = e.target.closest("[draggable]")?.querySelector("[data-id]")?.dataset?.id;
    // Fallback: use dataTransfer
    if (e.dataTransfer.types.includes("candidateid")) return;
    // We'll set it via the CandidateCard's dataTransfer
  }

  // form submission for new candidate
  async function handleAdd() {
    if (!addForm.full_name.trim() || !addForm.job_id) return;
    setSaving(true);
    try {
      await addCandidate(addForm);
      showToast("Candidate added!", "success");
      setAddModalOpen(false);
      setAddForm(EMPTY_CANDIDATE);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  // save changes from candidate modal
  async function handleUpdate(id, updates) {
    try {
      await updateCandidate(id, updates);
      showToast("Updated!", "success");
      // Refresh the selected candidate view
      setSelectedCandidate((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this candidate?")) return;
    try {
      await deleteCandidate(id);
      showToast("Candidate removed", "info");
      setSelectedCandidate(null);
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  const set = (field) => (e) => setAddForm({ ...addForm, [field]: e.target.value });
  const getJobTitle = (jobId) => jobs.find((j) => j.id === jobId)?.title || "Unknown";

  const stageOptions = STAGES.map((s) => ({
    value: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  }));

  return (
    <div className="animate-fade-in">
      {/* kanban header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <p className="text-sm text-slate-500">
            {filtered.length} candidate{filtered.length !== 1 && "s"} in pipeline
          </p>
        </div>
        <Button
          onClick={() => {
            setAddForm({ ...EMPTY_CANDIDATE, job_id: jobs[0]?.id || "" });
            setAddModalOpen(true);
          }}
          disabled={jobs.length === 0}
        >
          <Plus size={16} /> Add Candidate
        </Button>
      </div>

      {/* filter controls */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidates..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none cursor-pointer"
          >
            <option value="all">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* stage columns */}
      <div
        className="flex gap-3 overflow-x-auto pb-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const id = e.dataTransfer.getData("candidateId");
          if (id) setDraggedId(id);
        }}
      >
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            candidates={columns[stage] || []}
            jobs={jobs}
            onDrop={(targetStage) => {
              // Use the last dragged ID from state
              handleDrop(targetStage);
            }}
            onCardClick={(c) => setSelectedCandidate(c)}
          />
        ))}
      </div>

      {/* candidate detail view */}
      <Modal
        open={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title="Candidate Details"
        width="max-w-xl"
      >
        {selectedCandidate && (() => {
          const c = selectedCandidate;
          const sc = STAGE_COLORS[c.stage];
          return (
            <div className="flex flex-col gap-4">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold ${sc.bg} ${sc.text}`}>
                  {c.full_name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{c.full_name}</h3>
                  <div className="text-sm text-slate-500">{getJobTitle(c.job_id)}</div>
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                {c.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-400" /> {c.email}
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-400" /> {c.phone}
                  </div>
                )}
              </div>

              {/* LinkedIn */}
              {c.linkedin_url && (
                <a
                  href={c.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700"
                >
                  <ExternalLink size={14} /> View LinkedIn Profile
                </a>
              )}

              {/* Rating */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Rating</label>
                <StarRating
                  rating={c.rating || 0}
                  onChange={(r) => handleUpdate(c.id, { rating: r })}
                  size={20}
                />
              </div>

              {/* Stage */}
              <Select
                label="Stage"
                value={c.stage}
                onChange={(e) => handleUpdate(c.id, { stage: e.target.value })}
                options={stageOptions}
              />

              {/* Notes */}
              {c.notes && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Notes</label>
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 leading-relaxed">
                    {c.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>
                  <Trash2 size={14} /> Remove
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* new candidate form */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Candidate"
      >
        <div className="flex flex-col gap-4">
          <Input label="Full Name *" value={addForm.full_name} onChange={set("full_name")} placeholder="John Doe" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={addForm.email} onChange={set("email")} placeholder="john@email.com" />
            <Input label="Phone" value={addForm.phone} onChange={set("phone")} placeholder="+1 234 567 890" />
          </div>
          <Input label="LinkedIn URL" value={addForm.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/johndoe" />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Job *"
              value={addForm.job_id}
              onChange={set("job_id")}
              options={[{ value: "", label: "Select a job" }, ...jobs.map((j) => ({ value: j.id, label: j.title }))]}
            />
            <Select label="Stage" value={addForm.stage} onChange={set("stage")} options={stageOptions} />
          </div>
          <TextArea label="Notes" value={addForm.notes} onChange={set("notes")} placeholder="Any notes about the candidate..." />
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !addForm.full_name.trim() || !addForm.job_id}>
              {saving ? "Adding..." : "Add Candidate"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
