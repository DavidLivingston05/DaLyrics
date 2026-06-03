import React, { useState, useEffect, useRef } from 'react';

interface CountdownOverlayProps {
  active: boolean;
  startTime: number;
  duration: number;
}

export default function CountdownOverlay({ active, startTime, duration }: CountdownOverlayProps) {
  const [remaining, setRemaining] = useState(duration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setRemaining(duration);
      return;
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);
      if (left <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    tick();
    timerRef.current = setInterval(tick, 200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active, startTime, duration]);

  if (!active) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const expired = remaining <= 0;
  const pct = duration > 0 ? remaining / duration : 0;
  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90">
      <svg width="420" height="420" className="mb-10" viewBox="0 0 420 420">
        <circle cx="210" cy="210" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="210" cy="210" r={radius}
          fill="none"
          stroke={expired ? "#ef4444" : "#f97316"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 210 210)"
          style={{ transition: 'stroke-dashoffset 0.3s linear, stroke 0.5s ease' }}
        />
      </svg>
      <div className="text-[8rem] font-bold font-mono tracking-[0.1em] select-none text-white" style={{ lineHeight: 1 }}>
        {expired ? "00:00" : display}
      </div>
      {expired && (
        <div className="text-3xl font-bold text-red-400 mt-6 animate-pulse tracking-wider uppercase">
          Time's Up!
        </div>
      )}
      <div className="text-zinc-500 text-sm mt-10 font-sans tracking-wider uppercase">
        {expired ? "Click Stop to dismiss" : "Service starting soon"}
      </div>
    </div>
  );
}
