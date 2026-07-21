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
        if (!this.isMusicEnabled()) {
            this.stopMusic();
            return;
        }

        this.stopMusic();
        const key = `stage-${stage}`;
        const vol = this.getMusicVolume();
        if (vol > 0 && this.scene.cache.audio.exists(key)) {
            this.musicTrack = this.scene.sound.add(key, { volume: vol, loop: true });
            this.musicTrack.play();
        }
    }

    public playRandomMusic(): void {
        if (!this.isMusicEnabled()) {
            this.stopMusic();
            return;
        }

        const randomStage = Math.floor(Math.random() * 5) + 1;
        this.playStageMusic(randomStage);
    }

    public setMusicVolume(vol: number): void {
        if (this.musicTrack && 'setVolume' in this.musicTrack) {
            (this.musicTrack as Sound.HTML5AudioSound | Sound.WebAudioSound).setVolume(vol);
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

    public playSwoosh(direction: 'left' | 'right' = 'left'): void {
        const vol = 0.5 * this.getEffectsVolume();
        if (vol > 0 && this.scene.cache.audio.exists('swoosh')) {
            const pan = direction === 'left' ? -0.85 : 0.85;
            const rate = direction === 'left' ? 0.88 : 1.18;
            this.scene.sound.play('swoosh', { volume: vol, pan, rate });
        }
    }

    public playPowerUpSound(type: 'slow' | 'break' | 'life'): void {
        const vol = 0.75 * this.getEffectsVolume();
        if (vol <= 0) return;

        // Use surge / boom / audio cache with rate modulation as high-tech sound feedback
        if (type === 'slow' && this.scene.cache.audio.exists('swoosh')) {
            this.scene.sound.play('swoosh', { volume: vol, rate: 0.5, pan: 0 });
        } else if (type === 'break' && this.scene.cache.audio.exists('surge')) {
            this.scene.sound.play('surge', { volume: vol, rate: 1.4, pan: 0 });
        } else if (type === 'life' && this.scene.cache.audio.exists('surge')) {
            this.scene.sound.play('surge', { volume: vol, rate: 1.8, pan: 0 });
        }
    }

    public playBarrierShatter(): void {
        const vol = 0.85 * this.getEffectsVolume();
        if (vol > 0 && this.scene.cache.audio.exists('boom')) {
            this.scene.sound.play('boom', { volume: vol, rate: 1.5 });
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
        if (this.musicTrack) {
            this.musicTrack.stop();
            this.musicTrack.destroy();
            this.musicTrack = undefined;
        }
        // Also ensure no orphaned music audio instances continue playing
        this.scene.sound.stopAll();
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
