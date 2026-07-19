import { GameObjects, Scene } from 'phaser';
import { GlassPanel } from '../objects/ui/GlassPanel';
import { Button } from '../objects/ui/Button';

interface EndData { cleared?: boolean; stage?: number; ending?: string; }

const CYAN = 0x31f5ff;
const PINK = 0xff3da5;

export class GameOver extends Scene
{
    private celebrationEmitter?: GameObjects.Particles.ParticleEmitter;

    constructor () { super('GameOver'); }

    create (data: EndData): void
    {
        const cleared = data.cleared ?? false;
        this.cameras.main.setBackgroundColor(0x0a1c3f);

        // Main Report Panel
        const strokeColor = cleared ? CYAN : PINK;
        new GlassPanel(this, 512, 384, 900, 540, strokeColor, 0x0f2c52, 0.98);

        // Header Title
        this.add.text(512, 215, cleared ? 'MISSION DEBRIEF // SUCCESS' : 'SYSTEM CRASH // TERMINATED', {
            fontFamily: 'monospace',
            fontSize: 44,
            fontStyle: 'bold',
            color: cleared ? '#ffffff' : '#ff9bc9',
            stroke: '#082a4d',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Rank Badge
        const rankText = cleared ? 'RATING: S-RANK' : `REACHED STAGE 0${data.stage ?? 1} / 05`;
        this.add.text(512, 295, rankText, {
            fontFamily: 'monospace',
            fontSize: 22,
            fontStyle: 'bold',
            color: '#bafcff'
        }).setOrigin(0.5);

        if (cleared && data.ending) {
            this.add.text(
                512,
                370,
                `ENDING ACHIEVED: ${data.ending}\n\nTHE DESTINY OF THE OUTER COLONIES WAS DECIDED BY YOUR DIRECTIVES.`,
                {
                    fontFamily: 'monospace',
                    fontSize: 16,
                    color: '#ffffff',
                    align: 'center',
                    lineSpacing: 7,
                    wordWrap: { width: 780 }
                }
            ).setOrigin(0.5);
        } else if (!cleared) {
            this.add.text(
                512,
                370,
                `HULL INTEGRITY COMPROMISED.\n\nTHE CORPORATE BELT MAINTAINS CONTROL UNTIL THE NEXT PILOT BREACH.`,
                {
                    fontFamily: 'monospace',
                    fontSize: 16,
                    color: '#ffffff',
                    align: 'center',
                    lineSpacing: 7
                }
            ).setOrigin(0.5);
        }

        // Return Button
        new Button(
            this,
            512,
            475,
            'RETURN TO HANGAR',
            () => this.scene.start('MainMenu'),
            330,
            cleared ? 0x12365e : 0x611b49,
            strokeColor,
            56
        );

        // Particles
        this.createParticles(cleared);
    }

    private createParticles(cleared: boolean): void {
        if (!this.textures.exists('spark')) return;

        if (cleared) {
            this.celebrationEmitter = this.add.particles(512, 700, 'spark', {
                speedY: { min: -400, max: -150 },
                speedX: { min: -250, max: 250 },
                scale: { start: 0.8, end: 0 },
                alpha: { start: 1, end: 0 },
                tint: [0x31f5ff, 0xff3da5, 0xffffff],
                lifespan: 2000,
                frequency: 60
            });
        } else {
            this.celebrationEmitter = this.add.particles(512, 100, 'spark', {
                speedY: { min: 100, max: 300 },
                speedX: { min: -150, max: 150 },
                scale: { start: 0.6, end: 0 },
                alpha: { start: 0.8, end: 0 },
                tint: 0xff3da5,
                lifespan: 1500,
                frequency: 90
            });
        }
    }
}
