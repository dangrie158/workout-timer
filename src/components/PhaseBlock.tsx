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
      className={`relative overflow-hidden rounded-2xl p-4 transition-all ${
        isActive ? 'border border-white/15 shadow-[0_14px_40px_rgba(0,0,0,0.28)]' : 'border border-white/5'
      }`}
      style={accent
        ? { background: `radial-gradient(circle at 50% -20%, ${accent}1a, rgba(9,9,11,0.8) 62%), ${isActive ? '#27272ae6' : '#18181bca'}` }
        : undefined
      }>
      <div className="relative z-10 mb-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-zinc-500">{label}</span>
      </div>
      <div className="relative z-10 text-xl font-semibold text-white">{value}</div>
      {detail ? <div className="relative z-10 mt-1 text-sm text-zinc-400">{detail}</div> : null}
    </div>
  )
}
