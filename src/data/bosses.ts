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
  // Zones 31+
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
  // Zones 31+
  ['🕳️', '🌑', '👼', '🏔️', '💀'],
];

const SPECIAL_BOSS_NAMES = [
  'O GRANDE OGRE',
  'CICLOPE IMORTAL',
  'DRAGÃO PRIMITIVO',
  'TITÃ DO CAOS',
  'DRAGÃO ANCIAO',
  'SENHOR DAS TREVAS',
  'DESTRUIDOR DE MUNDOS',
  'ENTIDADE SUPREMA',
  'ARCANJO CAÍDO',
  'DEUS DA MORTE',
];

const SPECIAL_BOSS_EMOJIS = ['👹', '👁️', '🐲', '⚡', '🐉', '👿', '🕳️', '🌑', '👼', '💀'];

function getGroupIndex(zone: number): number {
  return Math.min(Math.floor((zone - 1) / 5), BOSS_NAMES.length - 1);
}

function getPositionInGroup(zone: number): number {
  return (zone - 1) % 5;
}

export function getBossDefinition(zone: number): BossDefinition {
  const isBoss = zone % 5 === 0;
  const groupIndex = getGroupIndex(zone);
  const posIndex = getPositionInGroup(zone);

  if (isBoss) {
    const specialIndex = Math.min(Math.floor(zone / 5) - 1, SPECIAL_BOSS_NAMES.length - 1);
    return {
      name: SPECIAL_BOSS_NAMES[specialIndex],
      emoji: SPECIAL_BOSS_EMOJIS[specialIndex],
      isBoss: true,
    };
  }

  const names = BOSS_NAMES[groupIndex];
  const emojis = BOSS_EMOJIS[groupIndex];
  const index = posIndex;

  return {
    name: names[index] || `Criatura Nível ${zone}`,
    emoji: emojis[index] || '👾',
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
