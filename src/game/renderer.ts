import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  CEILING_Y, 
  FLOOR_Y, 
  GameEngine 
} from './engine';
import { CHARACTER_SKINS } from './themes';
import { Player, Obstacle, Particle, SkinType } from '../types/game';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private starfield: { x: number; y: number; speed: number; size: number; alpha: number }[] = [];
  private buildings: { x: number; width: number; height: number; windows: { x: number; y: number; on: boolean }[] }[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.initBackgroundAssets();
  }

  private initBackgroundAssets() {
    // Generate starfield for Cosmic Space & digital dust
    this.starfield = [];
    for (let i = 0; i < 70; i++) {
      this.starfield.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speed: 0.1 + Math.random() * 0.4,
        size: Math.random() > 0.7 ? 2 : 1,
        alpha: 0.3 + Math.random() * 0.7
      });
    }

    // Generate parallax buildings for Neon City
    this.buildings = [];
    let currentX = 0;
    while (currentX < CANVAS_WIDTH * 2) {
      const bWidth = 50 + Math.random() * 70;
      const bHeight = 90 + Math.random() * 140;
      const windows: { x: number; y: number; on: boolean }[] = [];
      
      const rows = Math.floor(bHeight / 16);
      const cols = Math.floor(bWidth / 14);
      for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          windows.push({
            x: c * 14,
            y: r * 16,
            on: Math.random() > 0.45
          });
        }
      }

      this.buildings.push({
        x: currentX,
        width: bWidth,
        height: bHeight,
        windows
      });
      currentX += bWidth + 10 + Math.random() * 20;
    }
  }

  public render(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const theme = engine.currentTheme;

    ctx.save();

    // Screen Shake effect
    if (engine.screenShakeAmount > 0 && !engine.reducedMotion) {
      const shakeX = (Math.random() - 0.5) * engine.screenShakeAmount;
      const shakeY = (Math.random() - 0.5) * engine.screenShakeAmount;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Background
    this.drawBackground(engine, time);

    // 2. Draw Floor & Ceiling Boundaries
    this.drawBoundaries(engine);

    // 3. Draw Finish Line if in Challenge Mode
    if (engine.mode === 'challenge' && engine.currentChallengeLevel) {
      this.drawFinishLine(engine);
    }

    // 4. Draw Obstacles
    this.drawObstacles(engine, time);

    // 5. Draw Particles
    this.drawParticles(engine.particles);

    // 6. Draw Player & Trail
    this.drawPlayer(engine.player, time, engine.currentTheme.accentGlow);

    // 7. Draw Floating Texts
    this.drawFloatingTexts(engine);

    // 8. Screen Flash on death / milestone
    if (engine.flashAmount > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${engine.flashAmount * 0.4})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    ctx.restore();
  }

  private drawBackground(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const theme = engine.currentTheme;

    // Base background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, theme.bgGradient[0]);
    grad.addColorStop(1, theme.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Theme specific decorative backdrops
    switch (theme.id) {
      case 'neon_city':
        this.drawNeonCityBackdrop(engine);
        break;
      case 'digital_void':
        this.drawDigitalVoidBackdrop(engine, time);
        break;
      case 'cyber_grid':
        this.drawCyberGridBackdrop(engine, time);
        break;
      case 'cosmic_space':
        this.drawCosmicSpaceBackdrop(engine, time);
        break;
      case 'synthwave':
        this.drawSynthwaveBackdrop(engine, time);
        break;
    }
  }

  private drawNeonCityBackdrop(engine: GameEngine) {
    const ctx = this.ctx;
    const parallaxOffset = (engine.distanceTraveled * 0.15) % CANVAS_WIDTH;

    ctx.save();
    ctx.fillStyle = 'rgba(14, 18, 38, 0.7)';
    for (const b of this.buildings) {
      const drawX = (b.x - parallaxOffset);
      if (drawX > -b.width && drawX < CANVAS_WIDTH + b.width) {
        // Draw building silhouette
        ctx.fillRect(drawX, FLOOR_Y - b.height, b.width, b.height);
        
        // Draw lit windows
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        for (const w of b.windows) {
          if (w.on) {
            ctx.fillRect(drawX + w.x, FLOOR_Y - b.height + w.y, 4, 6);
          }
        }
        ctx.fillStyle = 'rgba(14, 18, 38, 0.7)';
      }
    }
    ctx.restore();
  }

  private drawDigitalVoidBackdrop(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const scrollOffset = (engine.distanceTraveled * 0.3) % 40;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.08)';
    ctx.lineWidth = 1;

    // Vertical matrix lines
    for (let x = -scrollOffset; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, CEILING_Y);
      ctx.lineTo(x, FLOOR_Y);
      ctx.stroke();
    }

    // Floating digital cubes
    for (let i = 0; i < 15; i++) {
      const cx = ((i * 120 + time * 20 - engine.distanceTraveled * 0.2) % (CANVAS_WIDTH + 80));
      const cy = 120 + ((i * 67) % 280);
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.15)';
      ctx.strokeRect(cx, cy, 14, 14);
    }
    ctx.restore();
  }

  private drawCyberGridBackdrop(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const scroll = (engine.distanceTraveled * 0.5) % 60;

    ctx.save();
    // Perspective vanishing grid horizon line
    const horizonY = CANVAS_HEIGHT / 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;

    // Angled perspective rays
    for (let x = -200; x <= CANVAS_WIDTH + 200; x += 80) {
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, horizonY);
      ctx.lineTo(x, FLOOR_Y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, horizonY);
      ctx.lineTo(x, CEILING_Y);
      ctx.stroke();
    }

    // Moving horizontal grid lines
    for (let y = CEILING_Y + 15; y < FLOOR_Y; y += 45) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawCosmicSpaceBackdrop(engine: GameEngine, time: number) {
    const ctx = this.ctx;

    // Distant pixel planet
    ctx.save();
    const planetX = CANVAS_WIDTH - 180;
    const planetY = 160;

    // Outer ring
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(planetX, planetY, 70, 22, -0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Planet body
    const planetGrad = ctx.createRadialGradient(planetX - 10, planetY - 10, 5, planetX, planetY, 38);
    planetGrad.addColorStop(0, '#c084fc');
    planetGrad.addColorStop(0.7, '#6b21a8');
    planetGrad.addColorStop(1, '#2e1065');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, 36, 0, Math.PI * 2);
    ctx.fill();

    // Starfield
    for (const star of this.starfield) {
      const starX = (star.x - engine.distanceTraveled * star.speed) % CANVAS_WIDTH;
      const actualX = starX < 0 ? starX + CANVAS_WIDTH : starX;
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * (0.6 + Math.sin(time * 3 + star.y) * 0.4)})`;
      ctx.fillRect(actualX, star.y, star.size, star.size);
    }
    ctx.restore();
  }

  private drawSynthwaveBackdrop(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    ctx.save();

    // Giant neon synthwave sun at center horizon
    const sunX = CANVAS_WIDTH / 2;
    const sunY = CANVAS_HEIGHT / 2 - 10;
    const sunRadius = 75;

    const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
    sunGrad.addColorStop(0, '#ffbe0b');
    sunGrad.addColorStop(0.6, '#ff007f');
    sunGrad.addColorStop(1, '#7928ca');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal dark sun stripes
    ctx.fillStyle = '#090310';
    for (let i = 0; i < 7; i++) {
      const stripeY = sunY + 8 + i * 9;
      const stripeH = 2 + i * 0.8;
      ctx.fillRect(sunX - sunRadius - 10, stripeY, (sunRadius + 10) * 2, stripeH);
    }

    // Moving horizon line
    ctx.strokeStyle = 'rgba(255, 42, 133, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, sunY + 6);
    ctx.lineTo(CANVAS_WIDTH, sunY + 6);
    ctx.stroke();

    ctx.restore();
  }

  private drawBoundaries(engine: GameEngine) {
    const ctx = this.ctx;
    const theme = engine.currentTheme;
    const tickSpacing = 36;
    const offset = (engine.distanceTraveled) % tickSpacing;

    ctx.save();

    // Ceiling solid bar
    ctx.fillStyle = '#090b16';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CEILING_Y);

    // Floor solid bar
    ctx.fillStyle = '#090b16';
    ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_Y);

    // Glow line on Ceiling
    ctx.shadowColor = theme.ceilingFloorColor;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = theme.ceilingFloorColor;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, CEILING_Y);
    ctx.lineTo(CANVAS_WIDTH, CEILING_Y);
    ctx.stroke();

    // Glow line on Floor
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(CANVAS_WIDTH, FLOOR_Y);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Moving tick marks / hazard slashes on ceiling and floor
    ctx.strokeStyle = theme.gridLineColor;
    ctx.lineWidth = 2;

    // Ceiling ticks
    for (let x = -offset; x < CANVAS_WIDTH + tickSpacing; x += tickSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 15);
      ctx.lineTo(x + 12, CEILING_Y - 4);
      ctx.stroke();
    }

    // Floor ticks
    for (let x = -offset; x < CANVAS_WIDTH + tickSpacing; x += tickSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y + 4);
      ctx.lineTo(x + 12, FLOOR_Y + 22);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawFinishLine(engine: GameEngine) {
    const level = engine.currentChallengeLevel;
    if (!level) return;

    const remainingDist = level.lengthInMeters - engine.distanceTraveled;
    const finishX = CANVAS_WIDTH + remainingDist;

    if (finishX < CANVAS_WIDTH + 200 && finishX > -100) {
      const ctx = this.ctx;
      ctx.save();
      // Glowing checkered portal finish line
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(finishX, CEILING_Y);
      ctx.lineTo(finishX, FLOOR_Y);
      ctx.stroke();

      // Checkered pattern
      const checkSize = 16;
      for (let y = CEILING_Y; y < FLOOR_Y; y += checkSize) {
        ctx.fillStyle = ((Math.floor(y / checkSize) % 2 === 0)) ? '#00f0ff' : '#ff007f';
        ctx.fillRect(finishX - 8, y, 16, checkSize);
      }

      // Finish banner text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FINISH', finishX, CEILING_Y + 30);

      ctx.restore();
    }
  }

  private drawObstacles(engine: GameEngine, time: number) {
    const ctx = this.ctx;

    for (const obs of engine.obstacles) {
      if (obs.x + obs.width < -50 || obs.x > CANVAS_WIDTH + 50) continue;

      ctx.save();

      switch (obs.type) {
        case 'spike':
        case 'double_spike':
          this.drawPixelSpike(obs);
          break;
        case 'block':
          this.drawPixelBlock(obs);
          break;
        case 'moving_barrier':
          this.drawMovingBarrier(obs, time);
          break;
        case 'laser_gate':
          this.drawLaserGate(obs, time);
          break;
        case 'floating_block':
          this.drawFloatingBlock(obs, time);
          break;
      }

      ctx.restore();
    }
  }

  private drawPixelSpike(obs: Obstacle) {
    const ctx = this.ctx;
    const isFloor = obs.surface === 'floor';
    const color = obs.color || '#ff0055';

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;

    ctx.beginPath();
    if (isFloor) {
      // Floor spike points upward
      ctx.moveTo(obs.x, obs.y + obs.height);
      ctx.lineTo(obs.x + obs.width / 2, obs.y);
      ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
    } else {
      // Ceiling spike points downward
      ctx.moveTo(obs.x, obs.y);
      ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height);
      ctx.lineTo(obs.x + obs.width, obs.y);
    }
    ctx.closePath();
    ctx.fill();

    // Sharp pixel inner core highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (isFloor) {
      ctx.moveTo(obs.x + obs.width / 2 - 2, obs.y + obs.height);
      ctx.lineTo(obs.x + obs.width / 2, obs.y + 4);
      ctx.lineTo(obs.x + obs.width / 2 + 2, obs.y + obs.height);
    } else {
      ctx.moveTo(obs.x + obs.width / 2 - 2, obs.y);
      ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height - 4);
      ctx.lineTo(obs.x + obs.width / 2 + 2, obs.y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawPixelBlock(obs: Obstacle) {
    const ctx = this.ctx;
    const color = obs.color || '#7000ff';

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#140c2e';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

    // Inner tech crosses / pixel diagonal pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);

    ctx.restore();
  }

  private drawMovingBarrier(obs: Obstacle, time: number) {
    const ctx = this.ctx;
    const color = obs.color || '#00e5ff';

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    // Main barrier body
    ctx.fillStyle = '#0c1a2e';
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

    // Animated central energy core
    const pulse = 0.5 + Math.sin(time * 8) * 0.5;
    ctx.fillStyle = `rgba(0, 229, 255, ${0.4 + pulse * 0.5})`;
    ctx.fillRect(obs.x + 6, obs.y + 6, obs.width - 12, obs.height - 12);

    // Direction arrow indicators
    ctx.fillStyle = '#ffffff';
    const midY = obs.y + obs.height / 2;
    ctx.fillRect(obs.x + obs.width / 2 - 3, midY - 6, 6, 3);
    ctx.fillRect(obs.x + obs.width / 2 - 3, midY + 4, 6, 3);

    ctx.restore();
  }

  private drawLaserGate(obs: Obstacle, time: number) {
    const ctx = this.ctx;
    const isWarning = obs.laserState === 'warning';
    const isActive = obs.laserState === 'active';
    const color = isActive ? (obs.color || '#ff0077') : '#ffea00';

    ctx.save();

    // Laser emitter brackets at top and bottom of gate
    ctx.fillStyle = '#222';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Top and bottom emitter nozzles
    ctx.fillRect(obs.x - 4, obs.y, obs.width + 8, 8);
    ctx.strokeRect(obs.x - 4, obs.y, obs.width + 8, 8);

    ctx.fillRect(obs.x - 4, obs.y + obs.height - 8, obs.width + 8, 8);
    ctx.strokeRect(obs.x - 4, obs.y + obs.height - 8, obs.width + 8, 8);

    if (isActive) {
      // Intense lethal beam
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;

      // Outer laser aura
      ctx.fillStyle = `rgba(255, 0, 119, ${0.4 + Math.sin(time * 20) * 0.3})`;
      ctx.fillRect(obs.x - 2, obs.y + 8, obs.width + 4, obs.height - 16);

      // Core blinding beam
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obs.x + 3, obs.y + 8, obs.width - 6, obs.height - 16);
    } else if (isWarning) {
      // Flashing dotted warning line
      ctx.strokeStyle = `rgba(255, 234, 0, ${0.5 + Math.sin(time * 18) * 0.5})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.width / 2, obs.y + 8);
      ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height - 8);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawFloatingBlock(obs: Obstacle, time: number) {
    const ctx = this.ctx;
    const color = obs.color || '#9333ea';

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    // Floating body
    ctx.fillStyle = '#1c0e33';
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

    // Glowing core crystal
    const pulse = 0.5 + Math.sin(time * 5 + obs.x) * 0.5;
    ctx.fillStyle = `rgba(147, 51, 234, ${0.3 + pulse * 0.4})`;
    ctx.fillRect(obs.x + 8, obs.y + 8, obs.width - 16, obs.height - 16);

    ctx.restore();
  }

  private drawPlayer(p: Player, time: number, accentGlow: string) {
    const ctx = this.ctx;
    const skinDef = CHARACTER_SKINS.find(s => s.id === p.skin) || CHARACTER_SKINS[0];

    // 1. Draw motion trail
    for (let i = p.trail.length - 1; i >= 0; i--) {
      const t = p.trail[i];
      if (t.alpha <= 0.05) continue;

      ctx.save();
      ctx.translate(t.x + p.width / 2, t.y + p.height / 2);
      ctx.rotate(t.rotation);
      ctx.fillStyle = skinDef.primaryColor;
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    }

    // 2. Draw Active Character Sprite
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    ctx.rotate(p.rotation);
    ctx.scale(p.squashX, p.squashY);

    // Glow aura
    ctx.shadowColor = skinDef.glowColor;
    ctx.shadowBlur = 14;

    switch (p.skin) {
      case 'cube':
        this.renderCubeSkin(p, skinDef, time);
        break;
      case 'robot':
        this.renderRobotSkin(p, skinDef, time);
        break;
      case 'astro':
        this.renderAstroSkin(p, skinDef, time);
        break;
      case 'phantom':
        this.renderPhantomSkin(p, skinDef, time);
        break;
      case 'prism':
        this.renderPrismSkin(p, skinDef, time);
        break;
    }

    ctx.restore();
  }

  private renderCubeSkin(p: Player, skin: typeof CHARACTER_SKINS[0], time: number) {
    const ctx = this.ctx;
    const half = p.width / 2;

    // Main glowing body
    ctx.fillStyle = '#061320';
    ctx.fillRect(-half, -half, p.width, p.height);

    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(-half, -half, p.width, p.height);

    // Inner glowing core
    const coreSize = 10;
    const pulse = 0.7 + Math.sin(time * 10) * 0.3;
    ctx.fillStyle = `rgba(0, 240, 255, ${pulse})`;
    ctx.fillRect(-coreSize / 2, -coreSize / 2, coreSize, coreSize);

    // White spark in core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -2, 4, 4);
  }

  private renderRobotSkin(p: Player, skin: typeof CHARACTER_SKINS[0], time: number) {
    const ctx = this.ctx;
    const half = p.width / 2;

    // Body
    ctx.fillStyle = '#081c10';
    ctx.fillRect(-half, -half, p.width, p.height);

    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(-half, -half, p.width, p.height);

    // Robot visor / glowing eye scanner
    const eyeX = Math.sin(time * 6) * 4;
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-half + 4, -4, p.width - 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(eyeX - 2, -3, 4, 6);

    // Antenna on top
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(0, -half - 5);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -half - 7, 4, 4);
  }

  private renderAstroSkin(p: Player, skin: typeof CHARACTER_SKINS[0], time: number) {
    const ctx = this.ctx;
    const half = p.width / 2;

    // Helmet body
    ctx.fillStyle = '#1c0b12';
    ctx.fillRect(-half, -half, p.width, p.height);

    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(-half, -half, p.width, p.height);

    // Golden reflective visor
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-half + 5, -half + 5, p.width - 10, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-half + 7, -half + 7, 4, 4);

    // Thruster pack
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(-half - 4, -4, 4, 8);
  }

  private renderPhantomSkin(p: Player, skin: typeof CHARACTER_SKINS[0], time: number) {
    const ctx = this.ctx;
    const half = p.width / 2;

    // Ghostly rounded pixel body
    ctx.fillStyle = '#1e0f33';
    ctx.fillRect(-half, -half, p.width, p.height);

    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(-half, -half, p.width, p.height);

    // Cute glowing ghost eyes
    ctx.fillStyle = '#e9d5ff';
    ctx.fillRect(-half + 6, -4, 4, 6);
    ctx.fillRect(half - 10, -4, 4, 6);
  }

  private renderPrismSkin(p: Player, skin: typeof CHARACTER_SKINS[0], time: number) {
    const ctx = this.ctx;
    const half = p.width / 2;

    // Rainbow crystal facet
    const hue = (time * 120) % 360;
    ctx.fillStyle = `hsl(${hue}, 85%, 25%)`;
    ctx.fillRect(-half, -half, p.width, p.height);

    ctx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
    ctx.lineWidth = 3;
    ctx.strokeRect(-half, -half, p.width, p.height);

    // Diamond cross inside
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -half + 5);
    ctx.lineTo(half - 5, 0);
    ctx.lineTo(0, half - 5);
    ctx.lineTo(-half + 5, 0);
    ctx.closePath();
    ctx.fill();
  }

  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;

      if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Pixel square / spark
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }
  }

  private drawFloatingTexts(engine: GameEngine) {
    const ctx = this.ctx;

    for (const ft of engine.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${Math.round(18 * ft.scale)}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
