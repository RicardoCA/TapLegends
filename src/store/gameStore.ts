import { create } from 'zustand';
import { HEROES } from '@/data/heroes';
import { getBossHp, getBossGold } from '@/data/bosses';
import { sounds } from '@/lib/sounds';
import { getAchievementForZone } from '@/data/achievements';

export interface DamageEvent {
  id: string;
  value: number;
  isCritical: boolean;
  x: number;
  y: number;
  timestamp: number;
}

export interface HeroState {
  id: string;
  level: number;
}

export interface GoldDrop {
  id: string;
  amount: number;
  x: number;
  y: number;
  timestamp: number;
}

export type BuyAmount = 1 | 10 | 25 | 100;

export interface GameState {
  // Core state
  gold: number;
  totalGold: number;
  zone: number;
  maxZone: number;
  bossCurrentHp: number;
  bossMaxHp: number;
  clickDamage: number;
  totalDps: number;
  bossTimer: number;
  totalKills: number;
  totalClicks: number;

  // Click upgrades
  clickUpgradeLevel: number;

  // Heroes
  heroes: HeroState[];

  // Visual events
  damageEvents: DamageEvent[];
  goldDrops: GoldDrop[];

  // Game state
  isBossFight: boolean;
  bossDefeated: boolean;

  // Achievements
  achievements: string[];
  newAchievement: string | null;

  // UI state
  buyAmount: BuyAmount;
  zoneLocked: boolean;

  // Actions
  clickBoss: (x: number, y: number) => void;
  buyHero: (heroId: string) => void;
  levelUpHero: (heroId: string) => void;
  levelUpHeroByAmount: (heroId: string, amount: BuyAmount) => void;
  buyClickUpgrade: () => void;
  tickDps: () => void;
  tickBossTimer: () => void;
  goToZone: (zone: number) => void;
  nextZone: () => void;
  prevZone: () => void;
  killBoss: () => void;
  cleanupEvents: () => void;
  setBuyAmount: (amount: BuyAmount) => void;
  toggleZoneLock: () => void;

  // Save/Load
  saveGame: () => void;
  loadGame: () => void;
  saveToServer: () => Promise<void>;
  loadFromServer: () => Promise<SaveData | null>;
  resetGame: () => void;

  // Achievements
  clearAchievementNotification: () => void;
  loadAchievements: () => Promise<void>;
  saveAchievements: () => Promise<void>;
}

const CRIT_CHANCE = 0.05;
const CRIT_MULTIPLIER = 5;
const BOSS_TIMER_SECONDS = 30;

// Click upgrade config
const CLICK_UPGRADE_BASE_COST = 100;
const CLICK_UPGRADE_COST_MULT = 1.08;
const CLICK_UPGRADE_BONUS = 1; // +1 click damage per upgrade

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function getHeroCost(heroId: string, currentLevel: number): number {
  const heroDef = HEROES.find(h => h.id === heroId);
  if (!heroDef) return Infinity;
  return Math.ceil(heroDef.baseCost * Math.pow(1.07, currentLevel));
}

function getHeroCostForLevels(heroId: string, currentLevel: number, count: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += getHeroCost(heroId, currentLevel + i);
  }
  return total;
}

function getMaxAffordableLevels(heroId: string, currentLevel: number, gold: number): number {
  let spent = 0;
  let levels = 0;
  while (levels < 10000) {
    const nextCost = getHeroCost(heroId, currentLevel + levels);
    if (spent + nextCost > gold) break;
    spent += nextCost;
    levels++;
  }
  return levels;
}

function getHeroDps(heroId: string, level: number): number {
  const heroDef = HEROES.find(h => h.id === heroId);
  if (!heroDef || level === 0) return 0;
  return heroDef.baseDps * level;
}

function calculateTotalDps(heroes: HeroState[]): number {
  let total = 0;
  for (const hero of heroes) {
    total += getHeroDps(hero.id, hero.level);
  }
  return total;
}

function calculateClickDamage(heroes: HeroState[], clickUpgradeLevel: number): number {
  const cidHero = heroes.find(h => h.id === 'cid');
  const cidLevel = cidHero ? cidHero.level : 0;
  return 1 + cidLevel * 1 + clickUpgradeLevel * CLICK_UPGRADE_BONUS;
}

function getClickUpgradeCost(currentLevel: number): number {
  return Math.ceil(CLICK_UPGRADE_BASE_COST * Math.pow(CLICK_UPGRADE_COST_MULT, currentLevel));
}

function initializeHeroes(): HeroState[] {
  return HEROES.map(h => ({
    id: h.id,
    level: 0,
  }));
}

interface SaveData {
  gold: number;
  totalGold: number;
  zone: number;
  maxZone: number;
  heroes: HeroState[];
  totalKills: number;
  totalClicks: number;
  clickUpgradeLevel: number;
  zoneLocked: boolean;
}

const STORAGE_KEY = 'tap-legends-save-v2';

export { getHeroCost, getHeroCostForLevels, getMaxAffordableLevels, getHeroDps, getClickUpgradeCost, CLICK_UPGRADE_BONUS };

export const useGameStore = create<GameState>((set, get) => ({
  gold: 0,
  totalGold: 0,
  zone: 1,
  maxZone: 1,
  bossCurrentHp: getBossHp(1),
  bossMaxHp: getBossHp(1),
  clickDamage: 1,
  totalDps: 0,
  bossTimer: BOSS_TIMER_SECONDS,
  totalKills: 0,
  totalClicks: 0,
  clickUpgradeLevel: 0,
  heroes: initializeHeroes(),
  damageEvents: [],
  goldDrops: [],
  isBossFight: false,
  bossDefeated: false,
  achievements: [],
  newAchievement: null,
  buyAmount: 1,
  zoneLocked: false,

  clickBoss: (x: number, y: number) => {
    const state = get();
    if (state.bossDefeated) return;

    const isCritical = Math.random() < CRIT_CHANCE;
    const damage = isCritical ? state.clickDamage * CRIT_MULTIPLIER : state.clickDamage;

    const newHp = Math.max(0, state.bossCurrentHp - damage);

    const damageEvent: DamageEvent = {
      id: generateId(),
      value: damage,
      isCritical,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 20,
      timestamp: Date.now(),
    };

    const newEvents = [...state.damageEvents, damageEvent].slice(-20);

    set({
      bossCurrentHp: newHp,
      damageEvents: newEvents,
      totalClicks: state.totalClicks + 1,
    });

    // Play sound based on critical or normal
    if (isCritical) {
      sounds.playCritical();
    } else {
      sounds.playAttack();
    }

    if (newHp <= 0) {
      get().killBoss();
    }
  },

  buyHero: (heroId: string) => {
    const state = get();
    const heroIndex = state.heroes.findIndex(h => h.id === heroId);
    if (heroIndex === -1) return;

    const hero = state.heroes[heroIndex];
    if (hero.level > 0) return;

    const cost = getHeroCost(heroId, 0);
    if (state.gold < cost) return;

    const newHeroes = [...state.heroes];
    newHeroes[heroIndex] = { ...hero, level: 1 };

    const newDps = calculateTotalDps(newHeroes);
    const newClickDamage = calculateClickDamage(newHeroes, state.clickUpgradeLevel);

    set({
      gold: state.gold - cost,
      heroes: newHeroes,
      totalDps: newDps,
      clickDamage: newClickDamage,
    });

    sounds.playBuy();
  },

  levelUpHero: (heroId: string) => {
    const state = get();
    const heroIndex = state.heroes.findIndex(h => h.id === heroId);
    if (heroIndex === -1) return;

    const hero = state.heroes[heroIndex];
    if (hero.level === 0) {
      get().buyHero(heroId);
      return;
    }

    const cost = getHeroCost(heroId, hero.level);
    if (state.gold < cost) return;

    const newHeroes = [...state.heroes];
    newHeroes[heroIndex] = { ...hero, level: hero.level + 1 };

    const newDps = calculateTotalDps(newHeroes);
    const newClickDamage = calculateClickDamage(newHeroes, state.clickUpgradeLevel);

    set({
      gold: state.gold - cost,
      heroes: newHeroes,
      totalDps: newDps,
      clickDamage: newClickDamage,
    });

    sounds.playBuy();
  },

  levelUpHeroByAmount: (heroId: string, amount: BuyAmount) => {
    const state = get();
    let heroIndex = state.heroes.findIndex(h => h.id === heroId);

    // If hero not found in store array, re-initialize heroes from HEROES data
    // This can happen if save data was corrupted or heroes array was empty
    if (heroIndex === -1) {
      const heroDef = HEROES.find(h => h.id === heroId);
      if (!heroDef) return;
      // Re-initialize heroes ensuring all heroes from HEROES data exist
      const currentHeroes = [...state.heroes];
      const missingHeroes = HEROES.filter(h => !currentHeroes.find(ch => ch.id === h.id));
      if (missingHeroes.length > 0) {
        const added = missingHeroes.map(h => ({ id: h.id, level: 0 }));
        currentHeroes.push(...added);
        // Re-sort to match HEROES order
        currentHeroes.sort((a, b) => {
          const aIdx = HEROES.findIndex(h => h.id === a.id);
          const bIdx = HEROES.findIndex(h => h.id === b.id);
          return aIdx - bIdx;
        });
        set({ heroes: currentHeroes });
        heroIndex = currentHeroes.findIndex(h => h.id === heroId);
        if (heroIndex === -1) return;
      } else {
        return;
      }
    }

    // Re-read state after possible set() call above
    const updatedState = get();
    const hero = updatedState.heroes[heroIndex];

    // If hero not hired yet and amount > 1, buy first then level rest
    if (hero.level === 0) {
      const hireCost = getHeroCost(heroId, 0);
      if (updatedState.gold < hireCost) return;

      const remainingGold = updatedState.gold - hireCost;
      const newHeroes = [...updatedState.heroes];
      newHeroes[heroIndex] = { ...hero, level: 1 };

      // Now level up the rest
      let levelsToAdd = 0;
      let totalSpent = hireCost;
      if (amount > 1) {
        const maxLevels = getMaxAffordableLevels(heroId, 1, remainingGold);
        levelsToAdd = Math.min(amount - 1, maxLevels);
        totalSpent += getHeroCostForLevels(heroId, 1, levelsToAdd);
        newHeroes[heroIndex] = { ...hero, level: 1 + levelsToAdd };
      }

      const newDps = calculateTotalDps(newHeroes);
      const newClickDamage = calculateClickDamage(newHeroes, updatedState.clickUpgradeLevel);

      set({
        gold: updatedState.gold - totalSpent,
        heroes: newHeroes,
        totalDps: newDps,
        clickDamage: newClickDamage,
      });

      sounds.playBuy();
      return;
    }

    // Already hired - level up by amount
    let actualAmount: number;
    if (amount === 100) {
      // MAX: buy as many as possible
      actualAmount = getMaxAffordableLevels(heroId, hero.level, updatedState.gold);
    } else {
      actualAmount = amount;
    }

    if (actualAmount <= 0) return;

    const cost = getHeroCostForLevels(heroId, hero.level, actualAmount);
    if (updatedState.gold < cost) {
      // Try to buy as many as we can afford
      const affordableAmount = getMaxAffordableLevels(heroId, hero.level, updatedState.gold);
      if (affordableAmount <= 0) return;
      const affordableCost = getHeroCostForLevels(heroId, hero.level, affordableAmount);

      const newHeroes = [...updatedState.heroes];
      newHeroes[heroIndex] = { ...hero, level: hero.level + affordableAmount };

      const newDps = calculateTotalDps(newHeroes);
      const newClickDamage = calculateClickDamage(newHeroes, updatedState.clickUpgradeLevel);

      set({
        gold: updatedState.gold - affordableCost,
        heroes: newHeroes,
        totalDps: newDps,
        clickDamage: newClickDamage,
      });

      sounds.playBuy();
      return;
    }

    const newHeroes = [...updatedState.heroes];
    newHeroes[heroIndex] = { ...hero, level: hero.level + actualAmount };

    const newDps = calculateTotalDps(newHeroes);
    const newClickDamage = calculateClickDamage(newHeroes, updatedState.clickUpgradeLevel);

    set({
      gold: updatedState.gold - cost,
      heroes: newHeroes,
      totalDps: newDps,
      clickDamage: newClickDamage,
    });

    sounds.playBuy();
  },

  buyClickUpgrade: () => {
    const state = get();
    const cost = getClickUpgradeCost(state.clickUpgradeLevel);
    if (state.gold < cost) return;

    const newClickDamage = calculateClickDamage(state.heroes, state.clickUpgradeLevel + 1);

    set({
      gold: state.gold - cost,
      clickUpgradeLevel: state.clickUpgradeLevel + 1,
      clickDamage: newClickDamage,
    });

    sounds.playBuy();
  },

  tickDps: () => {
    const state = get();
    if (state.bossDefeated || state.totalDps === 0) return;

    const dpsDamage = state.totalDps / 10;
    const newHp = Math.max(0, state.bossCurrentHp - dpsDamage);

    set({ bossCurrentHp: newHp });

    if (newHp <= 0) {
      get().killBoss();
    }
  },

  tickBossTimer: () => {
    const state = get();
    if (!state.isBossFight || state.bossDefeated) return;

    const newTimer = state.bossTimer - 1;

    // Play timer tick sound when timer is low
    if (newTimer <= 10 && newTimer > 0) {
      sounds.playTimerTick();
    }

    if (newTimer <= 0) {
      const prevZone = Math.max(1, state.zone - 1);
      const hp = getBossHp(prevZone);
      set({
        zone: prevZone,
        bossCurrentHp: hp,
        bossMaxHp: hp,
        bossTimer: BOSS_TIMER_SECONDS,
        isBossFight: prevZone % 5 === 0,
      });
    } else {
      set({ bossTimer: newTimer });
    }
  },

  goToZone: (zone: number) => {
    const state = get();
    if (zone < 1 || zone > state.maxZone) return;

    const hp = getBossHp(zone);
    const isBoss = zone % 5 === 0;

    set({
      zone,
      bossCurrentHp: hp,
      bossMaxHp: hp,
      bossDefeated: false,
      bossTimer: BOSS_TIMER_SECONDS,
      isBossFight: isBoss,
    });
  },

  nextZone: () => {
    const state = get();
    const nextZone = state.zone + 1;
    const hp = getBossHp(nextZone);
    const isBoss = nextZone % 5 === 0;
    const newMaxZone = Math.max(state.maxZone, nextZone);

    set({
      zone: nextZone,
      maxZone: newMaxZone,
      bossCurrentHp: hp,
      bossMaxHp: hp,
      bossDefeated: false,
      bossTimer: BOSS_TIMER_SECONDS,
      isBossFight: isBoss,
    });
  },

  prevZone: () => {
    const state = get();
    if (state.zone <= 1) return;
    const prevZone = state.zone - 1;
    const hp = getBossHp(prevZone);
    const isBoss = prevZone % 5 === 0;

    set({
      zone: prevZone,
      bossCurrentHp: hp,
      bossMaxHp: hp,
      bossDefeated: false,
      bossTimer: BOSS_TIMER_SECONDS,
      isBossFight: isBoss,
    });
  },

  killBoss: () => {
    const state = get();
    const goldReward = getBossGold(state.zone);
    const currentZone = state.zone;

    const goldDrop: GoldDrop = {
      id: generateId(),
      amount: goldReward,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50,
      timestamp: Date.now(),
    };

    // Check for achievement unlock
    const achievement = getAchievementForZone(currentZone);
    let newAchievements = state.achievements;
    let newAchievementName: string | null = null;

    if (achievement && !state.achievements.includes(achievement.id)) {
      newAchievements = [...state.achievements, achievement.id];
      newAchievementName = achievement.name;
    }

    set({
      gold: state.gold + goldReward,
      totalGold: state.totalGold + goldReward,
      bossDefeated: true,
      bossCurrentHp: 0,
      goldDrops: [...state.goldDrops, goldDrop].slice(-5),
      totalKills: state.totalKills + 1,
      achievements: newAchievements,
      newAchievement: newAchievementName,
    });

    // Save achievements to server if new one unlocked
    if (newAchievementName) {
      get().saveAchievements();
    }

    // Play boss death sound
    sounds.playBossDeath();

    setTimeout(() => {
      const currentState = get();
      if (currentState.bossDefeated && currentState.zone === state.zone) {
        if (currentState.zoneLocked) {
          // Zone is locked - respawn the same boss instead of advancing
          const hp = getBossHp(currentState.zone);
          set({
            bossCurrentHp: hp,
            bossMaxHp: hp,
            bossDefeated: false,
            bossTimer: BOSS_TIMER_SECONDS,
          });
        } else {
          get().nextZone();
        }
      }
    }, 800);
  },

  cleanupEvents: () => {
    const now = Date.now();
    const state = get();
    set({
      damageEvents: state.damageEvents.filter(e => now - e.timestamp < 1500),
      goldDrops: state.goldDrops.filter(g => now - g.timestamp < 2000),
    });
  },

  setBuyAmount: (amount: BuyAmount) => {
    set({ buyAmount: amount });
  },

  toggleZoneLock: () => {
    set((state) => ({ zoneLocked: !state.zoneLocked }));
  },

  saveToServer: async () => {
    try {
      const state = get();
      const saveData: SaveData = {
        gold: state.gold,
        totalGold: state.totalGold,
        zone: state.zone,
        maxZone: state.maxZone,
        heroes: state.heroes,
        totalKills: state.totalKills,
        totalClicks: state.totalClicks,
        clickUpgradeLevel: state.clickUpgradeLevel,
        zoneLocked: state.zoneLocked,
      };
      await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });
    } catch {
      // Silently fail - localStorage is the fallback
    }
  },

  loadFromServer: async (): Promise<SaveData | null> => {
    try {
      const res = await fetch('/api/game/load');
      if (!res.ok) return null;
      const data = await res.json();
      return data.saveData as SaveData | null;
    } catch {
      return null;
    }
  },

  saveGame: () => {
    const state = get();
    const saveData: SaveData = {
      gold: state.gold,
      totalGold: state.totalGold,
      zone: state.zone,
      maxZone: state.maxZone,
      heroes: state.heroes,
      totalKills: state.totalKills,
      totalClicks: state.totalClicks,
      clickUpgradeLevel: state.clickUpgradeLevel,
      zoneLocked: state.zoneLocked,
    };
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      console.log('Game saved to localStorage successfully');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    // Save to server (async, don't await)
    get().saveToServer();
  },

  loadGame: () => {
    // Try to load from server first, then fall back to localStorage
    (async () => {
      try {
        const serverSave = await get().loadFromServer();
        if (serverSave) {
          // Ensure heroes array is never empty - merge with default heroes
          let heroes = serverSave.heroes && serverSave.heroes.length > 0
            ? serverSave.heroes
            : initializeHeroes();
          // Ensure all heroes from HEROES data exist in the array
          const defaultHeroes = initializeHeroes();
          for (const dh of defaultHeroes) {
            if (!heroes.find(h => h.id === dh.id)) {
              heroes.push(dh);
            }
          }
          // Re-sort to match HEROES order
          heroes.sort((a, b) => {
            const aIdx = HEROES.findIndex(h => h.id === a.id);
            const bIdx = HEROES.findIndex(h => h.id === b.id);
            return aIdx - bIdx;
          });
          const hp = getBossHp(serverSave.zone || 1);
          const isBoss = (serverSave.zone || 1) % 5 === 0;
          const totalDps = calculateTotalDps(heroes);
          const clickDamage = calculateClickDamage(heroes, serverSave.clickUpgradeLevel || 0);

          set({
            gold: serverSave.gold || 0,
            totalGold: serverSave.totalGold || 0,
            zone: serverSave.zone || 1,
            maxZone: serverSave.maxZone || 1,
            heroes,
            bossCurrentHp: hp,
            bossMaxHp: hp,
            bossDefeated: false,
            bossTimer: BOSS_TIMER_SECONDS,
            isBossFight: isBoss,
            totalDps,
            clickDamage,
            totalKills: serverSave.totalKills || 0,
            totalClicks: serverSave.totalClicks || 0,
            clickUpgradeLevel: serverSave.clickUpgradeLevel || 0,
            zoneLocked: serverSave.zoneLocked || false,
          });
          return;
        }
      } catch {
        // Fall through to localStorage
      }

      // Fallback to localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const saveData: SaveData = JSON.parse(saved);
        // Ensure heroes array is never empty - merge with default heroes
        let heroes = saveData.heroes && saveData.heroes.length > 0
          ? saveData.heroes
          : initializeHeroes();
        const defaultHeroes = initializeHeroes();
        for (const dh of defaultHeroes) {
          if (!heroes.find(h => h.id === dh.id)) {
            heroes.push(dh);
          }
        }
        heroes.sort((a, b) => {
          const aIdx = HEROES.findIndex(h => h.id === a.id);
          const bIdx = HEROES.findIndex(h => h.id === b.id);
          return aIdx - bIdx;
        });

        const hp = getBossHp(saveData.zone || 1);
        const isBoss = (saveData.zone || 1) % 5 === 0;
        const totalDps = calculateTotalDps(heroes);
        const clickDamage = calculateClickDamage(heroes, saveData.clickUpgradeLevel || 0);

        set({
          gold: saveData.gold || 0,
          totalGold: saveData.totalGold || 0,
          zone: saveData.zone || 1,
          maxZone: saveData.maxZone || 1,
          heroes,
          bossCurrentHp: hp,
          bossMaxHp: hp,
          bossDefeated: false,
          bossTimer: BOSS_TIMER_SECONDS,
          isBossFight: isBoss,
          totalDps,
          clickDamage,
          totalKills: saveData.totalKills || 0,
          totalClicks: saveData.totalClicks || 0,
          clickUpgradeLevel: saveData.clickUpgradeLevel || 0,
          zoneLocked: saveData.zoneLocked || false,
        });
      } catch {
        // Silently fail
      }
    })();
  },

  resetGame: () => {
    const hp = getBossHp(1);
    const heroes = initializeHeroes();
    set({
      gold: 0,
      totalGold: 0,
      zone: 1,
      maxZone: 1,
      bossCurrentHp: hp,
      bossMaxHp: hp,
      clickDamage: 1,
      totalDps: 0,
      bossTimer: BOSS_TIMER_SECONDS,
      heroes,
      damageEvents: [],
      goldDrops: [],
      isBossFight: false,
      bossDefeated: false,
      totalKills: 0,
      totalClicks: 0,
      clickUpgradeLevel: 0,
      zoneLocked: false,
      achievements: [],
      newAchievement: null,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail
    }
    // Also reset server save
    get().saveToServer();
  },

  clearAchievementNotification: () => {
    set({ newAchievement: null });
  },

  loadAchievements: async () => {
    try {
      const res = await fetch('/api/game/achievements');
      if (!res.ok) return;
      const data = await res.json();
      set({ achievements: data.achievements || [] });
    } catch {
      // Silently fail
    }
  },

  saveAchievements: async () => {
    try {
      const state = get();
      await fetch('/api/game/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievements: state.achievements }),
      });
    } catch {
      // Silently fail
    }
  },
}));
