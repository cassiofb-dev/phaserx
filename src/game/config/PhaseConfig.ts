export interface PhaseTransmission {
    sender: string;
    message: string;
}

export interface PhaseConfig {
    title: string;
    transmissions: PhaseTransmission[];
}

export const PHASE_CONFIGS: Record<number, PhaseConfig> = {
    1: {
        title: 'THE BOSS',
        transmissions: [
            { sender: 'SHIP RADAR', message: 'Player ship intercepting boss flagship trajectory.' },
            { sender: 'BOSS COMMS', message: 'All units, eliminate the player immediately!' },
            { sender: 'SHIP SENSORS', message: 'Boss defense shield broken by player attack.' },
            { sender: 'FLEET SIGNAL', message: 'Player has killed the boss.' }
        ]
    },
    2: {
        title: 'THE STAFF',
        transmissions: [
            { sender: 'STAFF FREQUENCY', message: 'Coworkers receiving strict orders to stop player.' },
            { sender: 'COWORKER COMMS', message: 'We must obey orders! Intercept player ship!' },
            { sender: 'SHIP SENSORS', message: 'Player ship engaged against incoming coworkers.' },
            { sender: 'STAFF SIGNAL', message: 'Player kills the coworkers as they obey orders.' }
        ]
    },
    3: {
        title: 'THE PRODUCT',
        transmissions: [
            { sender: 'VAULT RADAR', message: 'Player ship breaching company stock reserves.' },
            { sender: 'COMPANY ALERT', message: 'Player is destroying automated company stocks!' },
            { sender: 'SHIP SENSORS', message: 'Company stock inventory crumbling from player attacks.' },
            { sender: 'VAULT SIGNAL', message: 'Player destroys all company stocks.' }
        ]
    },
    4: {
        title: 'THE COMPANY',
        transmissions: [
            { sender: 'HQ DEFENSE', message: 'Player ship penetrating company HQ main spire.' },
            { sender: 'COMPANY ALERT', message: 'Company HQ structural core taking fatal damage from player!' },
            { sender: 'SHIP SENSORS', message: 'Others witness company HQ collapsing under player assault.' },
            { sender: 'OTHERS SIGNAL', message: 'Player destroys the company HQ.' }
        ]
    },
    5: {
        title: 'THE FACTORY',
        transmissions: [
            { sender: 'FACTORY SCAN', message: 'Player ship entering central factory assembly hub.' },
            { sender: 'SYSTEM WARNING', message: 'Player targeting main factory fusion reactor!' },
            { sender: 'SHIP SENSORS', message: 'Company factory overload initiated by player.' },
            { sender: 'OTHERS TRANSMISSION', message: 'Player destroys the company factory.' }
        ]
    }
};
