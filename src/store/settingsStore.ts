import type { GlobalSettings } from '../types/workout';

const SETTINGS_KEY = 'settings';

const DEFAULT_SETTINGS: GlobalSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  autostart: false,
};

export function getSettings(): GlobalSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to parse settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GlobalSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
}
