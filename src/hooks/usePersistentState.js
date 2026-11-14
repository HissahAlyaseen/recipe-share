import { useEffect, useState } from 'react';

// Works like useState, but also saves the value in localStorage
// so the data survives a page refresh (useful while there is no back-end).
export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue; // storage unavailable or corrupted → fall back
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors (e.g. private mode)
    }
  }, [key, value]);

  return [value, setValue];
}
