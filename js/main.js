/* ==========================================================================
   CYBER CIRCUIT: LOGIC HACK - MAIN APPLICATION ENTRY POINT & GAME LOOP
   ========================================================================== */

import { CONFIG } from './config.js';
import { audio } from './engine/audio.js';
import { ParticleSystem } from './engine/particle.js';
import { LogicSolver } from './engine/logicSolver.js';
import { GridManager } from './engine/grid.js';
import { LEVELS, generateRandomLevel } from './levels.js';
import { leaderboard } from './ui/leaderboard.js';
import { AttractModeManager } from './ui/attractMode.js';

class CyberCircuitGame {
    constructor() {
        // State Variables
        this.currentMode = CONFIG.MODE.STORY;
        this.currentLevelIndex = 0;
        this.score = 0;
        this.moveCount = 0;
        this.timeRemaining = CONFIG.TIME_ATTACK_SECONDS;
        this.timerInterval = null;
        this.isPlaying = false;
        this.lastTime = performance.now();

        // Components
        this.particles = new ParticleSystem();
        this.canvas = document.getElementById('game-canvas');
        this.gridManager = new GridManager(this.canvas, this.particles);

        // Callbacks
        this.gridManager.onTileRotateCallback = (r, c) => this.onTileRotated(r, c);

        // Attract Mode & UI
        this.attractMode = new AttractModeManager(document.getElementById('attract-overlay'), this.gridManager);

        this.initUI();
        this.initEventListeners();
        this.startLoop();
    }

    initUI() {
        // Render initial leaderboard table
        leaderboard.renderTable(document.getElementById('leaderboard-body'));
    }

    initEventListeners() {
        // Sound Toggle
        document.getElementById('btn-sound').addEventListener('click', () => {
            const isMuted = audio.toggleMute();
            document.getElementById('sound-status').innerText = isMuted ? 'OFF' : 'ON';
            audio.playClick();
        });

        // Fullscreen Toggle (Kiosk Mode)
        document.getElementById('btn-fullscreen').addEventListener('click', () => {
            audio.playClick();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => console.log(err));
            } else {
                document.exitFullscreen().catch(err => console.log(err));
            }
        });

        // Menu Buttons
        document.getElementById('btn-start-story').addEventListener('click', () => {
            audio.playClick();
            this.startStoryMode();
        });

        document.getElementById('btn-start-rush').addEventListener('click', () => {
            audio.playClick();
            this.startTimeAttackMode();
        });

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

        // Toolbar Buttons
        document.getElementById('btn-reset-level').addEventListener('click', () => {
            audio.playClick();
            this.loadCurrentLevel();
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

        // Victory Modal Next Level
        document.getElementById('btn-next-level').addEventListener('click', () => {
            audio.playClick();
            this.hideModal('modal-victory');
            if (this.currentMode === CONFIG.MODE.STORY) {
                if (this.currentLevelIndex + 1 < LEVELS.length) {
                    this.currentLevelIndex++;
                    this.loadCurrentLevel();
                } else {
                    alert("🎉 SELAMAT! Kamu telah meretas seluruh 10 Level Story!");
                    this.triggerGameOver("Selamat! Seluruh 10 Stage Terretas!");
                }
            } else {
                // Time attack next procedural level
                this.currentLevelIndex++;
                this.loadCurrentLevel();
            }
        });

        // Game Over Buttons
        document.getElementById('btn-save-score').addEventListener('click', () => {
            const nameInput = document.getElementById('player-name').value;
            leaderboard.addEntry(nameInput, this.currentMode, this.currentLevelIndex + 1, this.score);
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

    startStoryMode() {
        this.currentMode = CONFIG.MODE.STORY;
        this.currentLevelIndex = 0;
        this.score = 0;
        this.hideAllModals();
        this.loadCurrentLevel();
    }

    startTimeAttackMode() {
        this.currentMode = CONFIG.MODE.TIME_ATTACK;
        this.currentLevelIndex = 0;
        this.score = 0;
        this.timeRemaining = CONFIG.TIME_ATTACK_SECONDS;
        this.hideAllModals();
        this.startTimer();
        this.loadCurrentLevel();
    }

    loadCurrentLevel() {
        let levelData;
        if (this.currentMode === CONFIG.MODE.STORY) {
            levelData = LEVELS[this.currentLevelIndex];
        } else {
            const size = Math.min(6, 4 + Math.floor(this.currentLevelIndex / 3));
            levelData = generateRandomLevel(size);
        }

        // Deep clone level grid
        const clonedGrid = levelData.grid.map(row => 
            row.map(tile => ({ ...tile }))
        );

        this.gridManager.setGrid(clonedGrid);
        this.moveCount = 0;
        this.isPlaying = true;

        if (this.currentMode === CONFIG.MODE.STORY) {
            this.timeRemaining = 180; // 3 menit per level story
            this.startTimer();
        }

        this.evaluateCircuit();
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
        const result = LogicSolver.evaluateGrid(this.gridManager.grid);

        if (result.isSolved) {
            this.onLevelSolved();
        }
    }

    onLevelSolved() {
        this.isPlaying = false;
        this.stopTimer();

        audio.playVictory();
        audio.playPowerConnect();

        // Spawn pulse ring particles at center of canvas
        this.particles.spawnPulseRing(this.canvas.width / 2, this.canvas.height / 2, CONFIG.COLORS.TARGET_ON);

        // Calculate score additions
        const timeBonus = this.timeRemaining * 10;
        const movePenalty = this.moveCount * 5;
        const levelBonus = (this.currentLevelIndex + 1) * 500;
        const gainedScore = Math.max(100, levelBonus + timeBonus - movePenalty);

        this.score += gainedScore;

        document.getElementById('vic-time').innerText = this.formatTime(180 - this.timeRemaining);
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

        document.getElementById('gameover-reason').innerText = reason;
        document.getElementById('go-score').innerText = this.score;
        document.getElementById('btn-save-score').disabled = false;

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
        document.getElementById('hud-mode').innerText = this.currentMode;
        document.getElementById('hud-level').innerText = `${String(this.currentLevelIndex + 1).padStart(2, '0')} / ${LEVELS.length}`;
        document.getElementById('hud-timer').innerText = this.formatTime(this.timeRemaining);
        document.getElementById('hud-score').innerText = String(this.score).padStart(5, '0');
        document.getElementById('hud-moves').innerText = this.moveCount;
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
    }

    startLoop() {
        const loop = (now) => {
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;

            this.gridManager.update(dt);
            this.particles.update();

            this.gridManager.render();
            this.particles.draw(this.gridManager.ctx);

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

// Start Game on DOM Content Loaded
window.addEventListener('DOMContentLoaded', () => {
    window.game = new CyberCircuitGame();
});
