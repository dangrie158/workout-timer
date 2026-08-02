import { useState, useMemo } from 'react'
import NumberPicker from './NumberPicker'
import DurationPicker from './DurationPicker'
import { PHASE_COLORS } from '../utils/timerUi'

interface FieldRowProps {
  label: string
  /** Phase key for accent color. Optional for non-phase config fields. */
  color?: keyof typeof PHASE_COLORS
  value: number
  displayValue?: string
  onChange: (value: number) => void
  /** Custom accent color when `color` is not set. Overrides the phase lookup if both are provided. */
  customAccent?: string
  min?: number
  max?: number
  /** When true, renders a DurationPicker with minute+second scrollers instead of NumberPicker.
   * The value prop still represents total seconds; onChange receives total seconds on confirm. */
  useDurationPicker?: boolean
  /** Maximum minutes shown in the minute scroller (defaults to max / 60 when useDurationPicker is true). */
  maxMinutes?: number
}

export default function FieldRow({
  label,
  color,
  value,
  displayValue,
  onChange,
  customAccent,
  min = 0,
  max = 3600,
  useDurationPicker = false,
  maxMinutes: propMaxMins,
}: FieldRowProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const accent = color ? PHASE_COLORS[color] : customAccent

  // Duration picker state
  const dMins = Math.floor(value / 60)
  const dSecs = value % 60
  const displayMins = useDurationPicker ? dMins : undefined
  const displaySecs = useDurationPicker ? dSecs : undefined
  const maxMinutes = propMaxMins ?? (useDurationPicker ? Math.floor(max / 60) : undefined)

  // Build mm:ss display string when using duration picker and no explicit displayValue
  const durationDisplay = useMemo(() => {
    if (!useDurationPicker || displayValue) return null
    return `${String(dMins).padStart(2, '0')}:${String(dSecs).padStart(2, '0')}`
  }, [dMins, dSecs, useDurationPicker, displayValue])

  const handleDurationChange = (minsStr: string, secsStr: string) => {
    const m = parseInt(minsStr, 10)
    const s = parseInt(secsStr, 10)
    if (!isNaN(m) && !isNaN(s)) {
      onChange(m * 60 + s)
    }
  }

  return (
    <>
      <div
        className="w-full px-4 py-4 flex items-center gap-3 cursor-pointer active:bg-zinc-800 hover:bg-zinc-800/50 transition-colors"
        onClick={() => setIsPickerOpen(true)}
      >
        {accent ? (
          <div
            className="shrink-0 w-[5px] h-9 rounded-full"
            style={{ backgroundColor: accent }}
          />
        ) : null}

        <div className={`flex-1 text-left ${accent ? 'pl-3' : ''}`}>
          <div className="text-sm text-zinc-400">{label}</div>
          <div className="text-lg font-medium text-white">
            {displayValue ?? durationDisplay ?? `${value}s`}
          </div>
        </div>

        <svg
          className="w-5 h-5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24x24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      {useDurationPicker ? (
        <DurationPicker
          isOpen={isPickerOpen}
          title={label}
          totalSeconds={value}
          maxMinutes={maxMinutes ?? 60}
          onMinsChange={(mins, secs) => handleDurationChange(String(mins), String(secs))}
          onClose={() => setIsPickerOpen(false)}
        />
      ) : (
        <NumberPicker
          isOpen={isPickerOpen}
          title={label}
          value={value}
          onChange={onChange}
          onClose={() => setIsPickerOpen(false)}
          min={min}
          max={max}
        />
      )}
    </>
  )
}
