import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSettings, saveSettings } from './settingsStore';
import { GlobalSettings } from '../types/workout';

describe('SettingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return default settings when none are saved', () => {
    const settings = getSettings();
    expect(settings.soundEnabled).toBe(true);
    expect(settings.vibrationEnabled).toBe(true);
    expect(settings.autostart).toBe(false);
  });

  it('should save settings to localStorage', () => {
    const newSettings: GlobalSettings = {
      soundEnabled: false,
      vibrationEnabled: false,
      autostart: true,
    };

    saveSettings(newSettings);
    const retrieved = getSettings();
    expect(retrieved).toEqual(newSettings);
  });

  it('should persist settings across multiple calls', () => {
    const settings1: GlobalSettings = {
      soundEnabled: false,
      vibrationEnabled: true,
      autostart: true,
    };

    saveSettings(settings1);
    const retrieved1 = getSettings();
    expect(retrieved1).toEqual(settings1);

    const retrieved2 = getSettings();
    expect(retrieved2).toEqual(settings1);
  });

  it('should update partial settings', () => {
    const initialSettings: GlobalSettings = {
      soundEnabled: true,
      vibrationEnabled: true,
      autostart: false,
    };

    saveSettings(initialSettings);
    const updated: Partial<GlobalSettings> = { autostart: true };
    saveSettings({ ...getSettings(), ...updated });

    const retrieved = getSettings();
    expect(retrieved.soundEnabled).toBe(true);
    expect(retrieved.vibrationEnabled).toBe(true);
    expect(retrieved.autostart).toBe(true);
  });
});
