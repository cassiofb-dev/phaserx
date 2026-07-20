import { Scene } from 'phaser';

export class Story extends Scene {
    private stage = 1;

    constructor() {
        super('Story');
    }

    init(data: { stage?: number }): void {
        this.stage = data.stage ?? 1;
    }

    create(): void {
        // Forward directly to Game (no text at start or end of phases)
        this.scene.start('Game', { stage: this.stage });
    }
}
