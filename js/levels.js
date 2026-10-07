/* ==========================================================================
   CYBER CIRCUIT: LOGIC HACK - PUZZLE LEVEL COLLECTION & GENERATOR
   ========================================================================== */

import { CONFIG } from './config.js';

export const LEVELS = [
    // Level 1: Inisiasi Sirkuit (Tutorial Straight & Corner Wires)
    {
        id: 1,
        title: "INISIASI SIRKUIT CORE",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ]
        ]
    },

    // Level 2: Percabangan Sinyal (T-Junction Wires)
    {
        id: 2,
        title: "DUAL CORE ROUTING",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.WIRE_T, rotation: 1 }, { type: CONFIG.TILE.EMPTY } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ]
        ]
    },

    // Level 3: Gerbang Pembalik (NOT Gate)
    {
        id: 3,
        title: "LOGIC GATE: NOT INVERTER",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.GATE_NOT, rotation: 2 } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ]
        ]
    },

    // Level 4: Gerbang Logika Kombinasi (AND Gate)
    {
        id: 4,
        title: "LOGIC GATE: AND CONVERGENCE",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.EMPTY } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.GATE_AND, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ],
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.EMPTY } ]
        ]
    },

    // Level 5: Percabangan OR (OR Gate)
    {
        id: 5,
        title: "LOGIC GATE: OR PASS",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.EMPTY } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_OR, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.EMPTY } ]
        ]
    },

    // Level 6: Gerbang Eksklusif (XOR Gate Challenge)
    {
        id: 6,
        title: "LOGIC GATE: XOR BALANCER",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_T, rotation: 2 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.GATE_XOR, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.EMPTY } ]
        ]
    },

    // Level 7: Cyber Grid 4x4
    {
        id: 7,
        title: "SERVER MATRIX ALPHA (4x4)",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_NOT, rotation: 3 }, { type: CONFIG.TILE.WIRE_T, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.WIRE_T, rotation: 1 }, { type: CONFIG.TILE.GATE_AND, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.EMPTY } ]
        ]
    },

    // Level 8: Cyber Grid 4x4 Dual Target
    {
        id: 8,
        title: "SERVER MATRIX BETA (4x4)",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_OR, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.EMPTY } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.WIRE_T, rotation: 3 }, { type: CONFIG.TILE.GATE_XOR, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.EMPTY } ]
        ]
    },

    // Level 9: Multi Gate 5x5
    {
        id: 9,
        title: "MAINFRAME HACK (5x5)",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, isFixed: true, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.TARGET, isFixed: true, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_NOT, rotation: 1 }, { type: CONFIG.TILE.WIRE_T, rotation: 3 }, { type: CONFIG.TILE.GATE_AND, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.WIRE_T, rotation: 1 }, { type: CONFIG.TILE.GATE_OR, rotation: 2 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 3 }, { type: CONFIG.TILE.TARGET, isFixed: true, rotation: 0 } ],
            [ { type: CONFIG.TILE.SOURCE, isFixed: true, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.GATE_XOR, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.EMPTY } ]
        ]
    },

    // Level 10: Master Cyber Core
    {
        id: 10,
        title: "ULTIMATE CORE OVERRIDE",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, isFixed: true, rotation: 0 }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.GATE_AND, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.TARGET, isFixed: true, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_NOT, rotation: 2 }, { type: CONFIG.TILE.WIRE_T, rotation: 1 }, { type: CONFIG.TILE.GATE_XOR, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_T, rotation: 2 }, { type: CONFIG.TILE.GATE_OR, rotation: 0 }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 3 }, { type: CONFIG.TILE.TARGET, isFixed: true, rotation: 0 } ],
            [ { type: CONFIG.TILE.SOURCE, isFixed: true, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.GATE_NOT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 } ],
            [ { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.EMPTY }, { type: CONFIG.TILE.EMPTY } ]
        ]
    }
];

// Generate Random Puzzle for Endless Time Attack
export function generateRandomLevel(size = 4) {
    const tileTypes = [
        CONFIG.TILE.WIRE_STRAIGHT,
        CONFIG.TILE.WIRE_CORNER,
        CONFIG.TILE.WIRE_T,
        CONFIG.TILE.WIRE_CROSS,
        CONFIG.TILE.GATE_NOT,
        CONFIG.TILE.GATE_AND,
        CONFIG.TILE.GATE_OR,
        CONFIG.TILE.GATE_XOR
    ];

    const grid = [];
    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) {
            if (r === 0 && c === 0) {
                row.push({ type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true });
            } else if (r === size - 1 && c === size - 1) {
                row.push({ type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true });
            } else {
                const randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
                const randomRot = Math.floor(Math.random() * 4);
                row.push({ type: randomType, rotation: randomRot });
            }
        }
        grid.push(row);
    }

    return {
        id: 'RUSH_' + Math.floor(Math.random() * 1000),
        title: `PROCEDURAL CIRCUIT (${size}x${size})`,
        grid
    };
}
