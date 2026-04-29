import { _decorator, Button, Color, Component, Graphics, Label, Node, UITransform } from 'cc';
import { isAngleInSafeZone, normalizeAngle } from '../data/FishData';

const { ccclass, property } = _decorator;

const TEXT_HIT_PREFIX = '\u547d\u4e2d ';
const TEXT_JUDGE = '\u70b9\u51fb\u5224\u5b9a';

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
    private _radius = 150;
    private _ringWidth = 42;
    private _ownsPointerGraphics = false;

    protected onLoad(): void {
        this.ensureDefaultControls();
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
        this.ensureDefaultControls();
        this._pointerAngle = 0;
        this._safeStartAngle = Math.random() * 360;
        this._safeZoneAngle = safeZoneAngle;
        this._pointerSpeed = pointerSpeed;
        this._currentSuccessCount = 0;
        this._requiredSuccessCount = Math.max(1, requiredSuccessCount);
        this._isRunning = true;

        this.drawDial();
        this.drawPointer();
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
        this.drawPointer();
        this.updatePointer();
    }

    private drawDial(): void {
        if (!this.dialGraphics) {
            return;
        }

        const graphics = this.dialGraphics;
        const transform = graphics.getComponent(UITransform);

        if (transform) {
            this._radius = Math.min(transform.width, transform.height) * 0.38;
            this._ringWidth = Math.max(28, this._radius * 0.24);
        }

        graphics.clear();

        graphics.lineWidth = this._ringWidth;
        graphics.strokeColor = new Color(224, 73, 77, 235);
        graphics.circle(0, 0, this._radius);
        graphics.stroke();

        const startRadians = this.degreesToRadians(this._safeStartAngle - 90);
        const endRadians = this.degreesToRadians(this._safeStartAngle + this._safeZoneAngle - 90);

        graphics.strokeColor = new Color(67, 204, 119, 245);
        graphics.arc(0, 0, this._radius, startRadians, endRadians, true);
        graphics.stroke();

        graphics.lineWidth = 4;
        graphics.strokeColor = new Color(235, 244, 255, 255);
        graphics.circle(0, 0, this._radius + this._ringWidth * 0.5);
        graphics.stroke();
        graphics.circle(0, 0, this._radius - this._ringWidth * 0.5);
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
            this.progressLabel.string = `${TEXT_HIT_PREFIX}${this._currentSuccessCount} / ${this._requiredSuccessCount}`;
        }
    }

    private degreesToRadians(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }

    private ensureDefaultControls(): void {
        this.dialGraphics ??= this.findGraphics('DialGraphics') ?? this.createFallbackGraphics('DialGraphics', 0, 50, 380, 380);
        this.pointerNode ??= this.findChildDeep(this.node, 'Pointer') ?? this.createFallbackPointer();
        this.progressLabel ??= this.findLabel('ProgressLabel') ?? this.createFallbackLabel('ProgressLabel', 0, -185, 360, 48, 28);
        this.judgeButton ??= this.findButton('JudgeButton') ?? this.createFallbackButton('JudgeButton', TEXT_JUDGE, 0, -260, 220, 68, 24);

        this.drawPointer();
    }

    private findGraphics(name: string): Graphics | null {
        return this.findChildDeep(this.node, name)?.getComponent(Graphics) ?? null;
    }

    private findLabel(name: string): Label | null {
        return this.findChildDeep(this.node, name)?.getComponent(Label) ?? null;
    }

    private findButton(name: string): Button | null {
        return this.findChildDeep(this.node, name)?.getComponent(Button) ?? null;
    }

    private createFallbackGraphics(name: string, x: number, y: number, width: number, height: number): Graphics {
        const node = new Node(name);
        this.node.addChild(node);
        this.layoutNode(node, x, y, width, height);
        return node.addComponent(Graphics);
    }

    private createFallbackPointer(): Node {
        const node = new Node('Pointer');
        this.node.addChild(node);
        this.layoutNode(node, 0, 50, 20, 170);
        node.addComponent(Graphics);
        this._ownsPointerGraphics = true;
        return node;
    }

    private drawPointer(): void {
        if (!this.pointerNode) {
            return;
        }

        const graphics = this.pointerNode.getComponent(Graphics);

        if (!graphics || !this._ownsPointerGraphics) {
            return;
        }

        graphics.clear();
        graphics.lineWidth = 10;
        graphics.strokeColor = new Color(255, 231, 116, 255);
        graphics.moveTo(0, 0);
        graphics.lineTo(0, this._radius + this._ringWidth * 0.5 + 8);
        graphics.stroke();
        graphics.fillColor = new Color(255, 231, 116, 255);
        graphics.circle(0, 0, 8);
        graphics.fill();
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
