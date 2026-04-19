'use client';

import { motion } from 'framer-motion';
import { type DamageEvent } from '@/store/gameStore';

interface DamageNumberProps {
  event: DamageEvent;
}

export function DamageNumber({ event }: DamageNumberProps) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -80, scale: event.isCritical ? 1.5 : 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="pointer-events-none absolute z-50"
      style={{
        left: `${event.x}%`,
        top: `${event.y}%`,
      }}
    >
      <span
        className={`font-bold whitespace-nowrap ${
          event.isCritical
            ? 'text-2xl text-amber-400 text-glow-gold'
            : 'text-lg text-white'
        }`}
        style={{
          textShadow: event.isCritical
            ? '0 0 10px rgba(251,191,36,0.8), 0 2px 4px rgba(0,0,0,0.8)'
            : '0 2px 4px rgba(0,0,0,0.8)',
        }}
      >
        {event.isCritical ? 'CRÍTICO! ' : ''}-{formatNumber(event.value)}
      </span>
    </motion.div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toString();
}
