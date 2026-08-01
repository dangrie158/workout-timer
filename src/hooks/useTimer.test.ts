import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useTimer } from './useTimer'
import type { WorkoutConfig } from '../types'

const defaultConfig: WorkoutConfig = {
  id: 'test-workout',
  name: 'Test Workout',
  prepare: 5,
  work: 30,
  rest: 10,
  rounds: 3,
  cycles: 2,
  restBetweenCycles: 20,
  cooldown: 10,
  createdAt: 0,
  updatedAt: 0,
}

describe('useTimer', () => {
  describe('Timer Initialization', () => {
    it('should initialize with correct state', () => {
      const { result } = renderHook(() => useTimer(defaultConfig))

      expect(result.current.isRunning).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.phase).toBe('prepare')
      expect(result.current.round).toBe(1)
      expect(result.current.cycle).toBe(1)
      expect(result.current.remaining).toBe(defaultConfig.prepare)
    })

    it('should calculate total duration correctly', () => {
      const { result } = renderHook(() => useTimer(defaultConfig))
      const cycleRoundsDuration =
        defaultConfig.rounds * defaultConfig.work +
        (defaultConfig.rounds - 1) * defaultConfig.rest
      const restBetweenCyclesTotalDuration =
        defaultConfig.cycles > 1 ? (defaultConfig.cycles - 1) * defaultConfig.restBetweenCycles : 0
      const expectedTotal =
        defaultConfig.prepare +
        defaultConfig.cycles * cycleRoundsDuration +
        restBetweenCyclesTotalDuration +
        defaultConfig.cooldown

      expect(result.current.totalDuration).toBe(expectedTotal)
    })
  })

  describe('Starting and Stopping', () => {
    it('should start the timer', () => {
      const { result } = renderHook(() => useTimer(defaultConfig))

      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(true)
      expect(result.current.isPaused).toBe(false)
    })

    it('should pause the timer', async () => {
      const { result } = renderHook(() => useTimer(defaultConfig))

      act(() => {
        result.current.start()
      })

      await waitFor(() => {
        expect(result.current.isRunning).toBe(true)
      })

      act(() => {
        result.current.pause()
      })

      expect(result.current.isRunning).toBe(false)
      expect(result.current.isPaused).toBe(true)
    })

    it('should resume the timer from pause', async () => {
      const { result } = renderHook(() => useTimer(defaultConfig))

      act(() => {
        result.current.start()
      })

      await waitFor(() => {
        expect(result.current.isRunning).toBe(true)
      })

      act(() => {
        result.current.pause()
      })

      const remainingAtPause = result.current.remaining

      act(() => {
        result.current.resume()
      })

      expect(result.current.isRunning).toBe(true)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.remaining).toBeLessThanOrEqual(remainingAtPause)
    })
  })

  describe('Phase Transitions', () => {
    it('should transition from prepare to work phase', async () => {
      const quickConfig: WorkoutConfig = {
        ...defaultConfig,
        prepare: 1,
      }

      const { result } = renderHook(() => useTimer(quickConfig))

      act(() => {
        result.current.start()
      })

      await waitFor(() => {
        expect(result.current.phase).toBe('work')
      }, { timeout: 2000 })
    })

    it('should transition from work to rest phase', async () => {
      const quickConfig: WorkoutConfig = {
        ...defaultConfig,
        prepare: 1,
        work: 1,
      }

      const { result } = renderHook(() => useTimer(quickConfig))

      act(() => {
        result.current.start()
      })

      await waitFor(() => {
        expect(result.current.phase).toBe('rest')
      }, { timeout: 3000 })
    })

    it('should cycle through all phases correctly', async () => {
      const quickConfig: WorkoutConfig = {
        ...defaultConfig,
        prepare: 1,
        work: 1,
        rest: 1,
        rounds: 2,
        cycles: 1,
        cooldown: 1,
      }

      const { result } = renderHook(() => useTimer(quickConfig))
      const phases = new Set<string>()

      act(() => {
        result.current.start()
      })

      phases.add(result.current.phase)

      await waitFor(() => {
        phases.add(result.current.phase)
        expect(result.current.phase).not.toBe('prepare')
      }, { timeout: 2000 })

      await waitFor(() => {
        phases.add(result.current.phase)
        expect(result.current.phase).toBe('rest')
      }, { timeout: 2000 })

      await waitFor(() => {
        phases.add(result.current.phase)
        expect(result.current.phase).toBe('cooldown')
      }, { timeout: 4000 })

      expect(Array.from(phases)).toContain('prepare')
      expect(Array.from(phases)).toContain('work')
      expect(Array.from(phases)).toContain('rest')
      expect(Array.from(phases)).toContain('cooldown')
    })
  })

  describe('Cycle and Round Counting', () => {
    it('should increment round counter', async () => {
      const quickConfig: WorkoutConfig = {
        ...defaultConfig,
        prepare: 0,
        work: 1,
        rest: 1,
        rounds: 3,
        cycles: 1,
        cooldown: 0,
      }

      const { result } = renderHook(() => useTimer(quickConfig))

      act(() => {
        result.current.start()
      })

      expect(result.current.round).toBe(1)

      await waitFor(() => {
        expect(result.current.round).toBe(2)
      }, { timeout: 3000 })
    })

    it('should increment cycle counter', async () => {
      const quickConfig: WorkoutConfig = {
        ...defaultConfig,
        prepare: 0,
        work: 1,
        rest: 0,
        rounds: 1,
        cycles: 2,
        restBetweenCycles: 1,
        cooldown: 0,
      }

      const { result } = renderHook(() => useTimer(quickConfig))

      act(() => {
        result.current.start()
      })

      expect(result.current.cycle).toBe(1)

      await waitFor(() => {
        expect(result.current.cycle).toBe(2)
      }, { timeout: 4000 })
    })
  })

  describe('Pause and Reset', () => {
    it('should maintain paused state until resumed', async () => {
      const { result } = renderHook(() => useTimer(defaultConfig))

      act(() => {
        result.current.start()
      })

      await waitFor(() => {
        expect(result.current.isRunning).toBe(true)
      })

      act(() => {
        result.current.pause()
      })

      const remainingAtPause = result.current.remaining
      await new Promise((resolve) => setTimeout(resolve, 1100))

      expect(result.current.remaining).toBe(remainingAtPause)
      expect(result.current.isPaused).toBe(true)
    })

    it('should reset timer to initial state', async () => {
      const { result } = renderHook(() => useTimer(defaultConfig))

      act(() => {
        result.current.start()
      })

      await waitFor(() => {
        expect(result.current.isRunning).toBe(true)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.isRunning).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.phase).toBe('prepare')
      expect(result.current.round).toBe(1)
      expect(result.current.cycle).toBe(1)
      expect(result.current.remaining).toBe(defaultConfig.prepare)
    })
  })

  describe('Workout Completion', () => {
    it('should complete workout after all time elapsed', async () => {
      const quickConfig: WorkoutConfig = {
        ...defaultConfig,
        prepare: 1,
        work: 1,
        rest: 0,
        rounds: 1,
        cycles: 1,
        restBetweenCycles: 0,
        cooldown: 1,
      }

      const { result } = renderHook(() => useTimer(quickConfig))

      act(() => {
        result.current.start()
      })

      await waitFor(() => {
        expect(result.current.isRunning).toBe(false)
      }, { timeout: 5000 })

      expect(result.current.phase).toBe('complete')
      expect(result.current.remaining).toBe(0)
    })
  })
})
