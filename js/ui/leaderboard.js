/* ==========================================================================
   CYBER CIRCUIT: LOGIC HACK - LEADERBOARD SYSTEM (LOCAL STORAGE)
   Manages booth high scores, top players table, & local persistence.
   ========================================================================== */

import { CONFIG } from '../config.js';

export class LeaderboardManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEY_LEADERBOARD;
        this.initDefaultsIfEmpty();
    }

    initDefaultsIfEmpty() {
        if (!localStorage.getItem(this.storageKey)) {
            const defaultScores = [
                { name: 'PANITIA_01', mode: 'STORY', level: 10, score: 9500, date: '2026-10-07' },
                { name: 'MAHASISWA_X', mode: 'TIME_ATTACK', level: 8, score: 7200, date: '2026-10-07' },
                { name: 'CYBER_GUEST', mode: 'STORY', level: 5, score: 4800, date: '2026-10-07' },
                { name: 'HACKER_88', mode: 'TIME_ATTACK', level: 4, score: 3500, date: '2026-10-07' },
                { name: 'VISITOR_01', mode: 'STORY', level: 3, score: 2100, date: '2026-10-07' }
            ];
            this.saveScores(defaultScores);
        }
    }

    getScores() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Failed to read leaderboard", e);
            return [];
        }
    }

    saveScores(scores) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(scores));
        } catch (e) {
            console.error("Failed to save leaderboard", e);
        }
    }

    addEntry(name, mode, level, score) {
        const cleanName = (name || 'ANONYMOUS').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
        const scores = this.getScores();

        scores.push({
            name: cleanName || 'HACKER',
            mode: mode,
            level: level,
            score: Math.floor(score),
            date: new Date().toISOString().split('T')[0]
        });

        // Sort descending by score
        scores.sort((a, b) => b.score - a.score);

        // Keep top 20
        const trimmed = scores.slice(0, 20);
        this.saveScores(trimmed);
        return trimmed;
    }

    renderTable(tableBodyEl) {
        const scores = this.getScores();
        tableBodyEl.innerHTML = '';

        if (scores.length === 0) {
            tableBodyEl.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-dim);">Belum ada data skor di booth pameran.</td></tr>`;
            return;
        }

        scores.forEach((entry, index) => {
            const tr = document.createElement('tr');
            const rankBadge = index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`;
            
            tr.innerHTML = `
                <td><strong style="color: ${index < 3 ? 'var(--yellow)' : 'var(--cyan)'};">${rankBadge}</strong></td>
                <td><strong>${entry.name}</strong></td>
                <td><span style="color: ${entry.mode === 'STORY' ? 'var(--cyan)' : 'var(--magenta)'}">${entry.mode}</span></td>
                <td>LVL ${entry.level}</td>
                <td><strong style="color: var(--green);">${entry.score.toLocaleString()}</strong></td>
            `;
            tableBodyEl.appendChild(tr);
        });
    }

    clearLeaderboard() {
        localStorage.removeItem(this.storageKey);
        this.initDefaultsIfEmpty();
    }
}

export const leaderboard = new LeaderboardManager();
