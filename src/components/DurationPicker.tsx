import { useEffect, useMemo, useRef, useState } from 'react'

interface DurationPickerProps {
  isOpen: boolean
  title: string
  totalSeconds: number
  maxMinutes: number
  /** Called with [minutes, seconds] when user taps Confirm. Total seconds = m * 60 + s. */
  onMinsChange: (minutes: number, seconds: number) => void
  onClose: () => void
}

const ITEM_HEIGHT = 48
const PADDING_ITEMS = 2
const REPEAT_COPIES = 3

export default function DurationPicker({
  isOpen,
  title,
  totalSeconds,
  maxMinutes,
  onMinsChange,
  onClose,
}: DurationPickerProps) {
  const [mins, setMins] = useState(0)
  const [secs, setSecs] = useState(0)
  const minsRef = useRef<HTMLDivElement | null>(null)
  const secsRef = useRef<HTMLDivElement | null>(null)

  const minsValues = useMemo(() => Array.from({ length: maxMinutes + 1 }, (_, i) => i), [maxMinutes])
  const secsValues = useMemo(() => Array.from({ length: 60 }, (_, i) => i), [])

  const repeatedMins = useMemo(() => Array.from({ length: REPEAT_COPIES }, () => minsValues).flat(), [minsValues])
  const repeatedSecs = useMemo(() => Array.from({ length: REPEAT_COPIES }, () => secsValues).flat(), [secsValues])

  const scrollToWheel = (el: HTMLElement | null, value: number, middleStartFn: () => number) => {
    if (!el) return
    el.scrollTop = (middleStartFn() + Math.max(0, Math.min(value, maxMinutes))) * ITEM_HEIGHT
  }

  useEffect(() => {
    if (!isOpen) return

    const m = Math.min(Math.floor(totalSeconds / 60), maxMinutes)
    const s = totalSeconds % 60
    setMins(m)
    setSecs(s)

    setTimeout(() => {
      scrollToWheel(minsRef.current, m, () => minsValues.length)
      scrollToWheel(secsRef.current, s, () => secsValues.length)
    }, 16)
  }, [isOpen, totalSeconds])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleScroll = (type: 'min' | 'sec') => () => {
    const el = type === 'min' ? minsRef.current : secsRef.current
    const values = type === 'min' ? minsValues : secsValues
    const maxVal = type === 'min' ? maxMinutes : 59
    const setVal = type === 'min' ? setMins : setSecs

    if (!el) return

    const rawIndex = Math.round(el.scrollTop / ITEM_HEIGHT)
    const normalizedIndex = ((rawIndex % values.length) + values.length) % values.length
    const nextValue = Math.min(normalizedIndex, maxVal)

    setVal((current) => (current === nextValue ? current : nextValue))

    const msFn = type === 'min' ? () => minsValues.length : () => secsValues.length
    const lowerBound = msFn() * ITEM_HEIGHT
    const upperBound = msFn() * 2 * ITEM_HEIGHT

    if (el.scrollTop < lowerBound) {
      el.scrollTop += values.length * ITEM_HEIGHT
    } else if (el.scrollTop > upperBound) {
      el.scrollTop -= values.length * ITEM_HEIGHT
    }
  }

  const handleConfirm = () => {
    onMinsChange(mins, secs)
    onClose()
  }

  if (!isOpen) return null

  const display = `${mins}:${String(secs).padStart(2, '0')}`

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-[2rem] border-t border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-white/15" />
        </div>
        <div className="px-5 pb-6">
          <p className="mb-4 text-xl font-semibold text-white">{title}</p>

          <div className="flex justify-center gap-8">
            {/* Minutes wheel */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Min</p>
              <div className="relative h-[240px] w-[100px]">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-white/[0.03] shadow-inner shadow-black/30">
                  <div className="h-12" />
                </div>
                <div
                  ref={minsRef}
                  role="listbox"
                  aria-label="Minutes wheel"
                  onScroll={handleScroll('min')}
                  className="no-scrollbar max-h-[240px] overflow-y-auto rounded-3xl snap-y snap-mandatory"
                  style={{ paddingTop: PADDING_ITEMS * ITEM_HEIGHT, paddingBottom: PADDING_ITEMS * ITEM_HEIGHT }}
                >
                  {repeatedMins.map((v, index) => {
                    const isSelected = mins === v
                    return (
                      <div
                        key={index}
                        role="option"
                        aria-selected={isSelected}
                        className={`h-12 snap-center flex items-center justify-center text-2xl font-semibold transition ${
                          isSelected ? 'text-white' : 'text-zinc-500'
                        }`}
                      >
                        {String(v).padStart(2, '0')}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Seconds wheel */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Sec</p>
              <div className="relative h-[240px] w-[100px]">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-white/[0.03] shadow-inner shadow-black/30">
                  <div className="h-12" />
                </div>
                <div
                  ref={secsRef}
                  role="listbox"
                  aria-label="Seconds wheel"
                  onScroll={handleScroll('sec')}
                  className="no-scrollbar max-h-[240px] overflow-y-auto rounded-3xl snap-y snap-mandatory"
                  style={{ paddingTop: PADDING_ITEMS * ITEM_HEIGHT, paddingBottom: PADDING_ITEMS * ITEM_HEIGHT }}
                >
                  {repeatedSecs.map((v, index) => {
                    const isSelected = secs === v
                    return (
                      <div
                        key={index}
                        role="option"
                        aria-selected={isSelected}
                        className={`h-12 snap-center flex items-center justify-center text-2xl font-semibold transition ${
                          isSelected ? 'text-white' : 'text-zinc-500'
                        }`}
                      >
                        {String(v).padStart(2, '0')}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{display} selected</span>
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10 active:bg-white/15">
              Cancel
            </button>
            <button onClick={handleConfirm}
              className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 active:bg-blue-700">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
