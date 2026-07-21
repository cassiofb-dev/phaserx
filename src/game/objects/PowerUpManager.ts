import { GameObjects, Math as PhaserMath, Scene } from 'phaser';

export type PowerUpType = 'slow' | 'break' | 'life';

export interface PowerUpItem {
    container: GameObjects.Container;
    type: PowerUpType;
    lane: number;
    speed: number;
    collected: boolean;
}

export class PowerUpManager {
    private scene: Scene;
    private powerups: PowerUpItem[] = [];
    private laneWidth = 210;
    private width = 1024;
    private height = 768;
    private collectEmitter?: GameObjects.Particles.ParticleEmitter;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createCollectEmitter();
    }

    private createCollectEmitter(): void {
        const texKey = this.scene.textures.exists('spark') ? 'spark' : undefined;
        if (!texKey) return;

        this.collectEmitter = this.scene.add.particles(0, 0, texKey, {
            speed: { min: 120, max: 350 },
            scale: { start: 1.0, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 450,
            emitting: false
        });
        this.collectEmitter.setDepth(16);
    }

    public spawnPowerUp(playerLane: number, currentSpeed: number): void {
        // Pick a random lane near player or across available lanes (-1, 0, 1)
        const lane = PhaserMath.Between(-1, 1);

        // Pick type with weighted randomness: slow (40%), break (40%), life (20%)
        const roll = PhaserMath.Between(0, 99);
        let type: PowerUpType = 'slow';
        if (roll < 40) {
            type = 'slow';
        } else if (roll < 80) {
            type = 'break';
        } else {
            type = 'life';
        }

        this.createSinglePowerUp(type, lane, -40, currentSpeed);
    }

    private createSinglePowerUp(type: PowerUpType, lane: number, yPos: number, speed: number): void {
        const xPos = this.width / 2 + lane * this.laneWidth;

        let primaryColor = 0x31f5ff; // Cyan for slow
        let strokeColor = 0xffffff;
        let labelText = 'SLOW';

        if (type === 'break') {
            primaryColor = 0xffaa00; // Gold for barrier break
            strokeColor = 0xffe680;
            labelText = 'BREAK';
        } else if (type === 'life') {
            primaryColor = 0xff3da5; // Pink for extra life
            strokeColor = 0xffc4e6;
            labelText = '+1 LIFE';
        }

        // Outer glowing orb background
        const outerGlow = this.scene.add.circle(0, 0, 24, primaryColor, 0.4);
        const innerOrb = this.scene.add.circle(0, 0, 18, primaryColor, 0.85)
            .setStrokeStyle(2, strokeColor);

        // Procedural Icon Graphics
        const iconGraphics = this.scene.add.graphics();
        iconGraphics.lineStyle(2, 0xffffff, 1);
        iconGraphics.fillStyle(0xffffff, 1);

        if (type === 'slow') {
            // Clock/Hourglass Icon
            iconGraphics.strokeCircle(0, 0, 10);
            iconGraphics.lineBetween(0, 0, 0, -6);
            iconGraphics.lineBetween(0, 0, 5, 0);
        } else if (type === 'break') {
            // Lightning / Shield Break Icon
            iconGraphics.beginPath();
            iconGraphics.moveTo(-2, -9);
            iconGraphics.lineTo(4, -1);
            iconGraphics.lineTo(0, 1);
            iconGraphics.lineTo(2, 9);
            iconGraphics.lineTo(-4, 1);
            iconGraphics.lineTo(0, -1);
            iconGraphics.closePath();
            iconGraphics.fillPath();
        } else if (type === 'life') {
            // Plus / Heart Icon
            iconGraphics.fillRect(-6, -2, 12, 4);
            iconGraphics.fillRect(-2, -6, 4, 12);
        }

        // Label text below orb
        const textObj = this.scene.add.text(0, 26, labelText, {
            fontFamily: 'monospace',
            fontSize: '11px',
            fontStyle: 'bold',
            color: type === 'slow' ? '#31f5ff' : type === 'break' ? '#ffaa00' : '#ff3da5',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const container = this.scene.add.container(xPos, yPos, [
            outerGlow,
            innerOrb,
            iconGraphics,
            textObj
        ]);
        container.setDepth(9);

        // Spawn pulse animation
        container.setScale(0.2);
        this.scene.tweens.add({
            targets: container,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 200,
            ease: 'Back.easeOut'
        });

        // Pulsing glow animation
        this.scene.tweens.add({
            targets: outerGlow,
            scale: { from: 0.9, to: 1.35 },
            alpha: { from: 0.3, to: 0.7 },
            duration: 400,
            yoyo: true,
            repeat: -1
        });

        this.powerups.push({
            container,
            type,
            lane,
            speed,
            collected: false
        });
    }

    public update(
        deltaSeconds: number,
        playerLane: number,
        playerY: number,
        onCollect: (type: PowerUpType) => void
    ): void {
        this.powerups = this.powerups.filter(item => {
            if (item.collected) return false;

            item.container.y += item.speed * deltaSeconds;

            // Rotation effect on icon container
            item.container.setRotation(Math.sin(this.scene.time.now * 0.005) * 0.15);

            // Screen boundary cleanup
            if (item.container.y > this.height + 60) {
                item.container.destroy();
                return false;
            }

            // Collection detection
            const sameLane = item.lane === playerLane;
            const distanceY = Math.abs(item.container.y - playerY);

            if (sameLane && distanceY < 45) {
                item.collected = true;

                // Particle burst on pickup
                if (this.collectEmitter) {
                    const tint = item.type === 'slow' ? 0x31f5ff : item.type === 'break' ? 0xffaa00 : 0xff3da5;
                    this.collectEmitter.setParticleTint(tint);
                    this.collectEmitter.explode(20, item.container.x, item.container.y);
                }

                item.container.destroy();
                onCollect(item.type);
                return false;
            }

            return true;
        });
    }

    public clearAll(): void {
        this.powerups.forEach(p => p.container.destroy());
        this.powerups = [];
    }

    public destroy(): void {
        this.clearAll();
        this.collectEmitter?.destroy();
    }
}
