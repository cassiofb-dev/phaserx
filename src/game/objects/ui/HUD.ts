import { GameObjects, Scene } from 'phaser';
import { Button } from './Button';

export class HUD {
    private scene: Scene;
    public container: GameObjects.Container;
    private topBar: GameObjects.Rectangle;
    private timerText: GameObjects.Text;
    private livesText: GameObjects.Text;
    private stageText: GameObjects.Text;
    private speedText: GameObjects.Text;
    private alertText: GameObjects.Text;
    private pauseButton: Button;
    private accentColor = '#31f5ff';

    constructor(scene: Scene, onPause: () => void) {
        this.scene = scene;

        // Container pinned to screen
        this.container = this.scene.add.container(0, -60).setScrollFactor(0).setDepth(20);

        // Top status glass bar
        this.topBar = this.scene.add.rectangle(512, 40, 990, 64, 0x07162b, 0.95)
            .setStrokeStyle(2, 0x31f5ff);
        this.container.add(this.topBar);

        // Subtly pulse top bar border
        this.scene.tweens.add({
            targets: this.topBar,
            alpha: { from: 0.85, to: 1 },
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        // Left: HULL Lives display
        this.livesText = this.scene.add.text(34, 40, '', this.hudTextStyle(18, '#bafcff'))
            .setOrigin(0, 0.5);

        // Center: Stage Countdown Timer
        this.timerText = this.scene.add.text(512, 39, '', this.hudTextStyle(26, '#31f5ff'))
            .setOrigin(0.5);

        // Right: Stage Level
        this.stageText = this.scene.add.text(860, 40, '', this.hudTextStyle(18, '#bafcff'))
            .setOrigin(1, 0.5);

        // Menu / Pause button
        this.pauseButton = new Button(this.scene, 936, 40, 'MENU', onPause, 95, 0x173e64, 0x31f5ff, 36);
        this.pauseButton.setScrollFactor(0);

        // Sub-bar: Speed & Surge countdown
        this.speedText = this.scene.add.text(512, 85, '', this.hudTextStyle(14, '#7da9c8'))
            .setOrigin(0.5);

        // Flash Alert text banner (e.g. VELOCITY SURGE! / HULL HIT!)
        this.alertText = this.scene.add.text(512, 135, '', this.hudTextStyle(22, '#ffffff'))
            .setOrigin(0.5)
            .setAlpha(0);

        this.container.add([
            this.livesText,
            this.timerText,
            this.stageText,
            this.speedText,
            this.alertText
        ]);

        // Smooth Entrance Drop-down Animation
        this.scene.tweens.add({
            targets: this.container,
            y: 0,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    public setStageAccent(colorHex: string): void {
        this.accentColor = colorHex;
        const colorNum = parseInt(colorHex.replace('#', '0x'), 16);
        this.topBar.setStrokeStyle(2, colorNum);
        this.pauseButton.setStroke(colorNum);
        this.stageText.setColor(colorHex);
    }

    public update(
        remainingSeconds: number,
        lives: number,
        maxLives: number,
        stage: number,
        currentSpeed: number,
        secondsToSurge: number
    ): void {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = String(remainingSeconds % 60).padStart(2, '0');
        this.timerText.setText(`${mins}:${secs}`);

        // Danger color pulse when time < 10s
        if (remainingSeconds <= 10 && remainingSeconds > 0) {
            this.timerText.setColor('#ff3da5');
        } else {
            this.timerText.setColor(this.accentColor);
        }

        // Hull hearts formatting
        const filled = '♥ '.repeat(Math.max(0, lives));
        const empty = '· '.repeat(Math.max(0, maxLives - lives));
        this.livesText.setText(`HULL  ${filled}${empty}`);

        this.stageText.setText(`STAGE 0${stage}/05`);
        this.speedText.setText(`SPEED ${Math.round(currentSpeed)} KM/H  //  NEXT SURGE ${Math.max(0, Math.ceil(secondsToSurge))}S`);
    }

    public flashAlert(text: string, colorHex: string): void {
        this.alertText.setText(text)
            .setColor(colorHex)
            .setAlpha(1)
            .setScale(0.5);

        this.scene.tweens.killTweensOf(this.alertText);
        this.scene.tweens.add({
            targets: this.alertText,
            scale: 1.25,
            duration: 180,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.alertText,
                    alpha: 0,
                    scale: 1.5,
                    duration: 750,
                    ease: 'Quad.easeOut'
                });
            }
        });
    }

    private hudTextStyle(size: number, color: string): Phaser.Types.GameObjects.Text.TextStyle {
        return {
            fontFamily: 'monospace',
            fontSize: size,
            fontStyle: 'bold',
            color,
            stroke: '#041224',
            strokeThickness: 4
        };
    }

    public destroy(): void {
        this.container.destroy();
        this.pauseButton.destroy();
    }
}
