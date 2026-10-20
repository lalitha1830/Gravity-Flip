import React, { useRef, useEffect } from 'react';
import { X, Lock, Check } from 'lucide-react';
import { SkinType, GameStats } from '../types/game';
import { CHARACTER_SKINS } from '../game/themes';
import { checkSkinUnlocked } from '../utils/storage';
import { soundManager } from '../audio/soundManager';

interface SkinsModalProps {
  activeSkin: SkinType;
  stats: GameStats;
  onSelectSkin: (skin: SkinType) => void;
  onClose: () => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  activeSkin,
  stats,
  onSelectSkin,
  onClose
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-pixel text-xl text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
              CHARACTER SKINS
            </h2>
            <p className="font-tech text-xs text-slate-400 mt-1">
              Unlock unique pixel avatars by reaching score milestones
            </p>
          </div>
          <button
            onClick={() => { soundManager.playClick(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Skins Grid */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
          {CHARACTER_SKINS.map((skin) => {
            const isUnlocked = checkSkinUnlocked(skin.id, stats);
            const isSelected = activeSkin === skin.id;

            return (
              <div
                key={skin.id}
                onClick={() => {
                  if (!isUnlocked) return;
                  soundManager.playClick();
                  onSelectSkin(skin.id);
                }}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  !isUnlocked
                    ? 'opacity-50 bg-slate-950/40 border-slate-800 cursor-not-allowed'
                    : isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3.5 mb-3">
                  {/* Skin Avatar Preview Canvas */}
                  <SkinAvatarCanvas skinId={skin.id} />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-pixel text-xs text-slate-200">
                        {skin.name}
                      </h3>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[9px] font-pixel text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                          <Check size={10} /> ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="font-tech text-xs text-slate-400 mt-1 line-clamp-2">
                      {skin.description}
                    </p>
                  </div>
                </div>

                {/* Status / Requirement */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-pixel text-slate-400 flex items-center gap-1">
                    {!isUnlocked ? (
                      <>
                        <Lock size={12} className="text-amber-400" />
                        <span className="text-amber-400/90">{skin.unlockRequirement}</span>
                      </>
                    ) : (
                      <span className="text-emerald-400">UNLOCKED</span>
                    )}
                  </span>

                  {isUnlocked && !isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClick();
                        onSelectSkin(skin.id);
                      }}
                      className="text-[10px] font-pixel text-cyan-400 hover:underline cursor-pointer"
                    >
                      EQUIP
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

// Mini animated avatar preview canvas
const SkinAvatarCanvas: React.FC<{ skinId: SkinType }> = ({ skinId }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const skinDef = CHARACTER_SKINS.find(s => s.id === skinId) || CHARACTER_SKINS[0];

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Float animation
      const floatY = Math.sin(time * 3) * 3;
      ctx.translate(0, floatY);

      // Glow
      ctx.shadowColor = skinDef.glowColor;
      ctx.shadowBlur = 10;

      // Draw character box
      ctx.fillStyle = '#08121f';
      ctx.fillRect(-12, -12, 24, 24);

      if (skinId === 'prism') {
        const hue = (time * 120) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
      } else {
        ctx.strokeStyle = skinDef.primaryColor;
      }
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-12, -12, 24, 24);

      // Inner details
      ctx.fillStyle = '#ffffff';
      if (skinId === 'robot') {
        ctx.fillRect(-6, -2, 12, 4);
      } else if (skinId === 'astro') {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(-8, -6, 16, 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-6, -4, 4, 3);
      } else if (skinId === 'phantom') {
        ctx.fillRect(-6, -3, 3, 5);
        ctx.fillRect(3, -3, 3, 5);
      } else {
        ctx.fillRect(-3, -3, 6, 6);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [skinId]);

  return (
    <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
      <canvas ref={canvasRef} width={44} height={44} className="w-11 h-11 block" />
    </div>
  );
};
