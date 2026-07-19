import { Scene } from 'phaser';

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
        briefing: 'A company owns every planet and abuses the workers who keep it running. The player steals a ship and flies toward the boss who ordered the abuse.',
        dialogue: '“The boss sees workers as numbers. Make the company see the player.”',
        startChoices: [
            { label: 'BROADCAST THE PAYROLL GRAVES', consequence: 'Every worker hears the truth before the raid begins.', value: 'mercy' },
            { label: 'STAY DARK AND HUNT VEYR', consequence: 'You preserve surprise, but leave the workers in the dark.', value: 'rage' }
        ],
        outcome: 'The boss is defeated. The company loses its first leader, and the workers learn that it can be hurt.',
        endChoices: [
            { label: 'RELEASE THE CONFESSION', consequence: 'The boss’s final words become a signal for every planet.', value: 'mercy' },
            { label: 'TAKE HIS ACCESS CODES', consequence: 'You turn his authority into a key for deeper violence.', value: 'rage' }
        ]
    },
    2: {
        title: 'THE STAFF', subtitle: 'PHASE 02 // FRIENDS IN THE CROSSHAIRS',
        briefing: 'The top staff try to protect the company after the boss falls. Coworkers are told to stop the player or lose what little safety they have.',
        dialogue: '“The coworkers call the player crazy because they are afraid of the company.”',
        startChoices: [
            { label: 'SEND A PLEA TO THE STAFF', consequence: 'You ask your old coworkers to stand aside and survive.', value: 'mercy' },
            { label: 'BREACH THE LOCKDOWN SILENTLY', consequence: 'You treat every intercepted ship as an enemy.', value: 'rage' }
        ],
        outcome: 'The staff is defeated. Some coworkers stand down, while others still believe the company is the only life they can have.',
        endChoices: [
            { label: 'OPEN AN ESCAPE CORRIDOR', consequence: 'Those who surrender can leave the station alive.', value: 'mercy' },
            { label: 'ERASE THE STAFF ROSTERS', consequence: 'The company loses its chain of command forever.', value: 'rage' }
        ]
    },
    3: {
        title: 'THE PRODUCT', subtitle: 'PHASE 03 // THE MACHINES THAT OWNED WORLDS',
        briefing: 'The company products control homes, food, work, and travel on every planet. The player reaches the product vaults and must decide what should remain after the destruction.',
        dialogue: '“The products are cages, but some workers still need them to survive.”',
        startChoices: [
            { label: 'SABOTAGE THE CONTROL NETWORK', consequence: 'You disable the chains while preserving essential machines.', value: 'mercy' },
            { label: 'OVERLOAD EVERY PRODUCT VAULT', consequence: 'You choose a total, irreversible purge.', value: 'rage' }
        ],
        outcome: 'The products stop working. Workers can finally move without the company watching every step.',
        endChoices: [
            { label: 'PUBLISH THE REPAIR SCHEMATICS', consequence: 'Communities can rebuild the useful machines themselves.', value: 'mercy' },
            { label: 'BURN THE BLUEPRINT ARCHIVE', consequence: 'No one can rebuild the company’s machinery of control.', value: 'rage' }
        ]
    },
    4: {
        title: 'THE COMPANY', subtitle: 'PHASE 04 // THE EMPTY THRONE',
        briefing: 'The company headquarters holds the records that let it own planets and control workers. The player enters the last command center to end that power.',
        dialogue: '“Destroying the company is easier than deciding what comes next.”',
        startChoices: [
            { label: 'SEIZE THE DEEDS AND DEBT RECORDS', consequence: 'You prepare evidence to return stolen planets to their people.', value: 'mercy' },
            { label: 'DRIVE STRAIGHT FOR THE REACTOR', consequence: 'You make the company’s symbol disappear in fire.', value: 'rage' }
        ],
        outcome: 'The headquarters falls. The company no longer has one place from which to rule the planets.',
        endChoices: [
            { label: 'SEND THE DEEDS TO THE PLANETS', consequence: 'You give each planet proof that it was never company property.', value: 'mercy' },
            { label: 'SCUTTLE THE VAULT WITH HQ', consequence: 'You deny everyone the old system’s records and revenge.', value: 'rage' }
        ]
    },
    5: {
        title: 'THE FACTORY', subtitle: 'PHASE 05 // WHERE THE BELT WAS BUILT',
        briefing: 'The original factory is still trapping workers below the planet. It makes the products that keep the company alive, and it is the player’s final target.',
        dialogue: '“Workers are still inside. If the factory falls, give them a way out.”',
        startChoices: [
            { label: 'OPEN THE WORKER EVACUATION GATES', consequence: 'You risk the assault to give every trapped worker a path outside.', value: 'mercy' },
            { label: 'TARGET THE FACTORY CORE', consequence: 'You race to end the company before it can rebuild itself.', value: 'rage' }
        ],
        outcome: 'The factory stops. The player reaches the final switch while every worker waits for the last choice.',
        endChoices: [
            { label: 'OPEN THE GATES AND WALK AWAY', consequence: 'The workers inherit a damaged but living future.', value: 'mercy' },
            { label: 'COLLAPSE THE FACTORY FOREVER', consequence: 'The company dies in flame, and the planets must survive its ashes.', value: 'rage' }
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
        const phase = PHASE_STORIES[this.stage];
        this.drawBackdrop();
        this.add.text(512, 68, this.mode === 'briefing' ? phase.subtitle : `PHASE ${String(this.stage).padStart(2, '0')} // AFTERMATH`, this.labelStyle(17)).setOrigin(0.5);
        this.add.text(512, 115, this.mode === 'briefing' ? phase.title : 'THE CHOICE AFTER', { ...this.labelStyle(36), color: '#ffffff' }).setOrigin(0.5);
        const body = this.mode === 'briefing' ? `${phase.briefing}\n\n${phase.dialogue}` : phase.outcome;
        this.add.text(512, 284, body, { fontFamily: 'monospace', fontSize: 17, color: '#d8f5ff', align: 'center', wordWrap: { width: 790 }, lineSpacing: 7 }).setOrigin(0.5);
        this.add.text(512, 465, this.mode === 'briefing' ? 'CHOOSE HOW TO ENTER THIS PHASE' : 'CHOOSE WHAT THE REBELLION LEAVES BEHIND', this.labelStyle(15)).setOrigin(0.5);
        const choices = this.mode === 'briefing' ? phase.startChoices : phase.endChoices;
        this.addChoice(300, 565, choices[0], () => this.select(choices[0]));
        this.addChoice(724, 565, choices[1], () => this.select(choices[1]));
        this.add.text(512, 706, this.mode === 'briefing' ? 'YOUR DECISIONS SHAPE THE FINAL TRANSMISSION.' : 'THE BELT WILL REMEMBER THIS.', this.labelStyle(14)).setOrigin(0.5);
    }

    private select(choice: StoryChoice): void {
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
        const mercy = choices.filter(entry => entry.value === 'mercy').length;
        const ending = mercy >= 6 ? 'THE OPEN SKY' : mercy <= 3 ? 'THE ASHEN BELT' : 'THE UNFINISHED DAWN';
        this.scene.start('GameOver', { cleared: true, stage: this.stage, ending });
    }

    private addChoice(x: number, y: number, choice: StoryChoice, action: () => void): void {
        const color = choice.value === 'mercy' ? 0x155775 : 0x5b1947;
        const border = choice.value === 'mercy' ? CYAN : PINK;
        const card = this.add.rectangle(x, y, 372, 166, color, 0.98).setStrokeStyle(3, border).setInteractive({ useHandCursor: true });
        const title = this.add.text(x, y - 40, choice.label, { fontFamily: 'monospace', fontSize: 17, fontStyle: 'bold', color: '#ffffff', align: 'center', wordWrap: { width: 330 } }).setOrigin(0.5);
        const detail = this.add.text(x, y + 25, choice.consequence, { fontFamily: 'monospace', fontSize: 13, color: '#d8f5ff', align: 'center', wordWrap: { width: 326 }, lineSpacing: 4 }).setOrigin(0.5);
        card.on('pointerover', () => { card.setFillStyle(border, 0.72); title.setColor('#ffffff'); });
        card.on('pointerout', () => card.setFillStyle(color, 0.98));
        card.on('pointerdown', action);
        detail.setInteractive({ useHandCursor: true }).on('pointerdown', action);
        title.setInteractive({ useHandCursor: true }).on('pointerdown', action);
    }

    private drawBackdrop(): void {
        this.cameras.main.setBackgroundColor(0x030713);
        const graphics = this.add.graphics();
        graphics.fillStyle(0x06172c, 1).fillRect(80, 30, 864, 708);
        graphics.lineStyle(3, CYAN, 0.7).strokeRect(80, 30, 864, 708);
        graphics.lineStyle(1, 0x1d6382, 0.35);
        for (let y = 155; y < 730; y += 38) graphics.lineBetween(88, y, 936, y);
    }

    private labelStyle(size: number): Phaser.Types.GameObjects.Text.TextStyle {
        return { fontFamily: 'monospace', fontSize: size, fontStyle: 'bold', color: '#79bcd5', stroke: '#06142b', strokeThickness: 3 };
    }
}
