import { GameObjects, Scene } from 'phaser';

export class EffectsManager {
    private scene: Scene;
    private warpParticles?: GameObjects.Particles.ParticleEmitter;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public triggerSpeedSurge(): void {
        const camera = this.scene.cameras.main;
        camera.flash(180, 49, 245, 255);
        camera.shake(150, 0.008);

        this.triggerSpeedWarpParticles();
    }

    public triggerHitGlitch(): void {
        const camera = this.scene.cameras.main;
        camera.shake(220, 0.018);
        camera.flash(120, 255, 61, 165);
    }

    private triggerSpeedWarpParticles(): void {
        if (!this.scene.textures.exists('spark')) return;

        if (!this.warpParticles) {
            this.warpParticles = this.scene.add.particles(0, 0, 'spark', {
                x: { min: 0, max: 1024 },
                y: -10,
                speedY: { min: 900, max: 1400 },
                scaleY: { start: 2.5, end: 0.1 },
                scaleX: 0.2,
                alpha: { start: 0.9, end: 0 },
                tint: 0x31f5ff,
                lifespan: 500,
                emitting: false
            });
            this.warpParticles.setDepth(18).setScrollFactor(0);
        }

        this.warpParticles.explode(40);
    }

    public destroy(): void {
        this.warpParticles?.destroy();
    }
}
