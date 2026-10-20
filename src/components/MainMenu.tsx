import React, { useEffect, useRef } from 'react';
import { Play, Sparkles, Sliders, HelpCircle, Trophy, Zap } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { GameStats, SkinType } from '../types/game';
import { CHARACTER_SKINS } from '../game/themes';

interface MainMenuProps {
  stats: GameStats;
  selectedSkin: SkinType;
  onPlay: () => void;
  onOpenModes: () => void;
  onOpenSkins: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  selectedSkin,
  onPlay,
  onOpenModes,
  onOpenSkins,
  onOpenHowToPlay,
  onOpenSettings
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated mini-preview of character flipping between floor and ceiling
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let y = 60;
    let vy = 0;
    let gravity = 1; // 1 = down, -1 = up
    let rot = 0;
    const skinDef = CHARACTER_SKINS.find(s => s.id === selectedSkin) || CHARACTER_SKINS[0];

    const floor = 80;
    const ceil = 20;

    let timer = 0;

    const renderPreview = () => {
      timer += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Floor and ceiling lines
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(10, ceil);
      ctx.lineTo(canvas.width - 10, ceil);
      ctx.moveTo(10, floor);
      ctx.lineTo(canvas.width - 10, floor);
      ctx.stroke();

      // Gravity flip cycle every 1.1s
      if (Math.sin(timer * 2.8) > 0.85 && vy === 0) {
        gravity = -gravity;
        vy = gravity * 3.5;
      }

      // Physics
      y += vy;
      rot += 0.08;

      if (gravity === 1 && y >= floor - 14) {
        y = floor - 14;
        vy = 0;
      } else if (gravity === -1 && y <= ceil + 2) {
        y = ceil + 2;
        vy = 0;
      }

      // Draw character
      ctx.save();
      ctx.translate(canvas.width / 2, y + 6);
      ctx.rotate(rot);
      ctx.fillStyle = skinDef.primaryColor;
      ctx.shadowColor = skinDef.glowColor;
      ctx.shadowBlur = 10;
      ctx.fillRect(-6, -6, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();

      animId = requestAnimationFrame(renderPreview);
    };

    renderPreview();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedSkin]);

  const handleStartPlay = () => {
    soundManager.playClick();
    onPlay();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-y-auto">
      {/* Top Header & High Score Badge */}
      <div className="w-full max-w-xl flex items-center justify-between text-xs font-pixel text-slate-400">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
          <Trophy size={14} className="text-yellow-400" />
          <span>BEST SCORE: <strong className="text-cyan-400">{stats.endlessHighScore}</strong></span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
          <Zap size={14} className="text-pink-400" />
          <span>CLEARED: <strong className="text-pink-400">{stats.completedLevels.length}/8</strong></span>
        </div>
      </div>

      {/* Hero Center Section */}
      <div className="flex flex-col items-center text-center my-auto py-4">
        {/* Animated Title */}
        <div className="relative mb-2">
          <h1 className="font-pixel text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-linear-to-b from-cyan-300 via-sky-400 to-indigo-500 drop-shadow-[0_0_25px_rgba(6,182,212,0.7)] animate-pulse">
            GRAVITY FLIP
          </h1>
          <div className="absolute -inset-1 blur-2xl bg-cyan-500/20 -z-10 rounded-full" />
        </div>

        {/* Subtitle */}
        <p className="font-tech text-base sm:text-xl text-slate-300 tracking-wider mb-6 font-semibold">
          &ldquo;One tap. Two worlds. Don&rsquo;t fall.&rdquo;
        </p>

        {/* Character Preview Canvas */}
        <div className="mb-8 p-1.5 bg-slate-950/70 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <canvas
            ref={previewCanvasRef}
            width={180}
            height={100}
            className="w-44 h-24 rounded-lg block"
          />
          <div className="text-[10px] font-pixel text-cyan-400/80 mt-1 pb-1">
            ACTIVE: {CHARACTER_SKINS.find(s => s.id === selectedSkin)?.name}
          </div>
        </div>

        {/* Primary Play Button */}
        <div className="flex flex-col items-center gap-3.5 w-full max-w-xs">
          <button
            onClick={handleStartPlay}
            className="w-full py-4 px-8 bg-linear-to-r from-cyan-500 hover:from-cyan-400 to-blue-600 hover:to-blue-500 text-slate-950 font-pixel text-lg sm:text-xl font-bold rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.9)] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play size={22} fill="currentColor" />
            PLAY NOW
          </button>

          {/* Secondary Action Grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={() => { soundManager.playClick(); onOpenModes(); }}
              className="py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-pink-500 text-slate-200 hover:text-pink-400 font-pixel text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={14} className="text-pink-400" />
              MODES
            </button>
            <button
              onClick={() => { soundManager.playClick(); onOpenSkins(); }}
              className="py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500 text-slate-200 hover:text-cyan-400 font-pixel text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} className="text-cyan-400" />
              SKINS
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={() => { soundManager.playClick(); onOpenHowToPlay(); }}
              className="py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-300 font-pixel text-[11px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle size={14} />
              HELP
            </button>
            <button
              onClick={() => { soundManager.playClick(); onOpenSettings(); }}
              className="py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-300 font-pixel text-[11px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sliders size={14} />
              SETTINGS
            </button>
          </div>
        </div>
      </div>

      {/* Footer Controls Quick Legend */}
      <div className="text-center text-[10px] font-pixel text-slate-500 pb-2">
        <span>PRESS <span className="text-slate-300">SPACE</span> OR <span className="text-slate-300">ENTER</span> TO PLAY</span>
      </div>
    </div>
  );
};
