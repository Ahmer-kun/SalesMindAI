/**
 * Custom hook for AI generation — handles loading, error, and result state.
 */

import { useState } from "react";
import { aiService } from "../services/aiService";

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState(null);

  const reset = () => {
    setError("");
    setResult(null);
  };

  // ── Generate outreach ──────────────────────────────────────────────────────
  const generateOutreach = async (leadId, productDescription) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await aiService.generateOutreach(leadId, productDescription);
      setResult({ type: "outreach", message: data.message });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate outreach message.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Generate follow-up ─────────────────────────────────────────────────────
  const generateFollowUp = async (leadId, previousMessage, followUpGoal) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await aiService.generateFollowUp(leadId, previousMessage, followUpGoal);
      setResult({ type: "followup", message: data.message });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate follow-up.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Score lead ─────────────────────────────────────────────────────────────
  const scoreLead = async (leadId) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await aiService.scoreLead(leadId);
      setResult({ type: "score", ...data });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to score lead.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    result,
    reset,
    generateOutreach,
    generateFollowUp,
    scoreLead,
  };
};