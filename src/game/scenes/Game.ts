import { Input, Scene } from 'phaser';
import { DIFFICULTIES, Difficulty } from './MainMenu';
import { STAGE_THEMES } from '../config/StageThemeConfig';
import { GridBackground } from '../objects/GridBackground';
import { PlayerShip } from '../objects/PlayerShip';
import { BarrierManager } from '../objects/BarrierManager';
import { PowerUpManager, PowerUpType } from '../objects/PowerUpManager';
import { HUD } from '../objects/ui/HUD';
import { EffectsManager } from '../managers/EffectsManager';
import { AudioManager } from '../managers/AudioManager';
import { TransmissionManager } from '../managers/TransmissionManager';
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
    private powerupSpawnElapsed = 0;
    private slowTimer = 0;
    private breakerTimer = 0;
    private shieldUntil = 0;
    private lane = 0;

    private gridBg!: GridBackground;
    private playerShip!: PlayerShip;
    private barrierMgr!: BarrierManager;
    private powerupMgr!: PowerUpManager;
    private hud!: HUD;
    private fxMgr!: EffectsManager;
    private audioMgr!: AudioManager;
    private transmissionMgr!: TransmissionManager;

    private leftKey!: Input.Keyboard.Key;
    private rightKey!: Input.Keyboard.Key;
    private aKey!: Input.Keyboard.Key;
    private dKey!: Input.Keyboard.Key;
    private escapeKey!: Input.Keyboard.Key;
    private enterKey!: Input.Keyboard.Key;

    private isEnding = false;
    private isPaused = false;
    private pauseOverlayElements: { destroy: () => void }[] = [];

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
        this.powerupSpawnElapsed = 0;
        this.slowTimer = 0;
        this.breakerTimer = 0;
        this.shieldUntil = 0;
        this.lane = 0;
        this.isEnding = false;
        this.isPaused = false;
        this.pauseOverlayElements = [];
    }

    create(): void {
        const theme = STAGE_THEMES[this.stage] ?? STAGE_THEMES[1];

        // Smooth Camera Scene Fade-In
        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.cameras.main.setBackgroundColor(theme.bgGradTop);
        this.cameras.main.scrollX = 0;

        // Managers & Components with Stage Theme
        this.audioMgr = new AudioManager(this);
        this.fxMgr = new EffectsManager(this);
        this.gridBg = new GridBackground(this, this.stage);
        this.playerShip = new PlayerShip(this, this.laneX(this.lane), 650);
        this.barrierMgr = new BarrierManager(this);
        this.powerupMgr = new PowerUpManager(this);
        this.hud = new HUD(this, () => this.togglePauseMenu());
        this.hud.setStageAccent(theme.hudAccent);

        this.transmissionMgr = new TransmissionManager(this, this.audioMgr, this.stage);

        // Keyboard Controls (A/D, Arrows, ESC, ENTER)
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
        this.powerupSpawnElapsed += deltaSeconds;

        // PowerUp Active Timer Countdowns
        if (this.slowTimer > 0) this.slowTimer = Math.max(0, this.slowTimer - deltaSeconds);
        if (this.breakerTimer > 0) this.breakerTimer = Math.max(0, this.breakerTimer - deltaSeconds);

        const rawSpeed = this.getCurrentSpeed();
        const currentSpeed = this.slowTimer > 0 ? rawSpeed * 0.5 : rawSpeed;

        const goal = DIFFICULTIES[this.difficulty].goal;
        const remainingTime = Math.max(0, Math.ceil(goal - this.elapsed));
        const speedEvery = DIFFICULTIES[this.difficulty].speedEvery;
        const surgeCountdown = Math.max(0, Math.ceil(speedEvery - (this.elapsed % speedEvery)));

        // Update HUD with powerup timers
        this.hud.update(
            remainingTime,
            this.lives,
            this.maxLives,
            this.stage,
            currentSpeed,
            surgeCountdown,
            this.slowTimer,
            this.breakerTimer
        );

        // Update Transmissions
        this.transmissionMgr.update(deltaSeconds);

        // Update Stage Grid & Planets
        this.gridBg.update(deltaSeconds, currentSpeed);

        // Check Speed Acceleration
        this.checkAcceleration();

        // Spawn Powerups periodically (every 11 seconds)
        if (this.powerupSpawnElapsed >= 11) {
            this.powerupSpawnElapsed = 0;
            this.powerupMgr.spawnPowerUp(this.lane, currentSpeed);
        }

        // Update Powerups & Collection Detection
        this.powerupMgr.update(
            deltaSeconds,
            this.lane,
            this.playerShip.y,
            (type) => this.handlePowerUpCollect(type)
        );

        // Spawn Barriers
        const gap = Math.max(0.35, 0.8 - this.speedLevel * 0.045 - (this.stage - 1) * 0.035);
        if (this.spawnElapsed >= gap) {
            this.spawnElapsed = 0;
            this.barrierMgr.spawnBarrier(this.lane, this.speedLevel, this.stage, currentSpeed);
        }

        // Update Barriers & Collision Detection
        const isShielded = this.time.now < this.shieldUntil;
        const isBreakerActive = this.breakerTimer > 0;
        this.barrierMgr.update(
            deltaSeconds,
            this.lane,
            this.playerShip.y,
            isShielded,
            isBreakerActive,
            this.audioMgr.isEffectsEnabled(),
            (direction) => {
                // Directional swoosh sound 1s earlier, no particle animation effect on pass
                this.audioMgr.playSwoosh(direction);
            },
            () => this.handleHit(),
            () => {
                this.audioMgr.playBarrierShatter();
                this.hud.flashAlert('BARRIER SHATTERED!', '#ffaa00');
            },
            this.stage
        );

        // Update Player Ship visual state & smooth movements
        this.playerShip.setBreakerVisual(isBreakerActive);
        this.playerShip.update(deltaSeconds);

        // Keep Camera Centered on Ship X offset
        this.cameras.main.scrollX = this.playerShip.x - WIDTH / 2;
    }

    private handlePowerUpCollect(type: PowerUpType): void {
        if (type === 'slow') {
            this.slowTimer = 30;
            this.audioMgr.playPowerUpSound('slow');
            this.hud.flashAlert('POWERUP: SLOW MOTION (30S)', '#31f5ff');
        } else if (type === 'break') {
            this.breakerTimer = 30;
            this.audioMgr.playPowerUpSound('break');
            this.hud.flashAlert('POWERUP: BARRIER BREAKER (30S)', '#ffaa00');
        } else if (type === 'life') {
            this.lives = Math.min(this.lives + 1, this.maxLives + 2);
            this.audioMgr.playPowerUpSound('life');
            this.hud.flashAlert('POWERUP: +1 RECOVERY LIFE', '#ff3da5');
        }
    }

    private createInput(): void {
        if (!this.input.keyboard) return;
        this.leftKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.RIGHT);
        this.aKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D);
        this.escapeKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.ESC);
        this.enterKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.ENTER);

        this.leftKey.on('down', () => this.changeLane(-1));
        this.aKey.on('down', () => this.changeLane(-1));
        this.rightKey.on('down', () => this.changeLane(1));
        this.dKey.on('down', () => this.changeLane(1));

        // Both ESC and ENTER open / close the in-game menu!
        this.escapeKey.on('down', () => this.togglePauseMenu());
        this.enterKey.on('down', () => this.togglePauseMenu());
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
        this.playerShip.triggerHitEffect();
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
            this.fxMgr.triggerSpeedSurge(this.stage);
            this.gridBg.setWarpEffect(true);
            this.hud.flashAlert('VELOCITY SURGE!', STAGE_THEMES[this.stage]?.hudAccent ?? '#31f5ff');

            this.time.delayedCall(1200, () => this.gridBg.setWarpEffect(false));
        }

        if (this.elapsed >= DIFFICULTIES[this.difficulty].goal) {
            this.endRun(true);
        }
    }

    private endRun(cleared: boolean): void {
        if (this.isEnding) return;
        this.isEnding = true;

        this.transmissionMgr?.destroy();
        this.powerupMgr?.clearAll();
        this.audioMgr.stopAll();

        const message = cleared
            ? (this.stage >= 5 ? 'ALL STAGES CLEARED!' : `STAGE 0${this.stage} CLEARED!`)
            : 'SHIP DESTROYED';

        const panel = new GlassPanel(this, 512, 384, 780, 215, cleared ? CYAN : PINK, 0x0e2b4f, 0.98);
        panel.setScrollFactor(0);
        panel.animateIn(200);

        this.add.text(512, 345, message, {
            fontFamily: 'monospace',
            fontSize: 34,
            fontStyle: 'bold',
            color: cleared ? '#ffffff' : '#ff7fbd',
            stroke: '#082a4d',
            strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0);

        this.add.text(512, 410, cleared ? (this.stage < 5 ? 'PROCEEDING TO NEXT PHASE...' : 'MISSION ACCOMPLISHED!') : 'RETURNING TO HANGAR...', {
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#bafcff'
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.delayedCall(1900, () => {
            if (cleared) {
                const unlocked = (this.game.registry.get('unlockedStage') as number | undefined) ?? 1;
                this.game.registry.set('unlockedStage', Math.max(unlocked, Math.min(5, this.stage + 1)));

                if (this.stage < 5) {
                    this.cameras.main.fadeOut(350);
                    this.time.delayedCall(360, () => {
                        this.scene.start('Game', { stage: this.stage + 1 });
                    });
                } else {
                    this.cameras.main.fadeOut(350);
                    this.time.delayedCall(360, () => {
                        this.scene.start('GameOver', { cleared: true, stage: 5 });
                    });
                }
            } else {
                this.cameras.main.fadeOut(350);
                this.time.delayedCall(360, () => {
                    this.scene.start('GameOver', { cleared: false, stage: this.stage });
                });
            }
        });
    }

    private togglePauseMenu(): void {
        if (this.isEnding) return;

        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.openPauseMenu();
        }
    }

    private openPauseMenu(): void {
        if (this.isEnding || this.isPaused) return;

        this.isPaused = true;
        this.audioMgr.pauseAll();

        const savedScrollX = this.cameras.main.scrollX;
        this.cameras.main.scrollX = 0;

        const theme = STAGE_THEMES[this.stage] ?? STAGE_THEMES[1];

        const shade = this.add.rectangle(512, 384, WIDTH, HEIGHT, 0x051229, 0.84)
            .setScrollFactor(0)
            .setInteractive()
            .setDepth(30);

        const panel = new GlassPanel(this, 512, 384, 520, 325, theme.horizonPrimary, 0x0e2b4f, 0.98);
        panel.setScrollFactor(0);
        panel.setDepth(31);
        panel.animateIn(200);

        const title = this.add.text(512, 280, 'SYSTEM PAUSED', {
            fontFamily: 'monospace',
            fontSize: 32,
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#082a4d',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(32);

        const subTitle = this.add.text(512, 315, '[ PRESS ENTER OR ESC TO RESUME ]', {
            fontFamily: 'monospace',
            fontSize: 13,
            color: theme.hudAccent
        }).setOrigin(0.5).setScrollFactor(0).setDepth(32);

        const resumeBtn = new Button(
            this,
            512,
            368,
            'RESUME MISSION',
            () => this.resumeGame(savedScrollX),
            270,
            0x12365e,
            theme.horizonPrimary,
            46
        );
        resumeBtn.setScrollFactor(0);
        resumeBtn.setDepth(32);
        resumeBtn.animateIn(50, 200);

        const hangarBtn = new Button(
            this,
            512,
            436,
            'RETURN TO HANGAR',
            () => {
                this.transmissionMgr?.destroy();
                this.audioMgr.stopAll();
                this.cameras.main.fadeOut(300);
                this.time.delayedCall(310, () => {
                    this.scene.start('MainMenu');
                });
            },
            270,
            0x611b49,
            PINK,
            46
        );
        hangarBtn.setScrollFactor(0);
        hangarBtn.setDepth(32);
        hangarBtn.animateIn(100, 200);

        this.pauseOverlayElements = [
            shade,
            panel.container,
            title,
            subTitle,
            resumeBtn.container,
            hangarBtn.container
        ];
    }

    private resumeGame(savedScrollX?: number): void {
        if (!this.isPaused) return;

        this.pauseOverlayElements.forEach(el => el.destroy());
        this.pauseOverlayElements = [];

        if (savedScrollX !== undefined) {
            this.cameras.main.scrollX = savedScrollX;
        }

        this.isPaused = false;
        this.audioMgr.resumeAll();
    }

    private showStageIntro(): void {
        const theme = STAGE_THEMES[this.stage];
        if (!theme) return;

        const titleText = this.add.text(512, 195, theme.title, {
            fontFamily: 'monospace',
            fontSize: 30,
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#082a4d',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(25);

        const subText = this.add.text(512, 235, theme.subtitle.toUpperCase(), {
            fontFamily: 'monospace',
            fontSize: 16,
            fontStyle: 'bold',
            color: theme.hudAccent,
            stroke: '#041224',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(25);

        this.tweens.add({
            targets: [titleText, subText],
            alpha: 0,
            y: '-=30',
            duration: 1600,
            delay: 900,
            ease: 'Quad.easeOut',
            onComplete: () => {
                titleText.destroy();
                subText.destroy();
            }
        });
    }

    private getCurrentSpeed(): number {
        return this.baseSpeed + (this.stage - 1) * 40 + this.speedLevel * 55;
    }

    private laneX(lane: number): number {
        return WIDTH / 2 + lane * LANE_WIDTH;
    }
}
