import { _decorator, Button, Component, Label, Node, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends Component {
    @property(Label)
    public goldLabel: Label | null = null;

    @property(Label)
    public rodLevelLabel: Label | null = null;

    @property(Label)
    public statusLabel: Label | null = null;

    @property(Button)
    public castButton: Button | null = null;

    @property(Button)
    public upgradeButton: Button | null = null;

    @property(Button)
    public collectionButton: Button | null = null;

    public onCastRequested: (() => void) | null = null;
    public onUpgradeRequested: (() => void) | null = null;
    public onCollectionRequested: (() => void) | null = null;

    protected onLoad(): void {
        this.ensureDefaultControls();
        this.setButtonText(this.castButton, '抛竿');
        this.setButtonText(this.upgradeButton, '升级鱼竿');
        this.setButtonText(this.collectionButton, '图鉴');
        this.castButton?.node?.on(Button.EventType.CLICK, this.handleCastClicked, this);
        this.upgradeButton?.node?.on(Button.EventType.CLICK, this.handleUpgradeClicked, this);
        this.collectionButton?.node?.on(Button.EventType.CLICK, this.handleCollectionClicked, this);
    }

    protected onDestroy(): void {
        this.castButton?.node?.off(Button.EventType.CLICK, this.handleCastClicked, this);
        this.upgradeButton?.node?.off(Button.EventType.CLICK, this.handleUpgradeClicked, this);
        this.collectionButton?.node?.off(Button.EventType.CLICK, this.handleCollectionClicked, this);
    }

    public setGold(gold: number): void {
        if (this.goldLabel) {
            this.goldLabel.string = `Gold: ${gold}`;
        }
    }

    public setRodLevel(rodLevel: number): void {
        if (this.rodLevelLabel) {
            this.rodLevelLabel.string = `Rod Lv.${rodLevel}`;
        }
    }

    public setStatus(status: string): void {
        if (this.statusLabel) {
            this.statusLabel.string = status;
        }
    }

    public setMainButtonsInteractable(interactable: boolean): void {
        if (this.castButton) {
            this.castButton.interactable = interactable;
        }
        if (this.upgradeButton) {
            this.upgradeButton.interactable = interactable;
        }
        if (this.collectionButton) {
            this.collectionButton.interactable = interactable;
        }
    }

    public setCastButtonInteractable(interactable: boolean): void {
        if (this.castButton) {
            this.castButton.interactable = interactable;
        }
    }

    public onCastButtonClicked(): void {
        this.onCastRequested?.();
    }

    public onUpgradeButtonClicked(): void {
        this.onUpgradeRequested?.();
    }

    public onCollectionButtonClicked(): void {
        this.onCollectionRequested?.();
    }

    private handleCastClicked(): void {
        this.onCastButtonClicked();
    }

    private handleUpgradeClicked(): void {
        this.onUpgradeButtonClicked();
    }

    private handleCollectionClicked(): void {
        this.onCollectionButtonClicked();
    }

    private ensureDefaultControls(): void {
        this.goldLabel ??= this.ensureLabel('GoldLabel', -200, 560, 220, 48);
        this.rodLevelLabel ??= this.ensureLabel('RodLevelLabel', 200, 560, 220, 48);
        this.statusLabel ??= this.ensureLabel('StatusLabel', 0, 120, 620, 64);
        this.castButton ??= this.ensureButton('CastButton', -220, -500, 180, 72, '抛竿');
        this.upgradeButton ??= this.ensureButton('UpgradeButton', 0, -500, 180, 72, '升级鱼竿');
        this.collectionButton ??= this.ensureButton('CollectionButton', 220, -500, 180, 72, '图鉴');
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
        button.transition = Button.Transition.NONE;
        this.setButtonText(button, text);
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

    private setButtonText(button: Button | null, text: string): void {
        if (!button) {
            return;
        }

        let labelNode = button.node.children.find((child) => Boolean(child.getComponent(Label)));

        if (!labelNode) {
            labelNode = new Node(`${button.node.name}Label`);
            button.node.addChild(labelNode);
            const transform = labelNode.addComponent(UITransform);
            transform.setContentSize(160, 48);
            labelNode.setPosition(0, 0, 0);
        }

        const label = labelNode.getComponent(Label) ?? labelNode.addComponent(Label);
        label.string = text;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.fontSize = 22;
        label.lineHeight = 30;
    }
}
