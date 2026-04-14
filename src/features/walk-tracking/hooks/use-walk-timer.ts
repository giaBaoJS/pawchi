import { useEffect, useState, useRef } from 'react';

function format(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function useWalkTimer(startedAt: number) {
  const [durationSeconds, setDurationSeconds] = useState(() =>
    Math.floor((Date.now() - startedAt) / 1000),
  );
  const startedAtRef = useRef(startedAt);
  startedAtRef.current = startedAt;

  useEffect(() => {
    const interval = setInterval(() => {
      setDurationSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return { durationSeconds, elapsedLabel: format(durationSeconds) };
}
