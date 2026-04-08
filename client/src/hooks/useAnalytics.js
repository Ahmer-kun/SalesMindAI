/**
 * useAnalytics.js
 * Path: client/src/hooks/useAnalytics.js
 */

import { useState, useEffect } from "react";
import { analyticsService } from "../services/analyticsService";

export const useAnalytics = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await analyticsService.getAnalytics();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
};
