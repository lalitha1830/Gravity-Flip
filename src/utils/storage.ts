import { GameSettings, GameStats, SkinType } from '../types/game';

const STORAGE_KEY_SETTINGS = 'gravity_flip_settings_v1';
const STORAGE_KEY_STATS = 'gravity_flip_stats_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.35,
  screenShake: true,
  reducedMotion: false,
  scanlines: false,
  theme: 'neon_city',
  selectedSkin: 'cube'
};

export const DEFAULT_STATS: GameStats = {
  endlessHighScore: 0,
  timeAttackHighScore: 0,
  completedLevels: [],
  totalFlips: 0,
  totalObstaclesPassed: 0,
  totalDeaths: 0
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // LocalStorage quota or blocked
  }
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: GameStats) {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch {
    // LocalStorage error
  }
}

export function checkSkinUnlocked(skin: SkinType, stats: GameStats): boolean {
  if (skin === 'cube') return true;
  if (skin === 'robot') return stats.endlessHighScore >= 15;
  if (skin === 'astro') return stats.endlessHighScore >= 30;
  if (skin === 'phantom') return stats.timeAttackHighScore >= 15;
  if (skin === 'prism') return stats.completedLevels.includes(8);
  return false;
}

export function resetAllStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_STATS);
  } catch {
    // ignore
  }
}
