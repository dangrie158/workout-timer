import { useCallback, useEffect, useRef } from 'react'
import { getSettings } from '../store/settingsStore'
import type { TimerPhase } from '../types'

export type AudioPhase = Exclude<TimerPhase, 'complete'>

type AudioCuePhase = 'prepare' | 'work' | 'rest' | 'cooldown'
type CueType = 'start' | 'end'

interface ToneStep {
  frequency: number
  duration: number
  type?: OscillatorType
  gain?: number
}

interface UseAudioReturn {
  playPhaseStart: (phase: AudioPhase) => void
  playPhaseEnd: (phase: AudioPhase) => void
  playPhaseTransition: (previousPhase: AudioPhase | null, nextPhase: TimerPhase) => void
  playWorkoutComplete: () => void
  playCountdownBeep: (phase: AudioPhase, remainingSeconds: number) => void
}

const STEP_GAP_SECONDS = 0.05
const ATTACK_SECONDS = 0.01
const RELEASE_SECONDS = 0.05
const MIN_GAIN = 0.0001
const DEFAULT_GAIN = 0.18

const PHASE_CUES: Record<`${AudioCuePhase}:${CueType}`, ToneStep[]> = {
  'prepare:start': [
    { frequency: 440, duration: 0.12, type: 'triangle' },
    { frequency: 554.37, duration: 0.16, type: 'triangle' },
  ],
  'prepare:end': [
    { frequency: 659.25, duration: 0.08, type: 'triangle' },
    { frequency: 783.99, duration: 0.1, type: 'triangle' },
  ],
  'work:start': [
    { frequency: 783.99, duration: 0.1, type: 'square', gain: 0.16 },
    { frequency: 987.77, duration: 0.14, type: 'square', gain: 0.16 },
  ],
  'work:end': [
    { frequency: 659.25, duration: 0.08, type: 'square', gain: 0.16 },
    { frequency: 523.25, duration: 0.08, type: 'square', gain: 0.16 },
    { frequency: 392, duration: 0.12, type: 'square', gain: 0.16 },
  ],
  'rest:start': [
    { frequency: 349.23, duration: 0.14, type: 'sine', gain: 0.14 },
    { frequency: 440, duration: 0.18, type: 'sine', gain: 0.14 },
  ],
  'rest:end': [
    { frequency: 293.66, duration: 0.08, type: 'sine', gain: 0.14 },
    { frequency: 349.23, duration: 0.08, type: 'sine', gain: 0.14 },
    { frequency: 440, duration: 0.12, type: 'sine', gain: 0.14 },
  ],
  'cooldown:start': [
    { frequency: 523.25, duration: 0.14, type: 'sawtooth', gain: 0.14 },
    { frequency: 440, duration: 0.14, type: 'sawtooth', gain: 0.14 },
    { frequency: 349.23, duration: 0.18, type: 'sawtooth', gain: 0.14 },
  ],
  'cooldown:end': [
    { frequency: 392, duration: 0.1, type: 'triangle' },
    { frequency: 523.25, duration: 0.1, type: 'triangle' },
    { frequency: 659.25, duration: 0.18, type: 'triangle' },
  ],
}

const WORKOUT_COMPLETE_CUE: ToneStep[] = [
  { frequency: 523.25, duration: 0.12, type: 'triangle' },
  { frequency: 659.25, duration: 0.12, type: 'triangle' },
  { frequency: 783.99, duration: 0.16, type: 'triangle' },
  { frequency: 1046.5, duration: 0.28, type: 'triangle', gain: 0.2 },
]

const COUNTDOWN_CUE: ToneStep[] = [{ frequency: 1046.5, duration: 0.08, type: 'square', gain: 0.12 }]

function normalizePhase(phase: AudioPhase): AudioCuePhase {
  return phase === 'restBetweenCycles' ? 'rest' : phase
}

function getAudioContextConstructor(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const audioWindow = window as typeof window & {
    AudioContext?: typeof AudioContext
    webkitAudioContext?: typeof AudioContext
  }

  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext
}

export function useAudio(): UseAudioReturn {
  const audioContextRef = useRef<AudioContext | null>(null)
  const lastCountdownKeyRef = useRef<string | null>(null)
  const lastTransitionKeyRef = useRef<string | null>(null)

  const isSoundEnabled = useCallback(() => getSettings().soundEnabled, [])

  const ensureAudioContext = useCallback(async (): Promise<AudioContext | null> => {
    if (!isSoundEnabled()) {
      return null
    }

    const AudioContextConstructor = getAudioContextConstructor()
    if (!AudioContextConstructor) {
      return null
    }

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContextConstructor()
    }

    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume()
      } catch (error) {
        console.warn('Failed to resume audio context:', error)
        return null
      }
    }

    return audioContextRef.current
  }, [isSoundEnabled])

  const playSequence = useCallback(
    (sequence: ToneStep[]) => {
      if (!isSoundEnabled()) {
        return
      }

      void ensureAudioContext().then((context) => {
        if (!context) {
          return
        }

        let cursor = context.currentTime + 0.01

        sequence.forEach((step) => {
          const oscillator = context.createOscillator()
          const gainNode = context.createGain()
          const maxGain = step.gain ?? DEFAULT_GAIN
          const endTime = cursor + step.duration

          oscillator.type = step.type ?? 'sine'
          oscillator.frequency.setValueAtTime(step.frequency, cursor)

          gainNode.gain.setValueAtTime(MIN_GAIN, cursor)
          gainNode.gain.linearRampToValueAtTime(maxGain, cursor + ATTACK_SECONDS)
          gainNode.gain.exponentialRampToValueAtTime(MIN_GAIN, endTime)

          oscillator.connect(gainNode)
          gainNode.connect(context.destination)

          oscillator.start(cursor)
          oscillator.stop(endTime + RELEASE_SECONDS)

          cursor = endTime + STEP_GAP_SECONDS
        })
      })
    },
    [ensureAudioContext, isSoundEnabled]
  )

  const playPhaseStart = useCallback(
    (phase: AudioPhase) => {
      playSequence(PHASE_CUES[`${normalizePhase(phase)}:start`])
    },
    [playSequence]
  )

  const playPhaseEnd = useCallback(
    (phase: AudioPhase) => {
      playSequence(PHASE_CUES[`${normalizePhase(phase)}:end`])
    },
    [playSequence]
  )

  const playWorkoutComplete = useCallback(() => {
    playSequence(WORKOUT_COMPLETE_CUE)
  }, [playSequence])

  const playCountdownBeep = useCallback(
    (phase: AudioPhase, remainingSeconds: number) => {
      const roundedSeconds = Math.ceil(remainingSeconds)

      if (roundedSeconds <= 0 || roundedSeconds > 10) {
        if (roundedSeconds > 10 || roundedSeconds <= 0) {
          lastCountdownKeyRef.current = null
        }
        return
      }

      const countdownKey = `${phase}:${roundedSeconds}`
      if (lastCountdownKeyRef.current === countdownKey) {
        return
      }

      lastCountdownKeyRef.current = countdownKey
      playSequence(COUNTDOWN_CUE)
    },
    [playSequence]
  )

  const playPhaseTransition = useCallback(
    (previousPhase: AudioPhase | null, nextPhase: TimerPhase) => {
      const transitionKey = `${previousPhase ?? 'none'}->${nextPhase}`
      if (lastTransitionKeyRef.current === transitionKey) {
        return
      }

      lastTransitionKeyRef.current = transitionKey
      lastCountdownKeyRef.current = null

      if (previousPhase && previousPhase !== nextPhase) {
        playPhaseEnd(previousPhase)
      }

      if (nextPhase === 'complete') {
        playWorkoutComplete()
        return
      }

      if (previousPhase !== nextPhase) {
        playPhaseStart(nextPhase)
      }
    },
    [playPhaseEnd, playPhaseStart, playWorkoutComplete]
  )

  useEffect(
    () => () => {
      const context = audioContextRef.current
      audioContextRef.current = null

      if (context && context.state !== 'closed') {
        void context.close().catch((error) => {
          console.warn('Failed to close audio context:', error)
        })
      }
    },
    []
  )

  return {
    playPhaseStart,
    playPhaseEnd,
    playPhaseTransition,
    playWorkoutComplete,
    playCountdownBeep,
  }
}
