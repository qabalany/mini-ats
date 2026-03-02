import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook for managing candidates data.
 *
 * Supports CRUD operations and stage transitions (for Kanban drag & drop).
 * Data is scoped by RLS policies — customers see their own, admins see all.
 */
export function useCandidates() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandidates = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setCandidates(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch candidates:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  async function addCandidate(candidateData) {
    const { error } = await supabase
      .from("candidates")
      .insert({ ...candidateData, owner_id: user.id });

    if (error) throw error;
    await fetchCandidates();
  }

  async function updateCandidate(id, updates) {
    const { error } = await supabase
      .from("candidates")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    await fetchCandidates();
  }

  /**
   * Move a candidate to a new pipeline stage.
   * Used by the Kanban board's drag-and-drop handler.
   */
  async function moveToStage(id, newStage) {
    return updateCandidate(id, { stage: newStage });
  }

  async function deleteCandidate(id) {
    const { error } = await supabase
      .from("candidates")
      .delete()
      .eq("id", id);

    if (error) throw error;
    await fetchCandidates();
  }

  return {
    candidates,
    loading,
    error,
    fetchCandidates,
    addCandidate,
    updateCandidate,
    moveToStage,
    deleteCandidate,
  };
}
