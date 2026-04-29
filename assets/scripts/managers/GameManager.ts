import { _decorator, Component } from 'cc';
import {
    calculateSellPrice,
    FishCatchResult,
    FishData,
    randomWeight,
    selectRandomFish,
} from '../data/FishData';
import { CollectionPanel } from '../ui/CollectionPanel';
import { FishingDialUI } from '../ui/FishingDialUI';
import { MainUI } from '../ui/MainUI';
import { ResultPanel } from '../ui/ResultPanel';
import { CollectionManager } from './CollectionManager';
import { SaveManager } from './SaveManager';

const { ccclass, property } = _decorator;

enum GameState {
    Idle = 'Idle',
    WaitingForBite = 'WaitingForBite',
    FishingChallenge = 'FishingChallenge',
    Result = 'Result',
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property(MainUI)
    public mainUI: MainUI | null = null;

    @property(FishingDialUI)
    public fishingDialUI: FishingDialUI | null = null;

    @property(ResultPanel)
    public resultPanel: ResultPanel | null = null;

    @property(CollectionPanel)
    public collectionPanel: CollectionPanel | null = null;

    private _state = GameState.Idle;
    private _gold = 0;
    private _rodLevel = 1;
    private _collectionManager = new CollectionManager();
    private _currentFish: FishData | null = null;
    private _currentResult: FishCatchResult | null = null;

    protected start(): void {
        this.loadGame();
        this.bindUIEvents();
        this.hideSecondaryPanels();
        this.refreshMainUI();
        this.setState(GameState.Idle, '准备钓鱼');
    }

    public castRod(): void {
        if (this._state !== GameState.Idle) {
            return;
        }

        this.setState(GameState.WaitingForBite, '等待鱼咬钩……');
        const waitSeconds = 1.5 + Math.random() * 1.5;
        this.scheduleOnce(() => this.handleFishBite(), waitSeconds);
    }

    public onCastButtonClicked(): void {
        this.castRod();
    }

    public upgradeRod(): void {
        if (this._state !== GameState.Idle) {
            return;
        }

        const cost = this.getUpgradeCost();

        if (this._gold < cost) {
            this.mainUI?.setStatus('金币不足');
            return;
        }

        this._gold -= cost;
        this._rodLevel += 1;
        this.saveGame();
        this.refreshMainUI();
        this.mainUI?.setStatus(`鱼竿升级成功！当前等级 ${this._rodLevel}`);
    }

    public onUpgradeButtonClicked(): void {
        this.upgradeRod();
    }

    public showCollection(): void {
        if (this._state !== GameState.Idle) {
            return;
        }

        this.collectionPanel?.show(this._collectionManager.getRecords());
        this.mainUI?.setMainButtonsInteractable(false);
    }

    public onCollectionButtonClicked(): void {
        this.showCollection();
    }

    public hideCollection(): void {
        this.collectionPanel?.hide();

        if (this._state === GameState.Idle) {
            this.mainUI?.setMainButtonsInteractable(true);
            this.mainUI?.setStatus('准备钓鱼');
        }
    }

    public sellCurrentFish(): void {
        if (this._state !== GameState.Result || !this._currentResult) {
            return;
        }

        this._gold += this._currentResult.sellPrice;
        this.saveGame();
        this.resultPanel?.hide();
        this._currentFish = null;
        this._currentResult = null;
        this.refreshMainUI();
        this.setState(GameState.Idle, '准备钓鱼');
    }

    public continueWithoutSelling(): void {
        if (this._state !== GameState.Result) {
            return;
        }

        this.resultPanel?.hide();
        this._currentFish = null;
        this._currentResult = null;
        this.setState(GameState.Idle, '准备钓鱼');
    }

    public resetGameForDebug(): void {
        const saveData = SaveManager.resetGame();
        this._gold = saveData.gold;
        this._rodLevel = saveData.rodLevel;
        this._collectionManager.initialize(saveData.collectionRecords);
        this._currentFish = null;
        this._currentResult = null;
        this.refreshMainUI();
        this.setState(GameState.Idle, '准备钓鱼');
    }

    private bindUIEvents(): void {
        if (this.mainUI) {
            this.mainUI.onCastRequested = () => this.castRod();
            this.mainUI.onUpgradeRequested = () => this.upgradeRod();
            this.mainUI.onCollectionRequested = () => this.showCollection();
        }

        if (this.fishingDialUI) {
            this.fishingDialUI.onChallengeSuccess = () => this.handleFishingSuccess();
            this.fishingDialUI.onChallengeFailed = () => this.handleFishingFailed();
        }

        if (this.resultPanel) {
            this.resultPanel.onSellRequested = () => this.sellCurrentFish();
            this.resultPanel.onContinueRequested = () => this.continueWithoutSelling();
        }

        if (this.collectionPanel) {
            this.collectionPanel.onCloseRequested = () => this.hideCollection();
        }
    }

    private hideSecondaryPanels(): void {
        this.fishingDialUI?.hide();
        this.resultPanel?.hide();
        this.collectionPanel?.hide();
    }

    private loadGame(): void {
        const saveData = SaveManager.loadGame();
        this._gold = saveData.gold;
        this._rodLevel = saveData.rodLevel;
        this._collectionManager.initialize(saveData.collectionRecords);
    }

    private saveGame(): void {
        SaveManager.saveGame({
            gold: this._gold,
            rodLevel: this._rodLevel,
            collectionRecords: this._collectionManager.getRecords(),
        });
    }

    private handleFishBite(): void {
        if (this._state !== GameState.WaitingForBite) {
            return;
        }

        this._currentFish = selectRandomFish();
        this.mainUI?.setStatus('鱼咬钩了！');
        this.setState(GameState.FishingChallenge);
        this.fishingDialUI?.startChallenge(
            this.getFinalSafeZoneAngle(this._currentFish),
            this._currentFish.pointerSpeed,
            this._currentFish.requiredSuccessCount,
        );
    }

    private handleFishingSuccess(): void {
        if (this._state !== GameState.FishingChallenge || !this._currentFish) {
            return;
        }

        const weight = randomWeight(this._currentFish);
        const sellPrice = calculateSellPrice(this._currentFish, weight);
        const collectionResult = this._collectionManager.recordCatch(this._currentFish.id, weight);

        this._currentResult = {
            fish: this._currentFish,
            weight,
            sellPrice,
            isNewRecord: collectionResult.isNewRecord,
        };

        this.saveGame();
        this.fishingDialUI?.hide();
        this.setState(GameState.Result, '判定成功！');
        this.resultPanel?.show(this._currentResult);
    }

    private handleFishingFailed(): void {
        if (this._state !== GameState.FishingChallenge) {
            return;
        }

        this.fishingDialUI?.hide();
        this._currentFish = null;
        this.setState(GameState.Idle, '鱼跑了！');
    }

    private setState(state: GameState, statusText?: string): void {
        this._state = state;

        if (statusText) {
            this.mainUI?.setStatus(statusText);
        }

        switch (state) {
            case GameState.Idle:
                this.mainUI?.setMainButtonsInteractable(true);
                break;
            case GameState.WaitingForBite:
            case GameState.FishingChallenge:
            case GameState.Result:
                this.mainUI?.setMainButtonsInteractable(false);
                break;
            default:
                break;
        }
    }

    private refreshMainUI(): void {
        this.mainUI?.setGold(this._gold);
        this.mainUI?.setRodLevel(this._rodLevel);
    }

    private getUpgradeCost(): number {
        return this._rodLevel * 100;
    }

    private getFinalSafeZoneAngle(fish: FishData): number {
        return Math.min(120, fish.safeZoneAngle + (this._rodLevel - 1) * 2);
    }
}
