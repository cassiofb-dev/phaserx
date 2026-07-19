import { Input, Math as PhaserMath, Scene } from 'phaser';
import { DIFFICULTIES, Difficulty } from './MainMenu';
import { PHASE_STORIES } from './Story';
import { GridBackground } from '../objects/GridBackground';
import { PlayerShip } from '../objects/PlayerShip';
import { BarrierManager } from '../objects/BarrierManager';
import { HUD } from '../objects/ui/HUD';
import { EffectsManager } from '../managers/EffectsManager';
import { AudioManager } from '../managers/AudioManager';
import { GlassPanel } from '../objects/ui/GlassPanel';
import { Button } from '../objects/ui/Button';

const WIDTH = 1024;
const HEIGHT = 768;
const LANE_WIDTH = 210;
const CYAN = 0x31f5ff;
const PINK = 0xff3da5;

interface GameStartData { stage?: number; }

export class Game extends Scene {
    private stage = 1;
    private difficulty: Difficulty = 'medium';
    private elapsed = 0;
    private speedLevel = 0;
    private lives = 3;
    private maxLives = 3;
    private baseSpeed = 500;
    private spawnElapsed = 0;
    private shieldUntil = 0;
    private lane = 0;

    private gridBg!: GridBackground;
    private playerShip!: PlayerShip;
    private barrierMgr!: BarrierManager;
    private hud!: HUD;
    private fxMgr!: EffectsManager;
    private audioMgr!: AudioManager;

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
        const rule = DIFFICULTIES[this.difficulty];
        this.lives = rule.lives;
        this.maxLives = rule.lives;

        this.elapsed = 0;
        this.speedLevel = 0;
        this.spawnElapsed = 0;
        this.shieldUntil = 0;
        this.lane = 0;
        this.isEnding = false;
        this.isPaused = false;
    }

    create(): void {
        this.cameras.main.setBackgroundColor(0x0a1c3f);
        this.cameras.main.scrollX = 0;

        // Managers & Components
        this.audioMgr = new AudioManager(this);
        this.fxMgr = new EffectsManager(this);
        this.gridBg = new GridBackground(this);
        this.playerShip = new PlayerShip(this, this.laneX(this.lane), 650);
        this.barrierMgr = new BarrierManager(this);
        this.hud = new HUD(this, () => this.openPauseMenu());

        // Keyboard Controls
        this.createInput();

        // Audio & Intro
        this.audioMgr.playStageMusic(this.stage);
        this.audioMgr.startFlightAmbient();
        this.showStageIntro();
    }

    update(_time: number, delta: number): void {
        if (this.isEnding || this.isPaused) return;

        const deltaSeconds = Math.min(delta, 50) / 1000;
        this.elapsed += deltaSeconds;
        this.spawnElapsed += deltaSeconds;

        const currentSpeed = this.getCurrentSpeed();
        const goal = DIFFICULTIES[this.difficulty].goal;
        const remainingTime = Math.max(0, Math.ceil(goal - this.elapsed));
        const speedEvery = DIFFICULTIES[this.difficulty].speedEvery;
        const surgeCountdown = Math.max(0, Math.ceil(speedEvery - (this.elapsed % speedEvery)));

        // Update HUD
        this.hud.update(
            remainingTime,
            this.lives,
            this.maxLives,
            this.stage,
            currentSpeed,
            surgeCountdown
        );

        // Update Background Grid & Planets Animation
        this.gridBg.update(deltaSeconds, currentSpeed);

        // Check Speed Acceleration
        this.checkAcceleration();

        // Spawn Barriers
        const gap = Math.max(0.35, 0.8 - this.speedLevel * 0.045 - (this.stage - 1) * 0.035);
        if (this.spawnElapsed >= gap) {
            this.spawnElapsed = 0;
            this.barrierMgr.spawnBarrier(this.lane, this.speedLevel, this.stage, currentSpeed);
        }

        // Update Barriers & Collision
        const isShielded = this.time.now < this.shieldUntil;
        this.barrierMgr.update(
            deltaSeconds,
            this.lane,
            this.playerShip.y,
            isShielded,
            this.audioMgr.isEffectsEnabled(),
            () => this.audioMgr.playSwoosh(),
            () => this.handleHit()
        );

        // Update Player Ship smooth movements
        this.playerShip.update(deltaSeconds);

        // Keep Camera Centered on Ship X offset
        this.cameras.main.scrollX = this.playerShip.x - WIDTH / 2;
    }

    private createInput(): void {
        if (!this.input.keyboard) return;
        this.leftKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.RIGHT);
        this.aKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D);
        this.escapeKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.ESC);

        this.leftKey.on('down', () => this.changeLane(-1));
        this.aKey.on('down', () => this.changeLane(-1));
        this.rightKey.on('down', () => this.changeLane(1));
        this.dKey.on('down', () => this.changeLane(1));
        this.escapeKey.on('down', () => this.openPauseMenu());
    }

    private changeLane(direction: number): void {
        if (this.isEnding || this.isPaused) return;

        this.lane += direction;
        this.playerShip.moveToLane(this.laneX(this.lane), direction);
    }

    private handleHit(): void {
        this.lives--;
        this.shieldUntil = this.time.now + 1400;

        this.fxMgr.triggerHitGlitch();
        this.audioMgr.playBoom();
        this.playerShip.setInvulnerable(true, 1400);
        this.hud.flashAlert('HULL HIT!', '#ff3da5');

        if (this.lives <= 0) {
            this.endRun(false);
        }
    }

    private checkAcceleration(): void {
        const every = DIFFICULTIES[this.difficulty].speedEvery;
        const nextLevel = Math.floor(this.elapsed / every);

        if (nextLevel > this.speedLevel) {
            this.speedLevel = nextLevel;
            this.audioMgr.playSurge();
            this.fxMgr.triggerSpeedSurge();
            this.gridBg.setWarpEffect(true);
            this.hud.flashAlert('VELOCITY SURGE!', '#31f5ff');

            this.time.delayedCall(1200, () => this.gridBg.setWarpEffect(false));
        }

        if (this.elapsed >= DIFFICULTIES[this.difficulty].goal) {
            this.endRun(true);
        }
    }

    private endRun(cleared: boolean): void {
        if (this.isEnding) return;
        this.isEnding = true;

        this.audioMgr.stopAll();

        const message = cleared
            ? (this.stage >= 5 ? 'ALL FACTORIES CLEARED!' : `STAGE 0${this.stage} CLEARED!`)
            : 'SHIP DESTROYED';

        const panel = new GlassPanel(this, 512, 384, 780, 215, cleared ? CYAN : PINK, 0x0e2b4f, 0.98);
        panel.setScrollFactor(0);

        const text1 = this.add.text(512, 345, message, {
            fontFamily: 'monospace',
            fontSize: 34,
            fontStyle: 'bold',
            color: cleared ? '#ffffff' : '#ff7fbd',
            stroke: '#082a4d',
            strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0);

        const text2 = this.add.text(512, 410, cleared ? 'PREPARING TRANSMISSION OUTCOME...' : 'RETURNING TO HANGAR...', {
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#bafcff'
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.delayedCall(1900, () => {
            if (cleared) {
                this.scene.start('Story', { stage: this.stage, mode: 'outcome' });
            } else {
                this.scene.start('GameOver', { cleared: false, stage: this.stage });
            }
        });
    }

    private openPauseMenu(): void {
        if (this.isEnding || this.isPaused) return;

        this.isPaused = true;
        this.audioMgr.pauseAll();

        const shade = this.add.rectangle(512, 384, WIDTH, HEIGHT, 0x051229, 0.82)
            .setScrollFactor(0)
            .setInteractive()
            .setDepth(30);

        const panel = new GlassPanel(this, 512, 384, 520, 315, CYAN, 0x0e2b4f, 0.98);
        panel.setScrollFactor(0);
        panel.setDepth(31);

        const title = this.add.text(512, 290, 'SYSTEM PAUSED', {
            fontFamily: 'monospace',
            fontSize: 32,
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#082a4d',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(32);

        const resumeBtn = new Button(
            this,
            512,
            360,
            'RESUME MISSION',
            () => {
                shade.destroy();
                panel.destroy();
                title.destroy();
                resumeBtn.destroy();
                hangarBtn.destroy();
                this.isPaused = false;
                this.audioMgr.resumeAll();
            },
            270,
            0x12365e,
            CYAN,
            48
        );
        resumeBtn.setScrollFactor(0);
        resumeBtn.setDepth(32);

        const hangarBtn = new Button(
            this,
            512,
            430,
            'RETURN TO HANGAR',
            () => {
                this.audioMgr.stopAll();
                this.scene.start('MainMenu');
            },
            270,
            0x611b49,
            PINK,
            48
        );
        hangarBtn.setScrollFactor(0);
        hangarBtn.setDepth(32);
    }

    private showStageIntro(): void {
        const phase = PHASE_STORIES[this.stage];
        const text = this.add.text(512, 205, `${phase.title}\n${phase.subtitle}`, {
            fontFamily: 'monospace',
            fontSize: 22,
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#082a4d',
            strokeThickness: 4,
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5).setScrollFactor(0).setDepth(25);

        this.tweens.add({
            targets: text,
            alpha: 0,
            y: 175,
            duration: 1500,
            delay: 600,
            onComplete: () => text.destroy()
        });
    }

    private getCurrentSpeed(): number {
        return this.baseSpeed + (this.stage - 1) * 40 + this.speedLevel * 55;
    }

    private laneX(lane: number): number {
        return WIDTH / 2 + lane * LANE_WIDTH;
    }
}
