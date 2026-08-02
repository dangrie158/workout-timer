import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSettings, updateSettings } from "../store/settingsStore";
import type { GlobalSettings } from "../types";
import NumberPicker from "../components/NumberPicker";

interface PreferenceItem {
  key: keyof GlobalSettings;
  title: string;
  description: string;
  badge: string;
}

const preferenceSections: Array<{
  heading: string;
  blurb: string;
  items: PreferenceItem[];
}> = [
  {
    heading: "Audio & haptics",
    blurb: "Fine-tune how the timer keeps you on pace during every interval.",
    items: [
      {
        key: "soundEnabled",
        title: "Sound cues",
        description:
          "Play transition tones, final workout chime, and countdown beeps.",
        badge: "Audio",
      },
      {
        key: "vibrationEnabled",
        title: "Vibration cues",
        description:
          "Trigger short haptics for transitions and countdown ticks on supported mobile devices.",
        badge: "Haptics",
      },
    ],
  },
  {
    heading: "Timer behavior",
    blurb: "Choose how the workout starts once you open a saved routine.",
    items: [
      {
        key: "autostart",
        title: "Autostart workout",
        description:
          "Begin the timer automatically when you open the workout screen.",
        badge: "Flow",
      },
    ],
  },
];

interface PreferenceToggleProps {
  item: PreferenceItem;
  checked: boolean;
  onChange: (key: keyof GlobalSettings, value: boolean) => void;
}

function PreferenceToggle({ item, checked, onChange }: PreferenceToggleProps) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-white/5 bg-white/[0.015] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition hover:bg-white/[0.03]">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/6 bg-white/[0.02] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            {item.badge}
          </span>
          <span className="text-base font-semibold text-white">
            {item.title}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {item.description}
        </p>
      </div>

      <span className="relative mt-1 inline-flex h-7 w-12 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(item.key, event.target.checked)}
          className="peer sr-only"
          aria-label={item.title}
        />
        <span className="absolute inset-0 rounded-full bg-zinc-800 transition peer-checked:bg-blue-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-400" />
        <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-lg transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

interface CountdownRowProps {
  value: number;
  onChange: (value: number) => void;
}

function CountdownRow({ value, onChange }: CountdownRowProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setPickerOpen(true)}
        className="flex w-full cursor-pointer items-start gap-4 rounded-xl border border-white/5 bg-white/[0.015] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition hover:bg-white/[0.03]">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/6 bg-white/[0.02] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
              Audio
            </span>
            <span className="text-base font-semibold text-white">
              Countdown cue length
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Play a beep for the last <span className="text-white">{value}</span>{" "}
            second{value !== 1 ? "s" : ""} of each phase. Set to 0 to disable
            countdown beeps.
          </p>
        </div>
        <span className="mt-1 shrink-0 rounded-lg border border-white/6 bg-white/[0.03] px-3 py-1 text-base font-semibold tabular-nums text-white">
          {value}s
        </span>
        <span className="mt-2 shrink-0 text-zinc-500" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </button>

      <NumberPicker
        isOpen={pickerOpen}
        title="Countdown cue length"
        value={value}
        onChange={onChange}
        onClose={() => setPickerOpen(false)}
        min={0}
        max={30}
      />
    </>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => getSettings());

  const handleToggleChange = (key: keyof GlobalSettings, value: boolean) => {
    const nextSettings = updateSettings({ [key]: value });
    setSettings(nextSettings);
  };

  const handleCountdownChange = (value: number) => {
    const nextSettings = updateSettings({ countdownSeconds: value });
    setSettings(nextSettings);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen w-full flex-col px-4 pb-[2rem] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
            ← Workouts
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Preferences
            </p>
            <h1 className="text-lg font-semibold text-white">
              Global settings
            </h1>
          </div>
        </div>

        <div className="space-y-5">
          {preferenceSections.map((section) => (
            <section
              key={section.heading}
              className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-xl shadow-black/25">
              <div className="mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  {section.heading}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {section.blurb}
                </p>
              </div>

              <div className="space-y-3">
                {section.items.map((item) => (
                  <PreferenceToggle
                    key={item.key}
                    item={item}
                    checked={settings[item.key] as boolean}
                    onChange={handleToggleChange}
                  />
                ))}
                {section.heading === "Audio & haptics" && (
                  <CountdownRow
                    value={settings.countdownSeconds}
                    onChange={handleCountdownChange}
                  />
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
