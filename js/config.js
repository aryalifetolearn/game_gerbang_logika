/* ==========================================================================
   CYBER CIRCUIT: LOGIC HACK - GAME CONFIGURATION & CONSTANTS
   ========================================================================== */

export const CONFIG = {
    // Canvas & Grid Dimensions
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    GRID_COLS: 6,
    GRID_ROWS: 6,
    CELL_SIZE: 80,
    
    // Exhibition & Game Loop Settings
    IDLE_TIMEOUT_MS: 30000,      // 30 detik tanpa aktivitas -> Mode Attract Pameran
    TIME_ATTACK_SECONDS: 120,     // 120 detik mode Hack Rush
    STORAGE_KEY_LEADERBOARD: 'cyber_circuit_booth_scores_v1',
    STORAGE_KEY_SETTINGS: 'cyber_circuit_settings_v1',

    // Game Modes
    MODE: {
        STORY: 'STORY',
        TIME_ATTACK: 'TIME_ATTACK'
    },

    // Directions (Clockwise: Top=0, Right=1, Bottom=2, Left=3)
    DIR: {
        TOP: 0,
        RIGHT: 1,
        BOTTOM: 2,
        LEFT: 3
    },

    // Tile Types
    TILE: {
        EMPTY: 'EMPTY',
        WIRE_STRAIGHT: 'WIRE_STRAIGHT', // I shape (0/180 or 90/270)
        WIRE_CORNER: 'WIRE_CORNER',     // L shape
        WIRE_T: 'WIRE_T',               // T shape
        WIRE_CROSS: 'WIRE_CROSS',       // + shape
        GATE_NOT: 'GATE_NOT',           // 1 Input -> 1 Inverted Output
        GATE_AND: 'GATE_AND',           // 2 Inputs -> 1 Output (All True)
        GATE_OR: 'GATE_OR',             // 2 Inputs -> 1 Output (Any True)
        GATE_XOR: 'GATE_XOR',           // 2 Inputs -> 1 Output (Exact 1 True)
        SOURCE: 'SOURCE',               // Power Source Node (Always ON)
        TARGET: 'TARGET',               // Server Core Target Node
        BLOCK: 'BLOCK'                  // Obstacle/Wall
    },

    // Color Palette
    COLORS: {
        BG_GRID: '#0d1324',
        GRID_LINE: '#1e293b',
        WIRE_OFF: '#334155',
        WIRE_ON: '#00f3ff',
        WIRE_GLOW: 'rgba(0, 243, 255, 0.6)',

        SOURCE_ON: '#ffe600',
        SOURCE_GLOW: 'rgba(255, 230, 0, 0.8)',
        
        TARGET_OFF: '#475569',
        TARGET_ON: '#00ff66',
        TARGET_GLOW: 'rgba(0, 255, 102, 0.8)',

        GATE_NOT: '#ff0055',
        GATE_AND: '#00f3ff',
        GATE_OR: '#ffe600',
        GATE_XOR: '#a855f7',
        
        TEXT_LIGHT: '#f8fafc',
        TEXT_DIM: '#64748b'
    }
};

// Helper: Reverse Direction
export function getOppositeDir(dir) {
    return (dir + 2) % 4;
}

// Helper: Direction Vector (dx, dy)
export const DIR_OFFSET = [
    { x: 0, y: -1 }, // TOP
    { x: 1, y: 0 },  // RIGHT
    { x: 0, y: 1 },  // BOTTOM
    { x: -1, y: 0 }  // LEFT
];
