import { PHASE_COLORS, PHASE_LABELS, formatClock } from '../utils/timerUi'
import type { TimerPhase } from '../types'

interface TimerDisplayProps {
  phase: TimerPhase
  remaining: number
  totalDuration: number
  isRunning: boolean
  isPaused: boolean
}

function getStatusText(phase: TimerPhase, isRunning: boolean, isPaused: boolean): string {
  if (phase === 'complete') {
    return 'Workout complete'
  }

  if (isPaused) {
    return 'Paused'
  }

  if (!isRunning) {
    return 'Ready to start'
  }

  if (phase === 'prepare') {
    return 'Get ready'
  }

  if (phase === 'work') {
    return 'Push through'
  }

  if (phase === 'restBetweenCycles') {
    return 'Recover between cycles'
  }

  if (phase === 'rest') {
    return 'Catch your breath'
  }

  return 'Cool down'
}

export default function TimerDisplay({
  phase,
  remaining,
  totalDuration,
  isRunning,
  isPaused,
}: TimerDisplayProps) {
  const highlight = PHASE_COLORS[phase]
  const countdown = Math.ceil(remaining)
  const showCountdown = isRunning && phase !== 'complete' && countdown > 0 && countdown <= 10

  return (
    <div className="flex flex-col items-center justify-center px-6 text-center">
      <span
        className="mb-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em]"
        style={{ color: highlight }}
      >
        {PHASE_LABELS[phase]}
      </span>
      <div className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">{formatClock(remaining)}</div>
      <p className="mt-2 text-sm text-zinc-400">{getStatusText(phase, isRunning, isPaused)}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-zinc-500">
        Total {formatClock(totalDuration)}
      </p>
      <div className="mt-4 min-h-6 text-sm font-medium" style={{ color: showCountdown ? highlight : 'rgb(161 161 170)' }}>
        {showCountdown ? `Countdown: ${countdown}` : ' '}
      </div>
    </div>
  )
}
