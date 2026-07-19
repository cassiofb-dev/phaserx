import { GameObjects, Scene } from 'phaser';
import { GridBackground } from '../objects/GridBackground';
import { Button } from '../objects/ui/Button';
import { GlassPanel } from '../objects/ui/GlassPanel';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'hardcore';

export interface DifficultyRule {
    label: string;
    lives: number;
    speedEvery: number;
    goal: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyRule> = {
    easy: { label: 'EASY', lives: 3, speedEvery: 30, goal: 60 },
    medium: { label: 'MEDIUM', lives: 3, speedEvery: 30, goal: 120 },
    hard: { label: 'HARD', lives: 3, speedEvery: 15, goal: 120 },
    hardcore: { label: 'HARDCORE', lives: 1, speedEvery: 15, goal: 180 }
};

const CYAN = 0x31f5ff;
const PINK = 0xff3da5;

export class MainMenu extends Scene {
    private gridBg!: GridBackground;
    private titleText!: GameObjects.Text;
    private selectedDifficulty: Difficulty = 'medium';
    private musicOn = true;
    private effectsOn = true;
    private showPhases = false;
    private difficultyButtons: Record<Difficulty, Button | null> = { easy: null, medium: null, hard: null, hardcore: null };

    constructor() {
        super('MainMenu');
    }

    init(data: { showPhaseSelector?: boolean }): void {
        this.showPhases = data.showPhaseSelector ?? false;
        this.selectedDifficulty = (this.game.registry.get('difficulty') as Difficulty) ?? 'medium';
        this.musicOn = (this.game.registry.get('musicOn') as boolean) ?? true;
        this.effectsOn = (this.game.registry.get('effectsOn') as boolean) ?? true;
    }

    create(): void {
        this.cameras.main.setBackgroundColor(0x0a1c3f);

        // Synthwave 3D perspective grid background with planets and stars
        this.gridBg = new GridBackground(this);

        // Animated neon floating Title
        this.titleText = this.add.text(512, 78, 'PHASERX', {
            fontFamily: 'monospace',
            fontSize: 62,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#08487e',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: this.titleText,
            scaleX: 1.04,
            scaleY: 1.04,
            alpha: { from: 0.88, to: 1 },
            duration: 850,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(512, 138, 'DODGE // SURVIVE // ACCELERATE', {
            fontFamily: 'monospace',
            fontSize: 16,
            fontStyle: 'bold',
            color: '#31f5ff'
        }).setOrigin(0.5).setDepth(10);

        if (this.showPhases) {
            this.createPhaseSelector();
            return;
        }

        // Start / Launch Run Button
        new Button(this, 512, 230, 'START MISSION', () => {
            this.saveRegistryOptions();
            this.scene.restart({ showPhaseSelector: true });
        }, 280, PINK, CYAN, 50).setDepth(10);

        // Difficulty Selector header & option buttons
        this.add.text(512, 312, 'SELECT DIFFICULTY', this.subHeaderStyle()).setOrigin(0.5).setDepth(10);
        const options = Object.keys(DIFFICULTIES) as Difficulty[];
        options.forEach((diffKey, idx) => {
            const x = 250 + idx * 175;
            const isSelected = diffKey === this.selectedDifficulty;
            const btn = new Button(
                this,
                x,
                356,
                DIFFICULTIES[diffKey].label,
                () => {
                    this.selectedDifficulty = diffKey;
                    this.saveRegistryOptions();
                    this.scene.restart();
                },
                154,
                isSelected ? CYAN : 0x12365e,
                isSelected ? 0xffffff : 0x31f5ff,
                38
            );
            btn.setDepth(10);
            this.difficultyButtons[diffKey] = btn;
        });

        // Difficulty Rule Description
        const rule = DIFFICULTIES[this.selectedDifficulty];
        this.add.text(
            512,
            415,
            `${rule.lives} LIFE${rule.lives > 1 ? 'S' : ''}  //  SURGE EACH ${rule.speedEvery}S  //  STAGE GOAL: ${this.formatTime(rule.goal)}`,
            { fontFamily: 'monospace', fontSize: 14, fontStyle: 'bold', color: '#ffffff' }
        ).setOrigin(0.5).setDepth(10);

        // Options Row
        new Button(this, 292, 498, 'PILOT GUIDE', () => this.showGuide(), 250, 0x12365e).setDepth(10);
        new Button(
            this,
            732,
            498,
            `AUDIO TRACK: ${this.musicOn ? 'ON' : 'OFF'}`,
            () => {
                this.musicOn = !this.musicOn;
                this.saveRegistryOptions();
                this.scene.restart();
            },
            310,
            0x12365e
        ).setDepth(10);

        new Button(
            this,
            512,
            556,
            `SOUND FX: ${this.effectsOn ? 'ON' : 'OFF'}`,
            () => {
                this.effectsOn = !this.effectsOn;
                this.saveRegistryOptions();
                this.scene.restart();
            },
            250,
            0x12365e
        ).setDepth(10);

        // Footer info text
        this.add.text(512, 685, '5 FACTORY STAGES  •  DYNAMIC TRANSMISSIONS', this.subHeaderStyle()).setOrigin(0.5).setDepth(10);
        this.add.text(512, 714, 'A / D  OR  ← / →  TO CHANGE LANES', { ...this.subHeaderStyle(), color: '#ffffff' }).setOrigin(0.5).setDepth(10);
    }

    update(_time: number, delta: number): void {
        this.gridBg?.update(delta / 1000, 200);
    }

    private saveRegistryOptions(): void {
        this.game.registry.set('difficulty', this.selectedDifficulty);
        this.game.registry.set('musicOn', this.musicOn);
        this.game.registry.set('effectsOn', this.effectsOn);
    }

    private createPhaseSelector(): void {
        const unlockedStage = (this.game.registry.get('unlockedStage') as number | undefined) ?? 1;

        this.add.text(512, 195, 'SELECT TRANSMISSION PHASE', {
            fontFamily: 'monospace',
            fontSize: 24,
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);

        this.add.text(512, 230, `UNLOCKED STAGES: ${unlockedStage} / 5`, this.subHeaderStyle()).setOrigin(0.5).setDepth(10);

        for (let stage = 1; stage <= 5; stage++) {
            const x = 152 + (stage - 1) * 180;
            const isAvailable = stage <= unlockedStage;
            const isCurrent = stage === unlockedStage;
            const strokeColor = isAvailable ? (isCurrent ? PINK : CYAN) : 0x30445c;

            const card = new GlassPanel(this, x, 375, 154, 210, strokeColor, isAvailable ? 0x0f2d54 : 0x0a1a33, 0.95);
            card.setDepth(10);

            const status = stage < unlockedStage ? 'CLEARED' : (isAvailable ? 'READY' : 'LOCKED');
            const statusColor = isAvailable ? '#ffffff' : '#6b8aa8';

            this.add.text(x, 320, `PHASE\n0${stage}`, {
                fontFamily: 'monospace',
                fontSize: 22,
                fontStyle: 'bold',
                color: isAvailable ? '#ffffff' : '#6b8aa8',
                align: 'center'
            }).setOrigin(0.5).setDepth(11);

            this.add.text(x, 415, status, {
                fontFamily: 'monospace',
                fontSize: 14,
                fontStyle: 'bold',
                color: statusColor
            }).setOrigin(0.5).setDepth(11);

            this.add.text(x, 455, isAvailable ? `TRACK 0${stage}` : 'LOCKED\nPREVIOUS', {
                fontFamily: 'monospace',
                fontSize: 12,
                color: statusColor,
                align: 'center'
            }).setOrigin(0.5).setDepth(11);

            if (isAvailable) {
                const clickArea = this.add.rectangle(x, 375, 154, 210, 0x000000, 0)
                    .setInteractive({ useHandCursor: true })
                    .setDepth(12);

                clickArea.on('pointerover', () => {
                    this.tweens.add({ targets: card.container, scaleX: 1.05, scaleY: 1.05, duration: 120 });
                });
                clickArea.on('pointerout', () => {
                    this.tweens.add({ targets: card.container, scaleX: 1.0, scaleY: 1.0, duration: 120 });
                });
                clickArea.on('pointerdown', () => this.startPhase(stage));
            }
        }

        new Button(this, 512, 615, 'BACK', () => this.scene.restart({ showPhaseSelector: false }), 190, 0x12365e).setDepth(10);
        this.add.text(512, 685, 'CLEAR EACH PHASE TO UNLOCK DEEPER FACTORY TRANSMISSIONS', this.subHeaderStyle()).setOrigin(0.5).setDepth(10);
    }

    private startPhase(stage: number): void {
        if (stage === 1) this.game.registry.set('storyChoices', []);
        this.scene.start('Story', { stage, mode: 'briefing' });
    }

    private showGuide(): void {
        const shade = this.add.rectangle(512, 384, 1024, 768, 0x051229, 0.82).setInteractive().setDepth(20);
        const panel = new GlassPanel(this, 512, 384, 720, 410, CYAN, 0x0d284a, 0.98);
        panel.setDepth(21);

        const title = this.add.text(512, 220, 'PILOT FLIGHT DIRECTIVE', {
            fontFamily: 'monospace', fontSize: 24, fontStyle: 'bold', color: '#31f5ff'
        }).setOrigin(0.5).setDepth(22);

        const copy = this.add.text(
            512,
            370,
            'CHANGE LANES with A / D  or  ← / →\nDODGE every hazard barrier streaming from above.\n\nA hit damages hull integrity and activates temporary shield.\nSurvive the timer to clear each corporate factory phase.\nVelocity surges trigger engine boost and UI shockwaves.\n\n[ CLICK ANYWHERE TO CLOSE ]',
            { fontFamily: 'monospace', fontSize: 17, color: '#ffffff', align: 'center', lineSpacing: 8 }
        ).setOrigin(0.5).setDepth(22);

        shade.once('pointerdown', () => {
            shade.destroy();
            panel.destroy();
            title.destroy();
            copy.destroy();
        });
    }

    private subHeaderStyle(): Phaser.Types.GameObjects.Text.TextStyle {
        return { fontFamily: 'monospace', fontSize: 14, fontStyle: 'bold', color: '#8ec3eb' };
    }

    private formatTime(seconds: number): string {
        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    }
}
