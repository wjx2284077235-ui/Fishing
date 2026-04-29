import { _decorator, Button, Color, Component, Label, Node, tween, Tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

const TEXT_CAST = '抛竿';
const TEXT_UPGRADE = '升级鱼竿';
const TEXT_COLLECTION = '图鉴';
const TEXT_GOLD_PREFIX = '金币：';
const TEXT_ROD_LEVEL_PREFIX = '鱼竿等级：';

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

    @property(Label)
    public goldGainLabel: Label | null = null;

    public onCastRequested: (() => void) | null = null;
    public onUpgradeRequested: (() => void) | null = null;
    public onCollectionRequested: (() => void) | null = null;

    protected onLoad(): void {
        this.ensureDefaultControls();
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
            this.goldLabel.string = `${TEXT_GOLD_PREFIX}${gold}`;
        }
    }

    public setRodLevel(rodLevel: number): void {
        if (this.rodLevelLabel) {
            this.rodLevelLabel.string = `${TEXT_ROD_LEVEL_PREFIX}${rodLevel}`;
        }
    }

    public setStatus(status: string): void {
        if (this.statusLabel) {
            this.statusLabel.string = status;
        }
    }

    public playGoldGain(amount: number): void {
        this.ensureDefaultControls();

        if (!this.goldGainLabel) {
            return;
        }

        const label = this.goldGainLabel;
        const node = label.node;
        const opacity = node.getComponent(UIOpacity) ?? node.addComponent(UIOpacity);
        const startPosition = new Vec3(-210, 468, 0);

        Tween.stopAllByTarget(node);
        Tween.stopAllByTarget(opacity);

        label.string = `+${amount}`;
        label.color = new Color(255, 221, 67, 255);
        node.active = true;
        node.setPosition(startPosition);
        opacity.opacity = 255;

        tween(node)
            .to(1, { position: new Vec3(startPosition.x, startPosition.y + 48, startPosition.z) })
            .start();

        tween(opacity)
            .to(1, { opacity: 0 })
            .call(() => {
                node.active = false;
                node.setPosition(startPosition);
            })
            .start();
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

    public setHudVisible(visible: boolean): void {
        this.setNodeActive(this.goldLabel?.node, visible);
        this.setNodeActive(this.rodLevelLabel?.node, visible);
        this.setNodeActive(this.statusLabel?.node, visible);
        this.setNodeActive(this.castButton?.node, visible);
        this.setNodeActive(this.upgradeButton?.node, visible);
        this.setNodeActive(this.collectionButton?.node, visible);

        if (!visible) {
            this.setNodeActive(this.goldGainLabel?.node, false);
        }
    }

    public isPointInFunctionArea(screenPoint: Vec2): boolean {
        return this.isPointInButton(this.castButton, screenPoint)
            || this.isPointInButton(this.upgradeButton, screenPoint)
            || this.isPointInButton(this.collectionButton, screenPoint);
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

    private setNodeActive(node: Node | undefined, active: boolean): void {
        if (node) {
            node.active = active;
        }
    }

    private isPointInButton(button: Button | null, screenPoint: Vec2): boolean {
        if (!button?.node.activeInHierarchy) {
            return false;
        }

        const transform = button.node.getComponent(UITransform);
        return transform?.getBoundingBoxToWorld().contains(screenPoint) ?? false;
    }

    private ensureDefaultControls(): void {
        this.goldLabel ??= this.findLabel('GoldLabel') ?? this.createFallbackLabel('GoldLabel', -210, 510, 240, 44, 22);
        this.rodLevelLabel ??= this.findLabel('RodLevelLabel') ?? this.createFallbackLabel('RodLevelLabel', 210, 510, 260, 44, 22);
        this.statusLabel ??= this.findLabel('StatusLabel') ?? this.createFallbackLabel('StatusLabel', 0, 330, 620, 72, 34);
        this.castButton ??= this.findButton('CastButton') ?? this.createFallbackButton('CastButton', TEXT_CAST, -220, -500, 180, 72, 30);
        this.upgradeButton ??= this.findButton('UpgradeButton') ?? this.createFallbackButton('UpgradeButton', TEXT_UPGRADE, 0, -500, 220, 72, 30);
        this.collectionButton ??= this.findButton('CollectionButton') ?? this.createFallbackButton('CollectionButton', TEXT_COLLECTION, 220, -500, 180, 72, 30);
        this.goldGainLabel ??= this.findLabel('GoldGainLabel') ?? this.createFallbackLabel('GoldGainLabel', -210, 468, 240, 44, 26);
        this.goldGainLabel.node.active = false;
    }

    private findLabel(name: string): Label | null {
        return this.findChildDeep(this.node, name)?.getComponent(Label) ?? null;
    }

    private findButton(name: string): Button | null {
        return this.findChildDeep(this.node, name)?.getComponent(Button) ?? null;
    }

    private createFallbackLabel(name: string, x: number, y: number, width: number, height: number, fontSize: number): Label {
        const node = new Node(name);
        this.node.addChild(node);
        this.layoutNode(node, x, y, width, height);
        const label = node.addComponent(Label);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        return label;
    }

    private createFallbackButton(name: string, text: string, x: number, y: number, width: number, height: number, fontSize: number): Button {
        const node = new Node(name);
        this.node.addChild(node);
        this.layoutNode(node, x, y, width, height);
        const button = node.addComponent(Button);
        button.transition = Button.Transition.NONE;

        const labelNode = new Node(`${name}Label`);
        node.addChild(labelNode);
        this.layoutNode(labelNode, 0, 0, width, height);
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        return button;
    }

    private layoutNode(node: Node, x: number, y: number, width: number, height: number): void {
        node.setPosition(x, y, 0);
        const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
        transform.setContentSize(width, height);
    }

    private findChildDeep(root: Node, name: string): Node | null {
        if (root.name === name) {
            return root;
        }

        for (const child of root.children) {
            const found = this.findChildDeep(child, name);

            if (found) {
                return found;
            }
        }

        return null;
    }
}
