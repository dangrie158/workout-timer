import type { TimerPhase, WorkoutConfig } from '../types'

export const PHASE_LABELS: Record<TimerPhase, string> = {
  prepare: 'Prepare',
  work: 'Work',
  rest: 'Rest',
  restBetweenCycles: 'Cycle Rest',
  cooldown: 'Cooldown',
  complete: 'Complete'
}

export const PHASE_COLORS: Record<TimerPhase, string> = {
  prepare: '#FFE600',
  work: '#AAEE00',
  rest: '#FF3B30',
  restBetweenCycles: '#FF3B30',
  cooldown: '#4A90E2',
  complete: '#34D399'
}

export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60

  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

export function formatCompactDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60

  if (minutes === 0) {
    return `${remainder}s`
  }

  if (remainder === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainder}s`
}

export function getPhaseDuration(
  config: WorkoutConfig,
  phase: TimerPhase
): number {
  switch (phase) {
    case 'prepare':
      return config.prepare
    case 'work':
      return config.work
    case 'rest':
      return config.rest
    case 'restBetweenCycles':
      return config.restBetweenCycles
    case 'cooldown':
      return config.cooldown
    case 'complete':
      return 0
  }
}
