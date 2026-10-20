/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GameState, 
  GameMode, 
  ChallengeLevel, 
  GameSettings, 
  GameStats, 
  SkinType 
} from './types/game';
import { 
  loadSettings, 
  saveSettings, 
  loadStats, 
  saveStats, 
  DEFAULT_STATS, 
  resetAllStorage 
} from './utils/storage';
import { soundManager } from './audio/soundManager';
import { CHALLENGE_LEVELS } from './game/levels';
import { GameEngine } from './game/engine';

import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { ModesModal } from './components/ModesModal';
import { SkinsModal } from './components/SkinsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Saved data
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [stats, setStats] = useState<GameStats>(() => loadStats());

  // Game state
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [currentChallengeLevel, setCurrentChallengeLevel] = useState<ChallengeLevel | null>(null);

  // In-game metrics
  const [score, setScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [gravityDir, setGravityDir] = useState<1 | -1>(1);
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);

  // Modals
  const [showModes, setShowModes] = useState(false);
  const [showSkins, setShowSkins] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const engineRef = useRef<GameEngine | null>(null);
  const milestoneTimeoutRef = useRef<number | null>(null);

  // Keep soundManager synced with current settings
  useEffect(() => {
    soundManager.updateSettings(
      settings.soundEnabled,
      settings.musicEnabled,
      settings.sfxVolume,
      settings.musicVolume
    );
  }, [settings]);

  // Persist settings changes
  const handleUpdateSettings = useCallback((newPartial: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Start a fresh game session
  const startGame = useCallback((mode: GameMode = 'endless', challengeLevel: ChallengeLevel | null = null) => {
    soundManager.resumeContext();
    setGameMode(mode);
    setCurrentChallengeLevel(challengeLevel);
    setScore(0);
    setIsNewRecord(false);
    setTimeRemaining(30);
    setDistanceTraveled(0);
    setMilestoneMessage(null);
    setGravityDir(1);

    // Close all open modals
    setShowModes(false);
    setShowSkins(false);
    setShowHowToPlay(false);
    setShowSettings(false);

    if (engineRef.current) {
      engineRef.current.reset(mode, challengeLevel);
      engineRef.current.player.skin = settings.selectedSkin;
    }

    setGameState('PLAYING');
  }, [settings.selectedSkin]);

  // Handle game over
  const handleGameOver = useCallback((finalScore: number) => {
    setStats((prevStats) => {
      let isPersonalBest = false;
      let newEndlessBest = prevStats.endlessHighScore;
      let newTimeAttackBest = prevStats.timeAttackHighScore;

      if (gameMode === 'endless' && finalScore > prevStats.endlessHighScore) {
        newEndlessBest = finalScore;
        isPersonalBest = true;
      } else if (gameMode === 'time_attack' && finalScore > prevStats.timeAttackHighScore) {
        newTimeAttackBest = finalScore;
        isPersonalBest = true;
      }

      setIsNewRecord(isPersonalBest);

      const updatedStats: GameStats = {
        ...prevStats,
        endlessHighScore: newEndlessBest,
        timeAttackHighScore: newTimeAttackBest,
        totalObstaclesPassed: prevStats.totalObstaclesPassed + finalScore,
        totalDeaths: prevStats.totalDeaths + 1
      };

      saveStats(updatedStats);
      return updatedStats;
    });

    setGameState('GAME_OVER');
  }, [gameMode]);

  // Handle victory (for Challenge Mode or Time Attack)
  const handleVictory = useCallback(() => {
    if (gameMode === 'challenge' && currentChallengeLevel) {
      setStats((prevStats) => {
        const completed = prevStats.completedLevels.includes(currentChallengeLevel.id)
          ? prevStats.completedLevels
          : [...prevStats.completedLevels, currentChallengeLevel.id];

        const updatedStats: GameStats = {
          ...prevStats,
          completedLevels: completed
        };
        saveStats(updatedStats);
        return updatedStats;
      });
    }

    setGameState('VICTORY');
  }, [gameMode, currentChallengeLevel]);

  // Handle Milestone popup
  const handleMilestone = useCallback((msg: string) => {
    setMilestoneMessage(msg);
    if (milestoneTimeoutRef.current) {
      clearTimeout(milestoneTimeoutRef.current);
    }
    milestoneTimeoutRef.current = window.setTimeout(() => {
      setMilestoneMessage(null);
    }, 1800);
  }, []);

  // Pause / Resume toggle
  const togglePause = useCallback(() => {
    if (gameState === 'PLAYING') {
      soundManager.playClick();
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      soundManager.playClick();
      setGameState('PLAYING');
    }
  }, [gameState]);

  // Quick sound toggle
  const toggleSound = useCallback(() => {
    handleUpdateSettings({ soundEnabled: !settings.soundEnabled });
  }, [handleUpdateSettings, settings.soundEnabled]);

  // Next level in Challenge mode
  const handleNextChallengeLevel = useCallback(() => {
    if (!currentChallengeLevel) return;
    const nextIdx = CHALLENGE_LEVELS.findIndex(l => l.id === currentChallengeLevel.id) + 1;
    if (nextIdx < CHALLENGE_LEVELS.length) {
      startGame('challenge', CHALLENGE_LEVELS[nextIdx]);
    } else {
      setGameState('MENU');
    }
  }, [currentChallengeLevel, startGame]);

  // Skin equip
  const handleSelectSkin = useCallback((skin: SkinType) => {
    handleUpdateSettings({ selectedSkin: skin });
    if (engineRef.current) {
      engineRef.current.player.skin = skin;
    }
  }, [handleUpdateSettings]);

  // Reset all scores & progress
  const handleResetScores = useCallback(() => {
    resetAllStorage();
    setStats(DEFAULT_STATS);
    setScore(0);
    setIsNewRecord(false);
  }, []);

  // Global key bindings
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
          e.preventDefault();
          togglePause();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, togglePause]);

  const activeHighScore = gameMode === 'time_attack' 
    ? stats.timeAttackHighScore 
    : stats.endlessHighScore;

  const hasNextLevel = currentChallengeLevel 
    ? currentChallengeLevel.id < CHALLENGE_LEVELS.length 
    : false;

  return (
    <div className="relative w-screen h-screen bg-[#060711] overflow-hidden flex items-center justify-center font-tech select-none touch-none">
      
      {/* Aspect Ratio Game Container */}
      <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-video flex items-center justify-center shadow-2xl">
        
        {/* Core Game Canvas */}
        <GameCanvas
          isPlaying={gameState === 'PLAYING'}
          isPaused={gameState === 'PAUSED'}
          gameMode={gameMode}
          challengeLevel={currentChallengeLevel}
          settings={settings}
          onScoreUpdate={setScore}
          onMilestone={handleMilestone}
          onGameOver={handleGameOver}
          onVictory={handleVictory}
          onGravityChange={setGravityDir}
          onTimeRemainingUpdate={setTimeRemaining}
          onDistanceUpdate={setDistanceTraveled}
          engineRef={engineRef}
        />

        {/* In-Game HUD overlay */}
        {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
          <HUD
            score={score}
            highScore={activeHighScore}
            mode={gameMode}
            timeRemaining={timeRemaining}
            challengeLevel={currentChallengeLevel}
            distanceTraveled={distanceTraveled}
            gravityDir={gravityDir}
            isPaused={gameState === 'PAUSED'}
            soundEnabled={settings.soundEnabled}
            onTogglePause={togglePause}
            onToggleSound={toggleSound}
            milestoneMessage={milestoneMessage}
          />
        )}

        {/* Main Menu overlay */}
        {gameState === 'MENU' && (
          <MainMenu
            stats={stats}
            selectedSkin={settings.selectedSkin}
            onPlay={() => startGame('endless')}
            onOpenModes={() => setShowModes(true)}
            onOpenSkins={() => setShowSkins(true)}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={togglePause}
            onRestart={() => startGame(gameMode, currentChallengeLevel)}
            onMainMenu={() => setGameState('MENU')}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            score={score}
            highScore={activeHighScore}
            isNewRecord={isNewRecord}
            onRestart={() => startGame(gameMode, currentChallengeLevel)}
            onMainMenu={() => setGameState('MENU')}
            onOpenSkins={() => setShowSkins(true)}
          />
        )}

        {/* Victory Modal */}
        {gameState === 'VICTORY' && (
          <VictoryModal
            mode={gameMode}
            score={score}
            challengeLevel={currentChallengeLevel}
            hasNextLevel={hasNextLevel}
            onNextLevel={handleNextChallengeLevel}
            onRestart={() => startGame(gameMode, currentChallengeLevel)}
            onMainMenu={() => setGameState('MENU')}
            onOpenSkins={() => setShowSkins(true)}
          />
        )}

        {/* Sub-Modals (accessible from Menu, Pause, or Game Over) */}
        {showModes && (
          <ModesModal
            currentMode={gameMode}
            stats={stats}
            onSelectMode={(selectedMode, lvl) => startGame(selectedMode, lvl || null)}
            onClose={() => setShowModes(false)}
          />
        )}

        {showSkins && (
          <SkinsModal
            activeSkin={settings.selectedSkin}
            stats={stats}
            onSelectSkin={handleSelectSkin}
            onClose={() => setShowSkins(false)}
          />
        )}

        {showHowToPlay && (
          <HowToPlayModal
            onClose={() => setShowHowToPlay(false)}
            onPlay={() => startGame('endless')}
          />
        )}

        {showSettings && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetScores={handleResetScores}
            onClose={() => setShowSettings(false)}
          />
        )}

      </div>
    </div>
  );
}
