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
            this.goldLabel.string = `金币：${gold}`;
        }
    }

    public setRodLevel(rodLevel: number): void {
        if (this.rodLevelLabel) {
            this.rodLevelLabel.string = `鱼竿等级：${rodLevel}`;
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
        this.goldLabel ??= this.ensureLabel('GoldLabel');
        this.rodLevelLabel ??= this.ensureLabel('RodLevelLabel');
        this.statusLabel ??= this.ensureLabel('StatusLabel');
        this.castButton ??= this.ensureButton('CastButton', '抛竿');
        this.upgradeButton ??= this.ensureButton('UpgradeButton', '升级鱼竿');
        this.collectionButton ??= this.ensureButton('CollectionButton', '图鉴');

        this.layoutLabel(this.goldLabel, -210, 510, 240, 44, 22);
        this.layoutLabel(this.rodLevelLabel, 210, 510, 260, 44, 22);
        this.layoutLabel(this.statusLabel, 0, 330, 620, 72, 34);
        this.layoutButton(this.castButton, -220, -500, 180, 72, 30);
        this.layoutButton(this.upgradeButton, 0, -500, 220, 72, 30);
        this.layoutButton(this.collectionButton, 220, -500, 180, 72, 30);
    }

    private ensureLabel(name: string): Label {
        const node = this.ensureNode(name);
        return node.getComponent(Label) ?? node.addComponent(Label);
    }

    private ensureButton(name: string, text: string): Button {
        const node = this.ensureNode(name);
        const button = node.getComponent(Button) ?? node.addComponent(Button);
        button.transition = Button.Transition.NONE;
        this.setButtonText(button, text);
        return button;
    }

    private ensureNode(name: string): Node {
        let node = this.node.getChildByName(name);

        if (!node) {
            node = new Node(name);
            this.node.addChild(node);
        }

        return node;
    }

    private layoutLabel(label: Label | null, x: number, y: number, width: number, height: number, fontSize: number): void {
        if (!label) {
            return;
        }

        this.layoutNode(label.node, x, y, width, height);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
    }

    private layoutButton(button: Button | null, x: number, y: number, width: number, height: number, fontSize: number): void {
        if (!button) {
            return;
        }

        this.layoutNode(button.node, x, y, width, height);
        button.transition = Button.Transition.NONE;
        const labelNode = this.getOrCreateButtonLabelNode(button, width, height);
        const label = labelNode.getComponent(Label) ?? labelNode.addComponent(Label);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
    }

    private layoutNode(node: Node, x: number, y: number, width: number, height: number): void {
        node.setPosition(x, y, 0);
        const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
        transform.setContentSize(width, height);
    }

    private setButtonText(button: Button | null, text: string): void {
        if (!button) {
            return;
        }

        const labelNode = this.getOrCreateButtonLabelNode(button, 180, 72);
        const label = labelNode.getComponent(Label) ?? labelNode.addComponent(Label);
        label.string = text;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
    }

    private getOrCreateButtonLabelNode(button: Button, width: number, height: number): Node {
        let labelNode = button.node.children.find((child) => Boolean(child.getComponent(Label)));

        if (!labelNode) {
            labelNode = new Node(`${button.node.name}Label`);
            button.node.addChild(labelNode);
        }

        labelNode.setPosition(0, 0, 0);
        const transform = labelNode.getComponent(UITransform) ?? labelNode.addComponent(UITransform);
        transform.setContentSize(width, height);
        return labelNode;
    }
}
