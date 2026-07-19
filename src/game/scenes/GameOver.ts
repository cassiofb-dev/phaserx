import { Scene } from 'phaser';

interface EndData { cleared?: boolean; stage?: number; ending?: string; }

export class GameOver extends Scene
{
    constructor () { super('GameOver'); }

    create (data: EndData): void
    {
        const cleared = data.cleared ?? false;
        this.cameras.main.setBackgroundColor(0x030713);
        this.add.rectangle(512, 384, 900, 530, 0x07162b, 0.98).setStrokeStyle(4, cleared ? 0x31f5ff : 0xff3da5);
        this.add.text(512, 245, cleared ? 'RUN COMPLETE' : 'RUN TERMINATED', {
            fontFamily: 'monospace', fontSize: 50, fontStyle: 'bold', color: cleared ? '#d9fdff' : '#ff9bc9', stroke: '#06142b', strokeThickness: 5
        }).setOrigin(0.5);
        this.add.text(512, 338, cleared ? 'YOU SURVIVED ALL FIVE FACTORY STAGES.' : `YOU REACHED STAGE ${data.stage ?? 1} OF 5.`, {
            fontFamily: 'monospace', fontSize: 20, color: '#bafcff'
        }).setOrigin(0.5);
        if (cleared && data.ending) {
            this.add.text(512, 385, `ENDING: ${data.ending}\nTHE FUTURE OF THE PLANETS WAS CHOSEN BY YOUR ACTIONS.`, {
                fontFamily: 'monospace', fontSize: 16, color: '#ffffff', align: 'center', lineSpacing: 7
            }).setOrigin(0.5);
        }
        const button = this.add.rectangle(512, 455, 330, 58, 0x173e64).setStrokeStyle(3, 0x31f5ff).setInteractive({ useHandCursor: true });
        this.add.text(512, 455, 'RETURN TO HANGAR', { fontFamily: 'monospace', fontSize: 20, fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
        button.on('pointerover', () => button.setFillStyle(0xff3da5));
        button.on('pointerout', () => button.setFillStyle(0x173e64));
        button.on('pointerdown', () => this.scene.start('MainMenu'));
    }
}
