import { Input, Scene } from 'phaser';
import { GlassPanel } from '../objects/ui/GlassPanel';
import { Button } from '../objects/ui/Button';

interface EndData { cleared?: boolean; stage?: number; ending?: string; }

const CYAN = 0x31f5ff;
const PINK = 0xff3da5;

export class GameOver extends Scene {
    constructor() { super('GameOver'); }

    create(data: EndData): void {
        const cleared = data.cleared ?? false;

        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.cameras.main.setBackgroundColor(0x0a1c3f);

        // Keyboard ENTER listener to return to hangar
        if (this.input.keyboard) {
            const enterKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.ENTER);
            enterKey.once('down', () => this.returnToHangar());
        }

        // Main Report Panel
        const strokeColor = cleared ? CYAN : PINK;
        const panel = new GlassPanel(this, 512, 384, 900, 540, strokeColor, 0x0f2c52, 0.98);
        panel.animateIn(200);

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

        if (cleared) {
            this.add.text(
                512,
                370,
                `VICTORY ACHIEVED!\n\nTHE PLAYER HAS DESTROYED THE COMPANY FACTORY, HQ, STOCKS, BOSS, AND ALL COWORKERS OBEYING ORDERS.`,
                {
                    fontFamily: 'monospace',
                    fontSize: 16,
                    color: '#ffffff',
                    align: 'center',
                    lineSpacing: 7,
                    wordWrap: { width: 780 }
                }
            ).setOrigin(0.5);
        } else {
            this.add.text(
                512,
                370,
                `HULL INTEGRITY COMPROMISED.\n\nPLAYER SHIP DESTROYED IN ACTION. MISSION FAILED.`,
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
        const returnBtn = new Button(
            this,
            512,
            475,
            'RETURN TO HANGAR [ENTER]',
            () => this.returnToHangar(),
            350,
            cleared ? 0x12365e : 0x611b49,
            strokeColor,
            56
        );
        returnBtn.animateIn(300);

        // Particles
        this.createParticles(cleared);
    }

    private returnToHangar(): void {
        this.cameras.main.fadeOut(350);
        this.time.delayedCall(360, () => {
            this.scene.start('MainMenu');
        });
    }

    private createParticles(cleared: boolean): void {
        if (!this.textures.exists('spark')) return;

        if (cleared) {
            this.add.particles(512, 700, 'spark', {
                speedY: { min: -400, max: -150 },
                speedX: { min: -250, max: 250 },
                scale: { start: 0.8, end: 0 },
                alpha: { start: 1, end: 0 },
                tint: [0x31f5ff, 0xff3da5, 0xffffff],
                lifespan: 2000,
                frequency: 60
            });
        } else {
            this.add.particles(512, 100, 'spark', {
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
