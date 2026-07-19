import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.cameras.main.setBackgroundColor(0x0e2246);

        // Cyberpunk background frame
        const frame = this.add.rectangle(512, 384, 540, 140, 0x122f5e, 0.95)
            .setStrokeStyle(2, 0x31f5ff);
        this.tweens.add({ targets: frame, alpha: { from: 0.85, to: 1 }, duration: 800, yoyo: true, repeat: -1 });

        this.add.text(512, 340, 'PHASERX // LOADING ASSETS', {
            fontFamily: 'monospace', fontSize: 18, fontStyle: 'bold', color: '#31f5ff'
        }).setOrigin(0.5);

        // Progress bar background & fill
        this.add.rectangle(512, 384, 468, 24, 0x173b75).setStrokeStyle(1, 0x31f5ff);
        const bar = this.add.rectangle(512 - 230, 384, 4, 18, 0x31f5ff).setOrigin(0, 0.5);

        const percentText = this.add.text(512, 418, '0%', {
            fontFamily: 'monospace', fontSize: 14, color: '#bafcff'
        }).setOrigin(0.5);

        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (456 * progress);
            percentText.setText(`${Math.floor(progress * 100)}%`);
        });
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.image('logo', 'images/logo.png');
        this.load.audio('swoosh', 'fx/universfield-fast-swoosh-05-192895.mp3');
        this.load.audio('flight', 'fx/freesound_community-spaceship-flight-94906.mp3');
        this.load.audio('surge', 'fx/freesound_community-bassindi4-heavy-108351.mp3');
        this.load.audio('boom', 'fx/freesound_community-boom-36120.mp3');
        this.load.audio('stage-1', 'sounds/Multifaros - The Factory/01 Multifaros - The Boss.mp3');
        this.load.audio('stage-2', 'sounds/Multifaros - The Factory/02 Multifaros - The Staff.mp3');
        this.load.audio('stage-3', 'sounds/Multifaros - The Factory/03 Multifaros - The Product.mp3');
        this.load.audio('stage-4', 'sounds/Multifaros - The Factory/04 Multifaros - The Company.mp3');
        this.load.audio('stage-5', 'sounds/Multifaros - The Factory/05 Multifaros - The Factory.mp3');
    }

    create ()
    {
        this.generateProceduralTextures();
        this.scene.start('MainMenu');
    }

    private generateProceduralTextures(): void {
        // Spark texture (soft glow circle)
        if (!this.textures.exists('spark')) {
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(16, 16, 16);
            g.fillStyle(0x31f5ff, 0.7);
            g.fillCircle(16, 16, 10);
            g.generateTexture('spark', 32, 32);
            g.destroy();
        }

        // Star texture
        if (!this.textures.exists('star')) {
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            g.fillStyle(0xffffff, 1);
            g.fillRect(0, 0, 4, 4);
            g.generateTexture('star', 4, 4);
            g.destroy();
        }

        // Flame particle texture
        if (!this.textures.exists('flame_particle')) {
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            g.fillStyle(0xff3da5, 0.9);
            g.fillCircle(8, 8, 8);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(8, 8, 4);
            g.generateTexture('flame_particle', 16, 16);
            g.destroy();
        }

        // Procedural Planet 1: Cyan Gas Giant with Saturn Rings
        if (!this.textures.exists('planet_cyan')) {
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            // Atmosphere outer glow
            g.fillStyle(0x31f5ff, 0.35);
            g.fillCircle(75, 75, 54);

            // Ring back
            g.lineStyle(10, 0x31f5ff, 0.6);
            g.strokeEllipse(75, 75, 130, 34);

            // Solid Sphere
            g.fillStyle(0x0e5e82, 1);
            g.fillCircle(75, 75, 45);

            // Stripes
            g.fillStyle(0x31f5ff, 0.8);
            g.fillRect(32, 60, 86, 10);
            g.fillStyle(0x8df0ff, 0.9);
            g.fillRect(36, 76, 78, 6);

            // Ring front overlay
            g.lineStyle(10, 0xffffff, 0.85);
            g.strokeEllipse(75, 75, 120, 30);

            g.generateTexture('planet_cyan', 150, 150);
            g.destroy();
        }

        // Procedural Planet 2: Vibrant Purple / Magenta World
        if (!this.textures.exists('planet_purple')) {
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            // Atmosphere
            g.fillStyle(0xff3da5, 0.4);
            g.fillCircle(65, 65, 52);

            // Planet body
            g.fillStyle(0x73145d, 1);
            g.fillCircle(65, 65, 44);

            // Neon pink continents/stripes
            g.fillStyle(0xff3da5, 0.85);
            g.fillCircle(50, 48, 20);
            g.fillCircle(80, 75, 26);

            // White polar cap
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(65, 26, 12);

            g.generateTexture('planet_purple', 130, 130);
            g.destroy();
        }

        // Procedural Planet 3: Golden Star / Sun
        if (!this.textures.exists('planet_gold')) {
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            // Solar Corona
            g.fillStyle(0xffaa00, 0.35);
            g.fillCircle(80, 80, 72);
            g.fillStyle(0xffdd44, 0.5);
            g.fillCircle(80, 80, 58);

            // Core
            g.fillStyle(0xffffff, 1);
            g.fillCircle(80, 80, 44);

            g.generateTexture('planet_gold', 160, 160);
            g.destroy();
        }

        // Procedural Planet 4: Silver Ice Moon
        if (!this.textures.exists('planet_moon')) {
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            g.fillStyle(0x7ab6d6, 0.3);
            g.fillCircle(45, 45, 38);

            g.fillStyle(0xa6d8f2, 1);
            g.fillCircle(45, 45, 30);

            // Craters
            g.fillStyle(0x528fae, 0.8);
            g.fillCircle(38, 35, 7);
            g.fillCircle(54, 48, 5);
            g.fillCircle(35, 55, 6);

            g.generateTexture('planet_moon', 90, 90);
            g.destroy();
        }
    }
}
