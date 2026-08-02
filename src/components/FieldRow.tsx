import { useState } from 'react'
import NumberPicker from './NumberPicker'

interface FieldRowProps {
  label: string
  color: 'prepare' | 'work' | 'rest' | 'cooldown' | 'cycle'
  value: number
  displayValue?: string
  onChange: (value: number) => void
  min?: number
  max?: number
}

const colorClasses: Record<FieldRowProps['color'], string> = {
  prepare: 'bg-phase-prepare',
  work: 'bg-phase-work',
  rest: 'bg-phase-rest',
  cooldown: 'bg-phase-cooldown',
  cycle: 'bg-phase-cycle',
}

export default function FieldRow({
  label,
  color,
  value,
  displayValue,
  onChange,
  min = 0,
  max = 3600,
}: FieldRowProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  return (
    <>
      <div
        className="w-full px-4 py-4 flex items-center gap-3 cursor-pointer active:bg-zinc-800 hover:bg-zinc-800/50 transition-colors"
        onClick={() => setIsPickerOpen(true)}
      >
        <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`} />

        <div className="flex-1 text-left">
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
