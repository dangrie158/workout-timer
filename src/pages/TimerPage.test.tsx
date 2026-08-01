import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TimerPage from './TimerPage'
import type { WorkoutConfig } from '../types'

const playCountdownBeep = vi.fn()
const playPhaseTransition = vi.fn()

vi.mock('../hooks/useAudio', () => ({
  useAudio: () => ({
    playPhaseStart: vi.fn(),
    playPhaseEnd: vi.fn(),
    playPhaseTransition,
    playWorkoutComplete: vi.fn(),
    playCountdownBeep,
  }),
}))

function renderTimerPage(id = 'timer-test') {
  return render(
    <MemoryRouter initialEntries={[`/workout/${id}/timer`]}>
      <Routes>
        <Route path="/workout/:id/timer" element={<TimerPage />} />
      </Routes>
    </MemoryRouter>
  )
}

const countdownWorkout: WorkoutConfig = {
  id: 'timer-test',
  name: 'Sprint Flow',
  prepare: 2,
  work: 2,
  rest: 0,
  rounds: 1,
  cycles: 1,
  restBetweenCycles: 0,
  cooldown: 0,
  createdAt: 0,
  updatedAt: 0,
}

const cycleRestWorkout: WorkoutConfig = {
  id: 'cycle-rest',
  name: 'Cycle Builder',
  prepare: 0,
  work: 1,
  rest: 0,
  rounds: 1,
  cycles: 2,
  restBetweenCycles: 1,
  cooldown: 0,
  createdAt: 0,
  updatedAt: 0,
}

describe('TimerPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-01T10:00:00.000Z'))
    localStorage.clear()
    playCountdownBeep.mockReset()
    playPhaseTransition.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('supports starting, pausing, resuming, and completing a workout', () => {
    localStorage.setItem('workouts', JSON.stringify([countdownWorkout]))
    renderTimerPage()

    expect(screen.getByText('Sprint Flow')).toBeInTheDocument()
    expect(screen.getByText('Ready to start')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(playPhaseTransition).toHaveBeenCalledWith(null, 'prepare')
    expect(playCountdownBeep).toHaveBeenCalledWith('prepare', 2)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('Countdown: 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByText('Paused')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('0:01')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getAllByText('Work').length).toBeGreaterThan(0)
    expect(playPhaseTransition).toHaveBeenCalledWith('prepare', 'work')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('Workout complete')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start again' })).toBeInTheDocument()
    expect(playPhaseTransition).toHaveBeenCalledWith('work', 'complete')
  })

  it('autostarts the timer when the global preference is enabled', () => {
    localStorage.setItem('workouts', JSON.stringify([countdownWorkout]))
    localStorage.setItem(
      'settings',
      JSON.stringify({ soundEnabled: true, vibrationEnabled: true, autostart: true })
    )

    renderTimerPage()

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(playPhaseTransition).toHaveBeenCalledWith(null, 'prepare')
  })

  it('routes cycle rest transitions and countdown beeps through the timer page', () => {
    localStorage.setItem('workouts', JSON.stringify([cycleRestWorkout]))
    renderTimerPage('cycle-rest')

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(playPhaseTransition).toHaveBeenCalledWith(null, 'work')
    expect(playCountdownBeep).toHaveBeenCalledWith('work', 1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getAllByText('Cycle Rest').length).toBeGreaterThan(0)
    expect(playPhaseTransition).toHaveBeenCalledWith('work', 'restBetweenCycles')
    expect(playCountdownBeep).toHaveBeenCalledWith('restBetweenCycles', 1)
  })
})
