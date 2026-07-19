import { GameObjects, Math as PhaserMath, Scene } from 'phaser';

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
        if (!this.scene.textures.exists('flame_particle')) return;

        this.explosionEmitter = this.scene.add.particles(0, 0, 'flame_particle', {
            speed: { min: 80, max: 350 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            emitting: false
        });
        this.explosionEmitter.setDepth(15);
    }

    public spawnBarrier(playerLane: number, speedLevel: number, stage: number, currentSpeed: number): void {
        const blockedLane = playerLane + PhaserMath.Between(-1, 1);
        this.createSingleBarrier(blockedLane, -30, currentSpeed);

        // Chance of second barrier in double-lane challenge
        const doubleChance = 25 + speedLevel * 4 + stage * 3;
        if (PhaserMath.Between(0, 100) < doubleChance) {
            let secondLane = playerLane + PhaserMath.Between(-2, 2);
            if (secondLane === blockedLane) secondLane += (blockedLane >= 0 ? -1 : 1);
            this.createSingleBarrier(secondLane, -90, currentSpeed);
        }
    }

    private createSingleBarrier(lane: number, yPos: number, speed: number): void {
        const xPos = this.width / 2 + lane * this.laneWidth;

        // Base rectangle body
        const rect = this.scene.add.rectangle(0, 0, 178, 28, 0xff3da5, 0.95)
            .setStrokeStyle(3, 0xffd1e8);

        // Hazard stripes
        const hazardLines = this.scene.add.graphics();
        hazardLines.lineStyle(2, 0xffffff, 0.6);
        for (let x = -80; x < 80; x += 18) {
            hazardLines.lineBetween(x, -12, x + 10, 12);
        }

        // Side energy warning lights
        const leftLight = this.scene.add.circle(-82, 0, 5, 0x31f5ff);
        const rightLight = this.scene.add.circle(82, 0, 5, 0x31f5ff);

        const container = this.scene.add.container(xPos, yPos, [rect, hazardLines, leftLight, rightLight]);
        container.setDepth(8);

        // Pulse energy light animation
        this.scene.tweens.add({
            targets: [leftLight, rightLight],
            alpha: { from: 0.3, to: 1 },
            duration: 200,
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
        effectsOn: boolean,
        onNearMiss: () => void,
        onCollision: () => void
    ): void {
        this.barriers = this.barriers.filter(barrier => {
            barrier.container.y += barrier.speed * deltaSeconds;

            // Near miss detection & swoosh audio trigger
            const distanceY = barrier.container.y - playerY;
            const isNear = Math.abs(barrier.lane - playerLane) <= 1 && distanceY > 15 && distanceY < 60;
            if (!barrier.swooshPlayed && isNear) {
                barrier.swooshPlayed = true;
                onNearMiss();
            }

            // Screen boundary cleanup
            if (barrier.container.y > this.height + 60) {
                barrier.container.destroy();
                return false;
            }

            // Hit collision detection
            const isCollision = barrier.lane === playerLane && Math.abs(barrier.container.y - playerY) < 42;
            if (isCollision && !isShielded) {
                this.triggerExplosion(barrier.container.x, barrier.container.y);
                barrier.container.destroy();
                onCollision();
                return false;
            }

            return true;
        });
    }

    public triggerExplosion(x: number, y: number): void {
        if (this.explosionEmitter) {
            this.explosionEmitter.explode(28, x, y);
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
