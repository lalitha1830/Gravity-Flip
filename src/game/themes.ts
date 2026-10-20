import { SkinDefinition, ThemeType } from '../types/game';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  tagline: string;
  bgGradient: [string, string];
  ceilingFloorColor: string;
  gridLineColor: string;
  accentGlow: string;
  spikeColor: string;
  laserBeamColor: string;
  laserWarningColor: string;
  blockColor: string;
  barrierColor: string;
  particleColors: string[];
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  neon_city: {
    id: 'neon_city',
    name: 'NEON CITY',
    tagline: 'Cyberpunk Skyline & Electric Rain',
    bgGradient: ['#0b0d1e', '#05060f'],
    ceilingFloorColor: '#00f0ff',
    gridLineColor: 'rgba(0, 240, 255, 0.25)',
    accentGlow: 'rgba(0, 240, 255, 0.4)',
    spikeColor: '#ff0055',
    laserBeamColor: '#ff0077',
    laserWarningColor: '#ffea00',
    blockColor: '#7000ff',
    barrierColor: '#00e5ff',
    particleColors: ['#00f0ff', '#ff0055', '#a855f7', '#ffffff']
  },
  digital_void: {
    id: 'digital_void',
    name: 'DIGITAL VOID',
    tagline: 'Matrix Minimalist Binary Depths',
    bgGradient: ['#040806', '#010402'],
    ceilingFloorColor: '#00ff66',
    gridLineColor: 'rgba(0, 255, 102, 0.2)',
    accentGlow: 'rgba(0, 255, 102, 0.35)',
    spikeColor: '#ff3366',
    laserBeamColor: '#00ffaa',
    laserWarningColor: '#ffee55',
    blockColor: '#008844',
    barrierColor: '#00ff88',
    particleColors: ['#00ff66', '#00ffcc', '#ffffff', '#22c55e']
  },
  cyber_grid: {
    id: 'cyber_grid',
    name: 'CYBER GRID',
    tagline: 'Infinite Tron Perspective & Vector Pulse',
    bgGradient: ['#080c1a', '#02040a'],
    ceilingFloorColor: '#38bdf8',
    gridLineColor: 'rgba(56, 189, 248, 0.3)',
    accentGlow: 'rgba(56, 189, 248, 0.45)',
    spikeColor: '#f43f5e',
    laserBeamColor: '#38bdf8',
    laserWarningColor: '#fbbf24',
    blockColor: '#2563eb',
    barrierColor: '#06b6d4',
    particleColors: ['#38bdf8', '#818cf8', '#f43f5e', '#ffffff']
  },
  cosmic_space: {
    id: 'cosmic_space',
    name: 'COSMIC SPACE',
    tagline: 'Stellar Nebula & Celestial Rings',
    bgGradient: ['#120726', '#05020c'],
    ceilingFloorColor: '#c084fc',
    gridLineColor: 'rgba(192, 132, 252, 0.25)',
    accentGlow: 'rgba(192, 132, 252, 0.4)',
    spikeColor: '#f97316',
    laserBeamColor: '#e879f9',
    laserWarningColor: '#fde047',
    blockColor: '#9333ea',
    barrierColor: '#c084fc',
    particleColors: ['#c084fc', '#f472b6', '#f97316', '#ffffff']
  },
  synthwave: {
    id: 'synthwave',
    name: 'SYNTHWAVE',
    tagline: 'Retro Sunset & Outrun Vibes',
    bgGradient: ['#1f0b2e', '#090310'],
    ceilingFloorColor: '#ff2a85',
    gridLineColor: 'rgba(255, 42, 133, 0.3)',
    accentGlow: 'rgba(255, 42, 133, 0.45)',
    spikeColor: '#00ffff',
    laserBeamColor: '#ff007f',
    laserWarningColor: '#ffbe0b',
    blockColor: '#8338ec',
    barrierColor: '#3a86ff',
    particleColors: ['#ff2a85', '#00ffff', '#ffbe0b', '#8338ec']
  }
};

export const CHARACTER_SKINS: SkinDefinition[] = [
  {
    id: 'cube',
    name: 'NEON CORE',
    description: 'The classic glowing hypercube with a radiant digital pulse.',
    primaryColor: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.8)',
    accentColor: '#ffffff',
    unlocked: true,
    unlockRequirement: 'Unlocked by default'
  },
  {
    id: 'robot',
    name: 'RETRO DROID',
    description: 'Compact cybernetic explorer with animated radar antenna and scanner.',
    primaryColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.8)',
    accentColor: '#86efac',
    unlocked: false,
    unlockRequirement: 'Score 15 in Endless Mode'
  },
  {
    id: 'astro',
    name: 'PIXEL ASTRONAUT',
    description: 'Zero-gravity spacesuit with reflective neon visor and thruster jets.',
    primaryColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.8)',
    accentColor: '#fecdd3',
    unlocked: false,
    unlockRequirement: 'Score 30 in Endless Mode'
  },
  {
    id: 'phantom',
    name: 'GHOST BIT',
    description: 'Ethereal pixel apparition leaving spectral neon trails in the void.',
    primaryColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.8)',
    accentColor: '#e9d5ff',
    unlocked: false,
    unlockRequirement: 'Survive 30s in Time Attack'
  },
  {
    id: 'prism',
    name: 'CHROMA GEM',
    description: 'Legendary multi-faceted crystal that bends gravity with pure light.',
    primaryColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.8)',
    accentColor: '#fef08a',
    unlocked: false,
    unlockRequirement: 'Beat Challenge Level 8'
  }
];
