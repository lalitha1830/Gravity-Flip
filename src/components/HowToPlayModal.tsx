import React from 'react';
import { X, ArrowUpDown, Smartphone, Monitor, ShieldAlert } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HowToPlayModalProps {
  onClose: () => void;
  onPlay: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  onClose,
  onPlay
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="font-pixel text-xl text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
            HOW TO PLAY
          </h2>
          <button
            onClick={() => { soundManager.playClick(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          
          {/* Core concept banner */}
          <div className="p-4 bg-linear-to-r from-cyan-950/50 to-purple-950/50 border border-cyan-500/40 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-400/50 shrink-0">
              <ArrowUpDown size={28} />
            </div>
            <div>
              <h3 className="font-pixel text-xs text-cyan-300">ONE TAP. TWO WORLDS.</h3>
              <p className="font-tech text-sm text-slate-200 mt-1">
                Your character continuously moves forward. Tap or press Space to invert gravity between the floor and ceiling!
              </p>
            </div>
          </div>

          {/* Controls Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Desktop */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-slate-200">
                <Monitor size={16} className="text-cyan-400" />
                <span className="font-pixel text-xs">KEYBOARD / MOUSE</span>
              </div>
              <ul className="font-tech text-xs text-slate-400 space-y-1.5">
                <li><span className="text-cyan-300 font-pixel text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">SPACE</span> or <span className="text-cyan-300 font-pixel text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">UP</span> : Flip Gravity</li>
                <li><span className="text-cyan-300 font-pixel text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">LEFT CLICK</span> : Flip Gravity</li>
                <li><span className="text-cyan-300 font-pixel text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">ESC / P</span> : Pause / Resume</li>
                <li><span className="text-cyan-300 font-pixel text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">ENTER</span> : Restart or Start</li>
              </ul>
            </div>

            {/* Mobile */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-slate-200">
                <Smartphone size={16} className="text-pink-400" />
                <span className="font-pixel text-xs">MOBILE / TOUCH</span>
              </div>
              <ul className="font-tech text-xs text-slate-400 space-y-1.5">
                <li><strong className="text-pink-300">Tap anywhere</strong> on screen to invert gravity.</li>
                <li>Instant response with zero latency.</li>
                <li>Tap [TRY AGAIN] button after collision to jump back into action immediately.</li>
              </ul>
            </div>
          </div>

          {/* Hazards & Obstacles Breakdown */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-200">
              <ShieldAlert size={16} className="text-amber-400" />
              <span className="font-pixel text-xs">HAZARDS GUIDE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-tech text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rotate-45 shrink-0" />
                <span><strong>Spikes:</strong> Deadly on contact. Stick to opposite surface.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-600 border border-purple-400 shrink-0" />
                <span><strong>Blocks:</strong> Rectangular barricades forcing you to switch.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-cyan-400 border border-white shrink-0 animate-pulse" />
                <span><strong>Moving Barriers:</strong> Oscillate vertically. Time your flip.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-pink-500 shadow-[0_0_8px_#ff0077] shrink-0" />
                <span><strong>Laser Gates:</strong> Warning flash before firing. Dodge beam!</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Play Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              onPlay();
            }}
            className="w-full py-3.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-pixel text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
          >
            LET&rsquo;S PLAY!
          </button>
        </div>

      </div>
    </div>
  );
};
