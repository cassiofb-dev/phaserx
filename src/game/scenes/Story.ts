import { Scene } from 'phaser';
import { GlassPanel } from '../objects/ui/GlassPanel';

type StoryMode = 'briefing' | 'outcome';

interface StoryData {
    stage?: number;
    mode?: StoryMode;
}

interface StoryChoice {
    label: string;
    consequence: string;
    value: 'mercy' | 'rage';
}

interface PhaseStory {
    title: string;
    subtitle: string;
    briefing: string;
    dialogue: string;
    startChoices: [StoryChoice, StoryChoice];
    outcome: string;
    endChoices: [StoryChoice, StoryChoice];
}

const CYAN = 0x31f5ff;
const PINK = 0xff3da5;

export const PHASE_STORIES: Record<number, PhaseStory> = {
    1: {
        title: 'THE BOSS', subtitle: 'PHASE 01 // THE FIRST BREACH',
        briefing: 'A mega-corporation owns every outer colony and exploits the workers who keep it running. You hijack a swift interceptor and fly straight toward the regional director.',
        dialogue: '“The director sees workers as line items. Make the company feel your presence.”',
        startChoices: [
            { label: 'BROADCAST PAYROLL RECORDS', consequence: 'Every worker hears the raw truth before the assault begins.', value: 'mercy' },
            { label: 'STAY DARK AND HUNT TARGET', consequence: 'You preserve total element of surprise, leaving workers uninformed.', value: 'rage' }
        ],
        outcome: 'The regional director is overthrown. The corporation suffers its first breach, and workers learn the regime can bleed.',
        endChoices: [
            { label: 'RELEASE THE CONFESSION', consequence: 'The director’s final logs spark uprisings across every planet.', value: 'mercy' },
            { label: 'SEIZE COMMAND ACCESS CODES', consequence: 'You convert corporate security overrides into weapons of war.', value: 'rage' }
        ]
    },
    2: {
        title: 'THE STAFF', subtitle: 'PHASE 02 // COWORKERS IN CROSSHAIRS',
        briefing: 'Station directors mobilize corporate staff to contain the rebellion. Former coworkers are ordered to intercept your ship or forfeit their survival rations.',
        dialogue: '“They call you an outlaw because they are terrified of corporate retaliation.”',
        startChoices: [
            { label: 'TRANSMIT PLEA TO STAFF', consequence: 'You urge old colleagues to step aside and survive the fallout.', value: 'mercy' },
            { label: 'BREACH LOCKDOWN SILENTLY', consequence: 'You treat every incoming defensive interceptor as an hostile target.', value: 'rage' }
        ],
        outcome: 'The staff fleet retreats. Some technicians stand down while diehards defend the broken hierarchy.',
        endChoices: [
            { label: 'OPEN ESCAPE CORRIDOR', consequence: 'Surrendering personnel are allowed to abandon station alive.', value: 'mercy' },
            { label: 'PURGE STAFF ROSTERS', consequence: 'The corporation’s local chain of command is erased forever.', value: 'rage' }
        ]
    },
    3: {
        title: 'THE PRODUCT', subtitle: 'PHASE 03 // AUTOMATED REPRESSION',
        briefing: 'Corporate automated systems manage life support, transit, and food distribution. Reaching the product engine core forces a decision on what remains.',
        dialogue: '“These machines are cages, yet millions rely on them to breathe tomorrow.”',
        startChoices: [
            { label: 'SABOTAGE CONTROL NETWORK', consequence: 'You sever monitoring telemetry while preserving civilian life support.', value: 'mercy' },
            { label: 'OVERLOAD PRODUCT VAULTS', consequence: 'You trigger total, irreversible destruction of all corporate assets.', value: 'rage' }
        ],
        outcome: 'The monitoring grid collapses. Outer colonies experience total dark-mode freedom from corporate surveillance.',
        endChoices: [
            { label: 'PUBLISH OPEN SCHEMATICS', consequence: 'Local engineers can now repair and adapt essential machinery.', value: 'mercy' },
            { label: 'BURN BLUEPRINT ARCHIVE', consequence: 'No faction will ever rebuild the machinery of total surveillance.', value: 'rage' }
        ]
    },
    4: {
        title: 'THE COMPANY', subtitle: 'PHASE 04 // THE EMPTY THRONE',
        briefing: 'Corporate high command holds planetary titles and indenture bonds. Breaching headquarters allows you to dismantle their legal reign.',
        dialogue: '“Dismantling corporate HQ is simpler than choosing what fills the vacuum.”',
        startChoices: [
            { label: 'SEIZE DEED & DEBT ARCHIVES', consequence: 'You secure legal evidence to return stolen worlds to their inhabitants.', value: 'mercy' },
            { label: 'OVERLOAD COMMAND REACTOR', consequence: 'You reduce corporate headquarters to a towering monument of flame.', value: 'rage' }
        ],
        outcome: 'Corporate command collapses. No centralized authority remains to enforce planetary debt collection.',
        endChoices: [
            { label: 'TRANSMIT DEEDS TO COLONIES', consequence: 'Each system receives proof of their absolute independence.', value: 'mercy' },
            { label: 'SCUTTLE VAULT WITH STATION', consequence: 'You deny everyone access to past records or systemic vengeance.', value: 'rage' }
        ]
    },
    5: {
        title: 'THE FACTORY', subtitle: 'PHASE 05 // WHERE THE BELT WAS BUILT',
        briefing: 'The central factory complex continues assembly below the crust. It is the heart of corporate power and your final operational target.',
        dialogue: '“Colonies wait on the surface. When the factory falls, show them the sky.”',
        startChoices: [
            { label: 'OPEN EVACUATION GATES', consequence: 'You hold line position so trapped workers can reach surface shuttles.', value: 'mercy' },
            { label: 'TARGET MAIN FUSION CORE', consequence: 'You rush the core to eliminate corporate infrastructure instantly.', value: 'rage' }
        ],
        outcome: 'The core shuts down. You stand at the master terminal as the outer worlds await your final transmission.',
        endChoices: [
            { label: 'UNLOCK GATES & WALK AWAY', consequence: 'The colonies inherit a scarred but self-determined future.', value: 'mercy' },
            { label: 'COLLAPSE FACTORY FOREVER', consequence: 'Corporate power dies in fire, leaving colonies to forge a new dawn.', value: 'rage' }
        ]
    }
};

export class Story extends Scene {
    private stage = 1;
    private mode: StoryMode = 'briefing';

    constructor() { super('Story'); }

    init(data: StoryData): void {
        this.stage = data.stage ?? 1;
        this.mode = data.mode ?? 'briefing';
    }

    create(): void {
        this.cameras.main.setBackgroundColor(0x0a1c3f);

        const phase = PHASE_STORIES[this.stage];

        // Central Transmission Panel
        new GlassPanel(this, 512, 384, 880, 710, CYAN, 0x0f2c52, 0.98);

        // Header
        this.add.text(
            512,
            68,
            this.mode === 'briefing' ? phase.subtitle : `PHASE ${String(this.stage).padStart(2, '0')} // AFTERMATH TRANSMISSION`,
            this.headerStyle(16, '#31f5ff')
        ).setOrigin(0.5);

        this.add.text(
            512,
            115,
            this.mode === 'briefing' ? phase.title : 'THE REBELLION DECISION',
            { ...this.headerStyle(34, '#ffffff'), stroke: '#082a4d', strokeThickness: 5 }
        ).setOrigin(0.5);

        // Narrative Body
        const bodyText = this.mode === 'briefing' ? `${phase.briefing}\n\n${phase.dialogue}` : phase.outcome;
        this.add.text(512, 280, bodyText, {
            fontFamily: 'monospace',
            fontSize: 17,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 790 },
            lineSpacing: 7
        }).setOrigin(0.5);

        // Decision Header
        this.add.text(
            512,
            460,
            this.mode === 'briefing' ? 'CHOOSE YOUR OPERATIONAL STRATEGY' : 'CHOOSE WHAT THE REBELLION LEAVES BEHIND',
            this.headerStyle(15, '#8ec3eb')
        ).setOrigin(0.5);

        const choices = this.mode === 'briefing' ? phase.startChoices : phase.endChoices;
        this.addChoiceCard(300, 565, choices[0], () => this.selectChoice(choices[0]));
        this.addChoiceCard(724, 565, choices[1], () => this.selectChoice(choices[1]));

        this.add.text(
            512,
            706,
            this.mode === 'briefing' ? 'YOUR STRATEGIC CHOICE SHAPES THE FINAL TRANSMISSION.' : 'THE COLONIES WILL REMEMBER THIS DIRECTIVE.',
            this.headerStyle(13, '#8ec3eb')
        ).setOrigin(0.5);
    }

    private selectChoice(choice: StoryChoice): void {
        const choices = (this.game.registry.get('storyChoices') as StoryChoice[] | undefined) ?? [];
        choices.push(choice);
        this.game.registry.set('storyChoices', choices);

        if (this.mode === 'briefing') {
            this.scene.start('Game', { stage: this.stage });
            return;
        }

        const unlocked = (this.game.registry.get('unlockedStage') as number | undefined) ?? 1;
        this.game.registry.set('unlockedStage', Math.max(unlocked, Math.min(5, this.stage + 1)));

        if (this.stage < 5) {
            this.scene.start('MainMenu', { showPhaseSelector: true });
            return;
        }

        const mercyCount = choices.filter(c => c.value === 'mercy').length;
        const ending = mercyCount >= 6 ? 'THE OPEN SKY' : mercyCount <= 3 ? 'THE ASHEN BELT' : 'THE UNFINISHED DAWN';
        this.scene.start('GameOver', { cleared: true, stage: this.stage, ending });
    }

    private addChoiceCard(x: number, y: number, choice: StoryChoice, action: () => void): void {
        const isMercy = choice.value === 'mercy';
        const borderColor = isMercy ? CYAN : PINK;
        const bgColor = isMercy ? 0x14496b : 0x611b49;

        const panel = new GlassPanel(this, x, y, 372, 166, borderColor, bgColor, 0.98);

        const titleText = this.add.text(x, y - 42, choice.label, {
            fontFamily: 'monospace',
            fontSize: 16,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 330 }
        }).setOrigin(0.5);

        const detailText = this.add.text(x, y + 22, choice.consequence, {
            fontFamily: 'monospace',
            fontSize: 13,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 326 },
            lineSpacing: 4
        }).setOrigin(0.5);

        const clickArea = this.add.rectangle(x, y, 372, 166, 0x000000, 0)
            .setInteractive({ useHandCursor: true });

        clickArea.on('pointerover', () => {
            this.tweens.add({ targets: panel.container, scaleX: 1.04, scaleY: 1.04, duration: 100 });
            if (this.game.registry.get('effectsOn') !== false) this.sound.play('swoosh', { volume: 0.15 });
        });
        clickArea.on('pointerout', () => {
            this.tweens.add({ targets: panel.container, scaleX: 1.0, scaleY: 1.0, duration: 100 });
        });
        clickArea.on('pointerdown', action);
    }

    private headerStyle(size: number, color: string): Phaser.Types.GameObjects.Text.TextStyle {
        return { fontFamily: 'monospace', fontSize: size, fontStyle: 'bold', color };
    }
}
