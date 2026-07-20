import { GameObjects, Math as PhaserMath, Scene, Utils } from 'phaser';
import { GlassPanel } from '../objects/ui/GlassPanel';
import { PHASE_CONFIGS, PhaseTransmission } from '../config/PhaseConfig';
import { AudioManager } from './AudioManager';

const CYAN = 0x31f5ff;

export class TransmissionManager {
    private scene: Scene;
    private audioMgr: AudioManager;
    private stage: number = 1;
    private timer: number = 0;
    private nextTriggerTime: number = 0;
    private shownIndices: Set<number> = new Set();
    private currentContainer: GameObjects.Container | null = null;

    constructor(scene: Scene, audioMgr: AudioManager, stage: number) {
        this.scene = scene;
        this.audioMgr = audioMgr;
        this.stage = stage;
        this.resetTimer();
    }

    private resetTimer(): void {
        // Initial transmission between 8-14s; subsequent transmissions between 28-48s (rare)
        const delay = this.shownIndices.size === 0
            ? PhaserMath.Between(8, 14)
            : PhaserMath.Between(28, 48);
        this.nextTriggerTime = this.timer + delay;
    }

    public update(deltaSeconds: number): void {
        this.timer += deltaSeconds;

        if (this.timer >= this.nextTriggerTime) {
            this.triggerRandomTransmission();
            this.resetTimer();
        }
    }

    public triggerRandomTransmission(): void {
        const config = PHASE_CONFIGS[this.stage];
        if (!config || !config.transmissions || config.transmissions.length === 0) return;

        let available = config.transmissions
            .map((t, idx) => ({ t, idx }))
            .filter(item => !this.shownIndices.has(item.idx));

        if (available.length === 0) {
            this.shownIndices.clear();
            available = config.transmissions.map((t, idx) => ({ t, idx }));
        }

        const selected = Utils.Array.GetRandom(available);
        this.shownIndices.add(selected.idx);

        this.showTransmissionUI(selected.t);
    }

    private showTransmissionUI(transmission: PhaseTransmission): void {
        if (this.currentContainer) {
            this.currentContainer.destroy();
            this.currentContainer = null;
        }

        this.audioMgr.playSwoosh();

        const x = 512;
        const y = 145;

        const container = this.scene.add.container(x, y).setScrollFactor(0).setDepth(22).setAlpha(0);
        this.currentContainer = container;

        const panel = new GlassPanel(this.scene, 0, 0, 720, 68, CYAN, 0x071b36, 0.96);
        container.add(panel.container);

        const header = this.scene.add.text(-340, -18, `[ INCOMING TRANSMISSION // ${transmission.sender} ]`, {
            fontFamily: 'monospace',
            fontSize: 13,
            fontStyle: 'bold',
            color: '#31f5ff'
        }).setOrigin(0, 0.5);

        const msgText = this.scene.add.text(-340, 8, transmission.message, {
            fontFamily: 'monospace',
            fontSize: 14,
            color: '#ffffff',
            wordWrap: { width: 680 }
        }).setOrigin(0, 0.5);

        container.add([header, msgText]);

        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            y: 155,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: container,
                    alpha: 0,
                    y: 140,
                    duration: 500,
                    delay: 4200,
                    onComplete: () => {
                        if (this.currentContainer === container) {
                            container.destroy();
                            this.currentContainer = null;
                        }
                    }
                });
            }
        });
    }

    public destroy(): void {
        if (this.currentContainer) {
            this.currentContainer.destroy();
            this.currentContainer = null;
        }
    }
}
