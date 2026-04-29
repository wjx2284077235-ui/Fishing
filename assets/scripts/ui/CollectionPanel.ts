import { _decorator, Button, Component, Label, Node, UITransform } from 'cc';
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
        this.ensureDefaultControls();
        this.closeButton?.node?.on(Button.EventType.CLICK, this.handleCloseClicked, this);
    }

    protected onDestroy(): void {
        this.closeButton?.node?.off(Button.EventType.CLICK, this.handleCloseClicked, this);
    }

    public show(records: FishCollectionRecord[]): void {
        this.node.active = true;
        this.ensureDefaultControls();
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
                label.string = `${fish.name} | ${fish.rarity} | 捕获 ${record.catchCount} | 最大 ${record.maxWeight.toFixed(2)} kg`;
            } else {
                label.string = `??? | ${fish.rarity} | 捕获 0 | 最大 0.00 kg`;
            }
        }
    }

    private handleCloseClicked(): void {
        this.onCloseRequested?.();
    }

    private ensureDefaultControls(): void {
        if (this.fishEntryLabels.length === 0) {
            for (let index = 0; index < FISH_POOL.length; index += 1) {
                this.fishEntryLabels.push(this.ensureLabel(`EntryLabel${index + 1}`, 0, 150 - index * 60, 640, 52));
            }
        }

        this.closeButton ??= this.ensureButton('CloseButton', 0, -210, 180, 64, '关闭');
    }

    private ensureLabel(name: string, x: number, y: number, width: number, height: number): Label {
        const node = this.ensureNode(name, x, y, width, height);
        const label = node.getComponent(Label) ?? node.addComponent(Label);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.fontSize = 22;
        label.lineHeight = 30;
        label.string = '';
        return label;
    }

    private ensureButton(name: string, x: number, y: number, width: number, height: number, text: string): Button {
        const node = this.ensureNode(name, x, y, width, height);
        const button = node.getComponent(Button) ?? node.addComponent(Button);
        let labelNode = node.children.find((child) => Boolean(child.getComponent(Label)));

        if (!labelNode) {
            labelNode = new Node(`${name}Label`);
            node.addChild(labelNode);
            const transform = labelNode.addComponent(UITransform);
            transform.setContentSize(width, height);
            labelNode.setPosition(0, 0, 0);
        }

        const label = labelNode.getComponent(Label) ?? labelNode.addComponent(Label);
        label.string = text;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.fontSize = 24;
        label.lineHeight = 32;
        return button;
    }

    private ensureNode(name: string, x: number, y: number, width: number, height: number): Node {
        let node = this.node.getChildByName(name);

        if (!node) {
            node = new Node(name);
            this.node.addChild(node);
        }

        node.setPosition(x, y, 0);
        const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
        transform.setContentSize(width, height);
        return node;
    }
}
