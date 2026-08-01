import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DEFAULT_SETTINGS, getSettings, saveSettings, updateSettings } from './settingsStore'
import type { GlobalSettings } from '../types/workout'

describe('SettingsStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns default settings when none are saved', () => {
    expect(getSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('saves settings to localStorage', () => {
    const newSettings: GlobalSettings = {
      soundEnabled: false,
      vibrationEnabled: false,
      autostart: true,
      countdownSeconds: 10,
    }

    saveSettings(newSettings)

    expect(getSettings()).toEqual(newSettings)
  })

  it('persists settings across multiple calls', () => {
    const settings: GlobalSettings = {
      soundEnabled: false,
      vibrationEnabled: true,
      autostart: true,
      countdownSeconds: 10,
    }

    saveSettings(settings)

    expect(getSettings()).toEqual(settings)
    expect(getSettings()).toEqual(settings)
  })

  it('updates partial settings while preserving the rest', () => {
    saveSettings(DEFAULT_SETTINGS)

    const updated = updateSettings({ autostart: true })

    expect(updated).toEqual({
      ...DEFAULT_SETTINGS,
      autostart: true,
    })
    expect(getSettings()).toEqual(updated)
  })

  it('fills missing stored keys with defaults', () => {
    localStorage.setItem('settings', JSON.stringify({ soundEnabled: false }))

    expect(getSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      soundEnabled: false,
    })
  })
})
