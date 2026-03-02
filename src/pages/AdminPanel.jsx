import { useState, useEffect, useCallback } from "react";
import { Plus, Shield } from "lucide-react";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";

import { useAuth } from "../context/AuthContext";

// admin view to manage users and view their data
// requires service_role key to actually create users
export default function AdminPanel({ showToast }) {
  const { session } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "customer",
    company_name: "",
  });
  const [creating, setCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState({ jobs: [], candidates: [] });

  // fetch users list
  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      showToast("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // handle account creation
  async function handleCreate() {
    if (!form.email || !form.password) return;
    setCreating(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");

      showToast(`Account created for ${form.email}`, "success");
      setModalOpen(false);
      setForm({ email: "", password: "", full_name: "", role: "customer", company_name: "" });

      // Refresh users list after a short delay (profile trigger needs to fire)
      setTimeout(loadUsers, 1500);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCreating(false);
    }
  }

  // load detail for selected user
  async function selectUser(user) {
    setSelectedUser(user);
    try {
      const [jobsRes, candidatesRes] = await Promise.all([
        supabase.from("jobs").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("candidates").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
      ]);

      setUserData({
        jobs: jobsRes.data || [],
        candidates: candidatesRes.data || [],
      });
    } catch (err) {
      showToast("Failed to load user data", "error");
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="animate-fade-in">
      {/* page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-slate-500">Manage accounts and monitor activity</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Create Account
        </Button>
      </div>

      <div className={`grid gap-5 ${selectedUser ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* users table */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-bold">All Users ({users.length})</h3>
          </div>

          {loadingUsers ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              {users.map((u) => {
                const isActive = selectedUser?.id === u.id;
                const roleColor = u.role === "admin"
                  ? "text-purple-700 bg-purple-50"
                  : "text-emerald-700 bg-emerald-50";
                const avatarColor = u.role === "admin"
                  ? "bg-purple-50 text-purple-700"
                  : "bg-emerald-50 text-emerald-700";

                return (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u)}
                    className={`flex w-full items-center gap-3 px-5 py-3 border-b border-slate-50 text-left transition-colors ${isActive ? "bg-brand-50" : "hover:bg-slate-50"
                      }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${avatarColor}`}>
                      {(u.full_name || u.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{u.full_name || "No name"}</div>
                      <div className="text-xs text-slate-400 truncate">{u.email}</div>
                    </div>
                    <Badge className={`capitalize ${roleColor}`}>{u.role}</Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* user detail view */}
        {selectedUser && (
          <div className="animate-slide-in flex flex-col gap-4">
            {/* basic info */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${selectedUser.role === "admin"
                    ? "bg-purple-50 text-purple-700"
                    : "bg-emerald-50 text-emerald-700"
                    }`}
                >
                  {(selectedUser.full_name || selectedUser.email)[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedUser.full_name || "No name"}</h3>
                  <div className="text-sm text-slate-500">{selectedUser.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 mb-0.5">Jobs</div>
                  <div className="font-mono text-xl font-bold">{userData.jobs.length}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 mb-0.5">Candidates</div>
                  <div className="font-mono text-xl font-bold">{userData.candidates.length}</div>
                </div>
              </div>
            </div>

            {/* recently posted jobs */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <h4 className="text-sm font-bold mb-3">Recent Jobs</h4>
              {userData.jobs.length === 0 ? (
                <p className="text-sm text-slate-400">No jobs</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {userData.jobs.slice(0, 5).map((j) => (
                    <div key={j.id} className="flex items-center gap-2 text-sm">
                      <Badge className={`capitalize ${j.status === "open" ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-100"
                        }`}>
                        {j.status}
                      </Badge>
                      <span className="font-medium">{j.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* modal for new account */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Account">
        <div className="flex flex-col gap-4">
          <Input label="Email *" type="email" value={form.email} onChange={set("email")} placeholder="user@company.com" />
          <Input label="Password *" type="password" value={form.password} onChange={set("password")} placeholder="Minimum 6 characters" />
          <Input label="Full Name" value={form.full_name} onChange={set("full_name")} placeholder="Jane Smith" />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Role"
              value={form.role}
              onChange={set("role")}
              options={[
                { value: "customer", label: "Customer" },
                { value: "admin", label: "Admin" },
              ]}
            />
            <Input label="Company" value={form.company_name} onChange={set("company_name")} placeholder="Acme Inc." />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !form.email || !form.password}>
              {creating ? "Creating..." : "Create Account"}
            </Button>
          </div>

          {/* Info note */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <strong>Note:</strong> Accounts are created server-side. Deploy the Edge
            Function with <code className="bg-amber-100 px-1 py-0.5 rounded">supabase functions deploy create-user</code>.
          </div>
        </div>
      </Modal>
    </div>
  );
}
