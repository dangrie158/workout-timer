import type { ReactNode } from 'react'

interface PhaseBlockProps {
  label: string
  value: ReactNode
  detail?: ReactNode
  accent: string
  isActive?: boolean
}

export default function PhaseBlock({ label, value, detail, accent, isActive = false }: PhaseBlockProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isActive ? 'border-white/15 bg-zinc-800/90 shadow-[0_14px_40px_rgba(0,0,0,0.28)]' : 'border-white/5 bg-zinc-900/70'
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-zinc-500">{label}</span>
      </div>
      <div className="text-xl font-semibold text-white">{value}</div>
      {detail ? <div className="mt-1 text-sm text-zinc-400">{detail}</div> : null}
    </div>
  )
}
