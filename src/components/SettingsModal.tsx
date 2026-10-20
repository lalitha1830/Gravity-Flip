import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Eye, Palette, AlertTriangle, Check } from 'lucide-react';
import { GameSettings, ThemeType } from '../types/game';
import { THEMES } from '../game/themes';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetScores: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetScores,
  onClose
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const themesList = Object.values(THEMES);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="font-pixel text-xl text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
            SETTINGS
          </h2>
          <button
            onClick={() => { soundManager.playClick(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          
          {/* Section: Audio */}
          <div className="space-y-4">
            <h3 className="font-pixel text-xs text-slate-400 flex items-center gap-2">
              <Volume2 size={14} className="text-cyan-400" /> AUDIO CONTROLS
            </h3>

            {/* Sound FX Toggle & Volume */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-pixel text-xs text-slate-200 block">SOUND EFFECTS</span>
                  <span className="font-tech text-xs text-slate-500">Chirps, explosions, and UI sounds</span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSettings({ soundEnabled: !settings.soundEnabled });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-pixel text-xs transition cursor-pointer ${
                    settings.soundEnabled ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {settings.soundEnabled && (
                <div className="flex items-center gap-3 pt-1">
                  <VolumeX size={14} className="text-slate-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.sfxVolume}
                    onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <Volume2 size={14} className="text-cyan-400" />
                </div>
              )}
            </div>

            {/* Chiptune Music Toggle & Volume */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-pixel text-xs text-slate-200 block">RETRO MUSIC</span>
                  <span className="font-tech text-xs text-slate-500">Procedural 8-bit synthwave soundtrack</span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSettings({ musicEnabled: !settings.musicEnabled });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-pixel text-xs transition cursor-pointer ${
                    settings.musicEnabled ? 'bg-pink-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.musicEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {settings.musicEnabled && (
                <div className="flex items-center gap-3 pt-1">
                  <Music size={14} className="text-slate-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.musicVolume}
                    onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                  <Music size={14} className="text-pink-400" />
                </div>
              )}
            </div>
          </div>

          {/* Section: Visuals & Accessibility */}
          <div className="space-y-4">
            <h3 className="font-pixel text-xs text-slate-400 flex items-center gap-2">
              <Eye size={14} className="text-cyan-400" /> VISUALS & ACCESSIBILITY
            </h3>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
              {/* Screen Shake */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-pixel text-xs text-slate-200 block">SCREEN SHAKE</span>
                  <span className="font-tech text-xs text-slate-500">Camera rumble on impact</span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSettings({ screenShake: !settings.screenShake });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-pixel text-xs transition cursor-pointer ${
                    settings.screenShake ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.screenShake ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="font-pixel text-xs text-slate-200 block">REDUCED MOTION</span>
                  <span className="font-tech text-xs text-slate-500">Disables flashing and camera shakes</span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSettings({ reducedMotion: !settings.reducedMotion });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-pixel text-xs transition cursor-pointer ${
                    settings.reducedMotion ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.reducedMotion ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* CRT Scanlines Overlay */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="font-pixel text-xs text-slate-200 block">CRT SCANLINES</span>
                  <span className="font-tech text-xs text-slate-500">Vintage arcade monitor filter</span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSettings({ scanlines: !settings.scanlines });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-pixel text-xs transition cursor-pointer ${
                    settings.scanlines ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.scanlines ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Section: Themes */}
          <div className="space-y-4">
            <h3 className="font-pixel text-xs text-slate-400 flex items-center gap-2">
              <Palette size={14} className="text-cyan-400" /> VISUAL THEMES
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themesList.map((th) => {
                const isSelected = settings.theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      soundManager.playClick();
                      onUpdateSettings({ theme: th.id as ThemeType });
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs text-slate-200">{th.name}</span>
                        {isSelected && <Check size={12} className="text-cyan-400" />}
                      </div>
                      <span className="font-tech text-[11px] text-slate-400 block mt-0.5">
                        {th.tagline}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: th.ceilingFloorColor }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: th.spikeColor }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danger Zone: Reset Scores */}
          <div className="pt-4 border-t border-slate-800">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-4 bg-slate-950/80 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400 font-pixel text-xs rounded-xl transition cursor-pointer"
              >
                RESET HIGH SCORES & PROGRESS
              </button>
            ) : (
              <div className="p-4 bg-red-950/40 border border-red-500/80 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle size={18} />
                  <span className="font-pixel text-xs">CONFIRM RESET?</span>
                </div>
                <p className="font-tech text-xs text-slate-300">
                  This will permanently clear your high scores, cleared challenges, and unlocked characters.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onResetScores();
                      setShowResetConfirm(false);
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs rounded-lg cursor-pointer"
                  >
                    YES, RESET
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs rounded-lg cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
