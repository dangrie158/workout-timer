import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getWorkouts, createWorkout, updateWorkout } from '../store/workoutStore'
import FieldRow from '../components/FieldRow'
import { PHASE_COLORS } from '../utils/timerUi'

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
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const totalDuration =
    prepare +
    cycles * (rounds * (work + rest) - rest + restBetweenCycles) -
    restBetweenCycles +
    cooldown

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen w-full flex-col px-4 pb-[2rem] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Edit</p>
          <h1 className="mt-1 text-lg font-semibold text-white">{id ? 'Workout' : 'New workout'}</h1>
        </div>

        {/* Name */}
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-xl shadow-black/25">
          {error && (
            <p className="mb-4 text-sm text-red-400">{error}</p>
          )}
          <label htmlFor="workout-name" className="text-base font-medium text-white">
            Name
          </label>
          <input
            id="workout-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="e.g., HIIT Workout"
            className="mt-3 w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Intervals */}
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-xl shadow-black/25 mt-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Intervals</h2>
          <div className="divide-y divide-zinc-700">
            <FieldRow label="Prepare" color="prepare" value={prepare} onChange={setPrepare} min={0} max={600} />
            <FieldRow label="Work" color="work" value={work} onChange={setWork} min={1} max={3600} />
            <FieldRow label="Rest" color="rest" value={rest} onChange={setRest} min={0} max={3600} />
            <FieldRow label="Cooldown" color="cooldown" value={cooldown} onChange={setCooldown} min={0} max={600} />
          </div>
        </div>

        {/* Structure */}
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-xl shadow-black/25 mt-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Structure</h2>
          <FieldRow label="Rounds" color="cycle" value={rounds} displayValue={String(rounds)} onChange={setRounds} min={1} max={100} hideTopBorder />
          <FieldRow label="Cycles" color="cycle" value={cycles} displayValue={String(cycles)} onChange={setCycles} min={1} max={100} />
          <FieldRow label="Rest Between Cycles" color="rest" value={restBetweenCycles} onChange={setRestBetweenCycles} min={0} max={3600} hideBottomBorder />
        </div>

        {/* Summary */}
        <div className="mt-4 rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-xl shadow-black/25">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PHASE_COLORS.prepare }} />
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Duration</span>
              </div>
              <div className="text-sm font-semibold text-white">{totalDuration}s</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PHASE_COLORS.work }} />
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Structure</span>
              </div>
              <div className="text-sm font-semibold text-white">{cycles}×{rounds}</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto pt-6">
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              {id ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
