import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkouts } from '../store/workoutStore'
import type { WorkoutConfig } from '../types/workout'
import WorkoutCard from '../components/WorkoutCard'

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 7.2a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState(() => getWorkouts())

  const handleWorkoutDeleted = () => {
    setWorkouts(getWorkouts())
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen w-full flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Workout Timer</p>
            <h1 className="mt-1 text-lg font-semibold text-white">Your workouts</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {workouts.length === 0 ? 'No workouts saved' : `${workouts.length} saved`}
            </p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
          >
            <SettingsIcon />
            Settings
          </button>
        </div>

        {workouts.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-6 text-center shadow-xl shadow-black/25">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300">
              <PlusIcon />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">No workouts yet</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Create a routine to set up your prepare, work, rest, and cooldown intervals.</p>
            <button
              onClick={() => navigate('/workout/new')}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 active:scale-[0.99]"
            >
              <PlusIcon />
              Create workout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} onDelete={handleWorkoutDeleted} />
            ))}
          </div>
        )}

        {workouts.length > 0 && (
          <div className="mt-auto pt-6">
            <button
              onClick={() => navigate('/workout/new')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 active:scale-[0.99]"
            >
              <PlusIcon />
              New workout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
