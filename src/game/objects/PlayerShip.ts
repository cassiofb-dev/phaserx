import { GameObjects, Math as PhaserMath, Scene } from 'phaser';

export class PlayerShip {
    private scene: Scene;
    public container: GameObjects.Container;
    private shipGraphics: GameObjects.Graphics;
    private shadowGlow: GameObjects.Rectangle;
    private shieldRing: GameObjects.Graphics;
    private thrusterEmitter?: GameObjects.Particles.ParticleEmitter;
    private targetX: number;
    private targetAngle = 0;
    private currentAngle = 0;
    private isInvulnerable = false;

    constructor(scene: Scene, startX: number, startY: number) {
        this.scene = scene;
        this.targetX = startX;

        // Under-ship neon shadow glow
        this.shadowGlow = this.scene.add.rectangle(startX, startY + 10, 110, 20, 0x31f5ff, 0.25);

        // Shield graphics ring
        this.shieldRing = this.scene.add.graphics();
        this.drawShieldGraphics();
        this.shieldRing.setVisible(false);

        // Vector graphics ship geometry
        this.shipGraphics = this.scene.add.graphics();
        this.drawShipGraphics();

        // Main Container
        this.container = this.scene.add.container(startX, startY, [this.shieldRing, this.shipGraphics]);
        this.container.setDepth(10);

        // Setup Thruster Particle Emitter
        this.createThruster();

        // Idle hover animation
        this.scene.tweens.add({
            targets: this.container,
            y: startY - 8,
            duration: 350,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private drawShipGraphics(): void {
        const g = this.shipGraphics;
        g.clear();

        // Outer Neon Cyan Wing Shell
        g.fillStyle(0x31f5ff, 1);
        g.fillTriangle(0, -45, -34, 32, 34, 32);

        // Dark Metallic Body Inset
        g.fillStyle(0x071b30, 1);
        g.fillTriangle(0, -28, -20, 24, 20, 24);

        // Cockpit Glass Glow (Pink / Magenta accent)
        g.fillStyle(0xff3da5, 1);
        g.fillRect(-8, -14, 16, 28);
        g.fillStyle(0xffffff, 0.9);
        g.fillRect(-3, -28, 6, 24);

        // Outer white crisp outline
        g.lineStyle(3, 0xffffff, 0.95);
        g.strokeTriangle(0, -45, -34, 32, 34, 32);

        // Wingtip energy cannons
        g.fillStyle(0x31f5ff, 1);
        g.fillRect(-36, 12, 5, 20);
        g.fillRect(31, 12, 5, 20);
    }

    private drawShieldGraphics(): void {
        const g = this.shieldRing;
        g.clear();
        g.lineStyle(3, 0x31f5ff, 0.85);
        g.strokeCircle(0, 0, 54);
        g.fillStyle(0x31f5ff, 0.15);
        g.fillCircle(0, 0, 54);
    }

    private createThruster(): void {
        if (!this.scene.textures.exists('spark')) return;

        this.thrusterEmitter = this.scene.add.particles(this.targetX, this.container.y + 32, 'spark', {
            speedY: { min: 180, max: 400 },
            speedX: { min: -25, max: 25 },
            scale: { start: 0.7, end: 0 },
            alpha: { start: 0.9, end: 0 },
            tint: [0x31f5ff, 0xff3da5, 0xffffff],
            lifespan: 300,
            frequency: 30
        });
        this.thrusterEmitter.setDepth(9);
    }

    public moveToLane(laneX: number, direction: number): void {
        this.targetX = laneX;
        this.targetAngle = direction * 16; // Bank tilt left (-16deg) or right (+16deg)

        this.scene.tweens.killTweensOf(this.container);
        this.scene.tweens.killTweensOf(this.shadowGlow);

        this.scene.tweens.add({
            targets: [this.container, this.shadowGlow],
            x: laneX,
            duration: 120,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.targetAngle = 0;
            }
        });
    }

    public update(deltaSeconds: number): void {
        // Interpolate angle tilt smooth using imported PhaserMath
        this.currentAngle = PhaserMath.Linear(this.currentAngle, this.targetAngle, deltaSeconds * 18);
        this.container.setAngle(this.currentAngle);

        // Update thruster emitter position
        if (this.thrusterEmitter) {
            this.thrusterEmitter.setPosition(this.container.x, this.container.y + 30);
        }

        // Shield animation wobble if invulnerable
        if (this.isInvulnerable) {
            const alpha = 0.4 + Math.sin(this.scene.time.now * 0.015) * 0.4;
            this.shieldRing.setAlpha(alpha);
        }
    }

    public setInvulnerable(active: boolean, durationMs = 1300): void {
        this.isInvulnerable = active;
        this.shieldRing.setVisible(active);

        if (active) {
            this.container.setAlpha(0.4);
            this.scene.tweens.add({
                targets: this.container,
                alpha: 1,
                duration: 120,
                yoyo: true,
                repeat: Math.floor(durationMs / 240),
                onComplete: () => {
                    this.container.setAlpha(1);
                    this.isInvulnerable = false;
                    this.shieldRing.setVisible(false);
                }
            });
        }
    }

    public triggerHitEffect(): void {
        this.scene.cameras.main.shake(180, 0.015);
    }

    public get x(): number { return this.container.x; }
    public get y(): number { return this.container.y; }

    public destroy(): void {
        this.container.destroy();
        this.shadowGlow.destroy();
        this.thrusterEmitter?.destroy();
    }
}
