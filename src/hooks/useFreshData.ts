import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook that calls a fetch function:
 * 1. On initial mount
 * 2. Every time the route path changes (navigating away and back)
 * 3. When the browser tab regains focus (admin switches back)
 *
 * This ensures the admin always sees the latest data without manual refresh.
 */
export function useFreshData(
  fetchFn: () => void | Promise<void>,
  options: {
    deps?: unknown[];
    refetchOnFocus?: boolean;
  } = {}
) {
  const { deps = [], refetchOnFocus = true } = options;
  const location = useLocation();
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  // Re-fetch on mount + route change + dependency change
  useEffect(() => {
    fetchRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, ...deps]);

  // Re-fetch when browser tab regains focus
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchOnFocus]);
}
