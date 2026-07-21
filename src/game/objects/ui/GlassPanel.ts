import { GameObjects, Scene } from 'phaser';

export class GlassPanel {
    private scene: Scene;
    public container: GameObjects.Container;
    private background: GameObjects.Rectangle;
    private frameGraphics: GameObjects.Graphics;
    private width: number;
    private height: number;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        strokeColor = 0x31f5ff,
        bgColor = 0x07162b,
        bgAlpha = 0.95
    ) {
        this.scene = scene;
        this.width = width;
        this.height = height;

        this.background = this.scene.add.rectangle(0, 0, width, height, bgColor, bgAlpha);
        this.frameGraphics = this.scene.add.graphics();
        this.drawFrame(strokeColor);

        this.container = this.scene.add.container(x, y, [this.background, this.frameGraphics]);
    }

    private drawFrame(strokeColor: number): void {
        const g = this.frameGraphics;
        g.clear();

        // Main outer stroke
        g.lineStyle(2, strokeColor, 0.9);
        g.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Inner subtle accent frame
        g.lineStyle(1, 0x1d6382, 0.4);
        g.strokeRect(-this.width / 2 + 6, -this.height / 2 + 6, this.width - 12, this.height - 12);

        // Tech Corner Brackets
        g.lineStyle(3, 0xffffff, 0.95);
        const w2 = this.width / 2;
        const h2 = this.height / 2;
        const len = 16;

        // Top-left
        g.lineBetween(-w2, -h2 + len, -w2, -h2);
        g.lineBetween(-w2, -h2, -w2 + len, -h2);

        // Top-right
        g.lineBetween(w2 - len, -h2, w2, -h2);
        g.lineBetween(w2, -h2, w2, -h2 + len);

        // Bottom-left
        g.lineBetween(-w2, h2 - len, -w2, h2);
        g.lineBetween(-w2, h2, -w2 + len, h2);

        // Bottom-right
        g.lineBetween(w2 - len, h2, w2, h2);
        g.lineBetween(w2, h2 - len, w2, h2);
    }

    public animateIn(duration = 250): this {
        this.container.setScale(0.8);
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1.0,
            scaleY: 1.0,
            alpha: 1.0,
            duration,
            ease: 'Back.easeOut'
        });
        return this;
    }

    public setScrollFactor(factor: number): this {
        this.container.setScrollFactor(factor);
        this.background.setScrollFactor(factor);
        this.frameGraphics.setScrollFactor(factor);
        return this;
    }

    public setDepth(depth: number): this {
        this.container.setDepth(depth);
        return this;
    }

    public destroy(): void {
        this.container.destroy();
    }
}
