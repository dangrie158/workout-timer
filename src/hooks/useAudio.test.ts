import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAudio } from './useAudio'
import type { GlobalSettings } from '../types'

interface MockAudioParam {
  setValueAtTime: ReturnType<typeof vi.fn>
  linearRampToValueAtTime: ReturnType<typeof vi.fn>
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
}

interface MockOscillator {
  type: OscillatorType
  frequency: MockAudioParam
  connect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
}

interface MockGainNode {
  gain: MockAudioParam
  connect: ReturnType<typeof vi.fn>
}

interface MockAudioContext {
  state: AudioContextState
  currentTime: number
  destination: AudioDestinationNode
  createOscillator: ReturnType<typeof vi.fn>
  createGain: ReturnType<typeof vi.fn>
  resume: ReturnType<typeof vi.fn>
  close: ReturnType<typeof vi.fn>
}

const defaultSettings: GlobalSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  autostart: false,
  countdownSeconds: 10,
}

let oscillatorCount = 0
let audioContext: MockAudioContext
let AudioContextMock: ReturnType<typeof vi.fn>

function createAudioParam(): MockAudioParam {
  return {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
}

function installAudioContextMock() {
  oscillatorCount = 0

  audioContext = {
    state: 'running',
    currentTime: 0,
    destination: {} as AudioDestinationNode,
    createOscillator: vi.fn(() => {
      oscillatorCount += 1
      return {
        type: 'sine',
        frequency: createAudioParam(),
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      } satisfies MockOscillator
    }),
    createGain: vi.fn(() => ({
      gain: createAudioParam(),
      connect: vi.fn(),
    }) satisfies MockGainNode),
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  }

  AudioContextMock = vi.fn(function MockAudioContextConstructor(this: object) {
    return audioContext
  })

  Object.defineProperty(window, 'AudioContext', {
    configurable: true,
    writable: true,
    value: AudioContextMock,
  })
}

describe('useAudio', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    localStorage.setItem('settings', JSON.stringify(defaultSettings))
    installAudioContextMock()
  })

  it('plays phase start cues when sound is enabled', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      result.current.playPhaseStart('prepare')
      await Promise.resolve()
    })

    expect(AudioContextMock).toHaveBeenCalledTimes(1)
    expect(oscillatorCount).toBe(2)
  })

  it('does not create audio when sound is disabled', async () => {
    localStorage.setItem(
      'settings',
      JSON.stringify({
        ...defaultSettings,
        soundEnabled: false,
      } satisfies GlobalSettings)
    )

    const { result } = renderHook(() => useAudio())

    await act(async () => {
      result.current.playWorkoutComplete()
      await Promise.resolve()
    })

    expect(AudioContextMock).not.toHaveBeenCalled()
    expect(oscillatorCount).toBe(0)
  })

  it('deduplicates countdown beeps for the same phase second', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      result.current.playCountdownBeep('work', 3.2)
      result.current.playCountdownBeep('work', 3.2)
      result.current.playCountdownBeep('work', 2)
      await Promise.resolve()
    })

    expect(oscillatorCount).toBe(2)
  })

  it('plays end and start cues on phase transitions', async () => {
    const { result } = renderHook(() => useAudio())

    await act(async () => {
      result.current.playPhaseTransition('work', 'rest')
      result.current.playPhaseTransition('work', 'rest')
      await Promise.resolve()
    })

    expect(oscillatorCount).toBe(5)
  })
})
