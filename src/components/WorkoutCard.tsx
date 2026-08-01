import type { WorkoutConfig } from '../types/workout'
import { useNavigate } from 'react-router-dom'
import { deleteWorkout } from '../store/workoutStore'

interface WorkoutCardProps {
  workout: WorkoutConfig
  onDelete?: () => void
}

export default function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const navigate = useNavigate()

  const handleDelete = () => {
    if (confirm(`Delete "${workout.name}"?`)) {
      deleteWorkout(workout.id)
      onDelete?.()
    }
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4 hover:bg-zinc-700/80 hover:border-zinc-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-bold text-white flex-1">{workout.name}</h2>
        <div className="flex gap-2 ml-2">
          <button
            onClick={() => navigate(`/workout/${workout.id}/edit`)}
            className="text-blue-400 hover:text-blue-300 transition-colors p-1"
            title="Edit workout"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition-colors p-1"
            title="Delete workout"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
        <div>
          <div className="text-gray-400">Prepare</div>
          <div className="font-semibold text-white">{workout.prepare}s</div>
        </div>
        <div>
          <div className="text-gray-400">Work</div>
          <div className="font-semibold text-white">{workout.work}s</div>
        </div>
        <div>
          <div className="text-gray-400">Rest</div>
          <div className="font-semibold text-white">{workout.rest}s</div>
        </div>
        <div>
          <div className="text-gray-400">Rounds</div>
          <div className="font-semibold text-white">{workout.rounds}</div>
        </div>
        <div>
          <div className="text-gray-400">Cycles</div>
          <div className="font-semibold text-white">{workout.cycles}</div>
        </div>
        <div>
          <div className="text-gray-400">Rest Between</div>
          <div className="font-semibold text-white">{workout.restBetweenCycles}s</div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/workout/${workout.id}/timer`)}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        ▶️ Start Workout
      </button>
    </div>
  )
}
