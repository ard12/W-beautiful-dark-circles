import { useState, useCallback, useEffect } from 'react';
import { getState, advancePhase, resetScenario, submitQuery, approveAction, getSitrep } from '../api/client';

export function useSentinelState() {
  const [worldState, setWorldState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getState();
      setWorldState(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdvance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await advancePhase();
      setWorldState(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(async () => {
    try {
      setLoading(true);
      const data = await resetScenario();
      setWorldState(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return {
    worldState,
    loading,
    error,
    fetchState,
    handleAdvance,
    handleReset,
    submitQuery,
    approveAction,
    getSitrep
  };
}
