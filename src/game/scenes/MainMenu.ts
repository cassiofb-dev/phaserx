import { GameObjects, Scene } from 'phaser';

type Difficulty = 'easy' | 'medium' | 'hard' | 'hardcore';

interface DifficultyRule {
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

export class MainMenu extends Scene
{
    background!: GameObjects.Image;
    title!: GameObjects.Text;
    selectedDifficulty: Difficulty = 'medium';
    musicOn = true;
    effectsOn = true;
    private showPhases = false;

    constructor ()
    {
        super('MainMenu');
    }

    init (data: { showPhaseSelector?: boolean }): void
    {
        this.showPhases = data.showPhaseSelector ?? false;
    }

    create ()
    {
        this.drawBackdrop();
        this.title = this.add.text(512, 78, 'PHASERX', {
            fontFamily: 'monospace', fontSize: 56, fontStyle: 'bold', color: '#d9fdff',
            align: 'center', stroke: '#083c68', strokeThickness: 7
        }).setOrigin(0.5);
        this.tweens.add({ targets: this.title, alpha: { from: 0.72, to: 1 }, duration: 750, yoyo: true, repeat: -1 });

        this.add.text(512, 142, 'DODGE // SURVIVE // ACCELERATE', {
            fontFamily: 'monospace', fontSize: 18, color: '#31f5ff'
        }).setOrigin(0.5);

        if (this.showPhases) {
            this.createPhaseSelector();
            return;
        }

        this.addButton(512, 235, 'START', () => {
            this.game.registry.set('difficulty', this.selectedDifficulty);
            this.game.registry.set('musicOn', this.musicOn);
            this.game.registry.set('effectsOn', this.effectsOn);
            this.scene.restart({ showPhaseSelector: true });
        }, 270, PINK);

        this.add.text(512, 322, 'DIFFICULTY', this.smallStyle()).setOrigin(0.5);
        const options = Object.keys(DIFFICULTIES) as Difficulty[];
        options.forEach((difficulty, index) => {
            const x = 250 + index * 175;
            const button = this.addButton(x, 366, DIFFICULTIES[difficulty].label, () => {
                this.selectedDifficulty = difficulty;
                this.scene.restart();
            }, 150, difficulty === this.selectedDifficulty ? CYAN : 0x173454, 34);
            if (difficulty === this.selectedDifficulty) button.setStrokeStyle(3, 0xffffff);
        });

        const rule = DIFFICULTIES[this.selectedDifficulty];
        this.add.text(512, 423, `${rule.lives} LIFE${rule.lives > 1 ? 'S' : ''}  //  BOOST EACH ${rule.speedEvery}S  //  STAGE: ${this.formatTime(rule.goal)}`, {
            fontFamily: 'monospace', fontSize: 15, color: '#c4d9ee'
        }).setOrigin(0.5);

        this.addButton(292, 506, 'HOW TO PLAY', () => this.showGuide(), 260, 0x173454);
        this.addButton(732, 506, `SOUNDTRACK: ${this.musicOn ? 'ON' : 'OFF'}`, () => {
            this.musicOn = !this.musicOn;
            this.scene.restart();
        }, 320, 0x173454);
        this.addButton(512, 563, `EFFECTS: ${this.effectsOn ? 'ON' : 'OFF'}`, () => {
            this.effectsOn = !this.effectsOn;
            this.scene.restart();
        }, 260, 0x173454);

        this.add.text(512, 687, '5 STAGES  •  EACH WITH ITS OWN FACTORY TRANSMISSION', this.smallStyle()).setOrigin(0.5);
        this.add.text(512, 716, 'A / D  or  ← / →  TO CHANGE LANES', { ...this.smallStyle(), color: '#ffffff' }).setOrigin(0.5);
    }

    private createPhaseSelector (): void {
        const unlockedStage = (this.game.registry.get('unlockedStage') as number | undefined) ?? 1;
        this.add.text(512, 202, 'SELECT PHASE', { fontFamily: 'monospace', fontSize: 28, fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(512, 237, `PHASES UNLOCKED: ${unlockedStage} / 5`, this.smallStyle()).setOrigin(0.5);

        for (let stage = 1; stage <= 5; stage++) {
            const x = 152 + (stage - 1) * 180;
            const available = stage <= unlockedStage;
            const color = available ? (stage === unlockedStage ? PINK : 0x173e64) : 0x101827;
            const card = this.add.rectangle(x, 380, 150, 205, color, 0.96).setStrokeStyle(3, available ? CYAN : 0x30445c);
            const status = stage < unlockedStage ? 'CLEARED' : (available ? 'READY' : 'LOCKED');
            const statusColor = available ? '#bafcff' : '#52627a';
            this.add.text(x, 330, `PHASE\n0${stage}`, { fontFamily: 'monospace', fontSize: 22, fontStyle: 'bold', color: available ? '#ffffff' : '#52627a', align: 'center' }).setOrigin(0.5);
            this.add.text(x, 425, status, { fontFamily: 'monospace', fontSize: 15, fontStyle: 'bold', color: statusColor }).setOrigin(0.5);
            this.add.text(x, 465, available ? `TRACK 0${stage}` : 'COMPLETE\nPREVIOUS', { fontFamily: 'monospace', fontSize: 12, color: statusColor, align: 'center' }).setOrigin(0.5);
            if (available) {
                card.setInteractive({ useHandCursor: true });
                card.on('pointerover', () => card.setFillStyle(PINK));
                card.on('pointerout', () => card.setFillStyle(color));
                card.on('pointerdown', () => this.startPhase(stage));
            }
        }

        this.addButton(512, 620, 'BACK', () => this.scene.restart({ showPhaseSelector: false }), 190, 0x173454);
        this.add.text(512, 687, 'BEAT A PHASE TO UNLOCK THE NEXT FACTORY TRANSMISSION', this.smallStyle()).setOrigin(0.5);
    }

    private startPhase (stage: number): void {
        if (!this.scale.isFullscreen) this.scale.startFullscreen();
        if (stage === 1) this.game.registry.set('storyChoices', []);
        this.scene.start('Story', { stage, mode: 'briefing' });
    }

    private drawBackdrop (): void {
        this.cameras.main.setBackgroundColor(0x030713);
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x0e426a, 0.62);
        for (let y = 120; y < 768; y += 42) grid.lineBetween(0, y, 1024, y);
        for (let x = 0; x <= 1024; x += 64) grid.lineBetween(x, 120, 512 + (x - 512) * 0.22, 768);
        grid.lineStyle(3, CYAN, 0.38).lineBetween(0, 120, 1024, 120);
        for (let i = 0; i < 18; i++) this.add.rectangle(28 + i * 58, 132 + (i % 4) * 128, 3, 20 + (i % 3) * 13, CYAN, 0.3);
    }

    private addButton (x: number, y: number, label: string, action: () => void, width: number, color: number, height = 46): GameObjects.Rectangle {
        const button = this.add.rectangle(x, y, width, height, color, 0.88).setStrokeStyle(2, 0x5fefff).setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: 17, fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
        button.on('pointerover', () => { button.setFillStyle(PINK, 1); text.setColor('#ffffff'); });
        button.on('pointerout', () => button.setFillStyle(color, 0.88));
        button.on('pointerdown', action);
        return button;
    }

    private showGuide (): void {
        const shade = this.add.rectangle(512, 384, 1024, 768, 0x01030a, 0.9).setInteractive();
        const panel = this.add.rectangle(512, 384, 700, 395, 0x0b1c35, 0.98).setStrokeStyle(4, CYAN);
        const copy = this.add.text(512, 350, 'PILOT GUIDE\n\nCHANGE LANES with A / D or LEFT / RIGHT.\nDODGE every red barrier streaming from above.\n\nA hit costs a life and grants a brief shield.\nSurvive the timer to enter the next factory stage.\nSpeed surges trigger a boom and a UI shockwave.\n\nCLICK ANYWHERE TO RETURN', {
            fontFamily: 'monospace', fontSize: 19, color: '#dcf9ff', align: 'center', lineSpacing: 5
        }).setOrigin(0.5);
        shade.once('pointerdown', () => { shade.destroy(); panel.destroy(); copy.destroy(); });
    }

    private smallStyle (): Phaser.Types.GameObjects.Text.TextStyle {
        return { fontFamily: 'monospace', fontSize: 15, color: '#7da9c8' };
    }

    private formatTime (seconds: number): string {
        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    }
}
