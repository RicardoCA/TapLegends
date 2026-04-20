export interface AchievementDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    zoneRequired: number;
    isBoss: boolean;
}

// Achievements are unlocked by defeating mobs/bosses in each zone
// Zone 5, 10, 15, etc. are boss zones
export const ACHIEVEMENTS: AchievementDefinition[] = [
    // Zones 1-5
    {
        id: 'zone_1',
        name: 'Primeira Vitória',
        description: 'Derrote o Slime na Zona 1',
        icon: '🟢',
        zoneRequired: 1,
        isBoss: false,
    },
    {
        id: 'zone_2',
        name: 'Caçador de Goblins',
        description: 'Derrote o Goblin na Zona 2',
        icon: '👺',
        zoneRequired: 2,
        isBoss: false,
    },
    {
        id: 'zone_3',
        name: 'Ossos Rotos',
        description: 'Derrote o Esqueleto na Zona 3',
        icon: '💀',
        zoneRequired: 3,
        isBoss: false,
    },
    {
        id: 'zone_4',
        name: 'Domador de Lobos',
        description: 'Derrote o Lobo Selvagem na Zona 4',
        icon: '🐺',
        zoneRequired: 4,
        isBoss: false,
    },
    {
        id: 'zone_5',
        name: 'Ogrocida',
        description: 'Derrote O GRANDE OGRE (Chefe da Zona 5)',
        icon: '👹',
        zoneRequired: 5,
        isBoss: true,
    },
    // Zones 6-10
    {
        id: 'zone_6',
        name: 'Caçador de Morcegos',
        description: 'Derrote o Morcego Gigante na Zona 6',
        icon: '🦇',
        zoneRequired: 6,
        isBoss: false,
    },
    {
        id: 'zone_7',
        name: 'Antídoto',
        description: 'Derrote a Aranha Venenosa na Zona 7',
        icon: '🕷️',
        zoneRequired: 7,
        isBoss: false,
    },
    {
        id: 'zone_8',
        name: 'Necromante Amador',
        description: 'Derrote o Zumbi na Zona 8',
        icon: '🧟',
        zoneRequired: 8,
        isBoss: false,
    },
    {
        id: 'zone_9',
        name: 'Cortador de Asas',
        description: 'Derrote a Harpia na Zona 9',
        icon: '🦅',
        zoneRequired: 9,
        isBoss: false,
    },
    {
        id: 'zone_10',
        name: 'Olho por Olho',
        description: 'Derrote o CICLOPE IMORTAL (Chefe da Zona 10)',
        icon: '👁️',
        zoneRequired: 10,
        isBoss: true,
    },
    // Zones 11-15
    {
        id: 'zone_11',
        name: 'Labirinto Superado',
        description: 'Derrote o Minotauro na Zona 11',
        icon: '🐂',
        zoneRequired: 11,
        isBoss: false,
    },
    {
        id: 'zone_12',
        name: 'Sem Pedra',
        description: 'Derrote a Medusa na Zona 12',
        icon: '🐍',
        zoneRequired: 12,
        isBoss: false,
    },
    {
        id: 'zone_13',
        name: 'Domador de Quimeras',
        description: 'Derrote a Quimera na Zona 13',
        icon: '🦁',
        zoneRequired: 13,
        isBoss: false,
    },
    {
        id: 'zone_14',
        name: 'Cortador de Cabeças',
        description: 'Derrote a Hidra na Zona 14',
        icon: '🐲',
        zoneRequired: 14,
        isBoss: false,
    },
    {
        id: 'zone_15',
        name: 'Domador de Dragões',
        description: 'Derrote o DRAGÃO PRIMITIVO (Chefe da Zona 15)',
        icon: '🐉',
        zoneRequired: 15,
        isBoss: true,
    },
    // Zones 16-20
    {
        id: 'zone_16',
        name: 'Exorcista',
        description: 'Derrote o Demônio na Zona 16',
        icon: '😈',
        zoneRequired: 16,
        isBoss: false,
    },
    {
        id: 'zone_17',
        name: 'Caçador de Mortos-Vivos',
        description: 'Derrote o Lich na Zona 17',
        icon: '☠️',
        zoneRequired: 17,
        isBoss: false,
    },
    {
        id: 'zone_18',
        name: 'Demolidor',
        description: 'Derrote o Golem de Pedra na Zona 18',
        icon: '🗿',
        zoneRequired: 18,
        isBoss: false,
    },
    {
        id: 'zone_19',
        name: 'Asas Negras',
        description: 'Derrote a Fênix Sombria na Zona 19',
        icon: '🔥',
        zoneRequired: 19,
        isBoss: false,
    },
    {
        id: 'zone_20',
        name: 'Detonador de Titãs',
        description: 'Derrote o TITÃ DO CAOS (Chefe da Zona 20)',
        icon: '⚡',
        zoneRequired: 20,
        isBoss: true,
    },
    // Zones 21-25
    {
        id: 'zone_21',
        name: 'Caçador de Criaturas',
        description: 'Derrote o Wendigo na Zona 21',
        icon: '🦬',
        zoneRequired: 21,
        isBoss: false,
    },
    {
        id: 'zone_22',
        name: 'Mestre de Venenos',
        description: 'Derrote o Basilisco na Zona 22',
        icon: '🦂',
        zoneRequired: 22,
        isBoss: false,
    },
    {
        id: 'zone_23',
        name: 'Domador de Cérberos',
        description: 'Derrote o Cérbero na Zona 23',
        icon: '🐕',
        zoneRequired: 23,
        isBoss: false,
    },
    {
        id: 'zone_24',
        name: 'Terror do Mar',
        description: 'Derrote o Kraken na Zona 24',
        icon: '🐙',
        zoneRequired: 24,
        isBoss: false,
    },
    {
        id: 'zone_25',
        name: 'Senhor dos Dragões',
        description: 'Derrote o DRAGÃO ANCIÃO (Chefe da Zona 25)',
        icon: '🐲',
        zoneRequired: 25,
        isBoss: true,
    },
    // Zones 26-30
    {
        id: 'zone_26',
        name: 'Anti-Magia',
        description: 'Derrote o Necromante na Zona 26',
        icon: '🧙',
        zoneRequired: 26,
        isBoss: false,
    },
    {
        id: 'zone_27',
        name: 'Caçador de Fantasmas',
        description: 'Derrote o Espectro na Zona 27',
        icon: '👻',
        zoneRequired: 27,
        isBoss: false,
    },
    {
        id: 'zone_28',
        name: 'Estaca de Prata',
        description: 'Derrote o Vampiro na Zona 28',
        icon: '🧛',
        zoneRequired: 28,
        isBoss: false,
    },
    {
        id: 'zone_29',
        name: 'Máquina Destruidora',
        description: 'Derrote o Golem de Ferro na Zona 29',
        icon: '⚙️',
        zoneRequired: 29,
        isBoss: false,
    },
    {
        id: 'zone_30',
        name: 'Salvador da Humanidade',
        description: 'Derrote o SENHOR DAS TREVAS (Chefe da Zona 30)',
        icon: '👿',
        zoneRequired: 30,
        isBoss: true,
    },
    // Zones 31-35
    {
        id: 'zone_31',
        name: 'Além da Realidade',
        description: 'Derrote o Devorador de Mundos na Zona 31',
        icon: '🕳️',
        zoneRequired: 31,
        isBoss: false,
    },
    {
        id: 'zone_32',
        name: 'Luz nas Trevas',
        description: 'Derrote a Sombra Eterna na Zona 32',
        icon: '🌑',
        zoneRequired: 32,
        isBoss: false,
    },
    {
        id: 'zone_33',
        name: 'Redentor',
        description: 'Derrote o Anjo Caído na Zona 33',
        icon: '👼',
        zoneRequired: 33,
        isBoss: false,
    },
    {
        id: 'zone_34',
        name: 'Gigante Caído',
        description: 'Derrote o Colosso na Zona 34',
        icon: '🏔️',
        zoneRequired: 34,
        isBoss: false,
    },
    {
        id: 'zone_35',
        name: 'Deus Caído',
        description: 'Derrote o DEUS DA DESTRUIÇÃO (Chefe da Zona 35)',
        icon: '💀',
        zoneRequired: 35,
        isBoss: true,
    },
];

export function getAchievementById(id: string): AchievementDefinition | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementForZone(zone: number): AchievementDefinition | undefined {
    return ACHIEVEMENTS.find(a => a.zoneRequired === zone);
}