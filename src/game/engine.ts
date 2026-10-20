import { 
  Player, 
  Obstacle, 
  Particle, 
  FloatingText, 
  ObstacleType, 
  GameMode, 
  ChallengeLevel 
} from '../types/game';
import { THEMES } from './themes';
import { soundManager } from '../audio/soundManager';

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const CEILING_Y = 50;
export const FLOOR_Y = 490;
export const PLAYER_SIZE = 28;
export const PLAYER_X = 180;

const GRAVITY_ACCEL = 2800; // px/s^2
const FLIP_INITIAL_BOOST = 350; // initial burst speed on flip
const MAX_VERTICAL_SPEED = 950;

export class GameEngine {
  public player: Player;
  public obstacles: Obstacle[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Game state
  public score = 0;
  public distanceTraveled = 0;
  public speed = 400; // base px/s
  public baseSpeed = 400;
  public maxSpeed = 750;
  public isGameOver = false;
  public isVictory = false;
  public screenShakeAmount = 0;
  public screenShakeDuration = 0;
  public flashAmount = 0;
  public currentTheme = THEMES.neon_city;
  public reducedMotion = false;
  public screenShakeEnabled = true;

  // Mode specific
  public mode: GameMode = 'endless';
  public timeAttackRemaining = 30; // seconds
  public currentChallengeLevel: ChallengeLevel | null = null;
  public challengePatternIndex = 0;

  // Spawning logic
  private nextObstacleX = 700;
  private minSpacing = 420;

  // Callbacks
  public onScoreChange?: (score: number) => void;
  public onMilestone?: (milestone: string) => void;
  public onGameOver?: (score: number) => void;
  public onVictory?: () => void;

  constructor() {
    this.player = this.createDefaultPlayer();
  }

  private createDefaultPlayer(): Player {
    return {
      x: PLAYER_X,
      y: FLOOR_Y - PLAYER_SIZE,
      vy: 0,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      gravityDir: 1, // 1 = floor, -1 = ceiling
      isGrounded: true,
      rotation: 0,
      targetRotation: 0,
      squashX: 1,
      squashY: 1,
      trail: [],
      skin: 'cube'
    };
  }

  public reset(mode: GameMode = 'endless', challengeLevel: ChallengeLevel | null = null) {
    this.mode = mode;
    this.currentChallengeLevel = challengeLevel;
    this.isGameOver = false;
    this.isVictory = false;
    this.score = 0;
    this.distanceTraveled = 0;
    this.screenShakeAmount = 0;
    this.screenShakeDuration = 0;
    this.flashAmount = 0;
    this.obstacles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.challengePatternIndex = 0;

    if (mode === 'challenge' && challengeLevel) {
      this.baseSpeed = challengeLevel.speed;
      this.speed = challengeLevel.speed;
      this.minSpacing = challengeLevel.obstacleSpacing;
      this.nextObstacleX = 650;
    } else if (mode === 'time_attack') {
      this.timeAttackRemaining = 30;
      this.baseSpeed = 440;
      this.speed = 440;
      this.minSpacing = 400;
      this.nextObstacleX = 700;
    } else {
      // Endless
      this.baseSpeed = 380;
      this.speed = 380;
      this.minSpacing = 440;
      this.nextObstacleX = 700;
    }

    this.player = this.createDefaultPlayer();
    if (this.onScoreChange) {
      this.onScoreChange(0);
    }
  }

  // Primary action: Flip Gravity
  public flipGravity(): boolean {
    if (this.isGameOver || this.isVictory) return false;

    // Flip direction
    this.player.gravityDir = (this.player.gravityDir === 1 ? -1 : 1) as 1 | -1;
    this.player.isGrounded = false;

    // Apply immediate impulse towards opposite boundary
    this.player.vy = -this.player.gravityDir * FLIP_INITIAL_BOOST;
    this.player.targetRotation += Math.PI;

    // Squash on flip launch
    this.player.squashX = 0.75;
    this.player.squashY = 1.3;

    // Audio
    soundManager.playFlip(this.player.gravityDir);

    // Spawn burst particles at launch
    this.spawnFlipParticles();

    return true;
  }

  private spawnFlipParticles() {
    const pX = this.player.x + this.player.width / 2;
    const pY = this.player.y + this.player.height / 2;
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 70 + Math.random() * 120;
      this.particles.push({
        x: pX,
        y: pY,
        vx: Math.cos(angle) * speed - this.speed * 0.25,
        vy: Math.sin(angle) * speed + (this.player.gravityDir === 1 ? 50 : -50),
        size: 3 + Math.random() * 4,
        color: this.currentTheme.particleColors[Math.floor(Math.random() * this.currentTheme.particleColors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
        shape: Math.random() > 0.5 ? 'square' : 'spark'
      });
    }
  }

  public update(dt: number) {
    if (this.isGameOver || this.isVictory) return;

    // Clamp dt to avoid physics blowups on tab switch
    const clampedDt = Math.min(dt, 0.05);

    // Distance and speed progression
    this.distanceTraveled += this.speed * clampedDt;

    if (this.mode === 'endless') {
      // Smooth logarithmic acceleration
      this.speed = Math.min(this.maxSpeed, this.baseSpeed + Math.floor(this.score / 5) * 18);
      this.minSpacing = Math.max(320, 440 - (this.score * 2.5));
    } else if (this.mode === 'time_attack') {
      this.timeAttackRemaining -= clampedDt;
      if (this.timeAttackRemaining <= 0) {
        this.timeAttackRemaining = 0;
        this.triggerVictory('TIME UP! OUTSTANDING RUN!');
        return;
      }
    } else if (this.mode === 'challenge' && this.currentChallengeLevel) {
      if (this.distanceTraveled >= this.currentChallengeLevel.lengthInMeters) {
        this.triggerVictory('LEVEL COMPLETE!');
        return;
      }
    }

    // Update screen shake & flash
    if (this.screenShakeDuration > 0) {
      this.screenShakeDuration -= clampedDt;
      if (this.screenShakeDuration <= 0) {
        this.screenShakeAmount = 0;
      }
    }
    if (this.flashAmount > 0) {
      this.flashAmount = Math.max(0, this.flashAmount - clampedDt * 4);
    }

    // Update Player Physics
    this.updatePlayer(clampedDt);

    // Update Obstacles & Spawning
    this.updateObstacles(clampedDt);

    // Update Particles
    this.updateParticles(clampedDt);

    // Update Floating Text
    this.updateFloatingText(clampedDt);

    // Collision Check
    this.checkCollisions();
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Apply gravity acceleration
    p.vy += p.gravityDir * GRAVITY_ACCEL * dt;
    
    // Clamp vertical velocity
    if (p.vy > MAX_VERTICAL_SPEED) p.vy = MAX_VERTICAL_SPEED;
    if (p.vy < -MAX_VERTICAL_SPEED) p.vy = -MAX_VERTICAL_SPEED;

    p.y += p.vy * dt;

    // Check ceiling and floor landings
    const topFloorY = FLOOR_Y - p.height;
    const bottomCeilingY = CEILING_Y;

    if (p.gravityDir === 1 && p.y >= topFloorY) {
      // Landed on floor
      p.y = topFloorY;
      if (!p.isGrounded && Math.abs(p.vy) > 200) {
        // Impact squash
        p.squashX = 1.35;
        p.squashY = 0.65;
        this.spawnLandingParticles(p.x + p.width / 2, FLOOR_Y);
      }
      p.vy = 0;
      p.isGrounded = true;
    } else if (p.gravityDir === -1 && p.y <= bottomCeilingY) {
      // Landed on ceiling
      p.y = bottomCeilingY;
      if (!p.isGrounded && Math.abs(p.vy) > 200) {
        // Impact squash
        p.squashX = 1.35;
        p.squashY = 0.65;
        this.spawnLandingParticles(p.x + p.width / 2, CEILING_Y);
      }
      p.vy = 0;
      p.isGrounded = true;
    } else {
      p.isGrounded = false;
    }

    // Smooth spring back for squash & stretch
    p.squashX += (1 - p.squashX) * 16 * dt;
    p.squashY += (1 - p.squashY) * 16 * dt;

    // Rotation interpolation
    p.rotation += (p.targetRotation - p.rotation) * 18 * dt;

    // Record trail
    p.trail.unshift({
      x: p.x,
      y: p.y,
      alpha: 0.6,
      rotation: p.rotation
    });
    if (p.trail.length > 8) {
      p.trail.pop();
    }
    p.trail.forEach(t => {
      t.alpha -= dt * 2.5;
    });
  }

  private spawnLandingParticles(x: number, y: number) {
    const count = 6;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y,
        vx: (Math.random() - 0.5) * 180 - this.speed * 0.2,
        vy: (this.player.gravityDir === 1 ? -1 : 1) * (40 + Math.random() * 80),
        size: 2 + Math.random() * 3,
        color: this.currentTheme.ceilingFloorColor,
        alpha: 0.8,
        life: 0,
        maxLife: 0.2 + Math.random() * 0.15,
        shape: 'square'
      });
    }
  }

  private updateObstacles(dt: number) {
    // Move obstacles to the left
    const moveAmount = this.speed * dt;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      obs.x -= moveAmount;

      // Handle vertical moving barrier oscillation
      if (obs.type === 'moving_barrier' && obs.vy !== undefined && obs.moveRange !== undefined && obs.initialY !== undefined) {
        obs.y += obs.vy * dt;
        if (Math.abs(obs.y - obs.initialY) > obs.moveRange) {
          obs.vy = -obs.vy;
        }
      }

      // Handle laser gate cycles
      if (obs.type === 'laser_gate') {
        obs.laserTimer = (obs.laserTimer || 0) + dt;
        const cycle = obs.laserCycleDuration || 2.4;
        const currentInCycle = (obs.laserTimer % cycle);

        // Warning for 0.7s, active lethal beam for 0.8s, cooldown for rest
        if (currentInCycle < 0.7) {
          obs.laserState = 'warning';
        } else if (currentInCycle < 1.5) {
          if (obs.laserState !== 'active') {
            soundManager.playLaserBeam();
          }
          obs.laserState = 'active';
        } else {
          obs.laserState = 'cooldown';
        }
      }

      // Check if passed player to score point
      if (!obs.passed && obs.x + obs.width < this.player.x) {
        obs.passed = true;
        this.addScore(1, obs.x + obs.width, obs.y + obs.height / 2);
      }
    }

    // Clean up passed obstacles off-screen
    this.obstacles = this.obstacles.filter(obs => obs.x + obs.width > -150);

    // Spawn new obstacles
    this.handleObstacleSpawning();
  }

  private handleObstacleSpawning() {
    if (this.mode === 'challenge' && this.currentChallengeLevel) {
      this.spawnChallengePattern();
      return;
    }

    // Endless or Time Attack procedural generator
    const lastObstacle = this.obstacles[this.obstacles.length - 1];
    const rightEdge = lastObstacle ? lastObstacle.x + lastObstacle.width : 0;

    if (rightEdge < CANVAS_WIDTH + 150) {
      this.generateFairObstaclePattern();
    }
  }

  private spawnChallengePattern() {
    const level = this.currentChallengeLevel;
    if (!level || !level.fixedPattern) return;

    while (this.challengePatternIndex < level.fixedPattern.length) {
      const item = level.fixedPattern[this.challengePatternIndex];
      // When distance comes into viewport range
      const spawnX = CANVAS_WIDTH + (item.distance - this.distanceTraveled);
      if (spawnX <= CANVAS_WIDTH + 600) {
        this.createPatternItem(item.type, item.surface, item.height || 45, spawnX);
        this.challengePatternIndex++;
      } else {
        break;
      }
    }
  }

  private createPatternItem(type: ObstacleType, surface: 'floor' | 'ceiling' | 'center', height: number, x: number) {
    const id = `obs_${Date.now()}_${Math.random()}`;
    const width = type === 'laser_gate' ? 14 : type === 'floating_block' ? 65 : type === 'block' ? 45 : 34;

    let y = 0;
    if (surface === 'floor') {
      y = FLOOR_Y - height;
    } else if (surface === 'ceiling') {
      y = CEILING_Y;
    } else {
      // Center
      y = (CEILING_Y + FLOOR_Y) / 2 - height / 2;
    }

    const obs: Obstacle = {
      id,
      type,
      x,
      y,
      width,
      height,
      surface,
      passed: false,
      color: type === 'spike' || type === 'double_spike' ? this.currentTheme.spikeColor :
             type === 'laser_gate' ? this.currentTheme.laserBeamColor :
             type === 'moving_barrier' ? this.currentTheme.barrierColor : this.currentTheme.blockColor
    };

    if (type === 'moving_barrier') {
      obs.initialY = y;
      obs.moveRange = 75;
      obs.vy = 120;
    }

    if (type === 'laser_gate') {
      obs.laserState = 'warning';
      obs.laserTimer = Math.random() * 0.5;
      obs.laserCycleDuration = 2.4;
    }

    this.obstacles.push(obs);

    // If double spike, add opposite surface counterpart
    if (type === 'double_spike') {
      const floorObs: Obstacle = {
        id: id + '_f',
        type: 'spike',
        x,
        y: FLOOR_Y - 45,
        width: 34,
        height: 45,
        surface: 'floor',
        passed: false,
        color: this.currentTheme.spikeColor
      };
      const ceilObs: Obstacle = {
        id: id + '_c',
        type: 'spike',
        x,
        y: CEILING_Y,
        width: 34,
        height: 45,
        surface: 'ceiling',
        passed: false,
        color: this.currentTheme.spikeColor
      };
      this.obstacles.push(floorObs, ceilObs);
    }
  }

  private generateFairObstaclePattern() {
    // Select curated pattern based on current difficulty score
    const patterns = ['single_floor', 'single_ceiling', 'alternating', 'moving_barrier', 'laser_corridor', 'narrow_floating', 'double_hazard'];
    
    // Weight patterns by progression
    let available = ['single_floor', 'single_ceiling'];
    if (this.score > 4) available.push('alternating');
    if (this.score > 10) available.push('moving_barrier');
    if (this.score > 16) available.push('narrow_floating');
    if (this.score > 24) available.push('laser_corridor', 'double_hazard');

    const chosen = available[Math.floor(Math.random() * available.length)];
    const startX = Math.max(CANVAS_WIDTH + 80, this.nextObstacleX);

    switch (chosen) {
      case 'single_floor': {
        this.createPatternItem('spike', 'floor', 45, startX);
        this.nextObstacleX = startX + this.minSpacing;
        break;
      }
      case 'single_ceiling': {
        this.createPatternItem('spike', 'ceiling', 45, startX);
        this.nextObstacleX = startX + this.minSpacing;
        break;
      }
      case 'alternating': {
        // Floor spike, then ceiling spike spaced comfortably
        const firstSurface = Math.random() > 0.5 ? 'floor' : 'ceiling';
        const secondSurface = firstSurface === 'floor' ? 'ceiling' : 'floor';
        this.createPatternItem('spike', firstSurface, 45, startX);
        this.createPatternItem('spike', secondSurface, 45, startX + this.minSpacing * 0.9);
        this.nextObstacleX = startX + this.minSpacing * 1.8;
        break;
      }
      case 'moving_barrier': {
        this.createPatternItem('moving_barrier', 'center', 130, startX);
        this.nextObstacleX = startX + this.minSpacing * 1.1;
        break;
      }
      case 'laser_corridor': {
        const surf = Math.random() > 0.5 ? 'floor' : 'ceiling';
        this.createPatternItem('laser_gate', surf, 170, startX);
        this.nextObstacleX = startX + this.minSpacing * 1.15;
        break;
      }
      case 'narrow_floating': {
        this.createPatternItem('floating_block', 'center', 105, startX);
        this.nextObstacleX = startX + this.minSpacing * 1.1;
        break;
      }
      case 'double_hazard': {
        this.createPatternItem('double_spike', 'center', 45, startX);
        this.nextObstacleX = startX + this.minSpacing * 1.2;
        break;
      }
      default: {
        this.createPatternItem('spike', 'floor', 45, startX);
        this.nextObstacleX = startX + this.minSpacing;
      }
    }
  }

  private addScore(points: number, x: number, y: number) {
    this.score += points;
    if (this.onScoreChange) {
      this.onScoreChange(this.score);
    }
    soundManager.playScore();

    // Spawn score pass particles
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 60 - this.speed * 0.2,
        vy: (Math.random() - 0.5) * 60,
        size: 3,
        color: this.currentTheme.ceilingFloorColor,
        alpha: 0.9,
        life: 0,
        maxLife: 0.3,
        shape: 'spark'
      });
    }

    // Milestones every 10 points
    if (this.score % 10 === 0) {
      soundManager.playMilestone();
      const milestoneText = `NICE! ${this.score}`;
      if (this.onMilestone) {
        this.onMilestone(milestoneText);
      }
      this.addFloatingText(milestoneText, CANVAS_WIDTH / 2, 140, '#00f0ff', 1.4);
      this.spawnCelebrationBurst();
    }
  }

  private addFloatingText(text: string, x: number, y: number, color = '#ffffff', scale = 1.0) {
    this.floatingTexts.push({
      id: `text_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      vy: -35,
      alpha: 1,
      color,
      scale
    });
  }

  private spawnCelebrationBurst() {
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 120 + Math.random() * 160;
      this.particles.push({
        x: CANVAS_WIDTH / 2,
        y: 160,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        color: this.currentTheme.particleColors[Math.floor(Math.random() * this.currentTheme.particleColors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
        shape: Math.random() > 0.5 ? 'square' : 'ring'
      });
    }
  }

  private checkCollisions() {
    const p = this.player;
    // Generous player hitbox with 4px inset on each side
    const inset = 4;
    const pBox = {
      x: p.x + inset,
      y: p.y + inset,
      w: p.width - inset * 2,
      h: p.height - inset * 2
    };

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];

      // Laser gates only collide when actively lethal
      if (obs.type === 'laser_gate') {
        if (obs.laserState !== 'active') {
          continue;
        }
      }

      // Check spike vs rectangle
      if (obs.type === 'spike' || obs.type === 'double_spike') {
        if (this.checkTriangleBoxCollision(pBox, obs)) {
          this.triggerDeath();
          return;
        }
      } else {
        // Standard AABB for blocks and barriers
        if (
          pBox.x < obs.x + obs.width &&
          pBox.x + pBox.w > obs.x &&
          pBox.y < obs.y + obs.height &&
          pBox.y + pBox.h > obs.y
        ) {
          this.triggerDeath();
          return;
        }
      }
    }
  }

  // Pixel-fair triangular spike collision
  private checkTriangleBoxCollision(box: { x: number; y: number; w: number; h: number }, spike: Obstacle): boolean {
    // Coarse AABB check first
    if (
      box.x >= spike.x + spike.width ||
      box.x + box.w <= spike.x ||
      box.y >= spike.y + spike.height ||
      box.y + box.h <= spike.y
    ) {
      return false;
    }

    // Triangular slope check
    // If spike is on floor: peak is at (spike.x + spike.width/2, spike.y)
    // If spike is on ceiling: peak is at (spike.x + spike.width/2, spike.y + spike.height)
    const midX = spike.x + spike.width / 2;
    const halfW = spike.width / 2;

    if (spike.surface === 'floor') {
      // For any point in player box overlapping spike X, check if box.y + box.h enters the triangle
      const closestX = Math.max(spike.x, Math.min(box.x + box.w / 2, spike.x + spike.width));
      const distFromCenter = Math.abs(closestX - midX);
      const allowedHeight = spike.height * (1 - distFromCenter / halfW);
      const spikeSurfaceY = (spike.y + spike.height) - allowedHeight;

      return (box.y + box.h) > spikeSurfaceY + 2;
    } else {
      // Ceiling spike
      const closestX = Math.max(spike.x, Math.min(box.x + box.w / 2, spike.x + spike.width));
      const distFromCenter = Math.abs(closestX - midX);
      const allowedHeight = spike.height * (1 - distFromCenter / halfW);
      const spikeSurfaceY = spike.y + allowedHeight;

      return box.y < spikeSurfaceY - 2;
    }
  }

  private triggerDeath() {
    this.isGameOver = true;
    soundManager.playCrash();

    // Trigger screen shake and flash
    if (!this.reducedMotion) {
      if (this.screenShakeEnabled) {
        this.screenShakeAmount = 14;
        this.screenShakeDuration = 0.35;
      }
      this.flashAmount = 0.8;
    }

    // Explosion particles
    this.spawnDeathExplosion();

    if (this.onGameOver) {
      this.onGameOver(this.score);
    }
  }

  private triggerVictory(message: string) {
    this.isVictory = true;
    soundManager.playVictory();
    this.addFloatingText(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30, '#ff007f', 1.6);
    this.spawnCelebrationBurst();

    if (this.onVictory) {
      this.onVictory();
    }
  }

  private spawnDeathExplosion() {
    const p = this.player;
    const centerX = p.x + p.width / 2;
    const centerY = p.y + p.height / 2;

    // 40 retro pixel explosion fragments
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 260;
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 10,
        y: centerY + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.4 ? this.currentTheme.spikeColor : '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
        shape: Math.random() > 0.3 ? 'square' : 'spark'
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife);
  }

  private updateFloatingText(dt: number) {
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= dt * 1.2;
    }
    this.floatingTexts = this.floatingTexts.filter(ft => ft.alpha > 0);
  }
}
