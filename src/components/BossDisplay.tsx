'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getBossDefinition } from '@/data/bosses';
import { DamageNumber } from './DamageNumber';
import { ClickEffect, GoldDropEffect } from './ClickEffects';

export function BossDisplay() {
  const {
    zone,
    bossCurrentHp,
    bossMaxHp,
    bossDefeated,
    isBossFight,
    bossTimer,
    clickBoss,
    damageEvents,
    goldDrops,
  } = useGameStore();

  const bossAreaRef = useRef<HTMLDivElement>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [clickEffects, setClickEffects] = useState<{ id: string; x: number; y: number }[]>([]);

  const bossDef = getBossDefinition(zone);
  const hpPercent = bossMaxHp > 0 ? (bossCurrentHp / bossMaxHp) * 100 : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (bossDefeated) return;

      const rect = bossAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      clickBoss(x, y);

      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);

      const effectId = Math.random().toString(36).substring(2, 9);
      setClickEffects((prev) => [...prev, { id: effectId, x, y }]);
      setTimeout(() => {
        setClickEffects((prev) => prev.filter((p) => p.id !== effectId));
      }, 600);
    },
    [bossDefeated, clickBoss]
  );

  // Boss size based on zone - gets bigger for boss fights, responsive
  const bossSize = isBossFight ? 'min(260px, 60vw)' : 'min(220px, 50vw)';

  return (
    <div className="flex flex-1 flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-64 h-64 rounded-full bg-glow"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            left: '20%',
            top: '30%',
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full bg-glow"
          style={{
            background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)',
            right: '20%',
            top: '40%',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute w-56 h-56 rounded-full bg-glow"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
            left: '50%',
            bottom: '20%',
            animationDelay: '1s',
          }}
        />
        {/* Boss fight red vignette */}
        {isBossFight && (
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(220,38,38,0.08) 100%)',
            }}
          />
        )}
      </div>

      {/* Zone & Boss name */}
      <div className="text-center mb-3 sm:mb-4 z-10">
        <div className="text-xs sm:text-sm text-muted-foreground tracking-wider uppercase">
          Zona {zone}
        </div>
        <AnimatePresence mode="wait">
          <motion.h2
            key={zone}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-xl sm:text-2xl font-bold ${isBossFight ? 'text-red-400 text-glow-red' : 'text-foreground'}`}
          >
            {bossDef.name}
          </motion.h2>
        </AnimatePresence>
        {isBossFight && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="px-2 sm:px-3 py-0.5 bg-red-900/60 border border-red-500/50 rounded text-red-300 text-[10px] sm:text-xs font-bold tracking-widest">
              CHEFE
            </span>
            <span className={`text-xs sm:text-sm font-mono ${bossTimer <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              ⏱ {bossTimer}s
            </span>
          </div>
        )}
      </div>

      {/* Boss clickable area */}
      <div
        ref={bossAreaRef}
        onClick={handleClick}
        className={`relative cursor-pointer select-none z-10 ${
          bossDefeated ? '' : 'hover:brightness-110 active:brightness-90'
        }`}
        style={{ width: bossSize, height: bossSize }}
      >
        {/* Boss emoji */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${zone}-${bossDefeated ? 'dead' : 'alive'}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: bossDefeated ? 0.5 : 0.3 }}
            className={`flex items-center justify-center w-full h-full ${
              isShaking && !bossDefeated ? 'boss-shake' : ''
            } ${bossDefeated ? 'boss-death' : ''} ${isBossFight ? 'glow-pulse' : ''}`}
          >
            <span
              className="leading-none"
              style={{
                fontSize: isBossFight ? 'clamp(4rem, 12vw, 8rem)' : 'clamp(3rem, 10vw, 6rem)',
                filter: isBossFight
                  ? 'drop-shadow(0 0 20px rgba(220,38,38,0.5)) drop-shadow(0 0 40px rgba(220,38,38,0.3))'
                  : 'drop-shadow(0 0 15px rgba(139,92,246,0.3))',
              }}
            >
              {bossDef.emoji}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Click effects */}
        {clickEffects.map((effect) => (
          <ClickEffect key={effect.id} x={effect.x} y={effect.y} id={effect.id} />
        ))}

        {/* Damage numbers */}
        {damageEvents.map((event) => (
          <DamageNumber key={event.id} event={event} />
        ))}

        {/* Gold drops */}
        {goldDrops.map((drop) => (
          <GoldDropEffect
            key={drop.id}
            x={drop.x}
            y={drop.y}
            amount={drop.amount}
            id={drop.id}
          />
        ))}
      </div>

      {/* Health bar - responsive width */}
      <div className="w-full max-w-xs sm:w-80 mt-4 sm:mt-6 z-10">
        <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mb-1">
          <span className="flex items-center gap-1">
            <span className="text-red-400">❤</span> HP
          </span>
          <span className="font-mono">
            {formatHp(bossCurrentHp)} / {formatHp(bossMaxHp)}
          </span>
        </div>
        <div className="relative h-5 sm:h-6 bg-black/60 rounded-full border border-red-900/50 overflow-hidden shadow-inner">
          <motion.div
            className="absolute inset-y-0 left-0 health-shimmer rounded-full"
            initial={false}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.15, ease: 'linear' }}
            style={{
              boxShadow: hpPercent < 25 ? '0 0 15px rgba(220,38,38,0.6), inset 0 0 8px rgba(255,100,100,0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md">
              {Math.ceil(hpPercent)}%
            </span>
          </div>
        </div>
      </div>

      {/* Click hint / defeated message */}
      {!bossDefeated && (
        <p className="text-[10px] sm:text-xs text-muted-foreground/50 mt-2 sm:mt-3 z-10 animate-pulse">
          Clique para atacar!
        </p>
      )}
      {bossDefeated && (
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs sm:text-sm text-amber-400 mt-2 sm:mt-3 z-10 text-glow-gold font-bold"
        >
          ✦ Derrotado! ✦
        </motion.p>
      )}
    </div>
  );
}

function formatHp(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.ceil(num).toString();
}
