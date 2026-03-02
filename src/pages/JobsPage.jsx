import { useState } from "react";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { EMPLOYMENT_TYPES, JOB_STATUSES, JOB_STATUS_COLORS } from "../constants";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import TextArea from "../components/ui/TextArea";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";

const EMPTY_FORM = {
  title: "",
  department: "",
  location: "",
  employment_type: "full-time",
  description: "",
  status: "open",
};

// job listing and management view
export default function JobsPage({ jobs, createJob, updateJob, deleteJob, showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);      // null = creating
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(job) {
    setEditing(job);
    setForm({
      title: job.title,
      department: job.department || "",
      location: job.location || "",
      employment_type: job.employment_type,
      description: job.description || "",
      status: job.status,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateJob(editing.id, form);
        showToast("Job updated!", "success");
      } else {
        await createJob(form);
        showToast("Job created!", "success");
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this job and all its candidates?")) return;
    try {
      await deleteJob(id);
      showToast("Job deleted", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  // handy helper for text inputs
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="animate-fade-in">
      {/* page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-sm text-slate-500">
            {jobs.length} job{jobs.length !== 1 && "s"} in your pipeline
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New Job
        </Button>
      </div>

      {/* jobs list */}
      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={48} className="text-slate-300" />}
          title="No jobs yet"
          description="Create your first job posting to start recruiting"
          action={<Button onClick={openCreate}><Plus size={16} /> Create Job</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className="animate-fade-in flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-5 py-4 transition-shadow hover:shadow-md"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                <Briefcase size={18} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{job.title}</div>
                <div className="text-xs text-slate-400">
                  {[job.department, job.location, job.employment_type]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <Badge className={`capitalize ${JOB_STATUS_COLORS[job.status]}`}>
                {job.status}
              </Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(job)}>
                  <Pencil size={15} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(job.id)}>
                  <Trash2 size={15} className="text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* job form modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Job" : "New Job"}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Job Title *"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Senior Frontend Developer"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Department" value={form.department} onChange={set("department")} placeholder="e.g. Engineering" />
            <Input label="Location" value={form.location} onChange={set("location")} placeholder="e.g. Remote" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Employment Type" value={form.employment_type} onChange={set("employment_type")} options={EMPLOYMENT_TYPES} />
            <Select label="Status" value={form.status} onChange={set("status")} options={JOB_STATUSES} />
          </div>
          <TextArea
            label="Description"
            value={form.description}
            onChange={set("description")}
            placeholder="Describe the role, requirements, etc."
          />
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
