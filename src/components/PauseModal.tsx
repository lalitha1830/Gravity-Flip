import React from 'react';
import { Play, RotateCcw, Home, Sliders } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  onOpenSettings
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-100">
      <div className="w-full max-w-xs bg-slate-900 border border-cyan-500/60 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.3)] text-center flex flex-col items-center">
        
        <h2 className="font-pixel text-xl sm:text-2xl font-bold text-cyan-400 mb-6 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
          PAUSED
        </h2>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => { soundManager.playClick(); onResume(); }}
            className="w-full py-3 px-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-pixel text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={16} fill="currentColor" />
            RESUME
          </button>

          <button
            onClick={() => { soundManager.playClick(); onRestart(); }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-200 font-pixel text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            RESTART
          </button>

          <button
            onClick={() => { soundManager.playClick(); onOpenSettings(); }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-200 font-pixel text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sliders size={16} />
            SETTINGS
          </button>

          <button
            onClick={() => { soundManager.playClick(); onMainMenu(); }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-200 font-pixel text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={16} />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
