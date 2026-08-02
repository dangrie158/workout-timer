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
  /** Create and prime an AudioContext inside a gesture handler. Returns true if context was primed (audio will play). Call synchronously in a click/touch event before any state updates. */
  primeAudioFromGesture: () => boolean
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

  // Track when we need to re-prime audio after coming back from background.
  // On iOS, locking the phone suspends AudioContext; sounds stop until we resume it
  // inside a user gesture (which happens when returning to the app).
  const needsResumeRef = useRef(false)

  // The hidden audio element that keeps Safari alive during background transitions.
  const heartbeatElRef = useRef<HTMLAudioElement | null>(null)

  const isSoundEnabled = useCallback(() => getSettings().soundEnabled, [])

  const ensureAudioContext = useCallback(async (): Promise<AudioContext | null> => {
    if (!isSoundEnabled()) {
      return null
    }

    // Must use a single context primed inside a gesture — never create fresh
    // contexts from async code on iOS (they start "suspended" and can't be
    // resumed outside a gesture).
    const AudioContextConstructor = getAudioContextConstructor()
    if (!AudioContextConstructor) {
      return null
    }

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      // Fallback: context was lost (e.g., component unmounted and remounted).
      // iOS will silently block this resume — sounds won't play until the user
      // triggers another gesture.
      audioContextRef.current = new AudioContextConstructor()
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
      const threshold = getSettings().countdownSeconds

      if (roundedSeconds <= 0 || roundedSeconds > threshold) {
        if (roundedSeconds > threshold || roundedSeconds <= 0) {
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

  /** Resume a context that iOS Safari has suspended when the app went to background.
   *  On iOS, locking the phone forces AudioContext into 'suspended' state.
   *  A persistent passive-false touch listener catches the first tap after returning
   *  from lock screen (which is still within the gesture chain) and resumes audio. */
  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleTouchStart = () => {
      const ctx = audioContextRef.current
      if (ctx && ctx.state === 'suspended') {
        void ctx.resume().catch(() => {})
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Best-effort resume — may work on some iOS versions.
        const ctx = audioContextRef.current
        if (ctx && ctx.state === 'suspended') {
          void ctx.resume().catch(() => {})
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  /** Catch the native 'suspend' event Safari sends right before suspending the AudioContext.
   *  This lets us re-prime inside a gesture so we stay in sync with the user's intent. */
  /** Set up a hidden audio element as an "heartbeat" to keep Safari alive when
   *  the page goes to background (phone lock). Without this, Safari suspends all
   *  AudioContext objects in background tabs — they stay suspended until unlocked.
   *  A playing `<audio>` element tells Safari "this is media playback", preventing
   *  tab suspension and keeping AudioContext in 'running' state. */
  const setupHeartbeat = useCallback(() => {
    if (typeof document === 'undefined') return null

    try {
      // Generate a nearly-silent WAV blob (64 samples of ~0 amplitude, 8kHz mono).
      const sampleRate = 8000
      const duration = 0.25 // seconds
      const numSamples = sampleRate * duration
      const headerSize = 44

      // Build WAV: RIFF header + fmt chunk + data chunk with silence
      const buffer = new ArrayBuffer(headerSize + numSamples)
      const view = new DataView(buffer)

      // RIFF header
      view.setUint32(0, 0x52494646, false) // "RIFF"
      view.setUint32(4, 36 + numSamples, true) // file size - 8
      view.setUint32(8, 0x57415645, false) // "WAVE"

      // fmt chunk
      view.setUint32(12, 0x666d7420, false) // "fmt "
      view.setUint32(16, 16, true) // chunk size
      view.setUint16(20, 1, true) // PCM format
      view.setUint16(22, 1, true) // mono
      view.setUint32(24, sampleRate, true) // sample rate
      view.setUint32(28, sampleRate, true) // byte rate
      view.setUint16(32, 1, true) // block align
      view.setUint16(34, 8, true) // bits per sample

      // data chunk
      view.setUint32(36, 0x64617461, false) // "data"
      view.setUint32(40, numSamples, true) // data size

      // Fill audio buffer with silence (8-bit unsigned samples = 128 = silence)
      for (let i = 0; i < numSamples; i++) {
        view.setUint8(44 + i, 128)
      }

      const wavBlob = new Blob([buffer], { type: 'audio/wav' })
      const url = URL.createObjectURL(wavBlob)

      const audioEl = document.createElement('audio')
      audioEl.src = url
      audioEl.loop = true
      // Autoplay — Safari allows this because the element was created in response
      // to a gesture (primeAudioFromGesture runs inside handlePrimaryAction onClick).
      void audioEl.play().catch(() => {})

      // Hide but don't remove — must stay in DOM for Safari to keep it alive.
      Object.assign(audioEl.style, {
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        width: '1px',
        height: '1px',
      } as React.CSSProperties)
      document.body.appendChild(audioEl)

      return audioEl
    } catch {
      // Blob URLs not supported — heartbeat won't help.
      return null
    }
  }, [])

  const primeSuspendListener = useCallback(() => {
    const ctx = audioContextRef.current
    if (!ctx) return

    try {
      ctx.addEventListener('suspend', () => {
        // iOS fires suspend just before the context dies.
        // We can't resume here (it would die immediately), but catching it
        // lets us know background is coming and schedule a resume for foreground return.
        needsResumeRef.current = true
      })
    } catch {
      // Safari may not support suspend — that's fine, visibilitychange covers it.
    }
  }, [])

  const primeAudioFromGesture = useCallback((): boolean => {
    if (typeof window === 'undefined') return false

    const AudioContextConstructor = getAudioContextConstructor()
    if (!AudioContextConstructor) return false

    try {
      // On iOS, a context created inside a gesture handler starts in "running" state.
      // This must happen synchronously in the gesture — not from async/React effects.
      audioContextRef.current = new AudioContextConstructor()

      if (audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume().catch(() => {})
      }

      // Attach suspend listener so we know when Safari forces suspension in the future.
      primeSuspendListener()

      // Start audio heartbeat to keep Safari alive during background transitions (phone lock).
      heartbeatElRef.current = setupHeartbeat()

      return true
    } catch {
      // jsdom / SSR — no real AudioContext available
      return false
    }
  }, [setupHeartbeat, primeSuspendListener])

  useEffect(
    () => () => {
      // Stop heartbeat element.
      const hb = heartbeatElRef.current
      if (hb) {
        void hb.pause()
        hb.remove()
        if (hb.src.startsWith('blob:')) URL.revokeObjectURL(hb.src)
        heartbeatElRef.current = null
      }

      // Close audio context.
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
    primeAudioFromGesture,
  }
}
