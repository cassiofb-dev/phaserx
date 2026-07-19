import { GameObjects, Input, Math as PhaserMath, Scene, Sound } from 'phaser';
import { DIFFICULTIES } from './MainMenu';
import { PHASE_STORIES } from './Story';

type Difficulty = keyof typeof DIFFICULTIES;

interface Barrier {
    body: GameObjects.Rectangle;
    lane: number;
    speed: number;
}

interface GameStartData { stage?: number; }

const WIDTH = 1024;
const HEIGHT = 768;
const LANE_WIDTH = 210;
const CYAN = 0x31f5ff;
const PINK = 0xff3da5;

export class Game extends Scene {
    private stage = 1;
    private difficulty: Difficulty = 'medium';
    private elapsed = 0;
    private speedLevel = 0;
    private lives = 3;
    private baseSpeed = 500;
    private spawnElapsed = 0;
    private shieldUntil = 0;
    private lane = 0;
    private barriers: Barrier[] = [];
    private ship!: GameObjects.Container;
    private shipGlow!: GameObjects.Rectangle;
    private timerText!: GameObjects.Text;
    private livesText!: GameObjects.Text;
    private stageText!: GameObjects.Text;
    private speedText!: GameObjects.Text;
    private boostText!: GameObjects.Text;
    private music?: Sound.BaseSound;
    private leftKey!: Input.Keyboard.Key;
    private rightKey!: Input.Keyboard.Key;
    private aKey!: Input.Keyboard.Key;
    private dKey!: Input.Keyboard.Key;
    private escapeKey!: Input.Keyboard.Key;
    private isEnding = false;
    private isPaused = false;

    constructor() {
        super('Game');
    }

    init(data: GameStartData): void {
        this.stage = data.stage ?? 1;
        this.difficulty = (this.game.registry.get('difficulty') as Difficulty) ?? 'medium';
        this.lives = DIFFICULTIES[this.difficulty].lives;
        this.elapsed = 0;
        this.speedLevel = 0;
        this.spawnElapsed = 0;
        this.shieldUntil = 0;
        this.lane = 0;
        this.barriers = [];
        this.isEnding = false;
        this.isPaused = false;
    }

    create(): void {
        this.cameras.main.setBackgroundColor(0x020611);
        this.cameras.main.scrollX = 0;
        this.drawTrack();
        this.createHud();
        this.createShip();
        this.createInput();
        this.playStageMusic();
        this.showStageIntro();
    }

    update(_time: number, delta: number): void {
        if (this.isEnding || this.isPaused) return;
        const deltaSeconds = Math.min(delta, 50) / 1000;
        this.elapsed += deltaSeconds;
        this.spawnElapsed += deltaSeconds;
        this.updateHud();
        this.checkAcceleration();
        this.spawnBarriers();
        this.moveBarriers(deltaSeconds);
        this.updateShipEffects();
        this.cameras.main.scrollX = this.ship.x - WIDTH / 2;
    }

    private drawTrack(): void {
        const g = this.add.graphics();
        g.fillStyle(0x06172c, 1).fillRect(-100000, 0, 200000, HEIGHT);
        g.lineStyle(2, 0x1d6382, 0.8);
        for (let lane = -480; lane <= 480; lane++) g.lineBetween(this.laneX(lane) - LANE_WIDTH / 2, 0, this.laneX(lane) - LANE_WIDTH / 2, HEIGHT);
        g.lineStyle(5, CYAN, 0.75);
        for (let lane = -480; lane <= 480; lane += 6) g.lineBetween(this.laneX(lane) - LANE_WIDTH / 2, 0, this.laneX(lane) - LANE_WIDTH / 2, HEIGHT);
        for (let y = -30; y < HEIGHT; y += 46) {
            g.lineStyle(2, 0x2d94ad, 0.45).lineBetween(-100000, y, 100000, y);
        }
    }

    private createHud(): void {
        const bar = this.add.rectangle(512, 40, 990, 64, 0x07162b, 0.96).setStrokeStyle(2, CYAN).setScrollFactor(0);
        this.timerText = this.add.text(512, 39, '', this.hudStyle(27)).setOrigin(0.5).setScrollFactor(0);
        this.livesText = this.add.text(34, 39, '', this.hudStyle(18)).setOrigin(0, 0.5).setScrollFactor(0);
        this.stageText = this.add.text(870, 39, '', this.hudStyle(18)).setOrigin(1, 0.5).setScrollFactor(0);
        const menuButton = this.add.rectangle(947, 40, 110, 38, 0x173e64, 1).setStrokeStyle(2, CYAN).setScrollFactor(0).setInteractive({ useHandCursor: true });
        this.add.text(947, 40, 'MENU', this.hudStyle(15)).setOrigin(0.5).setScrollFactor(0);
        menuButton.on('pointerdown', () => this.openPauseMenu());
        this.speedText = this.add.text(512, 83, '', this.hudStyle(15)).setOrigin(0.5).setScrollFactor(0);
        this.boostText = this.add.text(512, 132, 'SYSTEM ONLINE', { ...this.hudStyle(17), color: '#ffffff' }).setOrigin(0.5).setAlpha(0).setScrollFactor(0);
        this.tweens.add({ targets: bar, alpha: { from: 0.85, to: 1 }, duration: 600, yoyo: true, repeat: -1 });
    }

    private createShip(): void {
        this.shipGlow = this.add.rectangle(this.laneX(this.lane), 654, 104, 16, CYAN, 0.18);
        const graphics = this.add.graphics();
        graphics.fillStyle(0x31f5ff, 1).fillTriangle(0, -42, -31, 31, 31, 31);
        graphics.fillStyle(0x0b3157, 1).fillTriangle(0, -26, -17, 23, 17, 23);
        graphics.fillStyle(0xff3da5, 1).fillRect(-8, -15, 16, 30);
        graphics.fillStyle(0xffffff, 1).fillRect(-3, -31, 6, 26);
        graphics.lineStyle(3, 0xffffff, 0.85).strokeTriangle(0, -42, -31, 31, 31, 31);
        this.ship = this.add.container(this.laneX(this.lane), 650, [graphics]);
        this.tweens.add({ targets: this.ship, y: 642, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    private createInput(): void {
        this.leftKey = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.RIGHT);
        this.aKey = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.D);
        this.escapeKey = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.ESC);
        this.leftKey.on('down', () => this.changeLane(-1));
        this.aKey.on('down', () => this.changeLane(-1));
        this.rightKey.on('down', () => this.changeLane(1));
        this.dKey.on('down', () => this.changeLane(1));
        this.escapeKey.on('down', () => this.openPauseMenu());
    }

    private changeLane(direction: number): void {
        if (this.isEnding || this.isPaused) return;
        this.lane += direction;
        this.tweens.killTweensOf(this.ship);
        this.tweens.add({ targets: [this.ship, this.shipGlow], x: this.laneX(this.lane), duration: 110, ease: 'Quad.easeOut' });
    }

    private spawnBarriers(): void {
        const gap = Math.max(0.35, 0.8 - this.speedLevel * 0.045 - (this.stage - 1) * 0.035);
        if (this.spawnElapsed < gap) return;
        this.spawnElapsed = 0;
        const blockedLane = this.lane + PhaserMath.Between(-1, 1);
        const body = this.add.rectangle(this.laneX(blockedLane), -30, 178, 30, PINK).setStrokeStyle(3, 0xffd1e8);
        this.barriers.push({ body, lane: blockedLane, speed: this.currentSpeed() });
        if (PhaserMath.Between(0, 100) < 30 + this.speedLevel * 4) {
            const secondLane = this.lane + PhaserMath.Between(-2, 2);
            const second = this.add.rectangle(this.laneX(secondLane), -91, 178, 30, PINK).setStrokeStyle(3, 0xffd1e8);
            this.barriers.push({ body: second, lane: secondLane, speed: this.currentSpeed() });
        }
    }

    private moveBarriers(delta: number): void {
        this.barriers = this.barriers.filter(barrier => {
            barrier.body.y += barrier.speed * delta;
            if (barrier.body.y > HEIGHT + 50) { barrier.body.destroy(); return false; }
            if (barrier.lane === this.lane && Math.abs(barrier.body.y - this.ship.y) < 48 && this.time.now > this.shieldUntil) {
                this.hitBarrier(barrier);
                return false;
            }
            return true;
        });
    }

    private hitBarrier(barrier: Barrier): void {
        barrier.body.destroy();
        this.lives--;
        this.shieldUntil = this.time.now + 1300;
        this.cameras.main.shake(180, 0.012);
        this.ship.setAlpha(0.35);
        this.tweens.add({ targets: this.ship, alpha: 1, duration: 110, yoyo: true, repeat: 8 });
        this.flashMessage('HULL HIT!', PINK);
        if (this.lives <= 0) this.endRun(false);
    }

    private checkAcceleration(): void {
        const every = DIFFICULTIES[this.difficulty].speedEvery;
        const nextLevel = Math.floor(this.elapsed / every);
        if (nextLevel > this.speedLevel) {
            this.speedLevel = nextLevel;
            if (this.game.registry.get('effectsOn') !== false) this.sound.play('boost', { volume: 0.42 });
            this.cameras.main.flash(160, 49, 245, 255, false);
            this.flashMessage('VELOCITY SURGE!', CYAN);
        }
        if (this.elapsed >= DIFFICULTIES[this.difficulty].goal) this.endRun(true);
    }

    private endRun(cleared: boolean): void {
        if (this.isEnding) return;
        this.isEnding = true;
        this.music?.stop();
        const message = cleared ? (this.stage >= 5 ? 'ALL FACTORIES CLEARED!' : `STAGE ${this.stage} CLEARED!`) : 'SHIP DESTROYED';
        this.add.rectangle(512, 384, 780, 215, 0x06142b, 0.96).setStrokeStyle(4, cleared ? CYAN : PINK).setScrollFactor(0);
        this.add.text(512, 350, message, { ...this.hudStyle(37), color: cleared ? '#d9fdff' : '#ff7fbd' }).setOrigin(0.5).setScrollFactor(0);
        this.add.text(512, 412, cleared ? 'PREPARING NEXT RUN...' : 'RETURNING TO HANGAR...', this.hudStyle(18)).setOrigin(0.5).setScrollFactor(0);
        this.time.delayedCall(1900, () => {
            if (cleared && this.stage < 5) {
                this.scene.start('Story', { stage: this.stage, mode: 'outcome' });
            }
            else if (cleared) this.scene.start('Story', { stage: this.stage, mode: 'outcome' });
            else this.scene.start('GameOver', { cleared, stage: this.stage });
        });
    }

    private openPauseMenu(): void {
        if (this.isEnding || this.isPaused) return;
        this.isPaused = true;
        this.music?.pause();
        const shade = this.add.rectangle(512, 384, WIDTH, HEIGHT, 0x01030a, 0.88).setScrollFactor(0).setInteractive();
        const panel = this.add.rectangle(512, 384, 520, 315, 0x0b1c35, 1).setStrokeStyle(4, CYAN).setScrollFactor(0);
        const title = this.add.text(512, 292, 'PAUSED', { ...this.hudStyle(38), color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0);
        const resume = this.add.rectangle(512, 360, 270, 48, 0x173e64).setStrokeStyle(2, CYAN).setScrollFactor(0).setInteractive({ useHandCursor: true });
        const hangar = this.add.rectangle(512, 430, 270, 48, 0x5b1947).setStrokeStyle(2, PINK).setScrollFactor(0).setInteractive({ useHandCursor: true });
        const resumeText = this.add.text(512, 360, 'RESUME', this.hudStyle(18)).setOrigin(0.5).setScrollFactor(0);
        const hangarText = this.add.text(512, 430, 'RETURN TO HANGAR', this.hudStyle(18)).setOrigin(0.5).setScrollFactor(0);
        const close = (): void => {
            [shade, panel, title, resume, hangar, resumeText, hangarText].forEach(item => item.destroy());
            this.isPaused = false;
            this.music?.resume();
        };
        resume.on('pointerdown', close);
        hangar.on('pointerdown', () => {
            this.music?.stop();
            this.scene.start('MainMenu');
        });
    }

    private playStageMusic(): void {
        if (this.game.registry.get('musicOn') === false) return;
        this.music = this.sound.add(`stage-${this.stage}`, { volume: 0.3, loop: true });
        this.music.play();
    }

    private showStageIntro(): void {
        const phase = PHASE_STORIES[this.stage];
        const message = this.add.text(512, 205, `${phase.title}\n${phase.subtitle}`, { ...this.hudStyle(23), align: 'center', lineSpacing: 8 }).setOrigin(0.5).setScrollFactor(0);
        this.tweens.add({ targets: message, alpha: 0, y: 175, duration: 1500, delay: 500, onComplete: () => message.destroy() });
    }

    private updateShipEffects(): void {
        this.shipGlow.setAlpha(0.12 + Math.sin(this.time.now * 0.02) * 0.08);
    }

    private updateHud(): void {
        const goal = DIFFICULTIES[this.difficulty].goal;
        const remaining = Math.max(0, Math.ceil(goal - this.elapsed));
        this.timerText.setText(this.formatTime(remaining));
        this.livesText.setText(`HULL  ${'♥'.repeat(this.lives)}${'·'.repeat(DIFFICULTIES[this.difficulty].lives - this.lives)}`);
        this.stageText.setText(`STAGE ${this.stage}/5`);
        this.speedText.setText(`SPEED ${Math.round(this.currentSpeed())}  //  NEXT SURGE ${Math.max(0, Math.ceil(DIFFICULTIES[this.difficulty].speedEvery - (this.elapsed % DIFFICULTIES[this.difficulty].speedEvery)))}S`);
    }

    private flashMessage(text: string, color: number): void {
        this.boostText.setText(text).setColor(`#${color.toString(16).padStart(6, '0')}`).setAlpha(1).setScale(0.8);
        this.tweens.add({ targets: this.boostText, alpha: 0, scale: 1.25, duration: 900 });
    }

    private currentSpeed(): number { return this.baseSpeed + (this.stage - 1) * 38 + this.speedLevel * 55; }

    private laneX(lane: number): number { return WIDTH / 2 + lane * LANE_WIDTH; }

    private hudStyle(size: number): Phaser.Types.GameObjects.Text.TextStyle {
        return { fontFamily: 'monospace', fontSize: size, fontStyle: 'bold', color: '#bafcff', stroke: '#06223c', strokeThickness: 4 };
    }

    private formatTime(seconds: number): string { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
}
