import { fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NumberPicker from "./NumberPicker";

describe("NumberPicker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("scrolls like a wheel and confirms the selected value", async () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <NumberPicker
        isOpen
        title="Prepare"
        value={30}
        onChange={onChange}
        onClose={onClose}
        min={0}
        max={60}
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    const listbox = screen.getByRole("listbox", { name: "Prepare wheel" });
    expect(screen.getByText("30s selected")).toBeInTheDocument();

    act(() => {
      fireEvent.scroll(listbox, {
        target: {
          scrollTop: (61 + 41) * 48,
        },
      });
    });

    expect(screen.getByText("41s selected")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onChange).toHaveBeenCalledWith(41);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
