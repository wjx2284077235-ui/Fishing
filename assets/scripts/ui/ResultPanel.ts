import { _decorator, Button, Component, Label, Node, UITransform } from 'cc';
import { FishCatchResult } from '../data/FishData';

const { ccclass, property } = _decorator;

@ccclass('ResultPanel')
export class ResultPanel extends Component {
    @property(Label)
    public fishNameLabel: Label | null = null;

    @property(Label)
    public rarityLabel: Label | null = null;

    @property(Label)
    public weightLabel: Label | null = null;

    @property(Label)
    public sellPriceLabel: Label | null = null;

    @property(Label)
    public recordLabel: Label | null = null;

    @property(Button)
    public sellButton: Button | null = null;

    @property(Button)
    public continueButton: Button | null = null;

    public onSellRequested: (() => void) | null = null;
    public onContinueRequested: (() => void) | null = null;

    protected onLoad(): void {
        this.ensureDefaultControls();
        this.sellButton?.node?.on(Button.EventType.CLICK, this.handleSellClicked, this);
        this.continueButton?.node?.on(Button.EventType.CLICK, this.handleContinueClicked, this);
    }

    protected onDestroy(): void {
        this.sellButton?.node?.off(Button.EventType.CLICK, this.handleSellClicked, this);
        this.continueButton?.node?.off(Button.EventType.CLICK, this.handleContinueClicked, this);
    }

    public show(result: FishCatchResult): void {
        this.node.active = true;
        this.ensureDefaultControls();

        if (this.fishNameLabel) {
            this.fishNameLabel.string = `鱼类：${result.fish.name}`;
        }
        if (this.rarityLabel) {
            this.rarityLabel.string = `稀有度：${result.fish.rarity}`;
        }
        if (this.weightLabel) {
            this.weightLabel.string = `重量：${result.weight.toFixed(2)} kg`;
        }
        if (this.sellPriceLabel) {
            this.sellPriceLabel.string = `价值：${result.sellPrice} 金币`;
        }
        if (this.recordLabel) {
            this.recordLabel.string = result.isNewRecord ? '新的个人纪录！' : '未打破纪录';
        }
    }

    public hide(): void {
        this.node.active = false;
    }

    private handleSellClicked(): void {
        this.onSellRequested?.();
    }

    private handleContinueClicked(): void {
        this.onContinueRequested?.();
    }

    private ensureDefaultControls(): void {
        this.fishNameLabel ??= this.ensureLabel('FishNameLabel', 0, 150, 560, 48);
        this.rarityLabel ??= this.ensureLabel('RarityLabel', 0, 95, 560, 44);
        this.weightLabel ??= this.ensureLabel('WeightLabel', 0, 40, 560, 44);
        this.sellPriceLabel ??= this.ensureLabel('SellPriceLabel', 0, -15, 560, 44);
        this.recordLabel ??= this.ensureLabel('RecordLabel', 0, -70, 560, 44);
        this.sellButton ??= this.ensureButton('SellButton', -120, -155, 180, 64, '出售');
        this.continueButton ??= this.ensureButton('ContinueButton', 120, -155, 180, 64, '继续钓鱼');
    }

    private ensureLabel(name: string, x: number, y: number, width: number, height: number): Label {
        const node = this.ensureNode(name, x, y, width, height);
        const label = node.getComponent(Label) ?? node.addComponent(Label);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.fontSize = 24;
        label.lineHeight = 32;
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
        label.fontSize = 22;
        label.lineHeight = 30;
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
