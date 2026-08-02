import { useCallback, useEffect, useRef } from 'react'

/**
 * iOS Safari prevents auto-lock when there is an active `getUserMedia`
 * media session (microphone or camera). BigBlueButton, Google Meet and
 * similar web apps leverage this: once `navigator.mediaDevices.getUserMedia`
 * starts capturing audio/video, Safari treats the tab as having an active
 * media session and keeps the screen awake until the stream is stopped.
 *
 * This hook captures a silent audio stream (user must grant mic permission).
 * We don't read the captured data — we just keep the track alive so Safari
 * sees "media in progress" and won't auto-lock.
 */

export function useKeepScreenAwake(active: boolean): void {
  const streamRef = useRef<MediaStream | null>(null)

  const startAudioSession = useCallback(async (): Promise<MediaStream | null> => {
    if (typeof navigator === 'undefined') return null
    if (typeof navigator.mediaDevices !== 'object' || !navigator.mediaDevices.getUserMedia) {
      return null
    }

    try {
      // Request mic access. We won't process the audio — just keep the session alive.
      // Safari treats an active getUserMedia stream as a "media in progress" state,
      // which prevents auto-lock (same behavior as being on a phone call).
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      return stream
    } catch (error: unknown) {
      const err = error as DOMException
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        console.warn('Microphone permission denied — screen may auto-lock during timer.')
      } else if (err.name !== 'AbortError') {
        console.warn('Failed to start audio session:', error)
      }
      return null
    }
  }, [])

  const stopAudioSession = useCallback(() => {
    if (!streamRef.current) return
    streamRef.current.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    if (!active) {
      stopAudioSession()
      return
    }

    let cancelled = false
    void startAudioSession().then((stream) => {
      if (cancelled || !stream) return
      streamRef.current = stream
    })

    return () => {
      cancelled = true
    }
  }, [active, startAudioSession, stopAudioSession])
}
