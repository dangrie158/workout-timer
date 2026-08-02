export interface WorkoutConfig {
  id: string;
  name: string;
  prepare: number;
  work: number;
  rest: number;
  rounds: number;
  cycles: number;
  restBetweenCycles: number;
  cooldown: number;
  createdAt: number;
  updatedAt: number;
}

export type TimerPhase =
  "prepare" | "work" | "rest" | "restBetweenCycles" | "cooldown" | "complete";

export interface TimerState {
  phase: TimerPhase;
  remainingTime: number;
  currentRound: number;
  currentCycle: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedTime: number | null;
}

export interface GlobalSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autostart: boolean;
  countdownSeconds: number;
}
