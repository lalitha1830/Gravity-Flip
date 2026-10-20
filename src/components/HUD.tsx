import React from 'react';
import { GameMode, ChallengeLevel } from '../types/game';
import { Pause, Play, Volume2, VolumeX, ArrowDown, ArrowUp } from 'lucide-react';

interface HUDProps {
  score: number;
  highScore: number;
  mode: GameMode;
  timeRemaining?: number;
  challengeLevel?: ChallengeLevel | null;
  distanceTraveled?: number;
  gravityDir: 1 | -1;
  isPaused: boolean;
  soundEnabled: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
  milestoneMessage: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  mode,
  timeRemaining = 0,
  challengeLevel,
  distanceTraveled = 0,
  gravityDir,
  isPaused,
  soundEnabled,
  onTogglePause,
  onToggleSound,
  milestoneMessage
}) => {
  const challengeProgress = challengeLevel
    ? Math.min(100, Math.round((distanceTraveled / challengeLevel.lengthInMeters) * 100))
    : 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10 select-none">
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Score & Record */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-baseline gap-3">
            <span className="font-pixel text-3xl sm:text-4xl text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] tracking-wider">
              {score.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-pixel text-slate-400">
              BEST: <span className="text-pink-400 font-bold">{highScore}</span>
            </span>
          </div>

          {/* Mode Specific Badges */}
          {mode === 'time_attack' && (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/40 px-2.5 py-1 rounded backdrop-blur-xs w-fit">
              <span className="text-[10px] font-pixel text-amber-400">TIME:</span>
              <span className={`text-sm font-pixel font-bold ${timeRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-amber-300'}`}>
                {timeRemaining.toFixed(1)}s
              </span>
            </div>
          )}

          {mode === 'challenge' && challengeLevel && (
            <div className="flex flex-col gap-1 bg-slate-900/80 border border-purple-500/40 p-2 rounded backdrop-blur-xs w-48 sm:w-56">
              <div className="flex justify-between text-[9px] font-pixel text-purple-300">
                <span className="truncate">{challengeLevel.title.split(':')[1] || challengeLevel.title}</span>
                <span>{challengeProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-purple-800">
                <div 
                  className="bg-linear-to-r from-purple-500 to-pink-500 h-full transition-all duration-100 ease-out"
                  style={{ width: `${challengeProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Center: Milestone notification banner */}
        {milestoneMessage && (
          <div className="absolute left-1/2 -translate-x-1/2 top-14 animate-bounce">
            <div className="bg-cyan-500/20 border-2 border-cyan-400 px-4 py-1.5 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.6)] backdrop-blur-sm">
              <span className="font-pixel text-xs sm:text-sm text-cyan-300 tracking-wider">
                {milestoneMessage}
              </span>
            </div>
          </div>
        )}

        {/* Right: Controls & Gravity direction */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Gravity direction pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-2.5 py-1.5 rounded text-[10px] font-pixel text-slate-300">
            <span>GRAVITY</span>
            {gravityDir === 1 ? (
              <span className="flex items-center text-cyan-400 font-bold">
                <ArrowDown size={14} className="animate-bounce" /> FLOOR
              </span>
            ) : (
              <span className="flex items-center text-pink-400 font-bold">
                <ArrowUp size={14} className="animate-bounce" /> CEILING
              </span>
            )}
          </div>

          {/* Quick Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 rounded transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-red-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            aria-label="Pause Game"
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 rounded transition cursor-pointer"
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="flex justify-center text-center opacity-70">
        <span className="text-[10px] font-pixel text-slate-400 bg-slate-950/60 px-3 py-1 rounded border border-slate-800 backdrop-blur-xs">
          SPACE / CLICK / TAP TO FLIP
        </span>
      </div>
    </div>
  );
};
