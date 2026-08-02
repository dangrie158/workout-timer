import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getWorkouts, createWorkout, updateWorkout } from '../store/workoutStore'
import FieldRow from '../components/FieldRow'

export default function WorkoutEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [prepare, setPrepare] = useState(30)
  const [work, setWork] = useState(60)
  const [rest, setRest] = useState(30)
  const [rounds, setRounds] = useState(5)
  const [cycles, setCycles] = useState(1)
  const [restBetweenCycles, setRestBetweenCycles] = useState(60)
  const [cooldown, setCooldown] = useState(30)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load existing workout if editing
  useEffect(() => {
    if (id) {
      const workouts = getWorkouts()
      const workout = workouts.find((w) => w.id === id)
      if (workout) {
        setName(workout.name)
        setPrepare(workout.prepare)
        setWork(workout.work)
        setRest(workout.rest)
        setRounds(workout.rounds)
        setCycles(workout.cycles)
        setRestBetweenCycles(workout.restBetweenCycles)
        setCooldown(workout.cooldown)
      }
    }
    setIsLoading(false)
  }, [id])

  const handleSave = () => {
    if (!name.trim()) {
      setError('Workout name is required')
      return
    }

    try {
      const workoutData = {
        name: name.trim(),
        prepare,
        work,
        rest,
        rounds,
        cycles,
        restBetweenCycles,
        cooldown,
      }

      if (id) {
        updateWorkout(id, workoutData)
      } else {
        createWorkout(workoutData)
      }

      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout')
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 text-white bg-zinc-900 min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 px-4 py-4 z-20">
        <h1 className="text-xl font-bold text-white">
          {id ? 'Edit Workout' : 'New Workout'}
        </h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded bg-red-900/30 border border-red-700 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Name field */}
      <div className="mt-6 mx-4 mb-6">
        <label className="block text-sm text-zinc-400 mb-2">Workout Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          placeholder="e.g., HIIT Workout"
          className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Number fields */}
      <div className="bg-zinc-800/50">
        <div className="border-t border-b border-zinc-700">
          <FieldRow
            label="Prepare"
            color="prepare"
            value={prepare}
            onChange={setPrepare}
            min={0}
            max={600}
          />
          <FieldRow
            label="Work"
            color="work"
            value={work}
            onChange={setWork}
            min={1}
            max={3600}
          />
          <FieldRow
            label="Rest"
            color="rest"
            value={rest}
            onChange={setRest}
            min={0}
            max={3600}
          />
          <FieldRow
            label="Rounds"
            color="cycle"
            value={rounds}
            displayValue={String(rounds)}
            onChange={setRounds}
            min={1}
            max={100}
          />
          <FieldRow
            label="Cycles"
            color="cycle"
            value={cycles}
            displayValue={String(cycles)}
            onChange={setCycles}
            min={1}
            max={100}
          />
          <FieldRow
            label="Rest Between Cycles"
            color="rest"
            value={restBetweenCycles}
            onChange={setRestBetweenCycles}
            min={0}
            max={3600}
          />
          <FieldRow
            label="Cooldown"
            color="cooldown"
            value={cooldown}
            onChange={setCooldown}
            min={0}
            max={600}
          />
        </div>
      </div>

      {/* Summary info */}
      <div className="mt-6 mx-4 mb-20 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Workout Summary</h3>
        <div className="text-xs text-zinc-400 space-y-1">
          <div>
            Total duration: ~
            {prepare +
              cycles *
                (rounds * (work + rest) -
                  rest +
                  restBetweenCycles) -
              restBetweenCycles +
              cooldown}{' '}
            seconds
          </div>
          <div>
            {cycles} cycle{cycles !== 1 ? 's' : ''} × {rounds} round
            {rounds !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="sticky bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-zinc-700 bg-zinc-900 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={() => navigate('/')}
          className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          {id ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}
