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
    <div className="bg-zinc-900 min-h-screen text-white">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Workouts</h1>
          <p className="text-gray-400">Manage your workout routines</p>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No workouts yet</p>
            <p className="text-sm text-gray-500">Create a new workout to get started</p>
          </div>
        ) : (
          <div className="mb-6">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onDelete={handleWorkoutDeleted}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/workout/new')}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors sticky bottom-4"
        >
          + New Workout
        </button>
      </div>
    </div>
  )
}
