import { GameObjects, Math as PhaserMath, Scene } from 'phaser';
import { STAGE_THEMES } from '../config/StageThemeConfig';

export interface BarrierItem {
    container: GameObjects.Container;
    rect: GameObjects.Rectangle;
    hazardLines: GameObjects.Graphics;
    lane: number;
    speed: number;
    swooshPlayed: boolean;
}

export class BarrierManager {
    private scene: Scene;
    private barriers: BarrierItem[] = [];
    private explosionEmitter?: GameObjects.Particles.ParticleEmitter;
    private laneWidth = 210;
    private width = 1024;
    private height = 768;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createExplosionEmitter();
    }

    private createExplosionEmitter(): void {
        const texKey = this.scene.textures.exists('flame_particle') ? 'flame_particle' : 'spark';
        if (!this.scene.textures.exists(texKey)) return;

        this.explosionEmitter = this.scene.add.particles(0, 0, texKey, {
            speed: { min: 90, max: 380 },
            scale: { start: 1.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 650,
            emitting: false
        });
        this.explosionEmitter.setDepth(15);
    }

    public spawnBarrier(playerLane: number, speedLevel: number, stage: number, currentSpeed: number): void {
        const blockedLane = playerLane + PhaserMath.Between(-1, 1);
        this.createSingleBarrier(blockedLane, -30, currentSpeed, stage);

        // Chance of second barrier in double-lane challenge
        const doubleChance = 25 + speedLevel * 4 + stage * 3;
        if (PhaserMath.Between(0, 100) < doubleChance) {
            let secondLane = playerLane + PhaserMath.Between(-2, 2);
            if (secondLane === blockedLane) secondLane += (blockedLane >= 0 ? -1 : 1);
            this.createSingleBarrier(secondLane, -90, currentSpeed, stage);
        }
    }

    private createSingleBarrier(lane: number, yPos: number, speed: number, stage: number): void {
        const xPos = this.width / 2 + lane * this.laneWidth;
        const theme = STAGE_THEMES[stage] ?? STAGE_THEMES[1];

        // Base rectangle body with stage theme color
        const rect = this.scene.add.rectangle(0, 0, 178, 28, theme.barrierRect, 0.95)
            .setStrokeStyle(3, theme.barrierStroke);

        // Hazard stripes with stage hazard accent
        const hazardLines = this.scene.add.graphics();
        hazardLines.lineStyle(2, theme.barrierHazard, 0.75);
        for (let x = -80; x < 80; x += 18) {
            hazardLines.lineBetween(x, -12, x + 10, 12);
        }

        // Side energy warning lights
        const leftLight = this.scene.add.circle(-82, 0, 6, theme.barrierLight);
        const rightLight = this.scene.add.circle(82, 0, 6, theme.barrierLight);

        const container = this.scene.add.container(xPos, yPos, [rect, hazardLines, leftLight, rightLight]);
        container.setDepth(8);

        // Spawn warp / drop-in scale animation
        container.setScale(0.3);
        container.setAlpha(0.5);
        this.scene.tweens.add({
            targets: container,
            scaleX: 1.0,
            scaleY: 1.0,
            alpha: 1.0,
            duration: 150,
            ease: 'Back.easeOut'
        });

        // Pulse energy light animation
        this.scene.tweens.add({
            targets: [leftLight, rightLight],
            alpha: { from: 0.25, to: 1 },
            scale: { from: 0.8, to: 1.25 },
            duration: 180,
            yoyo: true,
            repeat: -1
        });

        this.barriers.push({
            container,
            rect,
            hazardLines,
            lane,
            speed,
            swooshPlayed: false
        });
    }

    public update(
        deltaSeconds: number,
        playerLane: number,
        playerY: number,
        isShielded: boolean,
        isBreakerActive: boolean,
        _effectsOn: boolean,
        onNearMiss: (direction: 'left' | 'right') => void,
        onCollision: () => void,
        onBreakBarrier?: () => void,
        stage = 1
    ): void {
        const theme = STAGE_THEMES[stage] ?? STAGE_THEMES[1];
        const playerX = this.width / 2 + playerLane * this.laneWidth;

        this.barriers = this.barriers.filter(barrier => {
            barrier.container.y += barrier.speed * deltaSeconds;

            // Audio trigger 1 second earlier due to track delay (distanceY <= barrier.speed * 1.0)
            const leadTimeY = playerY - barrier.speed * 1.0;
            if (!barrier.swooshPlayed && barrier.container.y >= leadTimeY && barrier.container.y < playerY + 40) {
                barrier.swooshPlayed = true;

                // Determine whether barrier is to the left or right of the player
                let direction: 'left' | 'right' = 'left';
                if (barrier.container.x < playerX || barrier.lane < playerLane) {
                    direction = 'left';
                } else if (barrier.container.x > playerX || barrier.lane > playerLane) {
                    direction = 'right';
                } else {
                    direction = 'left';
                }

                onNearMiss(direction);
            }

            // Screen boundary cleanup
            if (barrier.container.y > this.height + 60) {
                barrier.container.destroy();
                return false;
            }

            // Hit collision detection
            const isCollision = barrier.lane === playerLane && Math.abs(barrier.container.y - playerY) < 42;
            if (isCollision) {
                if (isBreakerActive) {
                    // Barrier Breaker powerup: Shatter barrier safely without damage
                    this.triggerExplosion(barrier.container.x, barrier.container.y, [0xffaa00, 0xffffff, 0xff3da5]);
                    barrier.container.destroy();
                    if (onBreakBarrier) onBreakBarrier();
                    return false;
                } else if (!isShielded) {
                    this.triggerExplosion(barrier.container.x, barrier.container.y, theme.explosionTints);
                    barrier.container.destroy();
                    onCollision();
                    return false;
                }
            }

            return true;
        });
    }

    public triggerExplosion(x: number, y: number, tints?: number[]): void {
        if (this.explosionEmitter) {
            if (tints) {
                this.explosionEmitter.setParticleTint(tints);
            }
            this.explosionEmitter.explode(32, x, y);
        }
    }

    public clearAll(): void {
        this.barriers.forEach(b => b.container.destroy());
        this.barriers = [];
    }

    public destroy(): void {
        this.clearAll();
        this.explosionEmitter?.destroy();
    }
}
