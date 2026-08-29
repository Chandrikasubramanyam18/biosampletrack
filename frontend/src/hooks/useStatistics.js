import { useState, useEffect, useCallback } from 'react';
import { fetchStatistics } from '../services/api';

/**
 * useStatistics — fetches and caches the statistics summary.
 * Exposes a reload() function so callers can refresh after mutations.
 */
export function useStatistics() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { statistics, loading, error, reload: load };
}
