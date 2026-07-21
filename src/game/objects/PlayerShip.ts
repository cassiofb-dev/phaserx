import { GameObjects, Math as PhaserMath, Scene } from 'phaser';

export class PlayerShip {
    private scene: Scene;
    public container: GameObjects.Container;
    private shipGraphics: GameObjects.Graphics;
    private shadowGlow: GameObjects.Rectangle;
    private shieldRing: GameObjects.Graphics;
    private breakerRing: GameObjects.Graphics;
    private wingLights: GameObjects.Graphics;
    private thrusterEmitter?: GameObjects.Particles.ParticleEmitter;
    private targetX: number;
    private targetAngle = 0;
    private currentAngle = 0;
    private targetScaleY = 1.0;
    private currentScaleY = 1.0;
    private isInvulnerable = false;

    constructor(scene: Scene, startX: number, startY: number) {
        this.scene = scene;
        this.targetX = startX;

        // Under-ship neon shadow glow
        this.shadowGlow = this.scene.add.rectangle(startX, startY + 12, 110, 20, 0x31f5ff, 0.28);

        // Shield graphics ring
        this.shieldRing = this.scene.add.graphics();
        this.drawShieldGraphics();
        this.shieldRing.setVisible(false);

        // Breaker energy aura ring
        this.breakerRing = this.scene.add.graphics();
        this.drawBreakerGraphics();
        this.breakerRing.setVisible(false);

        // Wing tip pulsing light graphics
        this.wingLights = this.scene.add.graphics();
        this.drawWingLights();

        // Vector graphics ship geometry
        this.shipGraphics = this.scene.add.graphics();
        this.drawShipGraphics();

        // Main Container
        this.container = this.scene.add.container(startX, startY, [
            this.shieldRing,
            this.breakerRing,
            this.shipGraphics,
            this.wingLights
        ]);
        this.container.setDepth(10);

        // Setup Thruster Particle Emitter
        this.createThruster();

        // Idle hover animation (sine wave pitch & elevation)
        this.scene.tweens.add({
            targets: this.container,
            y: startY - 8,
            duration: 380,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Wingtip energy pulse animation
        this.scene.tweens.add({
            targets: this.wingLights,
            alpha: { from: 0.3, to: 1 },
            duration: 250,
            yoyo: true,
            repeat: -1
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
        g.fillStyle(0xffffff, 0.95);
        g.fillRect(-3, -28, 6, 24);

        // Outer white crisp outline
        g.lineStyle(3, 0xffffff, 0.95);
        g.strokeTriangle(0, -45, -34, 32, 34, 32);

        // Wingtip energy cannons
        g.fillStyle(0x31f5ff, 1);
        g.fillRect(-36, 12, 5, 20);
        g.fillRect(31, 12, 5, 20);
    }

    private drawWingLights(): void {
        const g = this.wingLights;
        g.clear();
        g.fillStyle(0xffffff, 1);
        g.fillCircle(-33.5, 30, 4);
        g.fillCircle(33.5, 30, 4);

        g.fillStyle(0xff3da5, 0.8);
        g.fillCircle(0, -40, 3);
    }

    private drawShieldGraphics(): void {
        const g = this.shieldRing;
        g.clear();
        g.lineStyle(3, 0x31f5ff, 0.85);
        g.strokeCircle(0, 0, 56);
        g.fillStyle(0x31f5ff, 0.18);
        g.fillCircle(0, 0, 56);
    }

    private drawBreakerGraphics(): void {
        const g = this.breakerRing;
        g.clear();
        g.lineStyle(3, 0xffaa00, 0.9);
        g.strokeCircle(0, 0, 62);

        // Outer energy spike accents
        g.lineStyle(2, 0xffe680, 0.95);
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const cos = Math.cos(a);
            const sin = Math.sin(a);
            g.lineBetween(cos * 58, sin * 58, cos * 68, sin * 68);
        }
        g.fillStyle(0xffaa00, 0.15);
        g.fillCircle(0, 0, 62);
    }

    public setBreakerVisual(active: boolean): void {
        this.breakerRing.setVisible(active);
    }

    private createThruster(): void {
        if (!this.scene.textures.exists('spark')) return;

        this.thrusterEmitter = this.scene.add.particles(this.targetX, this.container.y + 32, 'spark', {
            speedY: { min: 200, max: 480 },
            speedX: { min: -25, max: 25 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.95, end: 0 },
            tint: [0x31f5ff, 0xff3da5, 0xffffff],
            lifespan: 320,
            frequency: 24
        });
        this.thrusterEmitter.setDepth(9);
    }

    public moveToLane(laneX: number, direction: number): void {
        this.targetX = laneX;
        this.targetAngle = direction * 18; // Bank tilt left (-18deg) or right (+18deg)
        this.targetScaleY = 0.92; // Slight squash during turn

        this.scene.tweens.killTweensOf(this.container);
        this.scene.tweens.killTweensOf(this.shadowGlow);

        this.scene.tweens.add({
            targets: [this.container, this.shadowGlow],
            x: laneX,
            duration: 130,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.targetAngle = 0;
                this.targetScaleY = 1.0;
            }
        });
    }

    public update(deltaSeconds: number): void {
        // Interpolate angle tilt smooth
        this.currentAngle = PhaserMath.Linear(this.currentAngle, this.targetAngle, deltaSeconds * 18);
        this.container.setAngle(this.currentAngle);

        // Interpolate scale Y squash/stretch
        this.currentScaleY = PhaserMath.Linear(this.currentScaleY, this.targetScaleY, deltaSeconds * 15);
        this.container.setScale(1.0, this.currentScaleY);

        // Update thruster emitter position
        if (this.thrusterEmitter) {
            this.thrusterEmitter.setPosition(this.container.x, this.container.y + 30);
        }

        // Shield animation wobble if invulnerable
        if (this.isInvulnerable) {
            const alpha = 0.4 + Math.sin(this.scene.time.now * 0.018) * 0.45;
            this.shieldRing.setAlpha(alpha);
            this.shieldRing.setRotation(this.scene.time.now * 0.003);
        }

        // Breaker aura spin & pulse if active
        if (this.breakerRing.visible) {
            this.breakerRing.setRotation(this.scene.time.now * 0.004);
            const alpha = 0.75 + Math.sin(this.scene.time.now * 0.012) * 0.25;
            this.breakerRing.setAlpha(alpha);
        }
    }

    public setInvulnerable(active: boolean, durationMs = 1400): void {
        this.isInvulnerable = active;
        this.shieldRing.setVisible(active);

        if (active) {
            this.container.setAlpha(0.4);
            this.scene.tweens.add({
                targets: this.container,
                alpha: 1,
                duration: 110,
                yoyo: true,
                repeat: Math.floor(durationMs / 220),
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

        // Quick flash & vibration on ship container
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1.25,
            scaleY: 0.75,
            duration: 80,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }

    public get x(): number { return this.container.x; }
    public get y(): number { return this.container.y; }

    public destroy(): void {
        this.container.destroy();
        this.shadowGlow.destroy();
        this.thrusterEmitter?.destroy();
    }
}
