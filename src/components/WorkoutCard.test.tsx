import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WorkoutCard from "./WorkoutCard";
import type { WorkoutConfig } from "../types/workout";

const workout: WorkoutConfig = {
  id: "hiit-blast",
  name: "HIIT Blast",
  prepare: 10,
  work: 45,
  rest: 15,
  rounds: 8,
  cycles: 2,
  restBetweenCycles: 60,
  cooldown: 30,
  createdAt: 1,
  updatedAt: 1,
};

function renderWorkoutCard(onDelete?: () => void) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={<WorkoutCard workout={workout} onDelete={onDelete} />}
        />
        <Route path="/workout/:id/timer" element={<div>Timer page</div>} />
        <Route path="/workout/:id/edit" element={<div>Edit page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("WorkoutCard", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("opens the timer when the card is clicked", () => {
    renderWorkoutCard();

    fireEvent.click(
      screen.getByRole("button", { name: "Open HIIT Blast workout" }),
    );

    expect(screen.getByText("Timer page")).toBeInTheDocument();
  });

  it("opens the editor without bubbling through to the timer route", () => {
    renderWorkoutCard();

    fireEvent.click(screen.getByRole("button", { name: "Edit workout" }));

    expect(screen.getByText("Edit page")).toBeInTheDocument();
    expect(screen.queryByText("Timer page")).not.toBeInTheDocument();
  });

  it("deletes without bubbling through to the timer route", () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWorkoutCard(onDelete);

    fireEvent.click(screen.getByRole("button", { name: "Delete workout" }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(screen.queryByText("Timer page")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit page")).not.toBeInTheDocument();
  });
});
