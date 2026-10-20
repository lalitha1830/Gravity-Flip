export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export type GameMode = 'endless' | 'time_attack' | 'challenge';

export type ThemeType = 'neon_city' | 'digital_void' | 'cyber_grid' | 'cosmic_space' | 'synthwave';

export type SkinType = 'cube' | 'robot' | 'astro' | 'phantom' | 'prism';

export interface SkinDefinition {
  id: SkinType;
  name: string;
  description: string;
  primaryColor: string;
  glowColor: string;
  accentColor: string;
  unlocked: boolean;
  unlockRequirement: string;
}

export interface Player {
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  gravityDir: 1 | -1; // 1 = downwards (floor), -1 = upwards (ceiling)
  isGrounded: boolean;
  rotation: number;
  targetRotation: number;
  squashX: number;
  squashY: number;
  trail: { x: number; y: number; alpha: number; rotation: number }[];
  skin: SkinType;
}

export type ObstacleType = 
  | 'spike' 
  | 'block' 
  | 'moving_barrier' 
  | 'laser_gate' 
  | 'double_spike' 
  | 'floating_block';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  surface: 'floor' | 'ceiling' | 'center';
  vy?: number;
  moveRange?: number;
  initialY?: number;
  // Laser gate specifics
  laserState?: 'warning' | 'active' | 'cooldown';
  laserTimer?: number;
  laserCycleDuration?: number;
  passed: boolean;
  color?: string;
  secondaryColor?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'square' | 'line' | 'spark' | 'ring';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  scale: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  screenShake: boolean;
  reducedMotion: boolean;
  scanlines: boolean;
  theme: ThemeType;
  selectedSkin: SkinType;
}

export interface ChallengeLevel {
  id: number;
  title: string;
  subtitle: string;
  speed: number;
  lengthInMeters: number; // finish line distance
  obstacleSpacing: number;
  description: string;
  allowedTypes: ObstacleType[];
  fixedPattern?: Array<{
    distance: number;
    type: ObstacleType;
    surface: 'floor' | 'ceiling' | 'center';
    height?: number;
  }>;
}

export interface GameStats {
  endlessHighScore: number;
  timeAttackHighScore: number;
  completedLevels: number[];
  totalFlips: number;
  totalObstaclesPassed: number;
  totalDeaths: number;
}
