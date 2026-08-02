import { useEffect, useMemo, useRef, useState } from "react";

interface NumberPickerProps {
  isOpen: boolean;
  title: string;
  value: number;
  onChange: (value: number) => void;
  onClose: () => void;
  min?: number;
  max?: number;
}

const ITEM_HEIGHT = 48;
const PADDING_ITEMS = 2;
const REPEAT_COPIES = 3;

export default function NumberPicker({
  isOpen,
  title,
  value,
  onChange,
  onClose,
  min = 0,
  max = 3600,
}: NumberPickerProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [tempValue, setTempValue] = useState(value);
  const titleId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-picker-title`;

  const values = useMemo(() => {
    return Array.from({ length: max - min + 1 }, (_, index) => min + index);
  }, [max, min]);

  const repeatedValues = useMemo(() => {
    return Array.from({ length: REPEAT_COPIES }, () => values).flat();
  }, [values]);

  const middleStartIndex = values.length;
  const centerOffset = PADDING_ITEMS * ITEM_HEIGHT;

  const scrollToValue = (nextValue: number) => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(values.length - 1, nextValue - min));
    list.scrollTop = (middleStartIndex + nextIndex) * ITEM_HEIGHT;
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTempValue(value);

    const frame = window.requestAnimationFrame(() => {
      scrollToValue(value);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isOpen, value]);

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const rawIndex = Math.round(list.scrollTop / ITEM_HEIGHT);
    const normalizedIndex =
      ((rawIndex % values.length) + values.length) % values.length;
    const nextValue = min + normalizedIndex;

    setTempValue((current) => (current === nextValue ? current : nextValue));

    const lowerBound = values.length * ITEM_HEIGHT;
    const upperBound = values.length * 2 * ITEM_HEIGHT;

    if (list.scrollTop < lowerBound) {
      list.scrollTop += values.length * ITEM_HEIGHT;
    } else if (list.scrollTop > upperBound) {
      list.scrollTop -= values.length * ITEM_HEIGHT;
    }
  };

  const handleConfirm = () => {
    onChange(tempValue);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] border-t border-white/10 bg-zinc-950 shadow-2xl"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-white/15" />
        </div>

        <div className="px-5 pb-5">
          <div className="mb-5 text-center">
            <h2 id={titleId} className="text-xl font-semibold text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Scroll the wheel to choose a value.
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-white/[0.03] shadow-inner shadow-black/30">
              <div className="h-12" />
            </div>

            <div
              ref={listRef}
              role="listbox"
              aria-label={`${title} wheel`}
              onScroll={handleScroll}
              className="no-scrollbar max-h-[240px] overflow-y-auto rounded-3xl snap-y snap-mandatory"
              style={{
                paddingTop: centerOffset,
                paddingBottom: centerOffset,
                scrollPaddingTop: centerOffset,
                scrollPaddingBottom: centerOffset,
              }}
            >
              {repeatedValues.map((item, index) => {
                const isSelected = tempValue === item;

                return (
                  <div
                    key={`${Math.floor(index / values.length)}-${item}-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex h-12 snap-center items-center justify-center text-2xl font-semibold transition ${
                      isSelected ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {tempValue}s selected
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10 active:bg-white/15"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 active:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
