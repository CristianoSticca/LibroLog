export interface UserSettings {
  annualGoal: number;
  dailyPagesGoal: number;
}

const DEFAULTS: UserSettings = {
  annualGoal: 12,
  dailyPagesGoal: 30,
};

const KEY = 'librolog_settings';

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: Partial<UserSettings>): void {
  const current = getSettings();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...settings }));
}
