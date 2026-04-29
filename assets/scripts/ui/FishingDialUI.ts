import { _decorator, Button, Color, Component, Graphics, Label, Node, tween, Tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import {
    FishRarity,
    getPerfectZoneAngle,
    getRarityLabel,
    isAngleInSafeZone,
    normalizeAngle,
    RARITY_GLOW_COLORS,
} from '../data/FishData';

const { ccclass, property } = _decorator;

const TEXT_HIT_PREFIX = '命中 ';
const TEXT_JUDGE = '点击判定';
const TEXT_SUCCESS = '成功！';
const TEXT_PERFECT = '完美！';
const TEXT_FISH_ESCAPED = '鱼跑掉了...';
const ARC_SEGMENT_DEGREES = 3;

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

    @property(Label)
    public feedbackLabel: Label | null = null;

    @property(Label)
    public rarityHintLabel: Label | null = null;

    @property(Graphics)
    public rarityEdgeGlow: Graphics | null = null;

    public onChallengeSuccess: ((isPerfect: boolean) => void) | null = null;
    public onChallengeFailed: (() => void) | null = null;

    private _pointerAngle = 0;
    private _safeStartAngle = 0;
    private _safeZoneAngle = 90;
    private _perfectZoneAngle = getPerfectZoneAngle();
    private _pointerSpeed = 180;
    private _currentSuccessCount = 0;
    private _requiredSuccessCount = 1;
    private _isRunning = false;
    private _radius = 150;
    private _ringWidth = 42;
    private _basePosition = new Vec3();
    private _hasBasePosition = false;
    private _shakeTime = 0;
    private _isResolving = false;
    private _highlightSafeZone = false;
    private _highlightPerfectZone = false;
    private _brokenDial = false;
    private _rarity = FishRarity.Common;
    private _hasPerfectHit = false;

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

        this.updateShake(deltaTime);

        if (!this._isResolving) {
            this._pointerAngle = normalizeAngle(this._pointerAngle + this._pointerSpeed * deltaTime);
            this.updatePointer();
        }
    }

    public startChallenge(rarity: FishRarity, safeZoneAngle: number, pointerSpeed: number, requiredSuccessCount: number): void {
        this.node.active = true;
        Tween.stopAllByTarget(this.node);
        this.ensureDefaultControls();
        this.captureBasePosition();
        this.node.setScale(1, 1, 1);
        this.node.angle = 0;
        this._rarity = rarity;
        this._pointerAngle = 0;
        this._safeStartAngle = Math.random() * 360;
        this._safeZoneAngle = safeZoneAngle;
        this._perfectZoneAngle = Math.min(getPerfectZoneAngle(), safeZoneAngle);
        this._pointerSpeed = pointerSpeed;
        this._currentSuccessCount = 0;
        this._requiredSuccessCount = Math.max(1, requiredSuccessCount);
        this._isRunning = true;
        this._isResolving = false;
        this._highlightSafeZone = false;
        this._highlightPerfectZone = false;
        this._brokenDial = false;
        this._hasPerfectHit = false;
        this.setFeedback('', false);
        this.setPointerVisible(true);
        this.setRarityHint();
        this.showRarityGlow(rarity);

        this.drawDial();
        this.drawPointer();
        this.updatePointer();
        this.updateProgressLabel();
    }

    public hide(): void {
        Tween.stopAllByTarget(this.node);
        this.stopRarityGlow();
        this._isRunning = false;
        this._isResolving = false;
        this._highlightSafeZone = false;
        this._highlightPerfectZone = false;
        this._brokenDial = false;
        if (this._hasBasePosition) {
            this.node.setPosition(this._basePosition);
        }
        this.node.active = false;
    }

    private handleJudgeClicked(): void {
        if (!this._isRunning || this._isResolving) {
            return;
        }

        const isHit = isAngleInSafeZone(this._pointerAngle, this._safeStartAngle, this._safeZoneAngle);
        const isPerfect = isAngleInSafeZone(this._pointerAngle, this.getPerfectStartAngle(), this._perfectZoneAngle);

        if (!isHit) {
            this._isRunning = false;
            this.playFailureFeedback();
            return;
        }

        this._hasPerfectHit = this._hasPerfectHit || isPerfect;
        this._currentSuccessCount += 1;
        this.updateProgressLabel();

        if (this._currentSuccessCount >= this._requiredSuccessCount) {
            this._isRunning = false;
            this.playSuccessFeedback(true, isPerfect);
            return;
        }

        this.playSuccessFeedback(false, isPerfect);
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

        if (this._brokenDial) {
            this.drawBrokenDial(graphics);
            return;
        }

        graphics.lineWidth = this._ringWidth;
        graphics.strokeColor = new Color(224, 73, 77, 235);
        graphics.circle(0, 0, this._radius);
        graphics.stroke();

        const safeColor = this._highlightSafeZone
            ? new Color(132, 255, 162, 255)
            : new Color(67, 204, 119, 245);
        this.strokeDialArc(
            graphics,
            this._safeStartAngle,
            this._safeZoneAngle,
            this._radius,
            this._highlightSafeZone ? this._ringWidth + 12 : this._ringWidth,
            safeColor,
        );

        const perfectColor = this._highlightPerfectZone
            ? new Color(255, 238, 238, 255)
            : new Color(255, 35, 48, 255);
        this.strokeDialArc(
            graphics,
            this.getPerfectStartAngle(),
            this._perfectZoneAngle,
            this._radius,
            this._ringWidth + 18,
            perfectColor,
        );

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

        this.drawPointer();
    }

    private updateProgressLabel(): void {
        if (this.progressLabel) {
            this.progressLabel.string = `${TEXT_HIT_PREFIX}${this._currentSuccessCount} / ${this._requiredSuccessCount}`;
        }
    }

    private ensureDefaultControls(): void {
        this.dialGraphics ??= this.findGraphics('DialGraphics') ?? this.createFallbackGraphics('DialGraphics', 0, 50, 380, 380);
        this.pointerNode ??= this.findChildDeep(this.node, 'Pointer') ?? this.createFallbackPointer();
        this.feedbackLabel ??= this.findLabel('FeedbackLabel') ?? this.createFallbackLabel('FeedbackLabel', 0, 300, 420, 58, 38);
        this.rarityHintLabel ??= this.findLabel('RarityHintLabel') ?? this.createFallbackLabel('RarityHintLabel', 0, 235, 420, 44, 26);
        this.progressLabel ??= this.findLabel('ProgressLabel') ?? this.createFallbackLabel('ProgressLabel', 0, -185, 360, 48, 28);
        this.judgeButton ??= this.findButton('JudgeButton') ?? this.createFallbackButton('JudgeButton', TEXT_JUDGE, 0, -260, 220, 68, 24);
        this.rarityEdgeGlow ??= this.findGraphics('RarityEdgeGlow') ?? this.createFallbackGraphics('RarityEdgeGlow', 0, 0, 720, 1280);
        this.rarityEdgeGlow.node.active = false;

        this.drawPointer();
    }

    private playSuccessFeedback(isFinalSuccess: boolean, isPerfect: boolean): void {
        this._isResolving = true;
        this._highlightSafeZone = true;
        this._highlightPerfectZone = isPerfect;
        this.setFeedback(isPerfect ? TEXT_PERFECT : TEXT_SUCCESS, true);
        this.drawDial();

        tween(this.node)
            .to(0.08, { scale: new Vec3(1.06, 1.06, 1) })
            .to(0.14, { scale: new Vec3(1, 1, 1) })
            .delay(isFinalSuccess ? 0.35 : 0.2)
            .call(() => {
                this._highlightSafeZone = false;
                this._highlightPerfectZone = false;
                this.setFeedback('', false);

                if (isFinalSuccess) {
                    this._isResolving = false;
                    this.stopRarityGlow();
                    this.onChallengeSuccess?.(this._hasPerfectHit);
                    return;
                }

                this._safeStartAngle = Math.random() * 360;
                this._pointerAngle = 0;
                this._isRunning = true;
                this._isResolving = false;
                this.drawDial();
                this.drawPointer();
                this.updatePointer();
            })
            .start();
    }

    private playFailureFeedback(): void {
        this._isResolving = true;
        this._brokenDial = true;
        this.stopRarityGlow();
        this.setPointerVisible(false);
        this.drawDial();

        tween(this.node)
            .to(0.06, { position: new Vec3(this._basePosition.x + 12, this._basePosition.y + 3, this._basePosition.z), angle: -5 })
            .to(0.06, { position: new Vec3(this._basePosition.x - 14, this._basePosition.y - 2, this._basePosition.z), angle: 6 })
            .to(0.08, { position: new Vec3(this._basePosition.x, this._basePosition.y, this._basePosition.z), angle: 0, scale: new Vec3(0.92, 0.92, 1) })
            .call(() => this.setFeedback(TEXT_FISH_ESCAPED, true))
            .delay(0.65)
            .call(() => {
                this._isResolving = false;
                this.onChallengeFailed?.();
            })
            .start();
    }

    private drawBrokenDial(graphics: Graphics): void {
        graphics.lineWidth = this._ringWidth;

        const fragmentCount = 12;
        const gapDegrees = 10;

        for (let index = 0; index < fragmentCount; index += 1) {
            const startAngle = index * 30 + gapDegrees * 0.5;
            const sweepAngle = 20 - gapDegrees * 0.5;
            const offset = index % 2 === 0 ? 12 : -8;

            graphics.strokeColor = index % 3 === 0
                ? new Color(255, 111, 106, 245)
                : new Color(180, 53, 60, 230);
            this.strokeDialArc(
                graphics,
                startAngle,
                sweepAngle,
                this._radius + (index % 4) * 3,
                this._ringWidth,
                graphics.strokeColor,
                offset,
            );
        }
    }

    private setRarityHint(): void {
        if (!this.rarityHintLabel) {
            return;
        }

        this.rarityHintLabel.string = `稀有度预感：${getRarityLabel(this._rarity)}`;
        this.rarityHintLabel.color = RARITY_GLOW_COLORS[this._rarity].clone();
        this.rarityHintLabel.node.active = true;
    }

    private showRarityGlow(rarity: FishRarity): void {
        if (!this.rarityEdgeGlow) {
            return;
        }

        const graphics = this.rarityEdgeGlow;
        const node = graphics.node;
        const opacity = node.getComponent(UIOpacity) ?? node.addComponent(UIOpacity);
        const color = RARITY_GLOW_COLORS[rarity];
        const width = 720;
        const height = 1280;
        const border = 64;

        Tween.stopAllByTarget(node);
        Tween.stopAllByTarget(opacity);

        node.active = true;
        opacity.opacity = 70;
        graphics.clear();
        graphics.fillColor = new Color(color.r, color.g, color.b, 115);
        graphics.rect(-width / 2, height / 2 - border, width, border);
        graphics.rect(-width / 2, -height / 2, width, border);
        graphics.rect(-width / 2, -height / 2, border, height);
        graphics.rect(width / 2 - border, -height / 2, border, height);
        graphics.fill();

        tween(opacity)
            .repeatForever(
                tween(opacity)
                    .to(0.45, { opacity: 180 })
                    .to(0.45, { opacity: 55 }),
            )
            .start();
    }

    private stopRarityGlow(): void {
        if (!this.rarityEdgeGlow) {
            return;
        }

        const opacity = this.rarityEdgeGlow.node.getComponent(UIOpacity);
        Tween.stopAllByTarget(this.rarityEdgeGlow.node);
        if (opacity) {
            Tween.stopAllByTarget(opacity);
            opacity.opacity = 0;
        }
        this.rarityEdgeGlow.clear();
        this.rarityEdgeGlow.node.active = false;
    }

    private getPerfectStartAngle(): number {
        return this._safeStartAngle + (this._safeZoneAngle - this._perfectZoneAngle) * 0.5;
    }

    private angleToRadians(angle: number): number {
        return (angle * Math.PI) / 180;
    }

    private getPointOnDial(angle: number, radius: number, yOffset = 0): Vec2 {
        const radians = this.angleToRadians(angle);
        return new Vec2(Math.sin(radians) * radius, Math.cos(radians) * radius + yOffset);
    }

    private strokeDialArc(
        graphics: Graphics,
        startAngle: number,
        sweepAngle: number,
        radius: number,
        width: number,
        color: Color,
        yOffset = 0,
    ): void {
        graphics.lineWidth = width;
        graphics.strokeColor = color;

        const segmentCount = Math.max(1, Math.ceil(Math.abs(sweepAngle) / ARC_SEGMENT_DEGREES));

        for (let index = 0; index <= segmentCount; index += 1) {
            const progress = index / segmentCount;
            const point = this.getPointOnDial(startAngle + sweepAngle * progress, radius, yOffset);

            if (index === 0) {
                graphics.moveTo(point.x, point.y);
            } else {
                graphics.lineTo(point.x, point.y);
            }
        }

        graphics.stroke();
    }

    private updateShake(deltaTime: number): void {
        this._shakeTime += deltaTime;
        const offsetX = Math.sin(this._shakeTime * 20) * 2.5;
        const offsetY = Math.cos(this._shakeTime * 17) * 1.8;
        this.node.setPosition(this._basePosition.x + offsetX, this._basePosition.y + offsetY, this._basePosition.z);
    }

    private captureBasePosition(): void {
        const position = this.node.position;
        this._basePosition.set(position.x, position.y, position.z);
        this._hasBasePosition = true;
        this._shakeTime = 0;
    }

    private setFeedback(text: string, visible: boolean): void {
        if (!this.feedbackLabel) {
            return;
        }

        this.feedbackLabel.string = text;
        this.feedbackLabel.node.active = visible;
    }

    private setPointerVisible(visible: boolean): void {
        if (this.pointerNode) {
            this.pointerNode.active = visible;
        }
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
        this.node.insertChild(node, 0);
        this.layoutNode(node, x, y, width, height);
        return node.addComponent(Graphics);
    }

    private createFallbackPointer(): Node {
        const node = new Node('Pointer');
        this.node.addChild(node);
        this.layoutNode(node, 0, 50, 20, 170);
        node.addComponent(Graphics);
        return node;
    }

    private drawPointer(): void {
        if (!this.pointerNode) {
            return;
        }

        const graphics = this.pointerNode.getComponent(Graphics) ?? this.pointerNode.addComponent(Graphics);

        this.pointerNode.angle = 0;

        graphics.clear();
        graphics.lineWidth = 10;
        graphics.strokeColor = new Color(255, 231, 116, 255);
        graphics.moveTo(0, 0);
        const tip = this.getPointOnDial(this._pointerAngle, this._radius + this._ringWidth * 0.5 + 8);
        graphics.lineTo(tip.x, tip.y);
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
