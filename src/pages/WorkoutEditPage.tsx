import { useCallback, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getWorkouts, createWorkout, updateWorkout } from '../store/workoutStore'
import FieldRow from '../components/FieldRow'
import { PHASE_COLORS } from '../utils/timerUi'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 shadow-xl shadow-black/25 mt-4 overflow-hidden">
      <div className="pt-4">
        <h2 className="mb-4 px-5 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/5 overflow-hidden"
      style={accent
        ? { background: `radial-gradient(circle at 50% -20%, ${accent}18, #18181b 62%), #09090b` }
        : undefined
      }>
      <div className="px-3 py-3">
        <div className="mb-1 flex items-center gap-1.5">
          {accent ? (
            <span className="h-[3px] w-4 rounded-full" style={{ backgroundColor: accent }} />
          ) : (
            <span className="h-[3px] w-4 shrink-0 rounded-full bg-zinc-600" />
          )}
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
        </div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  )
}

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
  const [hasChanges, setHasChanges] = useState(false)

  // Load existing workout if editing (also handles bfcache restore)
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

  // Catch bfcache restore of WorkoutEditPage — re-read form values from store
  useEffect(() => {
    const handlePageshow = () => {
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
      } else {
        setName('')
        setPrepare(30)
        setWork(60)
        setRest(30)
        setRounds(5)
        setCycles(1)
        setRestBetweenCycles(60)
        setCooldown(30)
      }
    }
    window.addEventListener('pageshow', handlePageshow)
    return () => window.removeEventListener('pageshow', handlePageshow)
  }, [id])

  // Warn before leaving if there are unsaved changes
  const navigateAway = useCallback((dest: string) => {
    if (hasChanges) {
      const confirmed = window.confirm('Unsaved changes. Leave without saving?')
      if (!confirmed) return false
    }
    navigate(dest)
    return true
  }, [hasChanges, navigate])

  const markChanged = useCallback(() => {
    setHasChanges(true)
  }, [])

  // Browser-level warning (tab close, address bar navigation, back button past this page)
  useEffect(() => {
    if (!hasChanges) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

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

      setHasChanges(false)

      // Notify other pages in the same tab (storage event doesn't fire on originating tab)
      window.postMessage({ type: '__workouts_changed' }, '*')

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

  const formatTotalDuration = (total: number) => {
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen w-full flex-col px-4 pb-[2rem] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigateAway('/')}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
            ← Workouts
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Edit</p>
            <h1 className="mt-1 text-lg font-semibold text-white">{id ? 'Workout' : 'New workout'}</h1>
          </div>
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
            onChange={(e) => { setName(e.target.value); setError(''); markChanged() }}
            placeholder="e.g., HIIT Workout"
            className="mt-3 w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Structure — rounds, cycles */}
        <SectionCard title="Structure">
          <div className="divide-y divide-zinc-700">
            <FieldRow label="Rounds" customAccent="#8B5CF6" value={rounds} displayValue={String(rounds)} onChange={(v) => { setRounds(v); markChanged() }} min={1} max={100} />
            <FieldRow label="Cycles" customAccent="#8B5CF6" value={cycles} displayValue={String(cycles)} onChange={(v) => { setCycles(v); markChanged() }} min={1} max={100} />
          </div>
        </SectionCard>

        {/* Intervals — durations */}
        <SectionCard title="Intervals">
          <div className="divide-y divide-zinc-700">
            <FieldRow label="Prepare" color="prepare" value={prepare} onChange={(v) => { setPrepare(v); markChanged() }} min={0} max={600} useDurationPicker />
            <FieldRow label="Work" color="work" value={work} onChange={(v) => { setWork(v); markChanged() }} min={1} max={3600} useDurationPicker />
            <FieldRow label="Rest" color="rest" value={rest} onChange={(v) => { setRest(v); markChanged() }} min={0} max={3600} useDurationPicker />
            <FieldRow label="Rest Between Cycles" value={restBetweenCycles} onChange={(v) => { setRestBetweenCycles(v); markChanged() }} customAccent="#FF9800" min={0} max={3600} useDurationPicker />
            <FieldRow label="Cooldown" color="cooldown" value={cooldown} onChange={(v) => { setCooldown(v); markChanged() }} min={0} max={600} useDurationPicker />
          </div>
        </SectionCard>

        {/* Summary */}
        <SectionCard title="Summary">
          <div className="px-5 pb-5 grid grid-cols-2 gap-3">
            <StatCell label="Duration" value={formatTotalDuration(totalDuration)} accent={PHASE_COLORS.work} />
            <StatCell label="Cycles × Rounds" value={`${cycles}×${rounds}`} accent={PHASE_COLORS.cooldown} />
          </div>
        </SectionCard>

        {/* Action buttons */}
        <div className="mt-auto pt-6">
          <div className="flex gap-3">
            <button
              onClick={() => navigateAway('/')}
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
