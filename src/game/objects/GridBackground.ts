import { GameObjects, Math as PhaserMath, Scene } from 'phaser';
import { STAGE_THEMES, StageTheme } from '../config/StageThemeConfig';

interface ActivePlanet {
    image: GameObjects.Image;
    speedY: number;
    speedX: number;
    rotationSpeed: number;
}

export class GridBackground {
    private scene: Scene;
    private stageTheme: StageTheme;
    private backgroundGraphics: GameObjects.Graphics;
    private gridGraphics: GameObjects.Graphics;
    private horizonGlow: GameObjects.Graphics;
    private starParticles?: GameObjects.Particles.ParticleEmitter;
    private brightStarParticles?: GameObjects.Particles.ParticleEmitter;
    private ambientParticles?: GameObjects.Particles.ParticleEmitter;
    private activePlanets: ActivePlanet[] = [];
    private planetSpawnTimer = 0;
    private gridOffsetY = 0;
    private planetKeys = ['planet_cyan', 'planet_purple', 'planet_gold', 'planet_moon'];

    constructor(scene: Scene, stage = 1) {
        this.scene = scene;
        this.stageTheme = STAGE_THEMES[stage] ?? STAGE_THEMES[1];

        this.backgroundGraphics = this.scene.add.graphics().setDepth(0);
        this.horizonGlow = this.scene.add.graphics().setDepth(1);
        this.gridGraphics = this.scene.add.graphics().setDepth(3);

        this.drawBackground();
        this.createStarfields();
        this.createAmbientParticles();
        this.drawHorizonGlow();

        // Seed initial planets on screen
        this.seedInitialPlanets();
    }

    private drawBackground(): void {
        this.backgroundGraphics.clear();
        this.backgroundGraphics.fillGradientStyle(
            this.stageTheme.bgGradTop,
            this.stageTheme.bgGradTop,
            this.stageTheme.bgGradBottom,
            this.stageTheme.bgGradBottom,
            1
        );
        this.backgroundGraphics.fillRect(-100000, 0, 200000, 768);
    }

    private drawHorizonGlow(): void {
        this.horizonGlow.clear();

        // Bright stage-themed horizon gradient flare
        this.horizonGlow.fillStyle(this.stageTheme.horizonPrimary, 0.35);
        this.horizonGlow.fillRect(-100000, 0, 200000, 160);

        this.horizonGlow.fillStyle(this.stageTheme.horizonSecondary, 0.22);
        this.horizonGlow.fillRect(-100000, 70, 200000, 90);

        // Crisp glowing horizon lines
        this.horizonGlow.lineStyle(4, this.stageTheme.horizonPrimary, 0.95);
        this.horizonGlow.lineBetween(-100000, 140, 100000, 140);

        this.horizonGlow.lineStyle(2, this.stageTheme.horizonSecondary, 0.85);
        this.horizonGlow.lineBetween(-100000, 144, 100000, 144);
    }

    private createStarfields(): void {
        if (!this.scene.textures.exists('star') || !this.scene.textures.exists('spark')) return;

        // Layer 1: Dense space dust / stars matching stage color palette
        this.starParticles = this.scene.add.particles(0, 0, 'star', {
            x: { min: -1000, max: 2000 },
            y: -20,
            speedY: { min: 120, max: 550 },
            speedX: 0,
            scale: { start: 1.2, end: 0.3 },
            alpha: { start: 0.95, end: 0.2 },
            tint: this.stageTheme.starTints,
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
            tint: this.stageTheme.starTints,
            lifespan: 4000,
            frequency: 90
        }).setDepth(1);
    }

    private createAmbientParticles(): void {
        const texKey = this.scene.textures.exists('flame_particle') ? 'flame_particle' : 'spark';
        if (!this.scene.textures.exists(texKey)) return;

        switch (this.stageTheme.ambientType) {
            case 'embers':
                // Stage 5: Lava embers floating upwards from the bottom core
                this.ambientParticles = this.scene.add.particles(0, 0, texKey, {
                    x: { min: -800, max: 1800 },
                    y: 780,
                    speedY: { min: -160, max: -40 },
                    speedX: { min: -30, max: 30 },
                    scale: { start: 0.6, end: 0.1 },
                    alpha: { start: 0.85, end: 0 },
                    tint: [0xff5400, 0xff0054, 0xffbd00],
                    lifespan: 3500,
                    frequency: 60
                }).setDepth(2);
                break;
            case 'electric':
                // Stage 4: Electric arcs flickering around the main spire
                this.ambientParticles = this.scene.add.particles(0, 0, 'spark', {
                    x: { min: -600, max: 1600 },
                    y: { min: 100, max: 700 },
                    speedY: { min: -80, max: 80 },
                    speedX: { min: -80, max: 80 },
                    scale: { start: 0.4, end: 0 },
                    alpha: { start: 0.9, end: 0 },
                    tint: [0x00f5d4, 0x90e0ef, 0xffffff],
                    lifespan: 600,
                    frequency: 80
                }).setDepth(2);
                break;
            case 'data':
                // Stage 2: Digital matrix stream particles downloading
                this.ambientParticles = this.scene.add.particles(0, 0, 'spark', {
                    x: { min: -600, max: 1600 },
                    y: -20,
                    speedY: { min: 350, max: 600 },
                    scaleY: { start: 1.5, end: 0.1 },
                    scaleX: 0.2,
                    alpha: { start: 0.9, end: 0 },
                    tint: [0x2bf076, 0xffd147],
                    lifespan: 1800,
                    frequency: 45
                }).setDepth(2);
                break;
            case 'sparks':
                // Stage 3: Crystalline gold/purple sparkle dust
                this.ambientParticles = this.scene.add.particles(0, 0, 'spark', {
                    x: { min: -600, max: 1600 },
                    y: { min: 50, max: 700 },
                    speedY: { min: 20, max: 90 },
                    scale: { start: 0.7, end: 0 },
                    alpha: { start: 0.95, end: 0 },
                    tint: [0xd800ff, 0xffd700, 0xffffff],
                    lifespan: 1200,
                    frequency: 70
                }).setDepth(2);
                break;
        }
    }

    private seedInitialPlanets(): void {
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

        // Draw Stage-Themed Perspective Grid Lines
        this.gridGraphics.clear();

        const laneWidth = 210;
        const centerX = 512;

        // Grid lines
        this.gridGraphics.lineStyle(2, this.stageTheme.gridLines, 0.65);
        for (let lane = -10; lane <= 10; lane++) {
            const topX = centerX + lane * laneWidth;
            const bottomX = centerX + lane * laneWidth;
            this.gridGraphics.lineBetween(topX, 0, bottomX, 768);
        }

        // Main track border lines with stage track borders color glow
        this.gridGraphics.lineStyle(5, this.stageTheme.trackBorders, 0.95);
        for (let lane of [-2.5, 2.5]) {
            const x = centerX + lane * laneWidth;
            this.gridGraphics.lineBetween(x, 0, x, 768);
        }

        // Horizontal moving speed velocity grid lines
        this.gridGraphics.lineStyle(2, this.stageTheme.trackBorders, 0.45);
        for (let y = this.gridOffsetY; y < 768; y += 46) {
            this.gridGraphics.lineBetween(-100000, y, 100000, y);
        }
    }

    public setWarpEffect(active: boolean): void {
        if (this.starParticles) {
            if (active) {
                this.starParticles.setParticleSpeed(0, 1350);
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
        this.ambientParticles?.destroy();
        this.activePlanets.forEach(p => p.image.destroy());
        this.activePlanets = [];
    }
}
