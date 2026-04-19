export interface HeroDefinition {
  id: string;
  name: string;
  title: string;
  baseDps: number;
  baseCost: number;
  emoji: string;
}

export const HEROES: HeroDefinition[] = [
  {
    id: 'cid',
    name: 'Cid',
    title: 'O Prestativo',
    baseDps: 1,
    baseCost: 50,
    emoji: '🧙',
  },
  {
    id: 'treebeast',
    name: 'Treebeast',
    title: 'Guardião da Floresta',
    baseDps: 5,
    baseCost: 250,
    emoji: '🌳',
  },
  {
    id: 'ivan',
    name: 'Ivan',
    title: 'O Brigão Embriagado',
    baseDps: 22,
    baseCost: 1000,
    emoji: '🍺',
  },
  {
    id: 'brittany',
    name: 'Brittany',
    title: 'Princesa da Praia',
    baseDps: 74,
    baseCost: 4000,
    emoji: '👸',
  },
  {
    id: 'fisherman',
    name: 'Pescador',
    title: 'Mestre dos Mares',
    baseDps: 245,
    baseCost: 18000,
    emoji: '🎣',
  },
  {
    id: 'betty',
    name: 'Betty Clicker',
    title: 'Rainha dos Cliques',
    baseDps: 976,
    baseCost: 72000,
    emoji: '🖱️',
  },
  {
    id: 'samurai',
    name: 'Samurai',
    title: 'Lâmina Silenciosa',
    baseDps: 3725,
    baseCost: 300000,
    emoji: '⚔️',
  },
  {
    id: 'leon',
    name: 'Leon',
    title: 'Pele de Ferro',
    baseDps: 14000,
    baseCost: 1200000,
    emoji: '🛡️',
  },
  {
    id: 'darkseer',
    name: 'Vidente Sombrio',
    title: 'Olhar do Abismo',
    baseDps: 52000,
    baseCost: 5000000,
    emoji: '👁️',
  },
  {
    id: 'alexa',
    name: 'Alexa',
    title: 'A Assassina',
    baseDps: 195000,
    baseCost: 20000000,
    emoji: '🗡️',
  },
  {
    id: 'natalia',
    name: 'Natalia',
    title: 'Aprendiz de Gelo',
    baseDps: 725000,
    baseCost: 80000000,
    emoji: '❄️',
  },
  {
    id: 'mercedes',
    name: 'Mercedes',
    title: 'Duquesa das Lâminas',
    baseDps: 2700000,
    baseCost: 320000000,
    emoji: '⚔️',
  },
];
