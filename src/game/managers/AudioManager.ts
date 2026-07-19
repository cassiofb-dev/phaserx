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

    public getMusicVolume(): number {
        if (!this.isMusicEnabled()) return 0;
        return (this.scene.game.registry.get('musicVolume') as number) ?? 0.75;
    }

    public getEffectsVolume(): number {
        if (!this.isEffectsEnabled()) return 0;
        return (this.scene.game.registry.get('effectsVolume') as number) ?? 0.80;
    }

    public playStageMusic(stage: number): void {
        if (!this.isMusicEnabled()) return;

        this.stopMusic();
        const key = `stage-${stage}`;
        const vol = this.getMusicVolume();
        if (vol > 0 && this.scene.cache.audio.exists(key)) {
            this.musicTrack = this.scene.sound.add(key, { volume: vol, loop: true });
            this.musicTrack.play();
        }
    }

    public startFlightAmbient(): void {
        if (!this.isEffectsEnabled()) return;

        this.stopFlightAmbient();
        const vol = 0.35 * this.getEffectsVolume();
        if (vol > 0 && this.scene.cache.audio.exists('flight')) {
            this.flightLoop = this.scene.sound.add('flight', { volume: vol, loop: true });
            this.flightLoop.play();
        }
    }

    public playSwoosh(): void {
        const vol = 0.4 * this.getEffectsVolume();
        if (vol > 0 && this.scene.cache.audio.exists('swoosh')) {
            this.scene.sound.play('swoosh', { volume: vol });
        }
    }

    public playSurge(): void {
        const vol = 0.8 * this.getEffectsVolume();
        if (vol > 0 && this.scene.cache.audio.exists('surge')) {
            this.scene.sound.play('surge', { volume: vol });
        }
    }

    public playBoom(): void {
        const vol = 0.9 * this.getEffectsVolume();
        if (vol > 0 && this.scene.cache.audio.exists('boom')) {
            this.scene.sound.play('boom', { volume: vol });
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
