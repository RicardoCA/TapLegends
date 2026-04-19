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
    isBossFight,
    clickDamage,
    totalDps,
    totalKills,
    gold,
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
    }
  }, [loadGame]);

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
