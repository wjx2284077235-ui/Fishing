import { _decorator, Button, Color, Component, Graphics, Label, Node, UITransform } from 'cc';
import { isAngleInSafeZone, normalizeAngle } from '../data/FishData';

const { ccclass, property } = _decorator;

@ccclass('FishingDialUI')
export class FishingDialUI extends Component {
    @property(Graphics)
    public dialGraphics: Graphics | null = null;

    @property(Node)
    public pointerNode: Node | null = null;

    @property(Label)
    public progressLabel: Label | null = null;

    @property(Button)
    public judgeButton: Button | null = null;

    public onChallengeSuccess: (() => void) | null = null;
    public onChallengeFailed: (() => void) | null = null;

    private _pointerAngle = 0;
    private _safeStartAngle = 0;
    private _safeZoneAngle = 90;
    private _pointerSpeed = 120;
    private _currentSuccessCount = 0;
    private _requiredSuccessCount = 1;
    private _isRunning = false;
    private _radius = 180;

    protected onLoad(): void {
        this.judgeButton?.node?.on(Button.EventType.CLICK, this.handleJudgeClicked, this);
        this.dialGraphics?.node?.on(Node.EventType.TOUCH_END, this.handleJudgeClicked, this);
    }

    protected onDestroy(): void {
        this.judgeButton?.node?.off(Button.EventType.CLICK, this.handleJudgeClicked, this);
        this.dialGraphics?.node?.off(Node.EventType.TOUCH_END, this.handleJudgeClicked, this);
    }

    protected update(deltaTime: number): void {
        if (!this._isRunning) {
            return;
        }

        this._pointerAngle = normalizeAngle(this._pointerAngle + this._pointerSpeed * deltaTime);
        this.updatePointer();
    }

    public startChallenge(safeZoneAngle: number, pointerSpeed: number, requiredSuccessCount: number): void {
        this.node.active = true;
        this._pointerAngle = 0;
        this._safeStartAngle = Math.random() * 360;
        this._safeZoneAngle = safeZoneAngle;
        this._pointerSpeed = pointerSpeed;
        this._currentSuccessCount = 0;
        this._requiredSuccessCount = Math.max(1, requiredSuccessCount);
        this._isRunning = true;

        this.drawDial();
        this.updatePointer();
        this.updateProgressLabel();
    }

    public hide(): void {
        this._isRunning = false;
        this.node.active = false;
    }

    private handleJudgeClicked(): void {
        if (!this._isRunning) {
            return;
        }

        const isHit = isAngleInSafeZone(this._pointerAngle, this._safeStartAngle, this._safeZoneAngle);

        if (!isHit) {
            this._isRunning = false;
            this.onChallengeFailed?.();
            return;
        }

        this._currentSuccessCount += 1;
        this.updateProgressLabel();

        if (this._currentSuccessCount >= this._requiredSuccessCount) {
            this._isRunning = false;
            this.onChallengeSuccess?.();
            return;
        }

        this._safeStartAngle = Math.random() * 360;
        this._pointerAngle = 0;
        this.drawDial();
        this.updatePointer();
    }

    private drawDial(): void {
        if (!this.dialGraphics) {
            return;
        }

        const graphics = this.dialGraphics;
        const transform = graphics.getComponent(UITransform);

        if (transform) {
            this._radius = Math.min(transform.width, transform.height) * 0.45;
        }

        graphics.clear();

        graphics.fillColor = new Color(32, 48, 74, 220);
        graphics.strokeColor = new Color(226, 238, 255, 255);
        graphics.lineWidth = 4;
        graphics.circle(0, 0, this._radius);
        graphics.fill();
        graphics.stroke();

        const startRadians = this.degreesToRadians(this._safeStartAngle - 90);
        const endRadians = this.degreesToRadians(this._safeStartAngle + this._safeZoneAngle - 90);

        graphics.fillColor = new Color(78, 214, 132, 230);
        graphics.moveTo(0, 0);
        graphics.arc(0, 0, this._radius, startRadians, endRadians, false);
        graphics.close();
        graphics.fill();

        graphics.strokeColor = new Color(255, 255, 255, 255);
        graphics.lineWidth = 2;
        graphics.circle(0, 0, this._radius);
        graphics.stroke();
    }

    private updatePointer(): void {
        if (!this.pointerNode) {
            return;
        }

        this.pointerNode.angle = this._pointerAngle;
    }

    private updateProgressLabel(): void {
        if (this.progressLabel) {
            this.progressLabel.string = `${this._currentSuccessCount} / ${this._requiredSuccessCount}`;
        }
    }

    private degreesToRadians(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }
}
