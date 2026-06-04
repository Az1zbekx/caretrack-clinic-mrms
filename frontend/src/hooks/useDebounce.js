/**
 * PURPOSE: Custom debounce hook for search queries.
 * MAQSAD: Qidiruv maydonlarini optimallashtirish uchun maxsus hook.
 */

import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
