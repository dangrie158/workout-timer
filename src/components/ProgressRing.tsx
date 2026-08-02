import type { ReactNode } from "react";
import { PHASE_COLORS } from "../utils/timerUi";
import type { TimerPhase } from "../types";

interface ProgressRingProps {
  progress: number;
  phase: TimerPhase;
  size?: number;
  strokeWidth?: number;
  label: string;
  onClick?: () => void;
  children?: ReactNode;
}

export default function ProgressRing({
  progress,
  phase,
  size = 280,
  strokeWidth = 18,
  label,
  onClick,
  children,
}: ProgressRingProps) {
  const safeProgress = Math.min(1, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safeProgress);

  const Inner = (
    <>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-[0_0_24px_rgba(255,255,255,0.08)]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(63 63 70)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={PHASE_COLORS[phase]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-8 rounded-full border border-white/5 bg-zinc-950/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex h-full items-center justify-center">
          {children}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="relative inline-flex items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.97]"
      >
        {Inner}
      </button>
    );
  }

  return (
    <div
      className="relative inline-flex items-center justify-center"
      aria-label={label}
    >
      {Inner}
    </div>
  );
}
