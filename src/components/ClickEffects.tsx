'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
}

interface ClickEffectProps {
  x: number;
  y: number;
  id: string;
}

export function ClickEffect({ x, y, id }: ClickEffectProps) {
  const [particles] = useState<Particle[]>(() => {
    const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#dc2626', '#fff'];
    return Array.from({ length: 8 }, (_, i) => ({
      id: `${id}-${i}`,
      x,
      y,
      angle: (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5,
      speed: 40 + Math.random() * 60,
      size: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* Ripple effect */}
      <motion.div
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute rounded-full border-2 border-amber-400/50"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: '40px',
          height: '40px',
          marginLeft: '-20px',
          marginTop: '-20px',
        }}
      />
      {/* Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 1, scale: 1 }}
          animate={{
            left: `${p.x + Math.cos(p.angle) * (p.speed / 5)}%`,
            top: `${p.y + Math.sin(p.angle) * (p.speed / 5)}%`,
            opacity: 0,
            scale: 0.3,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            marginLeft: `${-p.size / 2}px`,
            marginTop: `${-p.size / 2}px`,
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

interface GoldDropProps {
  x: number;
  y: number;
  amount: number;
  id: string;
}

export function GoldDropEffect({ x, y, amount, id }: GoldDropProps) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: [0, -40, -80, -120], scale: [0.5, 1.3, 1, 0.8] }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="pointer-events-none absolute z-50"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      <div className="flex items-center gap-1 text-glow-gold">
        <span className="text-2xl">🪙</span>
        <span className="text-lg font-bold text-amber-400">
          +{formatGold(amount)}
        </span>
      </div>
    </motion.div>
  );
}

function formatGold(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toString();
}
