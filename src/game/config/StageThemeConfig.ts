export interface StageTheme {
    title: string;
    subtitle: string;
    bgGradTop: number;
    bgGradBottom: number;
    gridLines: number;
    trackBorders: number;
    horizonPrimary: number;
    horizonSecondary: number;
    starTints: number[];
    ambientType: 'dust' | 'data' | 'sparks' | 'electric' | 'embers';
    barrierRect: number;
    barrierStroke: number;
    barrierHazard: number;
    barrierLight: number;
    explosionTints: number[];
    hudAccent: string;
}

export const STAGE_THEMES: Record<number, StageTheme> = {
    1: {
        title: 'THE BOSS',
        subtitle: 'Cyber Flagship Sector',
        bgGradTop: 0x030d22,
        bgGradBottom: 0x19082b,
        gridLines: 0x1e6a94,
        trackBorders: 0x31f5ff,
        horizonPrimary: 0x31f5ff,
        horizonSecondary: 0xff3da5,
        starTints: [0xffffff, 0x31f5ff, 0xff3da5, 0x70d6ff],
        ambientType: 'dust',
        barrierRect: 0xff2a6d,
        barrierStroke: 0xffd1e8,
        barrierHazard: 0xffffff,
        barrierLight: 0x31f5ff,
        explosionTints: [0xff2a6d, 0x31f5ff, 0xffffff],
        hudAccent: '#31f5ff'
    },
    2: {
        title: 'THE STAFF',
        subtitle: 'Industrial Staff Sector',
        bgGradTop: 0x0a1c12,
        bgGradBottom: 0x241d08,
        gridLines: 0x857318,
        trackBorders: 0xffd147,
        horizonPrimary: 0xffd147,
        horizonSecondary: 0x2bf076,
        starTints: [0xffffff, 0xffd147, 0x2bf076, 0xffb703],
        ambientType: 'data',
        barrierRect: 0x2bf076,
        barrierStroke: 0xcaffe0,
        barrierHazard: 0x145229,
        barrierLight: 0xffd147,
        explosionTints: [0x2bf076, 0xffd147, 0xffffff],
        hudAccent: '#ffd147'
    },
    3: {
        title: 'THE PRODUCT',
        subtitle: 'Vault Reserve Sector',
        bgGradTop: 0x1a072b,
        bgGradBottom: 0x2b0d23,
        gridLines: 0x8a2be2,
        trackBorders: 0xd800ff,
        horizonPrimary: 0xd800ff,
        horizonSecondary: 0xffd700,
        starTints: [0xffffff, 0xd800ff, 0xffd700, 0xe0aaff],
        ambientType: 'sparks',
        barrierRect: 0x9d4edd,
        barrierStroke: 0xf0d6ff,
        barrierHazard: 0xffd700,
        barrierLight: 0xffd700,
        explosionTints: [0x9d4edd, 0xffd700, 0xffffff],
        hudAccent: '#d800ff'
    },
    4: {
        title: 'THE COMPANY',
        subtitle: 'Corporate HQ Spire',
        bgGradTop: 0x061526,
        bgGradBottom: 0x0f2a40,
        gridLines: 0x20639b,
        trackBorders: 0x00f5d4,
        horizonPrimary: 0x00f5d4,
        horizonSecondary: 0x7b2cbf,
        starTints: [0xffffff, 0x00f5d4, 0x90e0ef, 0x48cae4],
        ambientType: 'electric',
        barrierRect: 0x00b4d8,
        barrierStroke: 0xcaf0f8,
        barrierHazard: 0xffffff,
        barrierLight: 0x00f5d4,
        explosionTints: [0x00f5d4, 0x00b4d8, 0xffffff],
        hudAccent: '#00f5d4'
    },
    5: {
        title: 'THE FACTORY',
        subtitle: 'Fusion Reactor Core',
        bgGradTop: 0x240606,
        bgGradBottom: 0x14020a,
        gridLines: 0x942a18,
        trackBorders: 0xff5400,
        horizonPrimary: 0xff5400,
        horizonSecondary: 0xff0054,
        starTints: [0xffffff, 0xff5400, 0xff0054, 0xffbd00],
        ambientType: 'embers',
        barrierRect: 0xff0054,
        barrierStroke: 0xffccd5,
        barrierHazard: 0xffbd00,
        barrierLight: 0xff5400,
        explosionTints: [0xff5400, 0xff0054, 0xffbd00],
        hudAccent: '#ff5400'
    }
};
