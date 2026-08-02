import { useState } from 'react'
import NumberPicker from './NumberPicker'
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
}: FieldRowProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const accent = color ? PHASE_COLORS[color] : customAccent

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
          <div className="text-lg font-medium text-white">{displayValue ?? `${value}s`}</div>
        </div>

        <svg
          className="w-5 h-5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      <NumberPicker
        isOpen={isPickerOpen}
        title={label}
        value={value}
        onChange={onChange}
        onClose={() => setIsPickerOpen(false)}
        min={min}
        max={max}
      />
    </>
  )
}
