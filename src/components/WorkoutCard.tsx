import type { WorkoutConfig } from '../types/workout'
import { useNavigate } from 'react-router-dom'
import { deleteWorkout } from '../store/workoutStore'
import { PHASE_COLORS } from '../utils/timerUi'
import { calculateTotalDuration } from '../utils/timerSequence'
import { formatCompactDuration } from '../utils/timerUi'
import type { KeyboardEvent, MouseEvent } from 'react'

interface WorkoutCardProps {
  workout: WorkoutConfig
  onDelete?: () => void
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

interface StatCellProps {
  label: string
  value: string
  accent: string
}

function StatCell({ label, value, accent }: StatCellProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  )
}

export default function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const navigate = useNavigate()
  const totalDuration = calculateTotalDuration(workout)
  const timerPath = `/workout/${workout.id}/timer`

  const handleOpenWorkout = () => {
    navigate(timerPath)
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpenWorkout()
    }
  }

  const stopCardNavigation = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    stopCardNavigation(event)

    if (confirm(`Delete "${workout.name}"?`)) {
      deleteWorkout(workout.id)
      onDelete?.()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpenWorkout}
      onKeyDown={handleCardKeyDown}
      aria-label={`Open ${workout.name} workout`}
      className="rounded-[2rem] border border-white/10 bg-zinc-900/80 shadow-xl shadow-black/25 transition hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 active:scale-[0.995]"
    >
      <div className="flex items-start justify-between p-5 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Workout</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{workout.name}</h2>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={(event) => {
              stopCardNavigation(event)
              navigate(`/workout/${workout.id}/edit`)
            }}
            aria-label="Edit workout"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <PencilIcon />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete workout"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-red-400"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 sm:grid-cols-4">
        <StatCell label="Prepare" value={formatCompactDuration(workout.prepare)} accent={PHASE_COLORS.prepare} />
        <StatCell label="Work" value={formatCompactDuration(workout.work)} accent={PHASE_COLORS.work} />
        <StatCell label="Rest" value={formatCompactDuration(workout.rest)} accent={PHASE_COLORS.rest} />
        <StatCell label="Cooldown" value={formatCompactDuration(workout.cooldown)} accent={PHASE_COLORS.cooldown} />
      </div>

      <div className="mx-5 mt-4 mb-5 flex items-center gap-3 rounded-2xl border border-white/5 bg-zinc-950/40 px-4 py-3">
        <div className="flex flex-1 flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Rounds</span>
          <span className="text-sm font-bold text-white">{workout.rounds}</span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-1 flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Cycles</span>
          <span className="text-sm font-bold text-white">{workout.cycles}</span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-1 flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Total</span>
          <span className="text-sm font-bold text-white">{formatCompactDuration(totalDuration)}</span>
        </div>
      </div>
    </div>
  )
}
