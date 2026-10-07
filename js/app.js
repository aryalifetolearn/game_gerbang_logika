/* ==========================================================================
   CYBER CIRCUIT: LOGIC HACK - STANDALONE BUNDLED GAME APPLICATION
   ========================================================================== */

// 1. CONFIGURATION & CONSTANTS
const CONFIG = {
    CANVAS_WIDTH: 900,
    CANVAS_HEIGHT: 600,
    GRID_COLS: 5,
    GRID_ROWS: 5,
    IDLE_TIMEOUT_MS: 45000,
    TIME_ATTACK_SECONDS: 120,
    STORAGE_KEY_LEADERBOARD: 'cyber_circuit_booth_scores_v1',
    MODE: { STORY: 'STORY', TIME_ATTACK: 'TIME_ATTACK' },
    DIR: { TOP: 0, RIGHT: 1, BOTTOM: 2, LEFT: 3 },
    TILE: {
        EMPTY: 'EMPTY',
        WIRE_STRAIGHT: 'WIRE_STRAIGHT',
        WIRE_CORNER: 'WIRE_CORNER',
        WIRE_T: 'WIRE_T',
        WIRE_CROSS: 'WIRE_CROSS',
        GATE_NOT: 'GATE_NOT',
        GATE_AND: 'GATE_AND',
        GATE_OR: 'GATE_OR',
        GATE_XOR: 'GATE_XOR',
        SOURCE: 'SOURCE',
        TARGET: 'TARGET',
        BLOCK: 'BLOCK'
    },
    COLORS: {
        BG_GRID: '#090e1d',
        GRID_LINE: '#1b253b',
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

function getOppositeDir(dir) {
    return (dir + 2) % 4;
}

const DIR_OFFSET = [
    { x: 0, y: -1 }, // TOP
    { x: 1, y: 0 },  // RIGHT
    { x: 0, y: 1 },  // BOTTOM
    { x: -1, y: 0 }  // LEFT
];

function drawRoundRectSafe(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        ctx.rect(x, y, width, height);
    }
}

// 2. WEB AUDIO SYNTHESIZER
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio API not supported.");
        }
    }

    ensureContext() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playRotate() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {}
    }

    playPowerConnect() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.06);
            osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
        } catch (e) {}
    }

    playVictory() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;
        try {
            const notes = [440, 554.37, 659.25, 880];
            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = this.ctx.currentTime + (index * 0.08);
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.15, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.25);
            });
        } catch (e) {}
    }

    playError() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        } catch (e) {}
    }

    playClick() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.04);
        } catch (e) {}
    }
}
const audio = new SoundEngine();

// 3. PARTICLE SYSTEM
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    spawnSparks(x, y, color = '#00f3ff', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: color,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }

    spawnPulseRing(x, y, color = '#00ff66') {
        this.particles.push({
            x, y,
            radius: 5,
            maxRadius: 50,
            color: color,
            alpha: 1,
            isRing: true,
            decay: 0.025
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.isRing) {
                p.radius += 2.5;
                p.alpha -= p.decay;
                if (p.alpha <= 0 || p.radius >= p.maxRadius) {
                    this.particles.splice(i, 1);
                }
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.alpha);
            if (p.isRing) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 3;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 12;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.fill();
            }
        }
        ctx.restore();
    }
}

// 4. LOGIC SOLVER
class LogicSolver {
    static getTilePorts(tile) {
        if (!tile) return [false, false, false, false];
        const r = (tile.rotation || 0) % 4;
        let basePorts = [false, false, false, false];

        switch (tile.type) {
            case CONFIG.TILE.WIRE_STRAIGHT: basePorts = [true, false, true, false]; break;
            case CONFIG.TILE.WIRE_CORNER:   basePorts = [true, true, false, false]; break;
            case CONFIG.TILE.WIRE_T:        basePorts = [true, true, true, false]; break;
            case CONFIG.TILE.WIRE_CROSS:    basePorts = [true, true, true, true]; break;
            case CONFIG.TILE.SOURCE:
            case CONFIG.TILE.TARGET:        basePorts = [true, true, true, true]; break;
            case CONFIG.TILE.GATE_NOT:      basePorts = [false, true, false, true]; break;
            case CONFIG.TILE.GATE_AND:
            case CONFIG.TILE.GATE_OR:
            case CONFIG.TILE.GATE_XOR:      basePorts = [true, true, true, false]; break;
            default: return [false, false, false, false];
        }

        const rotated = [false, false, false, false];
        for (let i = 0; i < 4; i++) {
            rotated[(i + r) % 4] = basePorts[i];
        }
        return rotated;
    }

    static evaluateGrid(grid) {
        if (!grid || grid.length === 0) return { isSolved: false, targetCount: 0 };
        const rows = grid.length;
        const cols = grid[0].length;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r] && grid[r][c]) {
                    grid[r][c].isPowered = false;
                    grid[r][c].portSignals = [false, false, false, false];
                }
            }
        }

        const queue = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r] && grid[r][c] && grid[r][c].type === CONFIG.TILE.SOURCE) {
                    grid[r][c].isPowered = true;
                    grid[r][c].portSignals = [true, true, true, true];
                    for (let dir = 0; dir < 4; dir++) {
                        queue.push({ r, c, outDir: dir });
                    }
                }
            }
        }

        const visitedEdges = new Set();
        let passes = 0;
        const maxPasses = rows * cols * 8;

        while (queue.length > 0 && passes < maxPasses) {
            passes++;
            const { r, c, outDir } = queue.shift();
            const offset = DIR_OFFSET[outDir];
            const nr = r + offset.y;
            const nc = c + offset.x;

            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (!grid[nr] || !grid[nr][nc]) continue;

            const nextTile = grid[nr][nc];
            const inDir = getOppositeDir(outDir);
            const nextPorts = this.getTilePorts(nextTile);

            if (!nextPorts[inDir]) continue;

            const edgeKey = `${r},${c}->${nr},${nc}:${outDir}`;
            if (visitedEdges.has(edgeKey)) continue;
            visitedEdges.add(edgeKey);

            nextTile.portSignals[inDir] = true;
            nextTile.isPowered = true;

            const nextRotation = (nextTile.rotation || 0) % 4;

            if (nextTile.type.startsWith('WIRE') || nextTile.type === CONFIG.TILE.TARGET) {
                for (let d = 0; d < 4; d++) {
                    if (d !== inDir && nextPorts[d] && !nextTile.portSignals[d]) {
                        nextTile.portSignals[d] = true;
                        queue.push({ r: nr, c: nc, outDir: d });
                    }
                }
            } else if (nextTile.type.startsWith('GATE_')) {
                const outPortDir = (CONFIG.DIR.RIGHT + nextRotation) % 4;
                let shouldOutput = false;

                if (nextTile.type === CONFIG.TILE.GATE_NOT) {
                    const inputPortDir = (CONFIG.DIR.LEFT + nextRotation) % 4;
                    shouldOutput = !nextTile.portSignals[inputPortDir];
                } else {
                    const inPort1 = (CONFIG.DIR.TOP + nextRotation) % 4;
                    const inPort2 = (CONFIG.DIR.BOTTOM + nextRotation) % 4;
                    const s1 = nextTile.portSignals[inPort1];
                    const s2 = nextTile.portSignals[inPort2];

                    if (nextTile.type === CONFIG.TILE.GATE_AND) shouldOutput = s1 && s2;
                    else if (nextTile.type === CONFIG.TILE.GATE_OR) shouldOutput = s1 || s2;
                    else if (nextTile.type === CONFIG.TILE.GATE_XOR) shouldOutput = (s1 || s2) && !(s1 && s2);
                }

                if (shouldOutput && !nextTile.portSignals[outPortDir]) {
                    nextTile.portSignals[outPortDir] = true;
                    queue.push({ r: nr, c: nc, outDir: outPortDir });
                }
            }
        }

        let allTargetsPowered = true;
        let targetCount = 0;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r] && grid[r][c] && grid[r][c].type === CONFIG.TILE.TARGET) {
                    targetCount++;
                    if (!grid[r][c].isPowered) allTargetsPowered = false;
                }
            }
        }

        return { isSolved: targetCount > 0 && allTargetsPowered, targetCount };
    }
}

// 5. GRID MANAGER
class GridManager {
    constructor(canvas, particleSystem) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = particleSystem;

        this.grid = [];
        this.cols = CONFIG.GRID_COLS;
        this.rows = CONFIG.GRID_ROWS;
        this.cellSize = 90;
        this.offsetX = 0;
        this.offsetY = 0;
        this.hoverCol = -1;
        this.hoverRow = -1;
        this.animTime = 0;
        this.onTileRotateCallback = null;

        this.calculateOffsets();
        this.setupInputListeners();
    }

    setGrid(gridData) {
        this.grid = gridData;
        this.rows = gridData.length;
        this.cols = gridData[0].length;
        this.calculateOffsets();
    }

    calculateOffsets() {
        const w = this.canvas ? this.canvas.width : 900;
        const h = this.canvas ? this.canvas.height : 600;
        const cols = this.cols || 5;
        const rows = this.rows || 5;
        const padding = 20;

        const availW = Math.max(100, w - padding * 2);
        const availH = Math.max(100, h - padding * 2);

        this.cellSize = Math.floor(Math.min(availW / cols, availH / rows));
        this.offsetX = Math.floor((w - (cols * this.cellSize)) / 2);
        this.offsetY = Math.floor((h - (rows * this.cellSize)) / 2);
    }

    getCanvasCoords(e) {
        if (!this.canvas) return { r: -1, c: -1 };
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        const c = Math.floor((x - this.offsetX) / this.cellSize);
        const r = Math.floor((y - this.offsetY) / this.cellSize);

        return { r, c };
    }

    setupInputListeners() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousemove', (e) => {
            const { r, c } = this.getCanvasCoords(e);
            if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
                this.hoverCol = c;
                this.hoverRow = r;
            } else {
                this.hoverCol = -1;
                this.hoverRow = -1;
            }
        });

        this.canvas.addEventListener('click', (e) => {
            const { r, c } = this.getCanvasCoords(e);
            if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
                this.rotateTile(r, c);
            }
        });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const { r, c } = this.getCanvasCoords(e);
            if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
                this.rotateTile(r, c);
            }
        }, { passive: false });
    }

    rotateTile(r, c) {
        if (!this.grid || !this.grid[r] || !this.grid[r][c]) return;
        const tile = this.grid[r][c];
        if (tile.type === CONFIG.TILE.EMPTY || tile.type === CONFIG.TILE.BLOCK || tile.isFixed) return;

        tile.rotation = (tile.rotation + 1) % 4;
        const centerX = this.offsetX + c * this.cellSize + this.cellSize / 2;
        const centerY = this.offsetY + r * this.cellSize + this.cellSize / 2;
        this.particles.spawnSparks(centerX, centerY, CONFIG.COLORS.WIRE_ON, 10);

        if (this.onTileRotateCallback) {
            this.onTileRotateCallback(r, c);
        }
    }

    update(dt) {
        this.animTime += dt;
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.fillStyle = CONFIG.COLORS.BG_GRID;
        ctx.fillRect(this.offsetX, this.offsetY, this.cols * this.cellSize, this.rows * this.cellSize);

        ctx.strokeStyle = CONFIG.COLORS.WIRE_ON;
        ctx.lineWidth = 3;
        ctx.shadowColor = CONFIG.COLORS.WIRE_ON;
        ctx.shadowBlur = 10;
        ctx.strokeRect(this.offsetX, this.offsetY, this.cols * this.cellSize, this.rows * this.cellSize);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        ctx.lineWidth = 1;
        for (let c = 0; c <= this.cols; c++) {
            const x = this.offsetX + c * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(x, this.offsetY);
            ctx.lineTo(x, this.offsetY + this.rows * this.cellSize);
            ctx.stroke();
        }
        for (let r = 0; r <= this.rows; r++) {
            const y = this.offsetY + r * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(this.offsetX, y);
            ctx.lineTo(this.offsetX + this.cols * this.cellSize, y);
            ctx.stroke();
        }

        if (this.grid && this.grid.length > 0) {
            for (let r = 0; r < this.rows; r++) {
                if (!this.grid[r]) continue;
                for (let c = 0; c < this.cols; c++) {
                    if (this.grid[r][c]) {
                        this.drawTile(r, c, this.grid[r][c]);
                    }
                }
            }
        }

        if (this.hoverCol >= 0 && this.hoverRow >= 0 && this.grid && this.grid[this.hoverRow] && this.grid[this.hoverRow][this.hoverCol]) {
            const tile = this.grid[this.hoverRow][this.hoverCol];
            if (tile.type !== CONFIG.TILE.EMPTY && tile.type !== CONFIG.TILE.BLOCK && !tile.isFixed) {
                const x = this.offsetX + this.hoverCol * this.cellSize;
                const y = this.offsetY + this.hoverRow * this.cellSize;
                ctx.strokeStyle = CONFIG.COLORS.WIRE_ON;
                ctx.lineWidth = 3;
                ctx.shadowColor = CONFIG.COLORS.WIRE_ON;
                ctx.shadowBlur = 12;
                ctx.strokeRect(x + 3, y + 3, this.cellSize - 6, this.cellSize - 6);
            }
        }

        ctx.restore();
    }

    drawTile(r, c, tile) {
        if (!tile || tile.type === CONFIG.TILE.EMPTY) return;

        const ctx = this.ctx;
        const cx = this.offsetX + c * this.cellSize + this.cellSize / 2;
        const cy = this.offsetY + r * this.cellSize + this.cellSize / 2;
        const size = this.cellSize;
        const ports = LogicSolver.getTilePorts(tile);

        ctx.save();
        ctx.translate(cx, cy);

        if (tile.type.startsWith('GATE_') || tile.type === CONFIG.TILE.SOURCE || tile.type === CONFIG.TILE.TARGET) {
            ctx.fillStyle = 'rgba(12, 18, 36, 0.95)';
            ctx.strokeStyle = tile.isPowered ? CONFIG.COLORS.WIRE_ON : CONFIG.COLORS.WIRE_OFF;
            ctx.lineWidth = 2;
            ctx.beginPath();
            drawRoundRectSafe(ctx, -size * 0.42, -size * 0.42, size * 0.84, size * 0.84, 8);
            ctx.fill();
            ctx.stroke();
        }

        for (let dir = 0; dir < 4; dir++) {
            if (!ports[dir]) continue;
            const isPortActive = tile.portSignals && tile.portSignals[dir];
            ctx.strokeStyle = isPortActive ? CONFIG.COLORS.WIRE_ON : CONFIG.COLORS.WIRE_OFF;
            ctx.lineWidth = isPortActive ? Math.max(6, Math.floor(size / 12)) : Math.max(4, Math.floor(size / 16));

            if (isPortActive) {
                ctx.shadowColor = CONFIG.COLORS.WIRE_ON;
                ctx.shadowBlur = 12;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.moveTo(0, 0);
            switch (dir) {
                case CONFIG.DIR.TOP:    ctx.lineTo(0, -size / 2); break;
                case CONFIG.DIR.RIGHT:  ctx.lineTo(size / 2, 0); break;
                case CONFIG.DIR.BOTTOM: ctx.lineTo(0, size / 2); break;
                case CONFIG.DIR.LEFT:   ctx.lineTo(-size / 2, 0); break;
            }
            ctx.stroke();
        }

        if (tile.type.startsWith('WIRE_')) {
            ctx.fillStyle = tile.isPowered ? CONFIG.COLORS.WIRE_ON : CONFIG.COLORS.WIRE_OFF;
            ctx.beginPath();
            ctx.arc(0, 0, tile.isPowered ? Math.max(4, Math.floor(size / 10)) : Math.max(3, Math.floor(size / 14)), 0, Math.PI * 2);
            ctx.fill();
        }

        const fontSize = Math.max(16, Math.floor(size * 0.3));
        if (tile.type === CONFIG.TILE.SOURCE) {
            ctx.fillStyle = CONFIG.COLORS.SOURCE_ON;
            ctx.shadowColor = CONFIG.COLORS.SOURCE_ON;
            ctx.shadowBlur = 16;
            ctx.font = `900 ${fontSize}px Orbitron, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', 0, 0);
        } else if (tile.type === CONFIG.TILE.TARGET) {
            ctx.fillStyle = tile.isPowered ? CONFIG.COLORS.TARGET_ON : CONFIG.COLORS.TARGET_OFF;
            ctx.shadowColor = tile.isPowered ? CONFIG.COLORS.TARGET_ON : 'transparent';
            ctx.shadowBlur = tile.isPowered ? 18 : 0;
            ctx.font = `900 ${fontSize}px Orbitron, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💾', 0, 0);
        } else if (tile.type.startsWith('GATE_')) {
            const gateName = tile.type.replace('GATE_', '');
            ctx.fillStyle = CONFIG.COLORS[`GATE_${gateName}`] || CONFIG.COLORS.WIRE_ON;
            ctx.font = `bold ${Math.max(12, Math.floor(size * 0.22))}px Orbitron, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(gateName, 0, 0);
        }

        ctx.restore();
    }
}

// 6. PUZZLE LEVELS (PROPERLY SCRAMBLED 5x5 BOARD FOR ALL STAGES)
const LEVELS = [
    {
        id: 1, title: "LEVEL 01: INISIASI SIRKUIT CORE",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_T, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.WIRE_T, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 3 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 3 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ]
        ]
    },
    {
        id: 2, title: "LEVEL 02: DUAL CORE ROUTING",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_T, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_T, rotation: 3 }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.WIRE_T, rotation: 2 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 3 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ]
        ]
    },
    {
        id: 3, title: "LEVEL 03: LOGIC GATE - NOT INVERTER",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_NOT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 0 }, { type: CONFIG.TILE.WIRE_T, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ]
        ]
    },
    {
        id: 4, title: "LEVEL 04: LOGIC GATE - AND CONVERGENCE",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_AND, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ]
        ]
    },
    {
        id: 5, title: "LEVEL 05: LOGIC GATE - OR PASS",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_OR, rotation: 3 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 3 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ]
        ]
    },
    {
        id: 6, title: "LEVEL 06: LOGIC GATE - XOR BALANCER",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_T, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_XOR, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 3 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ]
        ]
    },
    {
        id: 7, title: "LEVEL 07: SERVER MATRIX ALPHA",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_NOT, rotation: 1 }, { type: CONFIG.TILE.WIRE_T, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_T, rotation: 3 }, { type: CONFIG.TILE.GATE_AND, rotation: 2 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true } ]
        ]
    },
    {
        id: 8, title: "LEVEL 08: SERVER MATRIX BETA",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_OR, rotation: 3 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_T, rotation: 1 }, { type: CONFIG.TILE.GATE_XOR, rotation: 2 }, { type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 } ],
            [ { type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ]
        ]
    },
    {
        id: 9, title: "LEVEL 09: MAINFRAME HACK",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, isFixed: true, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.TARGET, isFixed: true, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_NOT, rotation: 3 }, { type: CONFIG.TILE.WIRE_T, rotation: 1 }, { type: CONFIG.TILE.GATE_AND, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.WIRE_T, rotation: 3 }, { type: CONFIG.TILE.GATE_OR, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.TARGET, isFixed: true, rotation: 0 } ],
            [ { type: CONFIG.TILE.SOURCE, isFixed: true, rotation: 0 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_XOR, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 } ]
        ]
    },
    {
        id: 10, title: "LEVEL 10: ULTIMATE CORE OVERRIDE",
        grid: [
            [ { type: CONFIG.TILE.SOURCE, isFixed: true, rotation: 0 }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.GATE_AND, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.TARGET, isFixed: true, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.GATE_NOT, rotation: 0 }, { type: CONFIG.TILE.WIRE_T, rotation: 3 }, { type: CONFIG.TILE.GATE_XOR, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 } ],
            [ { type: CONFIG.TILE.WIRE_T, rotation: 0 }, { type: CONFIG.TILE.GATE_OR, rotation: 2 }, { type: CONFIG.TILE.WIRE_CROSS, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.TARGET, isFixed: true, rotation: 0 } ],
            [ { type: CONFIG.TILE.SOURCE, isFixed: true, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 }, { type: CONFIG.TILE.GATE_NOT, rotation: 2 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 } ],
            [ { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 0 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 1 }, { type: CONFIG.TILE.WIRE_STRAIGHT, rotation: 1 }, { type: CONFIG.TILE.WIRE_CORNER, rotation: 2 } ]
        ]
    }
];

function generateRandomLevel(size = 5) {
    const tileTypes = [
        CONFIG.TILE.WIRE_STRAIGHT, CONFIG.TILE.WIRE_CORNER, CONFIG.TILE.WIRE_T, CONFIG.TILE.WIRE_CROSS,
        CONFIG.TILE.GATE_NOT, CONFIG.TILE.GATE_AND, CONFIG.TILE.GATE_OR, CONFIG.TILE.GATE_XOR
    ];

    const grid = [];
    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) {
            if (r === 0 && c === 0) row.push({ type: CONFIG.TILE.SOURCE, rotation: 0, isFixed: true });
            else if (r === size - 1 && c === size - 1) row.push({ type: CONFIG.TILE.TARGET, rotation: 0, isFixed: true });
            else {
                const randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
                const randomRot = Math.floor(Math.random() * 4);
                row.push({ type: randomType, rotation: randomRot });
            }
        }
        grid.push(row);
    }

    return { id: 'RUSH_' + Math.floor(Math.random() * 1000), title: `PROCEDURAL CIRCUIT (${size}x${size})`, grid };
}

// 7. LEADERBOARD MANAGER (WITH CUMULATIVE SCORE & FASTEST CLEARANCE TIME)
class LeaderboardManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEY_LEADERBOARD;
        this.initDefaultsIfEmpty();
    }

    initDefaultsIfEmpty() {
        if (!localStorage.getItem(this.storageKey)) {
            const defaultScores = [
                { name: 'PANITIA_01', mode: 'STORY', level: 10, score: 18500, totalTime: 185, date: '2026-10-07' },
                { name: 'MAHASISWA_X', mode: 'TIME_ATTACK', level: 8, score: 14200, totalTime: 120, date: '2026-10-07' },
                { name: 'CYBER_GUEST', mode: 'STORY', level: 5, score: 7800, totalTime: 145, date: '2026-10-07' },
                { name: 'HACKER_88', mode: 'TIME_ATTACK', level: 4, score: 5500, totalTime: 120, date: '2026-10-07' },
                { name: 'VISITOR_01', mode: 'STORY', level: 3, score: 3100, date: '2026-10-07' }
            ];
            this.saveScores(defaultScores);
        }
    }

    getScores() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    saveScores(scores) {
        try { localStorage.setItem(this.storageKey, JSON.stringify(scores)); } catch (e) {}
    }

    addEntry(name, mode, level, score, totalTime = 0) {
        const cleanName = (name || 'ANONYMOUS').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
        let scores = this.getScores();

        const existingIdx = scores.findIndex(s => s.name === cleanName && s.mode === mode);
        const newEntry = {
            name: cleanName || 'HACKER',
            mode: mode,
            level: Math.max(1, level),
            score: Math.floor(score),
            totalTime: Math.floor(totalTime),
            date: new Date().toISOString().split('T')[0]
        };

        if (existingIdx >= 0) {
            const existing = scores[existingIdx];
            if (newEntry.level > existing.level || 
               (newEntry.level === existing.level && newEntry.score > existing.score) ||
               (newEntry.level === existing.level && newEntry.score === existing.score && newEntry.totalTime < existing.totalTime)) {
                scores[existingIdx] = newEntry;
            }
        } else {
            scores.push(newEntry);
        }

        // Sorting: 1. Higher Level -> 2. Higher Cumulative Score -> 3. Faster Total Time (lower is better!)
        scores.sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            if (b.score !== a.score) return b.score - a.score;
            return (a.totalTime || 9999) - (b.totalTime || 9999);
        });

        const trimmed = scores.slice(0, 20);
        this.saveScores(trimmed);
        return trimmed;
    }

    renderTable(tableBodyEl) {
        if (!tableBodyEl) return;
        const scores = this.getScores();
        tableBodyEl.innerHTML = '';
        if (scores.length === 0) {
            tableBodyEl.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-dim);">Belum ada data skor di booth pameran.</td></tr>`;
            return;
        }

        const formatMMSS = (sec) => {
            const m = Math.floor(Math.max(0, sec) / 60);
            const s = Math.max(0, sec) % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };

        scores.forEach((entry, index) => {
            const tr = document.createElement('tr');
            const rankBadge = index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`;
            const timeFormatted = formatMMSS(entry.totalTime || 0);
            const levelLabel = entry.level >= 10 ? 'LVL 10 (FULL)' : `LVL ${entry.level}`;

            tr.innerHTML = `
                <td><strong style="color: ${index < 3 ? 'var(--yellow)' : 'var(--cyan)'};">${rankBadge}</strong></td>
                <td><strong>${entry.name}</strong></td>
                <td><span style="color: ${entry.mode === 'STORY' ? 'var(--cyan)' : 'var(--magenta)'}">${entry.mode}</span></td>
                <td><span style="color: var(--yellow);">${levelLabel}</span></td>
                <td><strong style="color: var(--cyan);">${timeFormatted}</strong></td>
                <td><strong style="color: var(--green);">${entry.score.toLocaleString()} PTS</strong></td>
            `;
            tableBodyEl.appendChild(tr);
        });
    }

    clearLeaderboard() {
        localStorage.removeItem(this.storageKey);
        this.initDefaultsIfEmpty();
    }
}
const leaderboard = new LeaderboardManager();

// 8. ATTRACT MODE MANAGER
class AttractModeManager {
    constructor(overlayEl, gridManager) {
        this.overlayEl = overlayEl;
        this.gridManager = gridManager;
        this.idleTimer = null;
        this.isAttractActive = false;
        this.autoRotateInterval = null;

        this.setupActivityListeners();
        this.resetIdleTimer();
    }

    setupActivityListeners() {
        const events = ['mousemove', 'mousedown', 'click', 'keydown', 'touchstart'];
        events.forEach(evt => {
            window.addEventListener(evt, () => this.onUserActivity(), { passive: true });
        });
    }

    onUserActivity() {
        if (this.isAttractActive) this.stopAttractMode();
        this.resetIdleTimer();
    }

    resetIdleTimer() {
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.startAttractMode(), CONFIG.IDLE_TIMEOUT_MS);
    }

    startAttractMode() {
        if (!this.overlayEl) return;
        this.isAttractActive = true;
        this.overlayEl.classList.remove('hidden');
        clearInterval(this.autoRotateInterval);
        this.autoRotateInterval = setInterval(() => {
            if (!this.gridManager || !this.gridManager.grid || this.gridManager.grid.length === 0) return;
            const r = Math.floor(Math.random() * this.gridManager.rows);
            const c = Math.floor(Math.random() * this.gridManager.cols);
            this.gridManager.rotateTile(r, c);
        }, 2000);
    }

    stopAttractMode() {
        this.isAttractActive = false;
        if (this.overlayEl) this.overlayEl.classList.add('hidden');
        clearInterval(this.autoRotateInterval);
    }
}

// 9. MAIN GAME CLASS
class CyberCircuitGame {
    constructor() {
        this.playerNickname = 'HACKER_01';
        this.pendingStartMode = CONFIG.MODE.STORY;
        this.currentMode = CONFIG.MODE.STORY;
        this.currentLevelIndex = 0;
        this.score = 0;
        this.sessionTotalTime = 0; // Total seconds spent across all cleared levels in current session
        this.moveCount = 0;
        this.timeRemaining = CONFIG.TIME_ATTACK_SECONDS;
        this.timerInterval = null;
        this.isPlaying = false;
        this.lastTime = performance.now();

        this.particles = new ParticleSystem();
        this.canvas = document.getElementById('game-canvas');
        this.gridManager = new GridManager(this.canvas, this.particles);
        this.gridManager.onTileRotateCallback = (r, c) => this.onTileRotated(r, c);

        this.attractMode = new AttractModeManager(document.getElementById('attract-overlay'), this.gridManager);

        this.initUI();
        this.initEventListeners();
        
        // Initial load of Level 1 preview board so canvas is NEVER blank on load
        this.loadCurrentLevel(false); 
        this.isPlaying = false; // Stay on menu until user clicks start

        this.startLoop();

        window.addEventListener('resize', () => {
            if (this.gridManager) this.gridManager.calculateOffsets();
        });
    }

    initUI() {
        leaderboard.renderTable(document.getElementById('leaderboard-body'));
        this.updateHUD();
    }

    initEventListeners() {
        const btnSound = document.getElementById('btn-sound');
        if (btnSound) {
            btnSound.addEventListener('click', () => {
                const isMuted = audio.toggleMute();
                document.getElementById('sound-status').innerText = isMuted ? 'OFF' : 'ON';
                audio.playClick();
            });
        }

        const btnFS = document.getElementById('btn-fullscreen');
        if (btnFS) {
            btnFS.addEventListener('click', () => {
                audio.playClick();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => console.log(err));
                } else {
                    document.exitFullscreen().catch(err => console.log(err));
                }
            });
        }

        // Open Nickname Registration Modal before starting game
        document.getElementById('btn-start-story').addEventListener('click', () => {
            audio.playClick();
            this.promptNickname(CONFIG.MODE.STORY);
        });

        document.getElementById('btn-start-rush').addEventListener('click', () => {
            audio.playClick();
            this.promptNickname(CONFIG.MODE.TIME_ATTACK);
        });

        // Confirm & Start button in Nickname Modal
        const btnConfirm = document.getElementById('btn-confirm-start');
        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                audio.playClick();
                this.confirmNicknameAndStart();
            });
        }

        const btnCancelNick = document.getElementById('btn-cancel-nickname');
        if (btnCancelNick) {
            btnCancelNick.addEventListener('click', () => {
                audio.playClick();
                this.hideModal('modal-nickname');
            });
        }

        const inputNick = document.getElementById('input-hacker-name');
        if (inputNick) {
            inputNick.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    audio.playClick();
                    this.confirmNicknameAndStart();
                }
            });
        }

        document.getElementById('btn-show-leaderboard').addEventListener('click', () => {
            audio.playClick();
            leaderboard.renderTable(document.getElementById('leaderboard-body'));
            this.showModal('modal-leaderboard');
        });

        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            audio.playClick();
            this.showModal('modal-howto');
        });

        document.getElementById('btn-close-howto').addEventListener('click', () => {
            audio.playClick();
            this.hideModal('modal-howto');
        });

        document.getElementById('btn-close-leaderboard').addEventListener('click', () => {
            audio.playClick();
            this.hideModal('modal-leaderboard');
        });

        document.getElementById('btn-clear-leaderboard').addEventListener('click', () => {
            if (confirm("Reset seluruh data Leaderboard Booth Pameran?")) {
                leaderboard.clearLeaderboard();
                leaderboard.renderTable(document.getElementById('leaderboard-body'));
            }
        });

        document.getElementById('btn-reset-level').addEventListener('click', () => {
            audio.playClick();
            this.loadCurrentLevel(true);
        });

        document.getElementById('btn-hint').addEventListener('click', () => {
            audio.playClick();
            alert("💡 PETUNJUK: Perhatikan arah gerbang NOT (membalikkan sinyal) dan pastikan jalur sirkuit dari ⚡ terhubung langsung ke 💾!");
        });

        document.getElementById('btn-main-menu').addEventListener('click', () => {
            audio.playClick();
            this.stopTimer();
            this.isPlaying = false;
            this.showModal('modal-menu');
        });

        document.getElementById('btn-next-level').addEventListener('click', () => {
            audio.playClick();
            this.hideModal('modal-victory');
            if (this.currentMode === CONFIG.MODE.STORY) {
                if (this.currentLevelIndex + 1 < LEVELS.length) {
                    this.currentLevelIndex++;
                    this.loadCurrentLevel(true);
                } else {
                    alert("🎉 SELAMAT! Kamu telah meretas seluruh 10 Level Story!");
                    this.triggerGameOver("Selamat! Seluruh 10 Stage Terretas!");
                }
            } else {
                this.currentLevelIndex++;
                this.loadCurrentLevel(true);
            }
        });

        document.getElementById('btn-save-score').addEventListener('click', () => {
            const nameInput = document.getElementById('player-name').value || this.playerNickname;
            leaderboard.addEntry(nameInput, this.currentMode, this.currentLevelIndex + 1, this.score, this.sessionTotalTime);
            alert("✅ Skor berhasil disimpan di Leaderboard Booth!");
            document.getElementById('btn-save-score').disabled = true;
        });

        document.getElementById('btn-retry').addEventListener('click', () => {
            audio.playClick();
            this.hideModal('modal-gameover');
            if (this.currentMode === CONFIG.MODE.STORY) {
                this.startStoryMode();
            } else {
                this.startTimeAttackMode();
            }
        });

        document.getElementById('btn-go-menu').addEventListener('click', () => {
            audio.playClick();
            this.hideModal('modal-gameover');
            this.showModal('modal-menu');
        });
    }

    promptNickname(mode) {
        this.pendingStartMode = mode;
        const inputNick = document.getElementById('input-hacker-name');
        if (inputNick) {
            inputNick.value = this.playerNickname !== 'GUEST' ? this.playerNickname : '';
        }
        this.showModal('modal-nickname');
        setTimeout(() => {
            if (inputNick) inputNick.focus();
        }, 100);
    }

    confirmNicknameAndStart() {
        const inputNick = document.getElementById('input-hacker-name');
        let rawName = inputNick ? inputNick.value : '';
        let cleanName = rawName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');

        if (!cleanName) cleanName = 'HACKER_' + Math.floor(10 + Math.random() * 90);

        this.playerNickname = cleanName;
        this.updateHUD();

        this.hideModal('modal-nickname');

        if (this.pendingStartMode === CONFIG.MODE.STORY) {
            this.startStoryMode();
        } else {
            this.startTimeAttackMode();
        }
    }

    startStoryMode() {
        this.currentMode = CONFIG.MODE.STORY;
        this.currentLevelIndex = 0;
        this.score = 0;
        this.sessionTotalTime = 0;
        this.hideAllModals();
        this.loadCurrentLevel(true);
    }

    startTimeAttackMode() {
        this.currentMode = CONFIG.MODE.TIME_ATTACK;
        this.currentLevelIndex = 0;
        this.score = 0;
        this.sessionTotalTime = 0;
        this.timeRemaining = CONFIG.TIME_ATTACK_SECONDS;
        this.hideAllModals();
        this.startTimer();
        this.loadCurrentLevel(true);
    }

    loadCurrentLevel(startTimerIfStory = true) {
        let levelData;
        if (this.currentMode === CONFIG.MODE.STORY) {
            levelData = LEVELS[this.currentLevelIndex] || LEVELS[0];
        } else {
            levelData = generateRandomLevel(5);
        }

        const clonedGrid = levelData.grid.map(row => row.map(tile => ({ ...tile })));
        this.gridManager.setGrid(clonedGrid);
        this.moveCount = 0;
        this.isPlaying = true;

        // Auto Scrambler: Ensure board is NOT pre-solved on initial level load!
        let evalRes = LogicSolver.evaluateGrid(this.gridManager.grid);
        let attempts = 0;
        while (evalRes.isSolved && attempts < 30) {
            attempts++;
            for (let r = 0; r < clonedGrid.length; r++) {
                for (let c = 0; c < clonedGrid[0].length; c++) {
                    const t = clonedGrid[r][c];
                    if (!t.isFixed && t.type !== CONFIG.TILE.EMPTY) {
                        t.rotation = (t.rotation + 1) % 4;
                    }
                }
            }
            evalRes = LogicSolver.evaluateGrid(this.gridManager.grid);
        }

        if (this.currentMode === CONFIG.MODE.STORY) {
            this.timeRemaining = 180;
            if (startTimerIfStory) this.startTimer();
        }

        this.updateHUD();
    }

    onTileRotated(r, c) {
        if (!this.isPlaying) return;
        this.moveCount++;
        audio.playRotate();
        this.evaluateCircuit();
        this.updateHUD();
    }

    evaluateCircuit() {
        // Require at least 1 move before declaring victory to prevent level auto-skipping
        if (this.moveCount === 0) return;

        const result = LogicSolver.evaluateGrid(this.gridManager.grid);
        if (result.isSolved && this.isPlaying) {
            this.onLevelSolved();
        }
    }

    onLevelSolved() {
        this.isPlaying = false;
        this.stopTimer();

        audio.playVictory();
        audio.playPowerConnect();

        this.particles.spawnPulseRing(this.canvas.width / 2, this.canvas.height / 2, CONFIG.COLORS.TARGET_ON);

        const levelTimeTaken = Math.max(1, 180 - this.timeRemaining);
        this.sessionTotalTime += levelTimeTaken;

        const timeBonus = this.timeRemaining * 10;
        const movePenalty = this.moveCount * 5;
        const levelBonus = (this.currentLevelIndex + 1) * 500;
        const gainedScore = Math.max(100, levelBonus + timeBonus - movePenalty);

        this.score += gainedScore;

        // Auto-save cumulative score and total time to Leaderboard
        leaderboard.addEntry(this.playerNickname, this.currentMode, this.currentLevelIndex + 1, this.score, this.sessionTotalTime);
        leaderboard.renderTable(document.getElementById('leaderboard-body'));

        document.getElementById('vic-time').innerText = this.formatTime(levelTimeTaken);
        document.getElementById('vic-moves').innerText = this.moveCount;
        document.getElementById('vic-score').innerText = `+${gainedScore}`;

        this.updateHUD();

        setTimeout(() => {
            this.showModal('modal-victory');
        }, 500);
    }

    triggerGameOver(reason = "Waktu meretas telah habis!") {
        this.isPlaying = false;
        this.stopTimer();
        audio.playError();

        if (this.currentMode === CONFIG.MODE.STORY) {
            const levelTimeTaken = Math.max(1, 180 - this.timeRemaining);
            this.sessionTotalTime += levelTimeTaken;
        } else {
            this.sessionTotalTime = CONFIG.TIME_ATTACK_SECONDS;
        }

        // Auto-save final cumulative score and total time to Leaderboard
        leaderboard.addEntry(this.playerNickname, this.currentMode, this.currentLevelIndex + 1, this.score, this.sessionTotalTime);
        leaderboard.renderTable(document.getElementById('leaderboard-body'));

        document.getElementById('gameover-reason').innerText = reason;
        document.getElementById('go-score').innerText = this.score;
        document.getElementById('btn-save-score').disabled = true;

        this.showModal('modal-gameover');
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateHUD();
            if (this.timeRemaining <= 0) {
                this.triggerGameOver("Waktu Meretas Telah Habis!");
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateHUD() {
        const elName = document.getElementById('hud-player-name');
        if (elName) elName.innerText = this.playerNickname;

        const elMode = document.getElementById('hud-mode');
        if (elMode) elMode.innerText = this.currentMode;

        const elLvl = document.getElementById('hud-level');
        if (elLvl) elLvl.innerText = `${String(this.currentLevelIndex + 1).padStart(2, '0')} / ${LEVELS.length}`;

        const elTimer = document.getElementById('hud-timer');
        if (elTimer) elTimer.innerText = this.formatTime(this.timeRemaining);

        const elTotalTime = document.getElementById('hud-total-time');
        if (elTotalTime) elTotalTime.innerText = this.formatTime(this.sessionTotalTime);

        const elScore = document.getElementById('hud-score');
        if (elScore) elScore.innerText = String(this.score).padStart(5, '0');

        const elMoves = document.getElementById('hud-moves');
        if (elMoves) elMoves.innerText = this.moveCount;
    }

    formatTime(sec) {
        const m = Math.floor(Math.max(0, sec) / 60);
        const s = Math.max(0, sec) % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    showModal(modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.remove('hidden');
    }

    hideModal(modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.add('hidden');
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(m => m.classList.add('hidden'));
        const attractOverlay = document.getElementById('attract-overlay');
        if (attractOverlay) attractOverlay.classList.add('hidden');
        if (this.attractMode) this.attractMode.stopAttractMode();
    }

    startLoop() {
        const loop = (now) => {
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;

            if (this.gridManager) {
                this.gridManager.update(dt);
                this.gridManager.render();
                if (this.particles && this.gridManager.ctx) {
                    this.particles.update();
                    this.particles.draw(this.gridManager.ctx);
                }
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

// Start Game on DOM Content Loaded
window.addEventListener('DOMContentLoaded', () => {
    window.game = new CyberCircuitGame();
});
