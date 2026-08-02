import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PhaseBlock from "../components/PhaseBlock";
import ProgressRing from "../components/ProgressRing";
import TimerDisplay from "../components/TimerDisplay";
import { useAudio, type AudioPhase } from "../hooks/useAudio";
import { useTimer } from "../hooks/useTimer";
import { useScreenWakeLock } from "../hooks/useScreenWakeLock";
import { getSettings } from "../store/settingsStore";
import { getWorkouts } from "../store/workoutStore";
import type { TimerPhase, WorkoutConfig } from "../types";
import {
  PHASE_COLORS,
  PHASE_LABELS,
  formatCompactDuration,
  getPhaseDuration,
} from "../utils/timerUi";

function PlayIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d="M3 2v6h6" />
      <path d="M3 8a9 9 0 1 0 2.64-4.36L3 6" />
    </svg>
  );
}

function getPhaseProgress(
  duration: number,
  remaining: number,
  phase: TimerPhase,
): number {
  if (phase === "complete") {
    return 1;
  }

  if (duration <= 0) {
    return 1;
  }

  return Math.min(1, Math.max(0, (duration - remaining) / duration));
}

export default function TimerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workout = useMemo(
    () => getWorkouts().find((entry) => entry.id === id),
    [id],
  );

  if (!workout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full rounded-3xl border border-white/10 bg-zinc-900/90 p-6 text-center shadow-2xl">
          <h1 className="text-2xl font-semibold">Workout not found</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Pick a saved workout to start the timer.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500">
            Back to workouts
          </button>
        </div>
      </div>
    );
  }

  return <TimerExperience onExit={() => navigate("/")} workout={workout} />;
}

interface TimerExperienceProps {
  workout: WorkoutConfig;
  onExit: () => void;
}

function TimerExperience({ workout, onExit }: TimerExperienceProps) {
  const { playCountdownBeep, playPhaseTransition } = useAudio();
  const {
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
    reset,
  } = useTimer(workout);
  const previousPhaseRef = useRef<AudioPhase | null>(null);
  const autostartWorkoutIdRef = useRef<string | null>(null);
  const lastCountdownVibrationKeyRef = useRef<string | null>(null);

  useScreenWakeLock(isRunning);

  const phaseDuration = getPhaseDuration(workout, phase);
  const phaseProgress = getPhaseProgress(phaseDuration, remaining, phase);
  const overallProgress =
    phase === "complete" || totalDuration === 0
      ? 1
      : Math.min(elapsed / totalDuration, 1);
  const accent = PHASE_COLORS[phase];
  const canReset = isRunning || isPaused || phase === "complete" || elapsed > 0;

  const triggerVibration = useCallback((pattern: number | number[]) => {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.vibrate !== "function"
    ) {
      return;
    }

    if (!getSettings().vibrationEnabled) {
      return;
    }

    navigator.vibrate(pattern);
  }, []);

  useEffect(() => {
    if (!getSettings().autostart) {
      return;
    }

    if (
      autostartWorkoutIdRef.current === workout.id ||
      isRunning ||
      isPaused ||
      phase === "complete"
    ) {
      return;
    }

    autostartWorkoutIdRef.current = workout.id;
    start();
  }, [isPaused, isRunning, phase, start, workout.id]);

  useEffect(() => {
    if (!isRunning && phase !== "complete") {
      return;
    }

    const previousPhase = previousPhaseRef.current;

    playPhaseTransition(previousPhase, phase);

    if (previousPhase !== phase) {
      if (phase === "complete") {
        triggerVibration([180, 60, 240]);
      } else if (phase === "work") {
        triggerVibration([80, 40, 120]);
      } else {
        triggerVibration(90);
      }
    }

    previousPhaseRef.current = phase === "complete" ? null : phase;
  }, [isRunning, phase, playPhaseTransition, triggerVibration]);

  useEffect(() => {
    if (!isRunning || phase === "complete") {
      return;
    }

    playCountdownBeep(phase as AudioPhase, remaining);

    const roundedSeconds = Math.ceil(remaining);
    if (
      roundedSeconds <= 0 ||
      roundedSeconds > getSettings().countdownSeconds
    ) {
      lastCountdownVibrationKeyRef.current = null;
      return;
    }

    const countdownKey = `${phase}:${roundedSeconds}`;
    if (lastCountdownVibrationKeyRef.current === countdownKey) {
      return;
    }

    lastCountdownVibrationKeyRef.current = countdownKey;
    triggerVibration(25);
  }, [isRunning, phase, playCountdownBeep, remaining, triggerVibration]);

  const handleReset = useCallback(() => {
    previousPhaseRef.current = null;
    lastCountdownVibrationKeyRef.current = null;
    reset();
  }, [reset]);

  const handlePrimaryAction = useCallback(() => {
    if (phase === "complete") {
      handleReset();
      return;
    }

    if (isRunning) {
      pause();
      return;
    }

    if (isPaused) {
      resume();
      return;
    }

    start();
  }, [handleReset, isPaused, isRunning, pause, phase, resume, start]);

  const primaryLabel =
    phase === "complete"
      ? "Start again"
      : isRunning
        ? "Pause"
        : isPaused
          ? "Resume"
          : "Start";
  useEffect(() => {
    const isTypingField = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.tagName === "BUTTON" ||
        target.tagName === "A"
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        isTypingField(event.target)
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        handlePrimaryAction();
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        handleReset();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePrimaryAction, handleReset, onExit]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen w-full flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onExit}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
            ← Workouts
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Timer
            </p>
            <h1 className="text-lg font-semibold text-white">{workout.name}</h1>
          </div>
        </div>

        <div className="relative rounded-[2rem] border border-white/10 px-4 py-6 shadow-2xl shadow-black/30" style={{ background: accent ? `radial-gradient(circle at 50% -20%, ${accent}3a, rgba(9,9,11,0.8) 62%), #18181bca` : undefined }}>
          <button
            onClick={handleReset}
            disabled={!canReset}
            aria-label="Reset"
            className="absolute left-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
            <RestartIcon />
          </button>
          <button
            onClick={handlePrimaryAction}
            aria-label={primaryLabel}
            className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition active:scale-[0.97] ${
              phase === "complete"
                ? "bg-emerald-500 hover:bg-emerald-400"
                : isRunning
                  ? "bg-amber-500 hover:bg-amber-400"
                  : "bg-blue-600 hover:bg-blue-500"
            }`}>
            {isRunning ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="flex justify-center">
            <ProgressRing
              progress={phaseProgress}
              phase={phase}
              label={`${primaryLabel} — ${PHASE_LABELS[phase]} phase, ${Math.round(phaseProgress * 100)} percent complete`}
              onClick={phase !== "complete" ? handlePrimaryAction : undefined}>
              <TimerDisplay
                phase={phase}
                remaining={remaining}
                totalDuration={totalDuration}
                isRunning={isRunning}
                isPaused={isPaused}
              />
            </ProgressRing>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.max(overallProgress * 100, phase === "complete" ? 100 : 0)}%`,
                backgroundColor: accent,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-zinc-500">
            <span>Overall workout</span>
            <span>{Math.round(overallProgress * 100)}% complete</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <PhaseBlock
            label="Cycle"
            value={`${Math.min(cycle, workout.cycles)} / ${workout.cycles}`}
            detail={
              phase === "restBetweenCycles" ? "Between cycles" : "Current cycle"
            }
            accent={PHASE_COLORS.cooldown}
          />
          <PhaseBlock
            label="Round"
            value={`${Math.min(round, workout.rounds)} / ${workout.rounds}`}
            detail={
              phase === "restBetweenCycles"
                ? "Last round complete"
                : "Current round"
            }
            accent={PHASE_COLORS.work}
          />
          <PhaseBlock
            label="Current phase"
            value={PHASE_LABELS[phase]}
            detail={
              phase === "complete"
                ? "All intervals finished"
                : `${formatCompactDuration(remaining)} left`
            }
            accent={accent}
            isActive
          />
          <PhaseBlock
            label="Elapsed"
            value={formatCompactDuration(elapsed)}
            detail={`of ${formatCompactDuration(totalDuration)}`}
            accent={PHASE_COLORS.prepare}
          />
        </div>

        <div className="mt-4 rounded-3xl border border-white/5 bg-zinc-900/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Workout structure
            </h2>
            <span className="text-sm text-zinc-400">
              {workout.rounds} rounds × {workout.cycles} cycles
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <PhaseBlock
              label="Prepare"
              value={formatCompactDuration(workout.prepare)}
              accent={PHASE_COLORS.prepare}
              isActive={phase === "prepare"}
            />
            <PhaseBlock
              label="Work"
              value={formatCompactDuration(workout.work)}
              accent={PHASE_COLORS.work}
              isActive={phase === "work"}
            />
            <PhaseBlock
              label="Rest"
              value={formatCompactDuration(workout.rest)}
              accent={PHASE_COLORS.rest}
              isActive={phase === "rest" || phase === "restBetweenCycles"}
              detail={
                workout.cycles > 1
                  ? `Cycle rest ${formatCompactDuration(workout.restBetweenCycles)}`
                  : undefined
              }
            />
            <PhaseBlock
              label="Cooldown"
              value={formatCompactDuration(workout.cooldown)}
              accent={PHASE_COLORS.cooldown}
              isActive={phase === "cooldown"}
            />
          </div>
        </div>

        <div className="mt-auto pt-6">
          {phase === "complete" ? (
            <div className="mb-4 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
                Complete
              </p>
              <p className="mt-2 text-sm text-emerald-100/80">
                Nice work — your session is done.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
