import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkouts } from '../store/workoutStore'
import type { WorkoutConfig } from '../types/workout'
import WorkoutCard from '../components/WorkoutCard'

export default function HomePage() {
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState<WorkoutConfig[]>([])

  useEffect(() => {
    setWorkouts(getWorkouts())
  }, [])

  const handleWorkoutDeleted = () => {
    setWorkouts(getWorkouts())
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="w-full px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-3xl font-bold">Workouts</h1>
            <p className="text-gray-400">Manage your workout routines</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
          >
            Settings
          </button>
        </div>

        {workouts.length === 0 ? (
          <div className="rounded-3xl border border-zinc-700 bg-zinc-800 p-8 text-center">
            <p className="mb-4 text-gray-400">No workouts yet</p>
            <p className="text-sm text-gray-500">Create a new workout to get started</p>
          </div>
        ) : (
          <div className="mb-6">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} onDelete={handleWorkoutDeleted} />
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/workout/new')}
          className="sticky bottom-4 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
        >
          + New Workout
        </button>
      </div>
    </div>
  )
}
