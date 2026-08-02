import type { GlobalSettings } from "../types/workout";

export const SETTINGS_KEY = "settings";

export const DEFAULT_SETTINGS: GlobalSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  autostart: false,
  countdownSeconds: 10,
};

function normalizeSettings(settings: unknown): GlobalSettings {
  if (!settings || typeof settings !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const candidate = settings as Partial<GlobalSettings>;

  return {
    soundEnabled:
      typeof candidate.soundEnabled === "boolean"
        ? candidate.soundEnabled
        : DEFAULT_SETTINGS.soundEnabled,
    vibrationEnabled:
      typeof candidate.vibrationEnabled === "boolean"
        ? candidate.vibrationEnabled
        : DEFAULT_SETTINGS.vibrationEnabled,
    autostart:
      typeof candidate.autostart === "boolean"
        ? candidate.autostart
        : DEFAULT_SETTINGS.autostart,
    countdownSeconds:
      typeof candidate.countdownSeconds === "number" &&
      candidate.countdownSeconds >= 0
        ? Math.round(candidate.countdownSeconds)
        : DEFAULT_SETTINGS.countdownSeconds,
  };
}

export function getSettings(): GlobalSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored
      ? normalizeSettings(JSON.parse(stored))
      : { ...DEFAULT_SETTINGS };
  } catch (error) {
    console.error("Failed to parse settings from localStorage:", error);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GlobalSettings): void {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(normalizeSettings(settings)),
    );
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
}

export function updateSettings(
  nextSettings: Partial<GlobalSettings>,
): GlobalSettings {
  const mergedSettings = { ...getSettings(), ...nextSettings };
  saveSettings(mergedSettings);
  return mergedSettings;
}
