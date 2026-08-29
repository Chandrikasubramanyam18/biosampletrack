import { useState, useEffect, useCallback } from 'react';
import { fetchSamples } from '../services/api';

/**
 * useSamples — manages sample list state including
 * search, status filter, and pagination.
 */
export function useSamples({ status, search, page, limit = 20 }) {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const skip = page * limit;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSamples({ status, search, skip, limit });
      setSamples(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, search, skip, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { samples, loading, error, reload: load };
}
