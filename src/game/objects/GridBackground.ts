import { GameObjects, Math as PhaserMath, Scene } from 'phaser';

interface ActivePlanet {
    image: GameObjects.Image;
    speedY: number;
    speedX: number;
    rotationSpeed: number;
}

export class GridBackground {
    private scene: Scene;
    private backgroundGraphics: GameObjects.Graphics;
    private gridGraphics: GameObjects.Graphics;
    private horizonGlow: GameObjects.Graphics;
    private starParticles?: GameObjects.Particles.ParticleEmitter;
    private brightStarParticles?: GameObjects.Particles.ParticleEmitter;
    private activePlanets: ActivePlanet[] = [];
    private planetSpawnTimer = 0;
    private gridOffsetY = 0;
    private currentSpeed = 300;
    private planetKeys = ['planet_cyan', 'planet_purple', 'planet_gold', 'planet_moon'];

    constructor(scene: Scene) {
        this.scene = scene;
        this.backgroundGraphics = this.scene.add.graphics().setDepth(0);
        this.horizonGlow = this.scene.add.graphics().setDepth(1);
        this.gridGraphics = this.scene.add.graphics().setDepth(3);

        this.drawBackground();
        this.createStarfields();
        this.drawHorizonGlow();

        // Seed initial planets on screen
        this.seedInitialPlanets();
    }

    private drawBackground(): void {
        this.backgroundGraphics.clear();
        // Vibrant bright cosmic blue to purple gradient background
        this.backgroundGraphics.fillGradientStyle(0x0a1d47, 0x0a1d47, 0x180f38, 0x180f38, 1);
        this.backgroundGraphics.fillRect(-100000, 0, 200000, 768);
    }

    private drawHorizonGlow(): void {
        this.horizonGlow.clear();

        // Bright neon horizon gradient flare
        this.horizonGlow.fillStyle(0x31f5ff, 0.3);
        this.horizonGlow.fillRect(-100000, 0, 200000, 160);

        this.horizonGlow.fillStyle(0xff3da5, 0.2);
        this.horizonGlow.fillRect(-100000, 70, 200000, 90);

        // Crisp glowing horizon lines
        this.horizonGlow.lineStyle(4, 0x31f5ff, 0.95);
        this.horizonGlow.lineBetween(-100000, 140, 100000, 140);

        this.horizonGlow.lineStyle(2, 0xff3da5, 0.85);
        this.horizonGlow.lineBetween(-100000, 144, 100000, 144);
    }

    private createStarfields(): void {
        if (!this.scene.textures.exists('star') || !this.scene.textures.exists('spark')) return;

        // Layer 1: Dense fast space dust / stars
        this.starParticles = this.scene.add.particles(0, 0, 'star', {
            x: { min: -1000, max: 2000 },
            y: -20,
            speedY: { min: 120, max: 550 },
            speedX: 0,
            scale: { start: 1.2, end: 0.3 },
            alpha: { start: 0.95, end: 0.2 },
            tint: [0xffffff, 0x31f5ff, 0xff3da5, 0xffea78],
            lifespan: 3000,
            frequency: 25
        }).setDepth(1);

        // Layer 2: Bright sparkling stars
        this.brightStarParticles = this.scene.add.particles(0, 0, 'spark', {
            x: { min: -800, max: 1800 },
            y: -20,
            speedY: { min: 60, max: 280 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.5, end: 0.1 },
            alpha: { start: 0.8, end: 0.1 },
            tint: [0xffffff, 0x31f5ff, 0xffd147],
            lifespan: 4000,
            frequency: 90
        }).setDepth(1);
    }

    private seedInitialPlanets(): void {
        // Spawn 2 planets right away at varied positions
        this.spawnPlanet(PhaserMath.Between(100, 900), PhaserMath.Between(60, 350));
        this.spawnPlanet(PhaserMath.Between(-100, 1100), PhaserMath.Between(400, 650));
    }

    private spawnPlanet(x?: number, y?: number): void {
        const key = this.planetKeys[PhaserMath.Between(0, this.planetKeys.length - 1)];
        if (!this.scene.textures.exists(key)) return;

        const posX = x ?? PhaserMath.Between(-150, 1170);
        const posY = y ?? -160;

        const img = this.scene.add.image(posX, posY, key);
        img.setDepth(2);

        const scale = PhaserMath.FloatBetween(0.6, 1.25);
        img.setScale(scale);
        img.setAlpha(PhaserMath.FloatBetween(0.75, 0.95));

        const speedY = PhaserMath.FloatBetween(30, 90);
        const speedX = PhaserMath.FloatBetween(-8, 8);
        const rotationSpeed = PhaserMath.FloatBetween(-0.005, 0.005);

        this.activePlanets.push({
            image: img,
            speedY,
            speedX,
            rotationSpeed
        });
    }

    public update(deltaSeconds: number, speed: number): void {
        this.currentSpeed = speed;
        this.gridOffsetY = (this.gridOffsetY + speed * deltaSeconds * 0.75) % 46;

        // Move Planets
        this.planetSpawnTimer += deltaSeconds;
        if (this.planetSpawnTimer > 5.5) {
            this.planetSpawnTimer = 0;
            this.spawnPlanet();
        }

        this.activePlanets = this.activePlanets.filter(planet => {
            planet.image.y += planet.speedY * deltaSeconds;
            planet.image.x += planet.speedX * deltaSeconds;
            planet.image.rotation += planet.rotationSpeed;

            if (planet.image.y > 900) {
                planet.image.destroy();
                return false;
            }
            return true;
        });

        // Draw Vibrant Perspective Grid Lines
        this.gridGraphics.clear();

        // Perspective Lane Lines (Bright Cyan & Magenta accent)
        const laneWidth = 210;
        const centerX = 512;

        this.gridGraphics.lineStyle(2, 0x2478a3, 0.65);
        for (let lane = -10; lane <= 10; lane++) {
            const topX = centerX + lane * laneWidth;
            const bottomX = centerX + lane * laneWidth;
            this.gridGraphics.lineBetween(topX, 0, bottomX, 768);
        }

        // Main track border lines (Glow Cyan + Magenta)
        this.gridGraphics.lineStyle(5, 0x31f5ff, 0.95);
        for (let lane of [-2.5, 2.5]) {
            const x = centerX + lane * laneWidth;
            this.gridGraphics.lineBetween(x, 0, x, 768);
        }

        // Horizontal moving grid lines for speed velocity feel
        this.gridGraphics.lineStyle(2, 0x48b6d4, 0.5);
        for (let y = this.gridOffsetY; y < 768; y += 46) {
            this.gridGraphics.lineBetween(-100000, y, 100000, y);
        }
    }

    public setWarpEffect(active: boolean): void {
        if (this.starParticles) {
            if (active) {
                this.starParticles.setParticleSpeed(0, 1200);
            } else {
                this.starParticles.setParticleSpeed(0, 300);
            }
        }
    }

    public destroy(): void {
        this.backgroundGraphics.destroy();
        this.gridGraphics.destroy();
        this.horizonGlow.destroy();
        this.starParticles?.destroy();
        this.brightStarParticles?.destroy();
        this.activePlanets.forEach(p => p.image.destroy());
        this.activePlanets = [];
    }
}
