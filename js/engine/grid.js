/* ==========================================================================
   CYBER CIRCUIT: LOGIC HACK - GRID & CANVAS RENDERING ENGINE
   Handles board rendering, tile rotation, neon wire effects, & gate icons.
   ========================================================================== */

import { CONFIG } from '../config.js';
import { LogicSolver } from './logicSolver.js';

export class GridManager {
    constructor(canvas, particleSystem) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = particleSystem;

        this.grid = [];
        this.cols = CONFIG.GRID_COLS;
        this.rows = CONFIG.GRID_ROWS;
        this.cellSize = CONFIG.CELL_SIZE;

        this.offsetX = 0;
        this.offsetY = 0;

        this.hoverCol = -1;
        this.hoverRow = -1;

        this.animTime = 0;
        this.onTileRotateCallback = null;

        this.setupInputListeners();
    }

    setGrid(gridData) {
        this.grid = gridData;
        this.rows = gridData.length;
        this.cols = gridData[0].length;
        this.calculateOffsets();
    }

    calculateOffsets() {
        this.cellSize = Math.min(
            Math.floor((this.canvas.width - 40) / this.cols),
            Math.floor((this.canvas.height - 40) / this.rows)
        );
        this.offsetX = Math.floor((this.canvas.width - (this.cols * this.cellSize)) / 2);
        this.offsetY = Math.floor((this.canvas.height - (this.rows * this.cellSize)) / 2);
    }

    setupInputListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

            const c = Math.floor((mouseX - this.offsetX) / this.cellSize);
            const r = Math.floor((mouseY - this.offsetY) / this.cellSize);

            if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
                this.hoverCol = c;
                this.hoverRow = r;
            } else {
                this.hoverCol = -1;
                this.hoverRow = -1;
            }
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.hoverCol >= 0 && this.hoverRow >= 0) {
                this.rotateTile(this.hoverRow, this.hoverCol);
            }
        });

        // Touch support for tablets/mobile booth
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
            const touchY = (touch.clientY - rect.top) * (this.canvas.height / rect.height);

            const c = Math.floor((touchX - this.offsetX) / this.cellSize);
            const r = Math.floor((touchY - this.offsetY) / this.cellSize);

            if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
                this.rotateTile(r, c);
            }
        }, { passive: false });
    }

    rotateTile(r, c) {
        const tile = this.grid[r][c];
        // Fixed tiles (Source, Target, Block, Locked) cannot be rotated
        if (tile.type === CONFIG.TILE.EMPTY || tile.type === CONFIG.TILE.BLOCK || tile.isFixed) {
            return;
        }

        tile.rotation = (tile.rotation + 1) % 4;

        // Particle sparks on click
        const centerX = this.offsetX + c * this.cellSize + this.cellSize / 2;
        const centerY = this.offsetY + r * this.cellSize + this.cellSize / 2;
        this.particles.spawnSparks(centerX, centerY, CONFIG.COLORS.WIRE_ON, 8);

        if (this.onTileRotateCallback) {
            this.onTileRotateCallback(r, c);
        }
    }

    update(dt) {
        this.animTime += dt;
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Grid Board Background
        ctx.save();
        ctx.fillStyle = CONFIG.COLORS.BG_GRID;
        ctx.fillRect(this.offsetX, this.offsetY, this.cols * this.cellSize, this.rows * this.cellSize);

        // Grid Lines
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

        // Draw Tiles
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.drawTile(r, c, this.grid[r][c]);
            }
        }

        // Draw Hover Cursor Highlight
        if (this.hoverCol >= 0 && this.hoverRow >= 0) {
            const tile = this.grid[this.hoverRow][this.hoverCol];
            if (tile.type !== CONFIG.TILE.EMPTY && tile.type !== CONFIG.TILE.BLOCK && !tile.isFixed) {
                const x = this.offsetX + this.hoverCol * this.cellSize;
                const y = this.offsetY + this.hoverRow * this.cellSize;
                ctx.strokeStyle = CONFIG.COLORS.WIRE_ON;
                ctx.lineWidth = 2;
                ctx.shadowColor = CONFIG.COLORS.WIRE_ON;
                ctx.shadowBlur = 10;
                ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            }
        }

        ctx.restore();
    }

    drawTile(r, c, tile) {
        if (tile.type === CONFIG.TILE.EMPTY) return;

        const ctx = this.ctx;
        const cx = this.offsetX + c * this.cellSize + this.cellSize / 2;
        const cy = this.offsetY + r * this.cellSize + this.cellSize / 2;
        const size = this.cellSize;
        const ports = LogicSolver.getTilePorts(tile);

        ctx.save();
        ctx.translate(cx, cy);

        // Tile Box Background if Logic Gate or Node
        if (tile.type.startsWith('GATE_') || tile.type === CONFIG.TILE.SOURCE || tile.type === CONFIG.TILE.TARGET) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.strokeStyle = tile.isPowered ? CONFIG.COLORS.WIRE_ON : CONFIG.COLORS.WIRE_OFF;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-size * 0.4, -size * 0.4, size * 0.8, size * 0.8, 6);
            ctx.fill();
            ctx.stroke();
        }

        // Draw Wires / Ports Connections
        for (let dir = 0; dir < 4; dir++) {
            if (!ports[dir]) continue;

            const isPortActive = tile.portSignals && tile.portSignals[dir];
            const wireColor = isPortActive ? CONFIG.COLORS.WIRE_ON : CONFIG.COLORS.WIRE_OFF;

            ctx.strokeStyle = wireColor;
            ctx.lineWidth = isPortActive ? 6 : 4;

            if (isPortActive) {
                ctx.shadowColor = CONFIG.COLORS.WIRE_ON;
                ctx.shadowBlur = 12;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.moveTo(0, 0);

            // Draw line to tile edge in direction `dir`
            switch (dir) {
                case CONFIG.DIR.TOP:    ctx.lineTo(0, -size / 2); break;
                case CONFIG.DIR.RIGHT:  ctx.lineTo(size / 2, 0); break;
                case CONFIG.DIR.BOTTOM: ctx.lineTo(0, size / 2); break;
                case CONFIG.DIR.LEFT:   ctx.lineTo(-size / 2, 0); break;
            }
            ctx.stroke();
        }

        // Center Wire Junction Dot
        if (tile.type.startsWith('WIRE_')) {
            ctx.fillStyle = tile.isPowered ? CONFIG.COLORS.WIRE_ON : CONFIG.COLORS.WIRE_OFF;
            ctx.beginPath();
            ctx.arc(0, 0, tile.isPowered ? 5 : 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Source / Target / Gate Badges
        if (tile.type === CONFIG.TILE.SOURCE) {
            ctx.fillStyle = CONFIG.COLORS.SOURCE_ON;
            ctx.shadowColor = CONFIG.COLORS.SOURCE_ON;
            ctx.shadowBlur = 15;
            ctx.font = '900 24px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', 0, 0);
        } else if (tile.type === CONFIG.TILE.TARGET) {
            ctx.fillStyle = tile.isPowered ? CONFIG.COLORS.TARGET_ON : CONFIG.COLORS.TARGET_OFF;
            if (tile.isPowered) {
                ctx.shadowColor = CONFIG.COLORS.TARGET_ON;
                ctx.shadowBlur = 18;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.font = '900 24px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💾', 0, 0);
        } else if (tile.type.startsWith('GATE_')) {
            const gateName = tile.type.replace('GATE_', '');
            ctx.fillStyle = CONFIG.COLORS[`GATE_${gateName}`] || CONFIG.COLORS.WIRE_ON;
            ctx.font = 'bold 14px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(gateName, 0, 0);
        }

        ctx.restore();
    }
}
