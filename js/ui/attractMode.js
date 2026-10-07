/* ==========================================================================
   CYBER CIRCUIT: LOGIC HACK - BOOTH ATTRACT / IDLE DEMO MODE
   Auto-triggers demo mode on TV/kiosk when idle for 30s to draw visitors.
   ========================================================================== */

import { CONFIG } from '../config.js';

export class AttractModeManager {
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
        if (this.isAttractActive) {
            this.stopAttractMode();
        }
        this.resetIdleTimer();
    }

    resetIdleTimer() {
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            this.startAttractMode();
        }, CONFIG.IDLE_TIMEOUT_MS);
    }

    startAttractMode() {
        this.isAttractActive = true;
        this.overlayEl.classList.remove('hidden');

        // Auto rotate random tile every 2 seconds for visual animation
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
        this.overlayEl.classList.add('hidden');
        clearInterval(this.autoRotateInterval);
    }
}
