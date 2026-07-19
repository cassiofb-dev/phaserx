import { GameObjects, Scene } from 'phaser';

export class Button {
    private scene: Scene;
    public container: GameObjects.Container;
    private background: GameObjects.Rectangle;
    private border: GameObjects.Graphics;
    private labelText: GameObjects.Text;
    private normalColor: number;
    private hoverColor = 0xff3da5; // Magenta hover glow
    private strokeColor: number;
    private width: number;
    private height: number;
    private isHovered = false;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        text: string,
        onClick: () => void,
        width = 220,
        normalColor = 0x173e64,
        strokeColor = 0x31f5ff,
        height = 48
    ) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.normalColor = normalColor;
        this.strokeColor = strokeColor;

        // Background translucent rectangle
        this.background = this.scene.add.rectangle(0, 0, width, height, normalColor, 0.9)
            .setInteractive({ useHandCursor: true });

        // Glowing border graphics
        this.border = this.scene.add.graphics();
        this.drawBorder(strokeColor, 2);

        // Label text
        this.labelText = this.scene.add.text(0, 0, text, {
            fontFamily: 'monospace',
            fontSize: 16,
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Main Container
        this.container = this.scene.add.container(x, y, [this.background, this.border, this.labelText]);

        // Pointer interactions
        this.background.on('pointerover', () => {
            this.isHovered = true;
            this.background.setFillStyle(this.hoverColor, 1);
            this.drawBorder(0xffffff, 3);
            this.scene.tweens.add({
                targets: this.container,
                scaleX: 1.04,
                scaleY: 1.04,
                duration: 100,
                ease: 'Quad.easeOut'
            });

            if (this.scene.game.registry.get('effectsOn') !== false) {
                this.scene.sound.play('swoosh', { volume: 0.15 });
            }
        });

        this.background.on('pointerout', () => {
            this.isHovered = false;
            this.background.setFillStyle(this.normalColor, 0.9);
            this.drawBorder(this.strokeColor, 2);
            this.scene.tweens.add({
                targets: this.container,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 100,
                ease: 'Quad.easeOut'
            });
        });

        this.background.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: this.container,
                scaleX: 0.96,
                scaleY: 0.96,
                duration: 60,
                yoyo: true,
                onComplete: onClick
            });
        });
    }

    private drawBorder(color: number, thickness: number): void {
        this.border.clear();
        this.border.lineStyle(thickness, color, 0.95);
        this.border.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Corner accents
        this.border.lineStyle(2, 0xffffff, 0.8);
        const w2 = this.width / 2;
        const h2 = this.height / 2;
        this.border.lineBetween(-w2, -h2 + 8, -w2, -h2);
        this.border.lineBetween(-w2, -h2, -w2 + 8, -h2);

        this.border.lineBetween(w2 - 8, h2, w2, h2);
        this.border.lineBetween(w2, h2 - 8, w2, h2);
    }

    public setText(newText: string): void {
        this.labelText.setText(newText);
    }

    public setStroke(color: number): void {
        this.strokeColor = color;
        if (!this.isHovered) {
            this.drawBorder(color, 2);
        }
    }

    public setFill(color: number): void {
        this.normalColor = color;
        if (!this.isHovered) {
            this.background.setFillStyle(color, 0.9);
        }
    }

    public setScrollFactor(factor: number): void {
        this.container.setScrollFactor(factor);
    }

    public setDepth(depth: number): void {
        this.container.setDepth(depth);
    }

    public destroy(): void {
        this.container.destroy();
    }
}
