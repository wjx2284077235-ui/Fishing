import { _decorator, Button, Component, Label } from 'cc';

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
}
