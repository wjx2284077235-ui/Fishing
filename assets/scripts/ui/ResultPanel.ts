import { _decorator, Button, Component, Label } from 'cc';
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
        this.sellButton?.node?.on(Button.EventType.CLICK, this.handleSellClicked, this);
        this.continueButton?.node?.on(Button.EventType.CLICK, this.handleContinueClicked, this);
    }

    protected onDestroy(): void {
        this.sellButton?.node?.off(Button.EventType.CLICK, this.handleSellClicked, this);
        this.continueButton?.node?.off(Button.EventType.CLICK, this.handleContinueClicked, this);
    }

    public show(result: FishCatchResult): void {
        this.node.active = true;

        if (this.fishNameLabel) {
            this.fishNameLabel.string = `Fish: ${result.fish.name}`;
        }
        if (this.rarityLabel) {
            this.rarityLabel.string = `Rarity: ${result.fish.rarity}`;
        }
        if (this.weightLabel) {
            this.weightLabel.string = `Weight: ${result.weight.toFixed(2)} kg`;
        }
        if (this.sellPriceLabel) {
            this.sellPriceLabel.string = `Value: ${result.sellPrice} Gold`;
        }
        if (this.recordLabel) {
            this.recordLabel.string = result.isNewRecord ? 'New personal best!' : 'No new record';
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
}
