import { _decorator, Component, EventTouch, input, Input } from 'cc';
import {
    calculateSellPrice,
    FishCatchResult,
    FishData,
    FIXED_POINTER_SPEED,
    getSafeZoneAngleByRarity,
    randomWeight,
    selectRandomFish,
    tryUpgradeFishByPerfect,
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
        input.on(Input.EventType.TOUCH_END, this.handleScreenTouchEnded, this);
        this.hideSecondaryPanels();
        this.refreshMainUI();
        this.setState(GameState.Idle, '准备钓鱼');
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_END, this.handleScreenTouchEnded, this);
    }

    public castRod(): void {
        if (this._state !== GameState.Idle) {
            return;
        }

        this.setState(GameState.WaitingForBite, '等待鱼儿咬钩...');
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
            this.mainUI?.setStatus(`金币不足，需要 ${cost} 金币`);
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

        const earnedGold = this._currentResult.sellPrice;
        this._gold += earnedGold;
        this.saveGame();
        this.resultPanel?.hide();
        this._currentFish = null;
        this._currentResult = null;
        this.setState(GameState.Idle, '准备钓鱼');
        this.refreshMainUI();
        this.mainUI?.playGoldGain(earnedGold);
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
            this.fishingDialUI.onChallengeSuccess = (isPerfect: boolean) => this.handleFishingSuccess(isPerfect);
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

    private handleScreenTouchEnded(event: EventTouch): void {
        if (this._state !== GameState.Idle) {
            return;
        }

        const touchPoint = event.getUILocation();

        if (this.mainUI?.isPointInFunctionArea(touchPoint)) {
            return;
        }

        if (this.collectionPanel?.node.activeInHierarchy || this.resultPanel?.node.activeInHierarchy) {
            return;
        }

        this.castRod();
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
        this.mainUI?.setStatus('鱼儿咬钩了！');
        this.setState(GameState.FishingChallenge);
        this.fishingDialUI?.startChallenge(
            this._currentFish.rarity,
            getSafeZoneAngleByRarity(this._currentFish.rarity),
            FIXED_POINTER_SPEED,
            this._currentFish.requiredSuccessCount,
        );
    }

    private handleFishingSuccess(isPerfect: boolean): void {
        if (this._state !== GameState.FishingChallenge || !this._currentFish) {
            return;
        }

        const perfectResult = isPerfect
            ? tryUpgradeFishByPerfect(this._currentFish)
            : { fish: this._currentFish, upgradedFromRarity: null };
        const finalFish = perfectResult.fish;
        const weight = randomWeight(finalFish);
        const sellPrice = calculateSellPrice(finalFish, weight);
        const collectionResult = this._collectionManager.recordCatch(finalFish.id, weight);

        this._currentFish = finalFish;
        this._currentResult = {
            fish: finalFish,
            weight,
            sellPrice,
            isNewRecord: collectionResult.isNewRecord,
            wasPerfect: isPerfect,
            upgradedFromRarity: perfectResult.upgradedFromRarity,
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
        this.mainUI?.setHudVisible(state !== GameState.FishingChallenge && state !== GameState.Result);

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
}
