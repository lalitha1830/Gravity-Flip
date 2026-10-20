import React, { useEffect, useMemo } from 'react';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenSkins: () => void;
}

const MOTIVATIONAL_QUOTES = [
  'Almost!',
  'One more try?',
  'You can beat that.',
  'Ready for another run?',
  'Gravity is tricky!',
  'Timing is everything.',
  'Keep your eyes on the ceiling!',
  'Instant retry available.'
];

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewRecord,
  onRestart,
  onMainMenu,
  onOpenSkins
}) => {
  const quote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }, []);

  // Listen to Space / Enter for instant retry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        soundManager.playClick();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-pink-500/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(236,72,153,0.4)] text-center flex flex-col items-center">
        
        {/* Title */}
        {isNewRecord ? (
          <div className="mb-3 flex flex-col items-center gap-1">
            <span className="font-pixel text-xs text-yellow-400 flex items-center gap-1.5 animate-bounce">
              <Trophy size={14} /> NEW RECORD!
            </span>
            <h2 className="font-pixel text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-300 via-pink-400 to-cyan-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
              PERSONAL BEST!
            </h2>
          </div>
        ) : (
          <h2 className="font-pixel text-2xl sm:text-3xl font-bold text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
            RUN OVER
          </h2>
        )}

        {/* Motivational quote */}
        <p className="font-tech text-sm text-slate-400 mb-6 italic">
          &ldquo;{quote}&rdquo;
        </p>

        {/* Score Board */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-pixel text-slate-400 mb-1">SCORE</span>
            <span className="font-pixel text-2xl sm:text-3xl text-cyan-400 font-bold">
              {score}
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-slate-800">
            <span className="text-[10px] font-pixel text-slate-400 mb-1">BEST</span>
            <span className="font-pixel text-2xl sm:text-3xl text-pink-400 font-bold">
              {highScore}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => { soundManager.playClick(); onRestart(); }}
            className="w-full py-3.5 px-6 bg-linear-to-r from-pink-500 hover:from-pink-400 to-cyan-500 hover:to-cyan-400 text-slate-950 font-pixel text-sm sm:text-base font-bold rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <RotateCcw size={18} />
            TRY AGAIN (SPACE)
          </button>

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={() => { soundManager.playClick(); onOpenSkins(); }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-pixel text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-cyan-400" />
              SKINS
            </button>
            <button
              onClick={() => { soundManager.playClick(); onMainMenu(); }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 font-pixel text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home size={14} />
              MENU
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
