import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Columns3,
  Users,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/kanban", icon: Columns3, label: "Kanban Board" },
  { to: "/candidates", icon: Users, label: "Candidates" },
];

const ADMIN_ITEM = { to: "/admin", icon: Shield, label: "Admin Panel" };

/**
 * Fixed sidebar with navigation links, user info, and sign-out.
 * Admin-only links are conditionally rendered based on user role.
 */
export default function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth();

  const items = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;
  const initials = (profile?.full_name || profile?.email || "?")[0].toUpperCase();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-slate-100 bg-white">
      {/* Logo */}
      <div className="border-b border-slate-100 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-purple-600">
            <span className="font-mono text-base font-bold text-white">A</span>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Mini ATS</div>
            <div className="text-[11px] font-medium text-slate-400">
              Applicant Tracking
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-50 text-brand-600 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? "text-brand-500" : "text-slate-400"} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">
              {profile?.full_name || "User"}
            </div>
            <div className="text-[11px] text-slate-400">
              {isAdmin ? "Admin" : "Customer"}
            </div>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
