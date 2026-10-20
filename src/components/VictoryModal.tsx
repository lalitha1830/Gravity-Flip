import React from 'react';
import { Award, ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { GameMode, ChallengeLevel } from '../types/game';

interface VictoryModalProps {
  mode: GameMode;
  score: number;
  challengeLevel?: ChallengeLevel | null;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenSkins: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  mode,
  score,
  challengeLevel,
  hasNextLevel,
  onNextLevel,
  onRestart,
  onMainMenu,
  onOpenSkins
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(16,185,129,0.4)] text-center flex flex-col items-center">
        
        {/* Victory Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
          <Award size={30} />
        </div>

        {/* Title */}
        <h2 className="font-pixel text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-300 via-teal-200 to-cyan-400 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
          {mode === 'challenge' ? 'LEVEL CLEARED!' : 'SURVIVAL COMPLETE!'}
        </h2>

        <p className="font-tech text-sm text-slate-300 mb-6">
          {mode === 'challenge' && challengeLevel
            ? `${challengeLevel.title} conquered with precision!`
            : `Time Attack survived with ${score} points!`}
        </p>

        {/* Level 8 special unlock notice */}
        {challengeLevel?.id === 8 && (
          <div className="w-full bg-amber-500/10 border border-amber-500/50 p-2.5 rounded-xl mb-4 text-center">
            <span className="font-pixel text-[10px] text-amber-300 flex items-center justify-center gap-1.5">
              <Sparkles size={12} /> UNLOCKED CHROMA GEM SKIN!
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          {mode === 'challenge' && hasNextLevel && (
            <button
              onClick={() => { soundManager.playClick(); onNextLevel(); }}
              className="w-full py-3.5 px-6 bg-linear-to-r from-emerald-500 hover:from-emerald-400 to-cyan-500 hover:to-cyan-400 text-slate-950 font-pixel text-xs sm:text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              NEXT LEVEL <ArrowRight size={16} />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={() => { soundManager.playClick(); onRestart(); }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-400 text-slate-300 font-pixel text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              REPLAY
            </button>
            <button
              onClick={() => { soundManager.playClick(); onOpenSkins(); }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-400 text-slate-300 font-pixel text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-cyan-400" />
              SKINS
            </button>
          </div>

          <button
            onClick={() => { soundManager.playClick(); onMainMenu(); }}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 font-pixel text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home size={14} />
            MAIN MENU
          </button>
        </div>

      </div>
    </div>
  );
};
