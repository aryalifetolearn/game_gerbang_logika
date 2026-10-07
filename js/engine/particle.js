/* ==========================================================================
   CYBER CIRCUIT: LOGIC HACK - PARTICLE & VISUAL EFFECTS SYSTEM
   ========================================================================== */

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    // Spawn sparks at canvas (x, y)
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
                life: 1,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }

    // Pulse rings when Target Node connects
    spawnPulseRing(x, y, color = '#00ff66') {
        this.particles.push({
            x, y,
            radius: 5,
            maxRadius: 40,
            color: color,
            alpha: 1,
            isRing: true,
            decay: 0.03
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.isRing) {
                p.radius += 2;
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
                ctx.lineWidth = 2;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
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

    clear() {
        this.particles = [];
    }
}
