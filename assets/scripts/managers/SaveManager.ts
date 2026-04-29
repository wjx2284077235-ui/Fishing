import { sys } from 'cc';
import { FISH_POOL, FishCollectionRecord } from '../data/FishData';

export interface SaveData {
    gold: number;
    rodLevel: number;
    collectionRecords: FishCollectionRecord[];
}

const SAVE_KEY = 'Fishing_V0_1_SaveData';

export class SaveManager {
    public static loadGame(): SaveData {
        const defaultData = SaveManager.createDefaultSaveData();
        const rawData = sys.localStorage.getItem(SAVE_KEY);

        if (!rawData) {
            return defaultData;
        }

        try {
            const parsedData = JSON.parse(rawData) as Partial<SaveData>;
            return {
                gold: Math.max(0, Number(parsedData.gold) || 0),
                rodLevel: Math.max(1, Number(parsedData.rodLevel) || 1),
                collectionRecords: SaveManager.mergeCollectionRecords(parsedData.collectionRecords),
            };
        } catch (error) {
            console.warn('[SaveManager] Failed to parse save data. Using default save.', error);
            return defaultData;
        }
    }

    public static saveGame(data: SaveData): void {
        const saveData: SaveData = {
            gold: Math.max(0, Math.floor(data.gold)),
            rodLevel: Math.max(1, Math.floor(data.rodLevel)),
            collectionRecords: SaveManager.mergeCollectionRecords(data.collectionRecords),
        };

        sys.localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    }

    public static resetGame(): SaveData {
        sys.localStorage.removeItem(SAVE_KEY);
        return SaveManager.createDefaultSaveData();
    }

    public static createDefaultSaveData(): SaveData {
        return {
            gold: 0,
            rodLevel: 1,
            collectionRecords: FISH_POOL.map((fish) => ({
                fishId: fish.id,
                unlocked: false,
                maxWeight: 0,
                catchCount: 0,
            })),
        };
    }

    private static mergeCollectionRecords(records?: FishCollectionRecord[]): FishCollectionRecord[] {
        const recordMap = new Map<string, FishCollectionRecord>();

        if (records) {
            for (const record of records) {
                recordMap.set(record.fishId, {
                    fishId: record.fishId,
                    unlocked: Boolean(record.unlocked),
                    maxWeight: Number(record.maxWeight) || 0,
                    catchCount: Number(record.catchCount) || 0,
                });
            }
        }

        return FISH_POOL.map((fish) => {
            const record = recordMap.get(fish.id);
            return record ?? {
                fishId: fish.id,
                unlocked: false,
                maxWeight: 0,
                catchCount: 0,
            };
        });
    }
}
