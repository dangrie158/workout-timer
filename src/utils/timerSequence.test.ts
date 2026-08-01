import { describe, expect, it } from 'vitest'
import type { WorkoutConfig } from '../types'
import { calculateTotalDuration, getPhaseAtTime } from './timerSequence'

const config: WorkoutConfig = {
  id: 'sequence-test',
  name: 'Sequence Test',
  prepare: 5,
  work: 10,
  rest: 4,
  rounds: 1,
  cycles: 2,
  restBetweenCycles: 7,
  cooldown: 3,
  createdAt: 0,
  updatedAt: 0,
}

describe('timerSequence', () => {
  it('uses rest between cycles instead of round rest after a cycle ends', () => {
    expect(getPhaseAtTime(config, 0).phase).toBe('prepare')
    expect(getPhaseAtTime(config, 5).phase).toBe('work')
    expect(getPhaseAtTime(config, 15).phase).toBe('restBetweenCycles')
    expect(getPhaseAtTime(config, 22).phase).toBe('work')
    expect(getPhaseAtTime(config, 32).phase).toBe('cooldown')
    expect(getPhaseAtTime(config, 35).phase).toBe('complete')
  })

  it('matches the total duration calculation', () => {
    expect(calculateTotalDuration(config)).toBe(35)
  })
})
