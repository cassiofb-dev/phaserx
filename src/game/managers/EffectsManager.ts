import { GameObjects, Scene } from 'phaser';
import { STAGE_THEMES } from '../config/StageThemeConfig';

export class EffectsManager {
    private scene: Scene;
    private warpParticles?: GameObjects.Particles.ParticleEmitter;
    private nearMissEmitter?: GameObjects.Particles.ParticleEmitter;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createNearMissEmitter();
    }

    private createNearMissEmitter(): void {
        if (!this.scene.textures.exists('spark')) return;

        this.nearMissEmitter = this.scene.add.particles(0, 0, 'spark', {
            speed: { min: 100, max: 300 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0x31f5ff, 0xffffffff, 0xff3da5],
            lifespan: 350,
            emitting: false
        });
        this.nearMissEmitter.setDepth(19).setScrollFactor(0);
    }

    public triggerNearMiss(x: number, y: number): void {
        if (this.nearMissEmitter) {
            this.nearMissEmitter.explode(12, x, y);
        }
    }

    public triggerSpeedSurge(stage = 1): void {
        const theme = STAGE_THEMES[stage] ?? STAGE_THEMES[1];
        const camera = this.scene.cameras.main;

        // Dynamic flash with stage accent
        camera.flash(180, 49, 245, 255);
        camera.shake(150, 0.008);

        // Zoom pulse camera transition effect
        this.scene.tweens.add({
            targets: camera,
            zoom: 1.03,
            duration: 120,
            yoyo: true,
            ease: 'Quad.easeOut'
        });

        this.triggerSpeedWarpParticles(theme.horizonPrimary);
    }

    public triggerHitGlitch(): void {
        const camera = this.scene.cameras.main;
        camera.shake(240, 0.02);
        camera.flash(140, 255, 61, 165);
    }

    private triggerSpeedWarpParticles(tintColor: number): void {
        if (!this.scene.textures.exists('spark')) return;

        if (!this.warpParticles) {
            this.warpParticles = this.scene.add.particles(0, 0, 'spark', {
                x: { min: 0, max: 1024 },
                y: -10,
                speedY: { min: 950, max: 1500 },
                scaleY: { start: 3.0, end: 0.1 },
                scaleX: 0.25,
                alpha: { start: 0.95, end: 0 },
                tint: tintColor,
                lifespan: 550,
                emitting: false
            });
            this.warpParticles.setDepth(18).setScrollFactor(0);
        } else {
            this.warpParticles.setParticleTint(tintColor);
        }

        this.warpParticles.explode(45);
    }

    public destroy(): void {
        this.warpParticles?.destroy();
        this.nearMissEmitter?.destroy();
    }
}
