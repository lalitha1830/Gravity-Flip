import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine, CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { GameMode, ChallengeLevel, GameSettings } from '../types/game';
import { THEMES } from '../game/themes';
import { soundManager } from '../audio/soundManager';

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  gameMode: GameMode;
  challengeLevel: ChallengeLevel | null;
  settings: GameSettings;
  onScoreUpdate: (score: number) => void;
  onMilestone: (msg: string) => void;
  onGameOver: (finalScore: number) => void;
  onVictory: () => void;
  onGravityChange: (dir: 1 | -1) => void;
  onTimeRemainingUpdate: (time: number) => void;
  onDistanceUpdate: (dist: number) => void;
  engineRef?: React.MutableRefObject<GameEngine | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPlaying,
  isPaused,
  gameMode,
  challengeLevel,
  settings,
  onScoreUpdate,
  onMilestone,
  onGameOver,
  onVictory,
  onGravityChange,
  onTimeRemainingUpdate,
  onDistanceUpdate,
  engineRef: externalEngineRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const internalEngineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize engine once
  if (!internalEngineRef.current) {
    const engine = new GameEngine();
    internalEngineRef.current = engine;
    if (externalEngineRef) {
      externalEngineRef.current = engine;
    }
  }

  const engine = internalEngineRef.current!;

  // Sync settings into engine
  useEffect(() => {
    engine.currentTheme = THEMES[settings.theme] || THEMES.neon_city;
    engine.reducedMotion = settings.reducedMotion;
    engine.screenShakeEnabled = settings.screenShake;
    engine.player.skin = settings.selectedSkin;
  }, [engine, settings]);

  // Hook callbacks
  useEffect(() => {
    engine.onScoreChange = (score) => {
      onScoreUpdate(score);
    };
    engine.onMilestone = (msg) => {
      onMilestone(msg);
    };
    engine.onGameOver = (score) => {
      onGameOver(score);
    };
    engine.onVictory = () => {
      onVictory();
    };
  }, [engine, onScoreUpdate, onMilestone, onGameOver, onVictory]);

  // Reset engine when starting fresh game
  const resetGame = useCallback(() => {
    engine.reset(gameMode, challengeLevel);
    engine.player.skin = settings.selectedSkin;
    onGravityChange(engine.player.gravityDir);
  }, [engine, gameMode, challengeLevel, settings.selectedSkin, onGravityChange]);

  // Handle game flip trigger
  const handleFlipAction = useCallback(() => {
    if (!isPlaying || isPaused || engine.isGameOver || engine.isVictory) return;
    const didFlip = engine.flipGravity();
    if (didFlip) {
      onGravityChange(engine.player.gravityDir);
    }
  }, [isPlaying, isPaused, engine, onGravityChange]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleFlipAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlipAction]);

  // Pointer / Touch input
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only primary mouse button or touch
    if (e.button === 0) {
      handleFlipAction();
    }
  };

  // Main Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(ctx);
    }
    const renderer = rendererRef.current;

    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (isPlaying && !isPaused && !engine.isGameOver && !engine.isVictory) {
        engine.update(dt);
        if (gameMode === 'time_attack') {
          onTimeRemainingUpdate(engine.timeAttackRemaining);
        }
        if (gameMode === 'challenge') {
          onDistanceUpdate(engine.distanceTraveled);
        }
      }

      // Render
      renderer.render(engine, currentTime / 1000);

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, isPaused, engine, gameMode, onTimeRemainingUpdate, onDistanceUpdate]);

  // Handle visibility change (pause on tab switch)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isPlaying && !isPaused) {
        // Tab hidden
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPlaying, isPaused]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        className="w-full h-full object-contain cursor-pointer pixelated select-none touch-none"
        style={{
          aspectRatio: '16/9',
          maxHeight: '100%',
          maxWidth: '100%'
        }}
      />

      {/* CRT Scanlines Overlay if enabled */}
      {settings.scanlines && (
        <div className="absolute inset-0 scanlines pointer-events-none z-15" />
      )}
    </div>
  );
};
