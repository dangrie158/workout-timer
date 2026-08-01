import type { WorkoutConfig } from '../types/workout'

export type Phase =
  | 'prepare'
  | 'work'
  | 'rest'
  | 'restBetweenCycles'
  | 'cooldown'
  | 'complete'

export interface PhaseInfo {
  phase: Phase
  round: number
  cycle: number
  remaining: number
}

export function getPhaseAtTime(config: WorkoutConfig, elapsedSeconds: number): PhaseInfo {
  let timeRemaining = elapsedSeconds

  if (timeRemaining < config.prepare) {
    return {
      phase: 'prepare',
      round: 1,
      cycle: 1,
      remaining: config.prepare - timeRemaining,
    }
  }
  timeRemaining -= config.prepare

  for (let cycle = 1; cycle <= config.cycles; cycle += 1) {
    for (let round = 1; round <= config.rounds; round += 1) {
      if (timeRemaining < config.work) {
        return {
          phase: 'work',
          round,
          cycle,
          remaining: config.work - timeRemaining,
        }
      }
      timeRemaining -= config.work

      const hasRoundRest = round < config.rounds
      if (hasRoundRest) {
        if (timeRemaining < config.rest) {
          return {
            phase: 'rest',
            round,
            cycle,
            remaining: config.rest - timeRemaining,
          }
        }
        timeRemaining -= config.rest
      }
    }

    const hasCycleRest = cycle < config.cycles
    if (hasCycleRest) {
      if (timeRemaining < config.restBetweenCycles) {
        return {
          phase: 'restBetweenCycles',
          round: config.rounds,
          cycle,
          remaining: config.restBetweenCycles - timeRemaining,
        }
      }
      timeRemaining -= config.restBetweenCycles
    }
  }

  if (timeRemaining < config.cooldown) {
    return {
      phase: 'cooldown',
      round: config.rounds,
      cycle: config.cycles,
      remaining: config.cooldown - timeRemaining,
    }
  }

  return {
    phase: 'complete',
    round: config.rounds,
    cycle: config.cycles,
    remaining: 0,
  }
}

export function calculateTotalDuration(config: WorkoutConfig): number {
  const cycleRoundsDuration = config.rounds * config.work + (config.rounds - 1) * config.rest
  const restBetweenCyclesTotalDuration =
    config.cycles > 1 ? (config.cycles - 1) * config.restBetweenCycles : 0

  return (
    config.prepare +
    config.cycles * cycleRoundsDuration +
    restBetweenCyclesTotalDuration +
    config.cooldown
  )
}

export function isValidWorkoutConfig(config: WorkoutConfig): boolean {
  return (
    config.prepare >= 0 &&
    config.work > 0 &&
    config.rest >= 0 &&
    config.rounds > 0 &&
    config.cycles > 0 &&
    config.restBetweenCycles >= 0 &&
    config.cooldown >= 0
  )
}
