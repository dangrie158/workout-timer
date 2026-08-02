import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from "./workoutStore";
import type { WorkoutConfig } from "../types/workout";

describe("WorkoutStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should return empty array when no workouts exist", () => {
    const workouts = getWorkouts();
    expect(workouts).toEqual([]);
  });

  it("should create a new workout and return it", () => {
    const newWorkout: Omit<WorkoutConfig, "id" | "createdAt" | "updatedAt"> = {
      name: "HIIT",
      prepare: 10,
      work: 30,
      rest: 15,
      rounds: 8,
      cycles: 3,
      restBetweenCycles: 60,
      cooldown: 30,
    };

    const created = createWorkout(newWorkout);
    expect(created.id).toBeDefined();
    expect(created.name).toBe("HIIT");
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBeDefined();
  });

  it("should persist created workout to localStorage", () => {
    const newWorkout: Omit<WorkoutConfig, "id" | "createdAt" | "updatedAt"> = {
      name: "Strength",
      prepare: 5,
      work: 45,
      rest: 30,
      rounds: 5,
      cycles: 2,
      restBetweenCycles: 120,
      cooldown: 60,
    };

    const created = createWorkout(newWorkout);
    const stored = getWorkouts();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(created.id);
  });

  it("should retrieve a workout by id", () => {
    const newWorkout: Omit<WorkoutConfig, "id" | "createdAt" | "updatedAt"> = {
      name: "Cardio",
      prepare: 15,
      work: 60,
      rest: 20,
      rounds: 10,
      cycles: 1,
      restBetweenCycles: 0,
      cooldown: 45,
    };

    const created = createWorkout(newWorkout);
    const workouts = getWorkouts();
    const found = workouts.find((w) => w.id === created.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe("Cardio");
  });

  it("should update an existing workout", () => {
    const newWorkout: Omit<WorkoutConfig, "id" | "createdAt" | "updatedAt"> = {
      name: "Original",
      prepare: 10,
      work: 30,
      rest: 15,
      rounds: 8,
      cycles: 3,
      restBetweenCycles: 60,
      cooldown: 30,
    };

    const created = createWorkout(newWorkout);
    const updated = updateWorkout(created.id, { name: "Updated" });
    expect(updated.name).toBe("Updated");
    expect(updated.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);
  });

  it("should persist updated workout to localStorage", () => {
    const newWorkout: Omit<WorkoutConfig, "id" | "createdAt" | "updatedAt"> = {
      name: "Original",
      prepare: 10,
      work: 30,
      rest: 15,
      rounds: 8,
      cycles: 3,
      restBetweenCycles: 60,
      cooldown: 30,
    };

    const created = createWorkout(newWorkout);
    updateWorkout(created.id, { work: 60 });
    const stored = getWorkouts();
    const found = stored.find((w) => w.id === created.id);
    expect(found?.work).toBe(60);
  });

  it("should delete a workout", () => {
    const newWorkout: Omit<WorkoutConfig, "id" | "createdAt" | "updatedAt"> = {
      name: "ToDelete",
      prepare: 10,
      work: 30,
      rest: 15,
      rounds: 8,
      cycles: 3,
      restBetweenCycles: 60,
      cooldown: 30,
    };

    const created = createWorkout(newWorkout);
    deleteWorkout(created.id);
    const stored = getWorkouts();
    expect(stored).toHaveLength(0);
  });

  it("should persist deletion to localStorage", () => {
    const newWorkout1: Omit<WorkoutConfig, "id" | "createdAt" | "updatedAt"> = {
      name: "Workout1",
      prepare: 10,
      work: 30,
      rest: 15,
      rounds: 8,
      cycles: 3,
      restBetweenCycles: 60,
      cooldown: 30,
    };

    const newWorkout2: Omit<WorkoutConfig, "id" | "createdAt" | "updatedAt"> = {
      name: "Workout2",
      prepare: 5,
      work: 45,
      rest: 30,
      rounds: 5,
      cycles: 2,
      restBetweenCycles: 120,
      cooldown: 60,
    };

    const created1 = createWorkout(newWorkout1);
    createWorkout(newWorkout2);
    deleteWorkout(created1.id);
    const stored = getWorkouts();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Workout2");
  });
});
