'use client';

import { useState, useCallback } from 'react';
import { useGameStore, getHeroCost, getHeroCostForLevels, getMaxAffordableLevels, getHeroDps, getClickUpgradeCost, CLICK_UPGRADE_BONUS, type BuyAmount } from '@/store/gameStore';
import { HEROES } from '@/data/heroes';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, Zap } from 'lucide-react';

function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toString();
}

function formatCost(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return Math.floor(num).toString();
}

const BUY_OPTIONS: { value: BuyAmount; label: string }[] = [
  { value: 1, label: 'x1' },
  { value: 10, label: 'x10' },
  { value: 25, label: 'x25' },
  { value: 100, label: 'MAX' },
];

export function HeroPanel() {
  const gold = useGameStore((s) => s.gold);
  const heroes = useGameStore((s) => s.heroes);
  const buyAmount = useGameStore((s) => s.buyAmount);
  const clickUpgradeLevel = useGameStore((s) => s.clickUpgradeLevel);
  const [isOpen, setIsOpen] = useState(true);
  const [buyFlash, setBuyFlash] = useState<string | null>(null);

  const clickUpgradeCost = getClickUpgradeCost(clickUpgradeLevel);
  const canAffordClickUpgrade = gold >= clickUpgradeCost;

  function getCostForHero(heroId: string, level: number): number {
    if (level === 0) {
      const hireCost = getHeroCost(heroId, 0);
      if (buyAmount === 1) return hireCost;
      if (buyAmount === 100) {
        const affordableFromZero = getMaxAffordableLevels(heroId, 0, gold);
        if (affordableFromZero === 0) return hireCost;
        return getHeroCostForLevels(heroId, 0, affordableFromZero);
      }
      const remainingGold = gold - hireCost;
      if (remainingGold < 0) return hireCost;
      const maxLevels = getMaxAffordableLevels(heroId, 1, remainingGold);
      const actualLevels = Math.min(buyAmount - 1, maxLevels);
      return hireCost + getHeroCostForLevels(heroId, 1, actualLevels);
    }
    if (buyAmount === 100) {
      const affordable = getMaxAffordableLevels(heroId, level, gold);
      if (affordable === 0) return getHeroCost(heroId, level);
      return getHeroCostForLevels(heroId, level, affordable);
    }
    return getHeroCostForLevels(heroId, level, buyAmount);
  }

  function getActualLevelGain(heroId: string, level: number): number {
    if (level === 0) return 1;
    if (buyAmount === 100) {
      return getMaxAffordableLevels(heroId, level, gold);
    }
    return buyAmount;
  }

  const flashBuy = useCallback((id: string) => {
    setBuyFlash(id);
    setTimeout(() => setBuyFlash(null), 300);
  }, []);

  const handleBuyClickUpgrade = useCallback(() => {
    try {
      const store = useGameStore.getState();
      const cost = getClickUpgradeCost(store.clickUpgradeLevel);
      if (store.gold < cost) return;
      store.buyClickUpgrade();
      flashBuy('click-upgrade');
    } catch (e) {
      console.error('Error buying click upgrade:', e);
    }
  }, [flashBuy]);

  const handleBuyHero = useCallback((heroId: string) => {
    try {
      const store = useGameStore.getState();
      const currentBuyAmount = store.buyAmount;
      store.levelUpHeroByAmount(heroId, currentBuyAmount);
      flashBuy(heroId);
    } catch (e) {
      console.error('Error buying hero:', e);
    }
  }, [flashBuy]);

  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col bg-card/50 border-t lg:border-t-0 lg:border-l border-border/50 lg:h-full" style={{ position: 'relative', zIndex: 1 }}>
      {/* Header - always visible */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 sm:p-3 flex items-center justify-between hover:bg-accent/30 transition-colors lg:cursor-default cursor-pointer"
      >
        <div>
          <h2 className="text-base sm:text-lg font-bold text-amber-400 text-glow-gold flex items-center gap-1.5 sm:gap-2">
            <span>⚔️</span>
            Heróis
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
            Contrate e evolua heróis
          </p>
        </div>
        <div className="lg:hidden text-muted-foreground">
          {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </div>
      </div>

      {/* Hero list - always open on desktop, toggleable on mobile */}
      <div className={`${isOpen ? 'flex' : 'hidden'} lg:flex flex-col flex-1 min-h-0`}>
        {/* Buy amount selector */}
        <div className="px-2 sm:px-3 pb-2 flex gap-1">
          {BUY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                useGameStore.getState().setBuyAmount(opt.value);
              }}
              className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded transition-colors ${
                buyAmount === opt.value
                  ? 'bg-amber-700 text-amber-100 shadow-md shadow-amber-900/30'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Click Upgrade */}
        <div className="px-2 pb-2">
          <div className={`p-2 sm:p-3 rounded-lg border transition-colors duration-200 ${
            canAffordClickUpgrade
              ? 'bg-gradient-to-r from-red-950/30 to-transparent border-red-800/40 ring-1 ring-red-500/20'
              : 'bg-muted/30 border-border/30'
          }`}>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="text-2xl sm:text-3xl flex-shrink-0">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-xs sm:text-sm text-foreground">Poder de Clique</span>
                  <Badge
                    variant="secondary"
                    className="text-[9px] sm:text-xs bg-red-900/40 text-red-300 border-red-700/30 flex-shrink-0"
                  >
                    Nv. {clickUpgradeLevel}
                  </Badge>
                </div>
                <p className="text-[9px] sm:text-xs text-muted-foreground truncate">
                  +{CLICK_UPGRADE_BONUS} dano por clique
                </p>
                <div className="mt-0.5 sm:mt-1 flex items-center gap-1">
                  <span className="text-[9px] sm:text-xs text-red-400/80">👆 Extra:</span>
                  <span className="text-[9px] sm:text-xs font-mono text-red-300">
                    {formatNumber(clickUpgradeLevel * CLICK_UPGRADE_BONUS)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <button
                type="button"
                onClick={handleBuyClickUpgrade}
                disabled={!canAffordClickUpgrade}
                className={`w-full text-[10px] sm:text-xs h-9 sm:h-10 font-bold rounded-md border-0 outline-none focus:outline-none ${
                  buyFlash === 'click-upgrade' ? 'bg-green-700 text-green-100' :
                  canAffordClickUpgrade
                    ? 'bg-red-700 hover:bg-red-600 text-red-100 cursor-pointer'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60'
                }`}
                style={{ pointerEvents: canAffordClickUpgrade ? 'auto' : 'none' }}
              >
                🪙 Melhorar — {formatCost(clickUpgradeCost)}
              </button>
            </div>
          </div>
        </div>

        {/* Hero list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2 space-y-1.5 sm:space-y-2" style={{ minHeight: 0 }}>
          {HEROES.map((heroDef) => {
            const heroState = heroes.find(h => h.id === heroDef.id);
            const level = heroState?.level || 0;
            const isHired = level > 0;
            const cost = getCostForHero(heroDef.id, level);
            const canAfford = gold >= cost && cost > 0;
            const dps = getHeroDps(heroDef.id, level);
            const actualGain = getActualLevelGain(heroDef.id, level);
            const nextDps = getHeroDps(heroDef.id, level + actualGain);

            return (
              <div
                key={heroDef.id}
                className={`p-2 sm:p-3 rounded-lg border transition-colors duration-200 ${
                  isHired
                    ? 'bg-gradient-to-r from-amber-950/20 to-transparent border-amber-800/30'
                    : 'bg-muted/30 border-border/30'
                } ${canAfford ? 'ring-1 ring-amber-500/30' : ''}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div
                    className={`text-2xl sm:text-3xl flex-shrink-0 ${
                      isHired ? '' : 'grayscale opacity-50'
                    }`}
                  >
                    {heroDef.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                        {heroDef.name}
                      </span>
                      {isHired && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] sm:text-xs bg-amber-900/40 text-amber-300 border-amber-700/30 flex-shrink-0"
                        >
                          Nv. {level}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[9px] sm:text-xs text-muted-foreground truncate">
                      {heroDef.title}
                    </p>

                    {isHired && (
                      <div className="mt-0.5 sm:mt-1 flex items-center gap-1 flex-wrap">
                        <span className="text-[9px] sm:text-xs text-green-400">⚔️</span>
                        <span className="text-[9px] sm:text-xs font-mono text-green-300">
                          {formatNumber(dps)}
                        </span>
                        {actualGain > 0 && (
                          <>
                            <span className="text-[9px] sm:text-xs text-muted-foreground">→</span>
                            <span className="text-[9px] sm:text-xs font-mono text-green-200">
                              {formatNumber(nextDps)}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    {!isHired && (
                      <div className="mt-0.5 sm:mt-1 flex items-center gap-1">
                        <span className="text-[9px] sm:text-xs text-green-400/60">⚔️</span>
                        <span className="text-[9px] sm:text-xs font-mono text-green-300/60">
                          {formatNumber(heroDef.baseDps)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-1.5 sm:mt-2">
                  <button
                    type="button"
                    onClick={() => handleBuyHero(heroDef.id)}
                    disabled={!canAfford}
                    className={`w-full text-[10px] sm:text-xs h-9 sm:h-10 font-bold rounded-md border-0 outline-none focus:outline-none ${
                      buyFlash === heroDef.id ? 'bg-green-700 text-green-100' :
                      canAfford
                        ? 'bg-amber-700 hover:bg-amber-600 text-amber-100 cursor-pointer'
                        : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60'
                    }`}
                    style={{ pointerEvents: canAfford ? 'auto' : 'none', position: 'relative', zIndex: 2 }}
                  >
                    🪙 {isHired ? `Evoluir${buyAmount > 1 ? ` x${buyAmount === 100 ? 'MAX' : buyAmount}` : ''}` : 'Contratar'} — {formatCost(cost)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
