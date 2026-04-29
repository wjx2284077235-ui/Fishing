import { FISH_POOL, FishCollectionRecord } from '../data/FishData';

export interface CollectionUpdateResult {
    records: FishCollectionRecord[];
    isNewRecord: boolean;
}

export class CollectionManager {
    private _records: FishCollectionRecord[] = [];

    public initialize(savedRecords?: FishCollectionRecord[]): void {
        const savedRecordMap = new Map<string, FishCollectionRecord>();

        if (savedRecords) {
            for (const record of savedRecords) {
                savedRecordMap.set(record.fishId, {
                    fishId: record.fishId,
                    unlocked: Boolean(record.unlocked),
                    maxWeight: Number(record.maxWeight) || 0,
                    catchCount: Number(record.catchCount) || 0,
                });
            }
        }

        this._records = FISH_POOL.map((fish) => {
            const savedRecord = savedRecordMap.get(fish.id);
            return savedRecord ?? {
                fishId: fish.id,
                unlocked: false,
                maxWeight: 0,
                catchCount: 0,
            };
        });
    }

    public recordCatch(fishId: string, weight: number): CollectionUpdateResult {
        const record = this.getOrCreateRecord(fishId);
        const isNewRecord = weight > record.maxWeight;

        record.unlocked = true;
        record.catchCount += 1;

        if (isNewRecord) {
            record.maxWeight = weight;
        }

        return {
            records: this.getRecords(),
            isNewRecord,
        };
    }

    public getRecords(): FishCollectionRecord[] {
        return this._records.map((record) => ({ ...record }));
    }

    public getRecord(fishId: string): FishCollectionRecord | undefined {
        const record = this._records.find((item) => item.fishId === fishId);
        return record ? { ...record } : undefined;
    }

    private getOrCreateRecord(fishId: string): FishCollectionRecord {
        let record = this._records.find((item) => item.fishId === fishId);

        if (!record) {
            record = {
                fishId,
                unlocked: false,
                maxWeight: 0,
                catchCount: 0,
            };
            this._records.push(record);
        }

        return record;
    }
}
