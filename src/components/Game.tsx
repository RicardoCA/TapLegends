'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { TopBar } from './TopBar';
import { BossDisplay } from './BossDisplay';
import { HeroPanel } from './HeroPanel';

export function Game() {
  const {
    tickDps,
    tickBossTimer,
    cleanupEvents,
    saveGame,
    loadGame,
    loadAchievements,
    isBossFight,
    clickDamage,
    totalDps,
    totalKills,
    gold,
    newAchievement,
    clearAchievementNotification,
    offlineEarnings,
    offlineSeconds,
    offlineKills,
    dismissOfflineEarnings,
  } = useGameStore();

  const dpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cleanupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadedRef = useRef(false);
  const [showSaveFlash, setShowSaveFlash] = useState(false);

  // Load game on mount
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadGame();
      loadAchievements();
    }
  }, [loadGame, loadAchievements]);

  // DPS tick - every 100ms
  useEffect(() => {
    dpsIntervalRef.current = setInterval(() => {
      tickDps();
    }, 100);

    return () => {
      if (dpsIntervalRef.current) clearInterval(dpsIntervalRef.current);
    };
  }, [tickDps]);

  // Boss timer tick - every 1 second
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      if (isBossFight) {
        tickBossTimer();
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [tickBossTimer, isBossFight]);

  // Cleanup visual events
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      cleanupEvents();
    }, 500);

    return () => {
      if (cleanupIntervalRef.current) clearInterval(cleanupIntervalRef.current);
    };
  }, [cleanupEvents]);

  // Auto-save every 30 seconds
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      saveGame();
      setShowSaveFlash(true);
      setTimeout(() => setShowSaveFlash(false), 1500);
    }, 30000);

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [saveGame]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGame();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveGame]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative">
      {/* Save flash notification */}
      <AnimatePresence>
        {showSaveFlash && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-50 px-3 sm:px-4 py-1 sm:py-1.5 bg-green-900/80 border border-green-500/30 rounded-full text-green-300 text-[10px] sm:text-xs font-medium backdrop-blur-sm"
          >
            💾 Jogo salvo!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline earnings notification */}
      <AnimatePresence>
        {offlineEarnings !== null && offlineEarnings > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -30 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={dismissOfflineEarnings}
          >
            <div className="bg-card border border-amber-500/40 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 max-w-xs w-full mx-4">
              <span className="text-4xl">⏰</span>
              <div className="text-center">
                <div className="text-amber-300 font-bold text-lg">Farm Offline!</div>
                <div className="text-muted-foreground text-sm mt-1">
                  Você ficou fora por {formatTime(offlineSeconds)}
                </div>
              </div>
              <div className="bg-amber-950/50 border border-amber-500/30 rounded-xl px-6 py-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Ouro coletado</div>
                <div className="text-amber-400 font-bold text-2xl font-mono">
                  +{formatNumber(offlineEarnings)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatNumber(offlineKills)} mobs derrotados
                </div>
              </div>
              <div className="text-xs text-muted-foreground">(50% do ouro por kill)</div>
              <button
                className="mt-1 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-sm transition-colors"
                onClick={dismissOfflineEarnings}
              >
                Coletar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-purple-900/90 border border-purple-400/50 rounded-lg shadow-lg backdrop-blur-sm"
            onClick={() => clearAchievementNotification()}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="text-purple-200 text-xs font-medium">Conquista Desbloqueada!</div>
                <div className="text-white font-bold">{newAchievement}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <TopBar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Boss area */}
        <div className="flex-1 flex flex-col relative min-h-0">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 25%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(220,38,38,0.2) 0%, transparent 50%)',
            }}
          />

          <BossDisplay />
        </div>

        {/* Hero panel */}
        <HeroPanel />
      </div>

      {/* Bottom stats bar */}
      <div className="px-2 sm:px-4 py-1.5 sm:py-2 bg-card/50 border-t border-border/50 flex items-center justify-center gap-2 sm:gap-3 md:gap-5 text-[9px] sm:text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-0.5 sm:gap-1">
          👆 <span className="hidden xs:inline">Clique:</span> <span className="text-red-400 font-mono font-bold">{formatNumber(clickDamage)}</span>
        </span>
        <span className="hidden sm:inline text-border">|</span>
        <span className="flex items-center gap-0.5 sm:gap-1">
          ⚔️ DPS: <span className="text-green-400 font-mono font-bold">{formatNumber(totalDps)}</span>
        </span>
        <span className="hidden sm:inline text-border">|</span>
        <span className="flex items-center gap-0.5 sm:gap-1">
          💀 <span className="hidden xs:inline">Kills:</span> <span className="text-purple-400 font-mono font-bold">{formatNumber(totalKills)}</span>
        </span>
        <span className="hidden sm:inline text-border">|</span>
        <span className="flex items-center gap-0.5 sm:gap-1">
          🪙 Ouro: <span className="text-amber-400 font-mono font-bold">{formatNumber(gold)}</span>
        </span>
        <span className="hidden md:inline text-border">|</span>
        <span className="hidden md:flex items-center gap-1">
          Crítico: <span className="text-amber-400 font-mono">5%</span> ×<span className="text-amber-400 font-mono">5</span>
        </span>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toString();
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
