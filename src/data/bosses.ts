export interface BossDefinition {
  name: string;
  emoji: string;
  isBoss: boolean;
}

const BOSS_NAMES: string[][] = [
  // Zones 1-5
  ['Slime', 'Goblin', 'Esqueleto', 'Lobo Selvagem', 'Ogro'],
  // Zones 6-10
  ['Morcego Gigante', 'Aranha Venenosa', 'Zumbi', 'Harpia', 'Ciclope'],
  // Zones 11-15
  ['Minotauro', 'Medusa', 'Quimera', 'Hidra', 'Dragão Menor'],
  // Zones 16-20
  ['Demônio', 'Lich', 'Golem de Pedra', 'Fênix Sombria', 'Titã'],
  // Zones 21-25
  ['Wendigo', 'Basilisco', 'Cerberus', 'Kraken', 'Dragão Ancião'],
  // Zones 26-30
  ['Necromante', 'Espectro', 'Vampiro', 'Golem de Ferro', 'Senhor dos Demônios'],
  // Zones 31-35
  ['Devorador de Mundos', 'Sombra Eterna', 'Anjo Caído', 'Colosso', 'Deus da Destruição'],
];

const BOSS_EMOJIS: string[][] = [
  // Zones 1-5
  ['🟢', '👺', '💀', '🐺', '👹'],
  // Zones 6-10
  ['🦇', '🕷️', '🧟', '🦅', '👁️'],
  // Zones 11-15
  ['🐂', '🐍', '🦁', '🐲', '🐉'],
  // Zones 16-20
  ['😈', '☠️', '🗿', '🔥', '⚡'],
  // Zones 21-25
  ['🦬', '🦂', '🐕', '🐙', '🐲'],
  // Zones 26-30
  ['🧙', '👻', '🧛', '⚙️', '👿'],
  // Zones 31-35
  ['🕳️', '🌑', '👼', '🏔️', '💀'],
];

const SPECIAL_BOSS_NAMES = [
  'O GRANDE OGRE',        // zone 5
  'CICLOPE IMORTAL',      // zone 10
  'DRAGÃO PRIMITIVO',     // zone 15
  'TITÃ DO CAOS',         // zone 20
  'DRAGÃO ANCIAO',        // zone 25
  'SENHOR DAS TREVAS',    // zone 30
  'DESTRUIDOR DE MUNDOS', // zone 35
  'ENTIDADE SUPREMA',     // zone 40
  'ARCANJO CAÍDO',        // zone 45
  'DEUS DA MORTE',        // zone 50
];

const SPECIAL_BOSS_EMOJIS = ['👹', '👁️', '🐲', '⚡', '🐉', '👿', '🕳️', '🌑', '👼', '💀'];

// --- Procedural generation (zones > 35 for mobs, zones > 50 for bosses) ---

const PROC_MOB_PREFIXES = [
  'Antigo', 'Eterno', 'Sombrio', 'Caótico', 'Primordial', 'Corrompido',
  'Celestial', 'Abissal', 'Maldito', 'Infernal', 'Arcano', 'Proibido',
  'Esquecido', 'Renegado', 'Amaldiçoado',
];

const PROC_MOB_CREATURES = [
  'Golem', 'Dragão', 'Demônio', 'Espectro', 'Colosso', 'Leviatã',
  'Behemoth', 'Titã', 'Quimera', 'Hidra', 'Lich', 'Vampiro',
  'Necromante', 'Basilisco', 'Wendigo', 'Kraken', 'Fênix', 'Grifo',
  'Manticora', 'Wyvern',
];

const PROC_MOB_SUFFIXES = [
  'das Sombras', 'do Caos', 'Primordial', 'Eterno', 'Corrompido',
  'das Trevas', 'do Vazio', 'Amaldiçoado', 'do Apocalipse', 'Imortal',
  'Renascido', 'Maldito', 'do Além', 'do Abismo', 'da Perdição',
];

const PROC_BOSS_TITLES = [
  'SENHOR', 'REI', 'IMPERADOR', 'DEUS', 'ARCANJO', 'DESTRUIDOR',
  'DEVORADOR', 'GUARDIÃO', 'ANCESTRAL', 'COLOSSO', 'PROFETA', 'JUIZ',
];

const PROC_BOSS_DOMAINS = [
  'DO CAOS', 'DAS TREVAS', 'DO VAZIO', 'DOS MUNDOS', 'DA ETERNIDADE',
  'DO APOCALIPSE', 'DA MORTE', 'DO INFERNO', 'DO ABISMO', 'DA DESTRUIÇÃO',
  'DO FIM', 'DA PERDIÇÃO', 'DO ALÉM', 'DA CONDENAÇÃO', 'DO SILÊNCIO',
];

const PROC_MOB_EMOJIS = [
  '💀', '🌑', '🕳️', '👿', '😈', '🔥', '⚡', '🌋', '☄️', '🌪️',
  '🌊', '💥', '🗡️', '👁️', '🦴',
];

const PROC_BOSS_EMOJIS_POOL = [
  '💀', '🌑', '🕳️', '👿', '😈', '🔥', '⚡', '🌋', '☄️', '🌪️', '🌊', '💥',
];

/**
 * Generates a unique mob name for any zone > 35.
 * Phase 1 (zones 36-335):  "Prefix Creature"       → 15×20 = 300 unique names
 * Phase 2 (zones 336-635): "Creature Suffix"        → 20×15 = 300 unique names
 * Phase 3 (zones 636+):    "Prefix Creature Suffix" → 15×20×15 = 4500 unique names
 * Total unique names before any repeat: 5100
 */
function generateProcMobName(zone: number): string {
  const P = PROC_MOB_PREFIXES.length;   // 15
  const C = PROC_MOB_CREATURES.length;  // 20
  const S = PROC_MOB_SUFFIXES.length;   // 15
  const i = zone - 36; // 0-based

  const phase1End = P * C;              // 300
  const phase2End = phase1End + C * S;  // 600

  if (i < phase1End) {
    return `${PROC_MOB_PREFIXES[i % P]} ${PROC_MOB_CREATURES[Math.floor(i / P) % C]}`;
  }
  if (i < phase2End) {
    const j = i - phase1End;
    return `${PROC_MOB_CREATURES[j % C]} ${PROC_MOB_SUFFIXES[Math.floor(j / C) % S]}`;
  }
  const j = i - phase2End;
  return `${PROC_MOB_PREFIXES[j % P]} ${PROC_MOB_CREATURES[Math.floor(j / P) % C]} ${PROC_MOB_SUFFIXES[Math.floor(j / (P * C)) % S]}`;
}

/**
 * Generates a unique boss name for bosses after zone 50.
 * 12 titles × 15 domains = 180 unique names → repeats only after zone 950.
 */
function generateProcBossName(zone: number): string {
  const specialIndex = Math.floor(zone / 5) - 1;
  const i = specialIndex - SPECIAL_BOSS_NAMES.length; // 0-based after predefined bosses
  const T = PROC_BOSS_TITLES.length;  // 12
  const D = PROC_BOSS_DOMAINS.length; // 15
  return `${PROC_BOSS_TITLES[i % T]} ${PROC_BOSS_DOMAINS[Math.floor(i / T) % D]}`;
}

export function getBossDefinition(zone: number): BossDefinition {
  const isBoss = zone % 5 === 0;

  if (isBoss) {
    const specialIndex = Math.floor(zone / 5) - 1;
    if (specialIndex < SPECIAL_BOSS_NAMES.length) {
      return {
        name: SPECIAL_BOSS_NAMES[specialIndex],
        emoji: SPECIAL_BOSS_EMOJIS[specialIndex],
        isBoss: true,
      };
    }
    // Procedural boss (zones > 50)
    const procIdx = specialIndex - SPECIAL_BOSS_NAMES.length;
    return {
      name: generateProcBossName(zone),
      emoji: PROC_BOSS_EMOJIS_POOL[procIdx % PROC_BOSS_EMOJIS_POOL.length],
      isBoss: true,
    };
  }

  // Regular mob: static for zones 1-35, procedural for zones 36+
  const rawGroupIndex = Math.floor((zone - 1) / 5);
  if (rawGroupIndex < BOSS_NAMES.length) {
    const posIndex = (zone - 1) % 5;
    return {
      name: BOSS_NAMES[rawGroupIndex][posIndex],
      emoji: BOSS_EMOJIS[rawGroupIndex][posIndex],
      isBoss: false,
    };
  }

  // Procedural mob (zones > 35)
  return {
    name: generateProcMobName(zone),
    emoji: PROC_MOB_EMOJIS[(zone - 36) % PROC_MOB_EMOJIS.length],
    isBoss: false,
  };
}

export function getBossHp(zone: number): number {
  const baseHp = 10;
  const isBoss = zone % 5 === 0;
  const hp = baseHp * Math.pow(1.55, zone);
  return Math.ceil(isBoss ? hp * 10 : hp);
}

export function getBossGold(zone: number): number {
  const baseGold = 5;
  return Math.ceil(baseGold * Math.pow(1.45, zone));
}
