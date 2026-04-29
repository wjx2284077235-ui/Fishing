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
}

export const FISH_POOL: FishData[] = [
    {
        id: 'bream',
        name: 'Bream',
        rarity: FishRarity.Common,
        minWeight: 0.3,
        maxWeight: 1.2,
        basePrice: 10,
        safeZoneAngle: 90,
        pointerSpeed: 120,
        requiredSuccessCount: 1,
    },
    {
        id: 'flathead',
        name: 'Flathead',
        rarity: FishRarity.Uncommon,
        minWeight: 0.8,
        maxWeight: 2.5,
        basePrice: 25,
        safeZoneAngle: 70,
        pointerSpeed: 160,
        requiredSuccessCount: 1,
    },
    {
        id: 'snapper',
        name: 'Snapper',
        rarity: FishRarity.Rare,
        minWeight: 1.5,
        maxWeight: 5.0,
        basePrice: 60,
        safeZoneAngle: 50,
        pointerSpeed: 200,
        requiredSuccessCount: 2,
    },
    {
        id: 'mangrove_jack',
        name: 'Mangrove Jack',
        rarity: FishRarity.Epic,
        minWeight: 2.0,
        maxWeight: 8.0,
        basePrice: 150,
        safeZoneAngle: 35,
        pointerSpeed: 260,
        requiredSuccessCount: 3,
    },
    {
        id: 'golden_barramundi',
        name: 'Golden Barramundi',
        rarity: FishRarity.Legendary,
        minWeight: 5.0,
        maxWeight: 15.0,
        basePrice: 500,
        safeZoneAngle: 25,
        pointerSpeed: 320,
        requiredSuccessCount: 4,
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
    const totalWeight = FISH_POOL.reduce((sum, fish) => sum + getFishSpawnWeight(fish), 0);
    let roll = Math.random() * totalWeight;

    for (const fish of FISH_POOL) {
        roll -= getFishSpawnWeight(fish);
        if (roll <= 0) {
            return fish;
        }
    }

    return FISH_POOL[0];
}

export function getFishSpawnWeight(fish: FishData): number {
    return FISH_WEIGHT_TABLE[fish.id] ?? 0;
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
