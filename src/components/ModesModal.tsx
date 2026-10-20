import React from 'react';
import { X, Flame, Clock, Target, CheckCircle2, Lock } from 'lucide-react';
import { GameMode, ChallengeLevel, GameStats } from '../types/game';
import { CHALLENGE_LEVELS } from '../game/levels';
import { soundManager } from '../audio/soundManager';

interface ModesModalProps {
  currentMode: GameMode;
  stats: GameStats;
  onSelectMode: (mode: GameMode, challengeLevel?: ChallengeLevel) => void;
  onClose: () => void;
}

export const ModesModal: React.FC<ModesModalProps> = ({
  currentMode,
  stats,
  onSelectMode,
  onClose
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <h2 className="font-pixel text-xl text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
              SELECT MODE
            </h2>
          </div>
          <button
            onClick={() => { soundManager.playClick(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Mode 1: Endless */}
          <div
            onClick={() => {
              soundManager.playClick();
              onSelectMode('endless');
            }}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              currentMode === 'endless'
                ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Flame size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-pixel text-sm text-slate-100">ENDLESS RUN</h3>
                  <span className="text-[9px] font-pixel bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                    DEFAULT
                  </span>
                </div>
                <p className="font-tech text-xs text-slate-400 mt-1">
                  Survive as long as possible. Dynamic speed and progressive obstacles.
                </p>
              </div>
            </div>
            <div className="text-right pl-3">
              <span className="text-[10px] font-pixel text-slate-500 block">RECORD</span>
              <span className="font-pixel text-cyan-400 font-bold text-sm">
                {stats.endlessHighScore}
              </span>
            </div>
          </div>

          {/* Mode 2: Time Attack */}
          <div
            onClick={() => {
              soundManager.playClick();
              onSelectMode('time_attack');
            }}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              currentMode === 'time_attack'
                ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Clock size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-pixel text-sm text-slate-100">TIME ATTACK (30s)</h3>
                </div>
                <p className="font-tech text-xs text-slate-400 mt-1">
                  Survive 30 seconds of high-speed gravity flips. Maximize your dodges.
                </p>
              </div>
            </div>
            <div className="text-right pl-3">
              <span className="text-[10px] font-pixel text-slate-500 block">BEST</span>
              <span className="font-pixel text-amber-400 font-bold text-sm">
                {stats.timeAttackHighScore}
              </span>
            </div>
          </div>

          {/* Mode 3: Handcrafted Challenges */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-purple-400" />
              <h3 className="font-pixel text-xs text-purple-300">
                CHALLENGE GAUNTLET ({stats.completedLevels.length}/8 CLEARED)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CHALLENGE_LEVELS.map((level) => {
                const isCompleted = stats.completedLevels.includes(level.id);
                // Level 1 is always unlocked; subsequent unlocked if previous completed
                const isUnlocked = level.id === 1 || stats.completedLevels.includes(level.id - 1);

                return (
                  <button
                    key={level.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (!isUnlocked) return;
                      soundManager.playClick();
                      onSelectMode('challenge', level);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      !isUnlocked
                        ? 'opacity-40 bg-slate-950/40 border-slate-800 cursor-not-allowed'
                        : isCompleted
                        ? 'bg-purple-950/30 border-purple-500/50 hover:border-purple-400 cursor-pointer'
                        : 'bg-slate-950/70 border-slate-800 hover:border-purple-400 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-pixel text-[11px] text-slate-200">
                          LVL {level.id}
                        </span>
                        {isCompleted && (
                          <CheckCircle2 size={13} className="text-emerald-400" />
                        )}
                      </div>
                      <p className="font-tech text-[11px] text-slate-400 truncate max-w-[170px]">
                        {level.subtitle}
                      </p>
                    </div>

                    {!isUnlocked ? (
                      <Lock size={15} className="text-slate-500" />
                    ) : (
                      <span className="text-[10px] font-pixel text-purple-400">
                        PLAY
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
