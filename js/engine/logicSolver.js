/* ==========================================================================
   CYBER CIRCUIT: LOGIC HACK - SIGNAL PROPAGATION & LOGIC SOLVER ENGINE
   Evaluates wire connections, logic gates (NOT, AND, OR, XOR), & target state.
   ========================================================================== */

import { CONFIG, getOppositeDir, DIR_OFFSET } from '../config.js';

export class LogicSolver {

    // Returns array of 4 boolean ports [TOP, RIGHT, BOTTOM, LEFT] for a given tile type & rotation
    static getTilePorts(tile) {
        const r = (tile.rotation || 0) % 4;
        let basePorts = [false, false, false, false];

        switch (tile.type) {
            case CONFIG.TILE.WIRE_STRAIGHT:
                basePorts = [true, false, true, false]; // TOP & BOTTOM
                break;
            case CONFIG.TILE.WIRE_CORNER:
                basePorts = [true, true, false, false]; // TOP & RIGHT
                break;
            case CONFIG.TILE.WIRE_T:
                basePorts = [true, true, true, false];  // TOP, RIGHT, BOTTOM
                break;
            case CONFIG.TILE.WIRE_CROSS:
                basePorts = [true, true, true, true];   // ALL 4
                break;
            case CONFIG.TILE.SOURCE:
            case CONFIG.TILE.TARGET:
                basePorts = [true, true, true, true];   // Connected on all sides
                break;
            case CONFIG.TILE.GATE_NOT:
                // Base 0°: Input from LEFT(3), Output to RIGHT(1)
                basePorts = [false, true, false, true];
                break;
            case CONFIG.TILE.GATE_AND:
            case CONFIG.TILE.GATE_OR:
            case CONFIG.TILE.GATE_XOR:
                // Base 0°: Inputs from TOP(0) & BOTTOM(2), Output to RIGHT(1)
                basePorts = [true, true, true, false];
                break;
            default:
                return [false, false, false, false];
        }

        // Rotate ports clockwise by r steps
        const rotated = [false, false, false, false];
        for (let i = 0; i < 4; i++) {
            rotated[(i + r) % 4] = basePorts[i];
        }
        return rotated;
    }

    // Solve signal flow for entire grid
    static evaluateGrid(grid) {
        const rows = grid.length;
        const cols = grid[0].length;

        // Reset signal state on all tiles
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const tile = grid[r][c];
                tile.isPowered = false;
                tile.portSignals = [false, false, false, false]; // Active signal on each port [TOP, RIGHT, BOTTOM, LEFT]
            }
        }

        // BFS Queue for signal propagation
        // Queue items: { r, c, fromDir }
        const queue = [];

        // 1. Enqueue all SOURCE nodes
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c].type === CONFIG.TILE.SOURCE) {
                    grid[r][c].isPowered = true;
                    // Source powers all its 4 ports
                    grid[r][c].portSignals = [true, true, true, true];
                    for (let dir = 0; dir < 4; dir++) {
                        queue.push({ r, c, outDir: dir });
                    }
                }
            }
        }

        const visitedEdges = new Set();
        let passes = 0;
        const maxPasses = rows * cols * 8; // Prevent infinite loops

        while (queue.length > 0 && passes < maxPasses) {
            passes++;
            const { r, c, outDir } = queue.shift();
            const tile = grid[r][c];
            
            const offset = DIR_OFFSET[outDir];
            const nr = r + offset.y;
            const nc = c + offset.x;

            // Out of bounds check
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

            const nextTile = grid[nr][nc];
            const inDir = getOppositeDir(outDir);
            
            // Check if next tile has a matching port on inDir
            const nextPorts = this.getTilePorts(nextTile);
            if (!nextPorts[inDir]) continue;

            const edgeKey = `${r},${c}->${nr},${nc}:${outDir}`;
            if (visitedEdges.has(edgeKey)) continue;
            visitedEdges.add(edgeKey);

            // Mark receiving port active
            nextTile.portSignals[inDir] = true;
            nextTile.isPowered = true;

            // Now compute output propagation from nextTile based on type
            const nextRotation = (nextTile.rotation || 0) % 4;

            if (nextTile.type.startsWith('WIRE') || nextTile.type === CONFIG.TILE.TARGET) {
                // Standard wire passes signal to all its other open ports
                for (let d = 0; d < 4; d++) {
                    if (d !== inDir && nextPorts[d] && !nextTile.portSignals[d]) {
                        nextTile.portSignals[d] = true;
                        queue.push({ r: nr, c: nc, outDir: d });
                    }
                }
            } else if (nextTile.type.startsWith('GATE_')) {
                // Logic Gate Evaluation
                const outPortDir = (CONFIG.DIR.RIGHT + nextRotation) % 4;
                let shouldOutput = false;

                if (nextTile.type === CONFIG.TILE.GATE_NOT) {
                    const inputPortDir = (CONFIG.DIR.LEFT + nextRotation) % 4;
                    // NOT gate: active if input port signal is FALSE
                    shouldOutput = !nextTile.portSignals[inputPortDir];
                } else {
                    const inPort1 = (CONFIG.DIR.TOP + nextRotation) % 4;
                    const inPort2 = (CONFIG.DIR.BOTTOM + nextRotation) % 4;
                    const s1 = nextTile.portSignals[inPort1];
                    const s2 = nextTile.portSignals[inPort2];

                    if (nextTile.type === CONFIG.TILE.GATE_AND) {
                        shouldOutput = s1 && s2;
                    } else if (nextTile.type === CONFIG.TILE.GATE_OR) {
                        shouldOutput = s1 || s2;
                    } else if (nextTile.type === CONFIG.TILE.GATE_XOR) {
                        shouldOutput = (s1 || s2) && !(s1 && s2);
                    }
                }

                if (shouldOutput && !nextTile.portSignals[outPortDir]) {
                    nextTile.portSignals[outPortDir] = true;
                    queue.push({ r: nr, c: nc, outDir: outPortDir });
                }
            }
        }

        // Check Victory Condition: ALL Target tiles must be powered
        let allTargetsPowered = true;
        let targetCount = 0;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c].type === CONFIG.TILE.TARGET) {
                    targetCount++;
                    if (!grid[r][c].isPowered) {
                        allTargetsPowered = false;
                    }
                }
            }
        }

        return {
            isSolved: targetCount > 0 && allTargetsPowered,
            targetCount
        };
    }
}
