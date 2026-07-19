import { Scene, Sound } from 'phaser';

export class AudioManager {
    private scene: Scene;
    private musicTrack?: Sound.BaseSound;
    private flightLoop?: Sound.BaseSound;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public isMusicEnabled(): boolean {
        return this.scene.game.registry.get('musicOn') !== false;
    }

    public isEffectsEnabled(): boolean {
        return this.scene.game.registry.get('effectsOn') !== false;
    }

    public playStageMusic(stage: number): void {
        if (!this.isMusicEnabled()) return;

        this.stopMusic();
        const key = `stage-${stage}`;
        if (this.scene.cache.audio.exists(key)) {
            this.musicTrack = this.scene.sound.add(key, { volume: 0.32, loop: true });
            this.musicTrack.play();
        }
    }

    public startFlightAmbient(): void {
        if (!this.isEffectsEnabled()) return;

        this.stopFlightAmbient();
        if (this.scene.cache.audio.exists('flight')) {
            this.flightLoop = this.scene.sound.add('flight', { volume: 0.16, loop: true });
            this.flightLoop.play();
        }
    }

    public playSwoosh(): void {
        if (this.isEffectsEnabled() && this.scene.cache.audio.exists('swoosh')) {
            this.scene.sound.play('swoosh', { volume: 0.22 });
        }
    }

    public playSurge(): void {
        if (this.isEffectsEnabled() && this.scene.cache.audio.exists('surge')) {
            this.scene.sound.play('surge', { volume: 0.45 });
        }
    }

    public playBoom(): void {
        if (this.isEffectsEnabled() && this.scene.cache.audio.exists('boom')) {
            this.scene.sound.play('boom', { volume: 0.5 });
        }
    }

    public pauseAll(): void {
        this.musicTrack?.pause();
        this.flightLoop?.pause();
    }

    public resumeAll(): void {
        this.musicTrack?.resume();
        this.flightLoop?.resume();
    }

    public stopMusic(): void {
        this.musicTrack?.stop();
        this.musicTrack?.destroy();
        this.musicTrack = undefined;
    }

    public stopFlightAmbient(): void {
        this.flightLoop?.stop();
        this.flightLoop?.destroy();
        this.flightLoop = undefined;
    }

    public stopAll(): void {
        this.stopMusic();
        this.stopFlightAmbient();
    }
}
