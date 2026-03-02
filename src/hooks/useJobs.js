import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook for managing jobs data.
 *
 * Handles fetching, creating, updating, and deleting jobs.
 * Automatically scopes data to the current user (RLS handles the rest).
 */
export function useJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setJobs(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch jobs:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  async function createJob(jobData) {
    const { error } = await supabase
      .from("jobs")
      .insert({ ...jobData, owner_id: user.id });

    if (error) throw error;
    await fetchJobs();
  }

  async function updateJob(id, updates) {
    const { error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    await fetchJobs();
  }

  async function deleteJob(id) {
    // Delete associated candidates first (cascade doesn't apply via API)
    await supabase.from("candidates").delete().eq("job_id", id);
    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) throw error;
    await fetchJobs();
  }

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
  };
}
