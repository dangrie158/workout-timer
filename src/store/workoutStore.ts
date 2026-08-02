import type { WorkoutConfig } from '../types/workout'

const STORAGE_KEY = 'workouts';

// Simple pub/sub for same-tab page notifications (storage event doesn't fire on the originating tab)
type Listener = () => void
const _listeners = new Set<Listener>()

export function subscribeWorkoutChange(fn: Listener): () => void {
  _listeners.add(fn)
  return () => { _listeners.delete(fn) }
}

function notifyWorkoutChanged(): void {
  // Notify listeners in this tab (storage event only fires cross-tab)
  _listeners.forEach(fn => fn())
  // Also broadcast via postMessage for robustness — any page in the same tab can catch it
  try { window.postMessage({ type: '__workouts_changed' }, '*') } catch {}
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getWorkouts(): WorkoutConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse workouts from localStorage:', error);
    return [];
  }
}

export function createWorkout(
  workout: Omit<WorkoutConfig, 'id' | 'createdAt' | 'updatedAt'>
): WorkoutConfig {
  const now = Date.now();
  const newWorkout: WorkoutConfig = {
    ...workout,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  const workouts = getWorkouts();
  workouts.push(newWorkout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  notifyWorkoutChanged();

  return newWorkout;
}

export function updateWorkout(
  id: string,
  updates: Partial<Omit<WorkoutConfig, 'id' | 'createdAt' | 'updatedAt'>>
): WorkoutConfig {
  const workouts = getWorkouts();
  const index = workouts.findIndex((w) => w.id === id);

  if (index === -1) {
    throw new Error(`Workout with id ${id} not found`);
  }

  const updated: WorkoutConfig = {
    ...workouts[index],
    ...updates,
    updatedAt: Date.now(),
  };

  workouts[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  notifyWorkoutChanged();

  return updated;
}

export function deleteWorkout(id: string): void {
  const workouts = getWorkouts();
  const filtered = workouts.filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  notifyWorkoutChanged();
}
