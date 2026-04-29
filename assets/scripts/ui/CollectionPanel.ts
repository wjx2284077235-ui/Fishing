import { _decorator, Button, Component, Label } from 'cc';
import { FISH_POOL, FishCollectionRecord } from '../data/FishData';

const { ccclass, property } = _decorator;

@ccclass('CollectionPanel')
export class CollectionPanel extends Component {
    @property({ type: [Label] })
    public fishEntryLabels: Label[] = [];

    @property(Button)
    public closeButton: Button | null = null;

    public onCloseRequested: (() => void) | null = null;

    protected onLoad(): void {
        this.closeButton?.node?.on(Button.EventType.CLICK, this.handleCloseClicked, this);
    }

    protected onDestroy(): void {
        this.closeButton?.node?.off(Button.EventType.CLICK, this.handleCloseClicked, this);
    }

    public show(records: FishCollectionRecord[]): void {
        this.node.active = true;
        this.refresh(records);
    }

    public hide(): void {
        this.node.active = false;
    }

    public refresh(records: FishCollectionRecord[]): void {
        const recordMap = new Map<string, FishCollectionRecord>();

        for (const record of records) {
            recordMap.set(record.fishId, record);
        }

        for (let index = 0; index < this.fishEntryLabels.length; index += 1) {
            const label = this.fishEntryLabels[index];
            const fish = FISH_POOL[index];

            if (!label || !fish) {
                continue;
            }

            const record = recordMap.get(fish.id);
            const isUnlocked = Boolean(record?.unlocked);

            if (isUnlocked && record) {
                label.string = `${fish.name} | ${fish.rarity} | Caught: ${record.catchCount} | Best: ${record.maxWeight.toFixed(2)} kg`;
            } else {
                label.string = `??? | ${fish.rarity} | Caught: 0 | Best: 0.00 kg`;
            }
        }
    }

    private handleCloseClicked(): void {
        this.onCloseRequested?.();
    }
}
