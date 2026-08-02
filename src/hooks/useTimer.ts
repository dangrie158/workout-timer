import { useState, useCallback, useEffect, useRef } from 'react'
import type { WorkoutConfig } from '../types/workout'
import { getPhaseAtTime, calculateTotalDuration } from '../utils/timerSequence'
import type { Phase } from '../utils/timerSequence'

export interface UseTimerReturn {
  elapsed: number
  remaining: number
  phase: Phase
  round: number
  cycle: number
  isPaused: boolean
  isRunning: boolean
  totalDuration: number
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useTimer(config: WorkoutConfig): UseTimerReturn {
  const initialPhase = getPhaseAtTime(config, 0)

  // State management
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [phase, setPhase] = useState<Phase>(initialPhase.phase)
  const [round, setRound] = useState(initialPhase.round)
  const [cycle, setCycle] = useState(initialPhase.cycle)
  const [remaining, setRemaining] = useState(initialPhase.remaining)
  const [elapsed, setElapsed] = useState(0)

  // Refs for wall-clock time tracking (NOT affected by React re-renders)
  const startTimeRef = useRef<number | null>(null)
  const pausedElapsedRef = useRef<number>(0)
  const pauseTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalDuration = calculateTotalDuration(config)

  // Calculate elapsed time from wall-clock (Date.now())
  const getElapsedSeconds = useCallback((): number => {
    if (!isRunning || startTimeRef.current === null) {
      return pausedElapsedRef.current
    }

    const now = Date.now()
    const elapsedMs = now - startTimeRef.current
    const elapsedSeconds = elapsedMs / 1000

    return pausedElapsedRef.current + elapsedSeconds
  }, [isRunning])

  // Update UI based on elapsed time
  useEffect(() => {
    if (!isRunning) return

    const updateTimer = () => {
      const elapsedSeconds = getElapsedSeconds()
      const phaseInfo = getPhaseAtTime(config, elapsedSeconds)
      setElapsed(Math.min(totalDuration, elapsedSeconds))

      setPhase(phaseInfo.phase)
      setCycle(phaseInfo.cycle)
      setRound(phaseInfo.round)
      setRemaining(Math.max(0, phaseInfo.remaining))

      // Stop if complete
      if (phaseInfo.phase === 'complete') {
        setIsRunning(false)
      }
    }

    // Initial update
    updateTimer()

    // Set up interval for UI updates (1 Hz)
    intervalRef.current = setInterval(updateTimer, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [config, getElapsedSeconds, isRunning, totalDuration])

  const start = useCallback(() => {
    if (isRunning) return

    const nextPhase = getPhaseAtTime(config, 0)
    startTimeRef.current = Date.now()
    pausedElapsedRef.current = 0
    pauseTimeRef.current = null

    setElapsed(0)
    setPhase(nextPhase.phase)
    setCycle(nextPhase.cycle)
    setRound(nextPhase.round)
    setRemaining(nextPhase.remaining)
    setIsRunning(true)
    setIsPaused(false)
  }, [config, isRunning])

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return

    const elapsedSeconds = getElapsedSeconds()
    const phaseInfo = getPhaseAtTime(config, elapsedSeconds)
    pausedElapsedRef.current = elapsedSeconds
    pauseTimeRef.current = Date.now()
    startTimeRef.current = null

    setElapsed(Math.min(totalDuration, elapsedSeconds))
    setPhase(phaseInfo.phase)
    setCycle(phaseInfo.cycle)
    setRound(phaseInfo.round)
    setRemaining(Math.max(0, phaseInfo.remaining))
    setIsRunning(false)
    setIsPaused(true)
  }, [config, getElapsedSeconds, isPaused, isRunning, totalDuration])

  const resume = useCallback(() => {
    if (isRunning || !isPaused) return

    // Resume from where we paused
    startTimeRef.current = Date.now()
    pauseTimeRef.current = null

    setIsRunning(true)
    setIsPaused(false)
  }, [isRunning, isPaused])

  const reset = useCallback(() => {
    // Stop interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Reset all state
    startTimeRef.current = null
    pausedElapsedRef.current = 0
    pauseTimeRef.current = null

    const nextPhase = getPhaseAtTime(config, 0)
    setElapsed(0)
    setIsRunning(false)
    setIsPaused(false)
    setPhase(nextPhase.phase)
    setRound(nextPhase.round)
    setCycle(nextPhase.cycle)
    setRemaining(nextPhase.remaining)
  }, [config])

  return {
    elapsed,
    remaining,
    phase,
    round,
    cycle,
    isPaused,
    isRunning,
    totalDuration,
    start,
    pause,
    resume,
    reset
  }
}
