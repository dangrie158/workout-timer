import type { WorkoutConfig } from '../types/workout'

const STORAGE_KEY = 'workouts';

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

  return updated;
}

export function deleteWorkout(id: string): void {
  const workouts = getWorkouts();
  const filtered = workouts.filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
