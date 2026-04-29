import { Color } from 'cc';

export enum FishRarity {
    Common = 'Common',
    Uncommon = 'Uncommon',
    Rare = 'Rare',
    Epic = 'Epic',
    Legendary = 'Legendary',
}

export interface FishData {
    id: string;
    name: string;
    rarity: FishRarity;
    minWeight: number;
    maxWeight: number;
    basePrice: number;
    safeZoneAngle: number;
    pointerSpeed: number;
    requiredSuccessCount: number;
    imageKey: string;
}

export interface FishCollectionRecord {
    fishId: string;
    unlocked: boolean;
    maxWeight: number;
    catchCount: number;
}

export interface FishCatchResult {
    fish: FishData;
    weight: number;
    sellPrice: number;
    isNewRecord: boolean;
    wasPerfect: boolean;
    upgradedFromRarity: FishRarity | null;
}

export const FIXED_POINTER_SPEED = 180;
export const PERFECT_ZONE_RATIO = 1 / 128;

export const RARITY_ORDER: FishRarity[] = [
    FishRarity.Common,
    FishRarity.Uncommon,
    FishRarity.Rare,
    FishRarity.Epic,
    FishRarity.Legendary,
];

export const RARITY_LABELS: Record<FishRarity, string> = {
    [FishRarity.Common]: '普通',
    [FishRarity.Uncommon]: '稀有',
    [FishRarity.Rare]: '罕见',
    [FishRarity.Epic]: '传说',
    [FishRarity.Legendary]: '鱼王',
};

export const RARITY_SAFE_ZONE_RATIO: Record<FishRarity, number> = {
    [FishRarity.Common]: 1 / 4,
    [FishRarity.Uncommon]: 1 / 8,
    [FishRarity.Rare]: 1 / 16,
    [FishRarity.Epic]: 1 / 32,
    [FishRarity.Legendary]: 1 / 128,
};

export const RARITY_ROLL_WEIGHT: Record<FishRarity, number> = {
    [FishRarity.Common]: 60,
    [FishRarity.Uncommon]: 25,
    [FishRarity.Rare]: 10,
    [FishRarity.Epic]: 4,
    [FishRarity.Legendary]: 1,
};

export const PERFECT_UPGRADE_CHANCE: Partial<Record<FishRarity, number>> = {
    [FishRarity.Common]: 1,
    [FishRarity.Uncommon]: 0.75,
    [FishRarity.Rare]: 0.4,
    [FishRarity.Epic]: 0.2,
};

export const RARITY_GLOW_COLORS: Record<FishRarity, Color> = {
    [FishRarity.Common]: new Color(255, 255, 255, 210),
    [FishRarity.Uncommon]: new Color(62, 154, 255, 220),
    [FishRarity.Rare]: new Color(179, 91, 255, 225),
    [FishRarity.Epic]: new Color(255, 207, 67, 230),
    [FishRarity.Legendary]: new Color(255, 59, 62, 235),
};

export const FISH_POOL: FishData[] = [
    {
        id: 'bream',
        name: '鲷鱼',
        rarity: FishRarity.Common,
        minWeight: 0.3,
        maxWeight: 1.2,
        basePrice: 10,
        safeZoneAngle: 72,
        pointerSpeed: 120,
        requiredSuccessCount: 1,
        imageKey: 'fish_bream_pixel',
    },
    {
        id: 'flathead',
        name: '牛尾鱼',
        rarity: FishRarity.Uncommon,
        minWeight: 0.8,
        maxWeight: 2.5,
        basePrice: 25,
        safeZoneAngle: 54,
        pointerSpeed: 160,
        requiredSuccessCount: 2,
        imageKey: 'fish_flathead_pixel',
    },
    {
        id: 'snapper',
        name: '红鲷',
        rarity: FishRarity.Rare,
        minWeight: 1.5,
        maxWeight: 5.0,
        basePrice: 60,
        safeZoneAngle: 38,
        pointerSpeed: 200,
        requiredSuccessCount: 3,
        imageKey: 'fish_snapper_pixel',
    },
    {
        id: 'mangrove_jack',
        name: '红鲈',
        rarity: FishRarity.Epic,
        minWeight: 2.0,
        maxWeight: 8.0,
        basePrice: 150,
        safeZoneAngle: 26,
        pointerSpeed: 260,
        requiredSuccessCount: 4,
        imageKey: 'fish_mangrove_jack_pixel',
    },
    {
        id: 'golden_barramundi',
        name: '黄金尖吻鲈',
        rarity: FishRarity.Legendary,
        minWeight: 5.0,
        maxWeight: 15.0,
        basePrice: 500,
        safeZoneAngle: 16,
        pointerSpeed: 320,
        requiredSuccessCount: 5,
        imageKey: 'fish_golden_barramundi_pixel',
    },
];

export const FISH_WEIGHT_TABLE: Record<string, number> = {
    bream: 50,
    flathead: 25,
    snapper: 15,
    mangrove_jack: 8,
    golden_barramundi: 2,
};

export function selectRandomFish(): FishData {
    return selectRandomFishByRarity(selectRandomRarity());
}

export function selectRandomRarity(): FishRarity {
    const totalWeight = RARITY_ORDER.reduce((sum, rarity) => sum + RARITY_ROLL_WEIGHT[rarity], 0);
    let roll = Math.random() * totalWeight;

    for (const rarity of RARITY_ORDER) {
        roll -= RARITY_ROLL_WEIGHT[rarity];
        if (roll <= 0) {
            return rarity;
        }
    }

    return FishRarity.Common;
}

export function selectRandomFishByRarity(rarity: FishRarity): FishData {
    const fishPool = FISH_POOL.filter((fish) => fish.rarity === rarity);

    if (fishPool.length === 0) {
        return FISH_POOL[0];
    }

    const totalWeight = fishPool.reduce((sum, fish) => sum + Math.max(0, getFishSpawnWeight(fish)), 0);

    if (totalWeight <= 0) {
        return fishPool[Math.floor(Math.random() * fishPool.length)];
    }

    let roll = Math.random() * totalWeight;

    for (const fish of fishPool) {
        roll -= Math.max(0, getFishSpawnWeight(fish));
        if (roll <= 0) {
            return fish;
        }
    }

    return fishPool[0];
}

export function getFishSpawnWeight(fish: FishData): number {
    return FISH_WEIGHT_TABLE[fish.id] ?? 0;
}

export function getRarityLabel(rarity: FishRarity): string {
    return RARITY_LABELS[rarity] ?? '未知';
}

export function getSafeZoneAngleByRarity(rarity: FishRarity): number {
    return 360 * (RARITY_SAFE_ZONE_RATIO[rarity] ?? RARITY_SAFE_ZONE_RATIO[FishRarity.Common]);
}

export function getPerfectZoneAngle(): number {
    return 360 * PERFECT_ZONE_RATIO;
}

export function getNextRarity(rarity: FishRarity): FishRarity | null {
    const index = RARITY_ORDER.indexOf(rarity);

    if (index < 0 || index >= RARITY_ORDER.length - 1) {
        return null;
    }

    return RARITY_ORDER[index + 1];
}

export function tryUpgradeFishByPerfect(originalFish: FishData): { fish: FishData; upgradedFromRarity: FishRarity | null } {
    const upgradeChance = PERFECT_UPGRADE_CHANCE[originalFish.rarity] ?? 0;
    const nextRarity = getNextRarity(originalFish.rarity);

    if (!nextRarity || Math.random() > upgradeChance) {
        return {
            fish: originalFish,
            upgradedFromRarity: null,
        };
    }

    return {
        fish: selectRandomFishByRarity(nextRarity),
        upgradedFromRarity: originalFish.rarity,
    };
}

export function isAngleInSafeZone(pointerAngle: number, safeStartAngle: number, safeZoneAngle: number): boolean {
    const pointer = normalizeAngle(pointerAngle);
    const start = normalizeAngle(safeStartAngle);
    const end = normalizeAngle(start + safeZoneAngle);

    if (safeZoneAngle >= 360) {
        return true;
    }

    if (start <= end) {
        return pointer >= start && pointer <= end;
    }

    return pointer >= start || pointer <= end;
}

export function normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
}

export function randomWeight(fish: FishData): number {
    const rawWeight = fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight);
    return Math.round(rawWeight * 100) / 100;
}

export function calculateSellPrice(fish: FishData, weight: number): number {
    return Math.floor(fish.basePrice * weight);
}
