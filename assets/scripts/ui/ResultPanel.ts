import { _decorator, Button, Color, Component, Graphics, Label, Node, UITransform } from 'cc';
import { FishCatchResult, getRarityLabel, RARITY_GLOW_COLORS } from '../data/FishData';

const { ccclass, property } = _decorator;

@ccclass('ResultPanel')
export class ResultPanel extends Component {
    @property(Graphics)
    public fishImage: Graphics | null = null;

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

    @property(Label)
    public imageKeyLabel: Label | null = null;

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
        this.drawFishPlaceholder(result);

        if (this.fishNameLabel) {
            this.fishNameLabel.string = `鱼种：${result.fish.name}`;
        }
        if (this.rarityLabel) {
            const upgradeText = result.upgradedFromRarity
                ? `（完美提升：${getRarityLabel(result.upgradedFromRarity)} → ${getRarityLabel(result.fish.rarity)}）`
                : '';
            this.rarityLabel.string = `稀有度：${getRarityLabel(result.fish.rarity)}${upgradeText}`;
        }
        if (this.weightLabel) {
            this.weightLabel.string = `重量：${result.weight.toFixed(2)} kg`;
        }
        if (this.sellPriceLabel) {
            this.sellPriceLabel.string = `售价：${result.sellPrice} 金币`;
        }
        if (this.recordLabel) {
            const perfectText = result.wasPerfect ? '完美上鱼！' : '';
            const recordText = result.isNewRecord ? '新的个人纪录！' : '未打破纪录';
            this.recordLabel.string = perfectText ? `${perfectText} ${recordText}` : recordText;
        }
        if (this.imageKeyLabel) {
            this.imageKeyLabel.string = `图片资源：${result.fish.imageKey}`;
        }
        if (this.continueButton) {
            this.continueButton.node.active = false;
            this.continueButton.interactable = false;
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
        this.fishImage ??= this.ensureGraphics('FishImage', 0, 220, 360, 220);
        this.imageKeyLabel ??= this.ensureLabel('ImageKeyLabel', 0, 95, 560, 34, 18);
        this.fishNameLabel ??= this.ensureLabel('FishNameLabel', 0, 45, 600, 44, 24);
        this.rarityLabel ??= this.ensureLabel('RarityLabel', 0, 0, 660, 44, 22);
        this.weightLabel ??= this.ensureLabel('WeightLabel', 0, -45, 560, 44, 22);
        this.sellPriceLabel ??= this.ensureLabel('SellPriceLabel', 0, -90, 560, 44, 22);
        this.recordLabel ??= this.ensureLabel('RecordLabel', 0, -135, 640, 44, 22);
        this.sellButton ??= this.ensureButton('SellButton', 0, -235, 220, 70, '出售');
        this.continueButton ??= this.findButton('ContinueButton');

        if (this.continueButton) {
            this.continueButton.node.active = false;
            this.continueButton.interactable = false;
        }
    }

    private drawFishPlaceholder(result: FishCatchResult): void {
        if (!this.fishImage) {
            return;
        }

        const graphics = this.fishImage;
        const rarityColor = RARITY_GLOW_COLORS[result.fish.rarity];

        graphics.clear();
        graphics.lineWidth = 6;
        graphics.strokeColor = new Color(rarityColor.r, rarityColor.g, rarityColor.b, 255);
        graphics.fillColor = new Color(31, 48, 63, 235);
        graphics.roundRect(-170, -95, 340, 190, 16);
        graphics.fill();
        graphics.stroke();

        graphics.fillColor = new Color(rarityColor.r, rarityColor.g, rarityColor.b, 210);
        graphics.ellipse(-20, 0, 110, 52);
        graphics.fill();

        graphics.fillColor = new Color(rarityColor.r, rarityColor.g, rarityColor.b, 165);
        graphics.moveTo(-118, 0);
        graphics.lineTo(-164, 44);
        graphics.lineTo(-164, -44);
        graphics.close();
        graphics.fill();

        graphics.fillColor = new Color(255, 255, 255, 245);
        graphics.circle(64, 18, 9);
        graphics.fill();

        graphics.fillColor = new Color(16, 24, 32, 255);
        graphics.circle(67, 18, 4);
        graphics.fill();
    }

    private ensureGraphics(name: string, x: number, y: number, width: number, height: number): Graphics {
        const node = this.ensureNode(name, x, y, width, height);
        return node.getComponent(Graphics) ?? node.addComponent(Graphics);
    }

    private ensureLabel(name: string, x: number, y: number, width: number, height: number, fontSize: number): Label {
        const node = this.ensureNode(name, x, y, width, height);
        const label = node.getComponent(Label) ?? node.addComponent(Label);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
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

    private findButton(name: string): Button | null {
        return this.node.getChildByName(name)?.getComponent(Button) ?? null;
    }

    private ensureNode(name: string, x: number, y: number, width: number, height: number): Node {
        let node = this.node.getChildByName(name);

        if (!node) {
            node = new Node(name);
            this.node.addChild(node);
        }

        node.active = true;
        node.setPosition(x, y, 0);
        const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
        transform.setContentSize(width, height);
        return node;
    }
}
