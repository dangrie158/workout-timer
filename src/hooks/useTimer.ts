import { useState, useCallback, useEffect, useRef } from 'react';
import type { WorkoutConfig } from '../types/workout';
import { getPhaseAtTime, calculateTotalDuration } from '../utils/timerSequence';
import type { Phase } from '../utils/timerSequence';

export interface UseTimerReturn {
  remaining: number;
  phase: Phase;
  round: number;
  cycle: number;
  isPaused: boolean;
  isRunning: boolean;
  totalDuration: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useTimer(config: WorkoutConfig): UseTimerReturn {
  // State management
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<Phase>('prepare');
  const [round, setRound] = useState(1);
  const [cycle, setCycle] = useState(1);
  const [remaining, setRemaining] = useState(config.prepare);

  // Refs for wall-clock time tracking (NOT affected by React re-renders)
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);
  const pauseTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = calculateTotalDuration(config);

  // Calculate elapsed time from wall-clock (Date.now())
  const getElapsedSeconds = useCallback((): number => {
    if (!isRunning || startTimeRef.current === null) {
      return pausedElapsedRef.current;
    }

    const now = Date.now();
    const elapsedMs = now - startTimeRef.current;
    const elapsedSeconds = elapsedMs / 1000;

    return pausedElapsedRef.current + elapsedSeconds;
  }, [isRunning]);

  // Update UI based on elapsed time
  useEffect(() => {
    if (!isRunning) return;

    const updateTimer = () => {
      const elapsedSeconds = getElapsedSeconds();
      const phaseInfo = getPhaseAtTime(config, elapsedSeconds);

      setPhase(phaseInfo.phase);
      setCycle(phaseInfo.cycle);
      setRound(phaseInfo.round);
      setRemaining(Math.max(0, phaseInfo.remaining));

      // Stop if complete
      if (phaseInfo.phase === 'complete') {
        setIsRunning(false);
      }
    };

    // Initial update
    updateTimer();

    // Set up interval for UI updates (1 Hz)
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, config, getElapsedSeconds]);

  const start = useCallback(() => {
    if (isRunning) return;

    startTimeRef.current = Date.now();
    pausedElapsedRef.current = 0;
    pauseTimeRef.current = null;

    setIsRunning(true);
    setIsPaused(false);
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    const elapsedSeconds = getElapsedSeconds();
    pausedElapsedRef.current = elapsedSeconds;
    pauseTimeRef.current = Date.now();
    startTimeRef.current = null;

    setIsRunning(false);
    setIsPaused(true);
  }, [isRunning, isPaused, getElapsedSeconds]);

  const resume = useCallback(() => {
    if (isRunning || !isPaused) return;

    // Resume from where we paused
    startTimeRef.current = Date.now();
    pauseTimeRef.current = null;

    setIsRunning(true);
    setIsPaused(false);
  }, [isRunning, isPaused]);

  const reset = useCallback(() => {
    // Stop interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset all state
    startTimeRef.current = null;
    pausedElapsedRef.current = 0;
    pauseTimeRef.current = null;

    setIsRunning(false);
    setIsPaused(false);
    setPhase('prepare');
    setRound(1);
    setCycle(1);
    setRemaining(config.prepare);
  }, [config.prepare]);

  return {
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
    reset,
  };
}
