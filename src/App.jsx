import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useJobs } from "./hooks/useJobs";
import { useCandidates } from "./hooks/useCandidates";
import { useToast } from "./hooks/useToast";

import Sidebar from "./components/layout/Sidebar";
import Toast from "./components/ui/Toast";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import JobsPage from "./pages/JobsPage";
import KanbanPage from "./pages/KanbanPage";
import CandidatesPage from "./pages/CandidatesPage";
import AdminPanel from "./pages/AdminPanel";

// main app entry - handles auth state & routing
// we keep global data hooks here so pages stay relatively pure
export default function App() {
  const { user, profile, isAdmin, loading } = useAuth();
  const { jobs, createJob, updateJob, deleteJob } = useJobs();
  const {
    candidates,
    addCandidate,
    updateCandidate,
    moveToStage,
    deleteCandidate,
  } = useCandidates();
  const { toast, showToast, hideToast } = useToast();

  // show loader while checking session
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-xl bg-gradient-to-br from-brand-600 to-purple-600" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // not logged in
  if (!user) {
    return (
      <>
        <LoginPage />
        {toast && <Toast {...toast} onClose={hideToast} />}
      </>
    );
  }

  // main logged in view
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-60 flex-1 p-7">
        <Routes>
          <Route
            path="/"
            element={<Dashboard jobs={jobs} candidates={candidates} />}
          />
          <Route
            path="/jobs"
            element={
              <JobsPage
                jobs={jobs}
                createJob={createJob}
                updateJob={updateJob}
                deleteJob={deleteJob}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/kanban"
            element={
              <KanbanPage
                candidates={candidates}
                jobs={jobs}
                addCandidate={addCandidate}
                updateCandidate={updateCandidate}
                moveToStage={moveToStage}
                deleteCandidate={deleteCandidate}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/candidates"
            element={<CandidatesPage candidates={candidates} jobs={jobs} />}
          />
          {isAdmin && (
            <Route
              path="/admin"
              element={<AdminPanel showToast={showToast} />}
            />
          )}
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
