/* ============================================================
   bg-field.js — animated canvas background engine
   Three modes: 'flow' (particle flow field),
                'grid' (perspective wireframe terrain),
                'plasma' (drifting gradient mesh).
   Vanilla, framework-agnostic. Instantiate with a <canvas>.
   ============================================================ */
(function (global) {
  'use strict';

  // ---- seeded value noise ----------------------------------
  function makeNoise(seed) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = (seed >>> 0) || 1;
    const rng = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a, b, t) => a + (b - a) * t;
    return function (x, y) {
      const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
      const xf = x - Math.floor(x), yf = y - Math.floor(y);
      const tl = perm[(perm[xi] + yi) & 511];
      const tr = perm[(perm[(xi + 1) & 255] + yi) & 511];
      const bl = perm[(perm[xi] + ((yi + 1) & 255)) & 511];
      const br = perm[(perm[(xi + 1) & 255] + ((yi + 1) & 255)) & 511];
      const u = fade(xf), v = fade(yf);
      return lerp(lerp(tl, tr, u), lerp(bl, br, u), v) / 255;
    };
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  class BackgroundField {
    constructor(canvas, opts) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.opts = Object.assign({
        mode: 'flow',
        accent: '#C2F24A',
        intensity: 1,
        bg: '#08080A'
      }, opts || {});
      this.noise = makeNoise(1337);
      this.t = 0;
      this.particles = [];
      this.running = false;
      this.mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
      this._raf = null;
      this._onResize = this.resize.bind(this);
      this._reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.addEventListener('resize', this._onResize);
      this.resize();
      this.initParticles();
    }

    setOptions(o) {
      const prevMode = this.opts.mode;
      Object.assign(this.opts, o);
      if (o.mode && o.mode !== prevMode) {
        this.fill(this.opts.bg, 1);
        if (o.mode === 'flow') this.initParticles();
      }
    }

    setMouse(nx, ny) { this.mouse.tx = nx; this.mouse.ty = ny; }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = this.canvas.clientWidth || window.innerWidth;
      this.h = this.canvas.clientHeight || window.innerHeight;
      this.canvas.width = Math.round(this.w * dpr);
      this.canvas.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.dpr = dpr;
      this.fill(this.opts.bg, 1);
    }

    initParticles() {
      const count = Math.round((this.w * this.h) / 9000 * this.opts.intensity);
      this.particles = [];
      for (let i = 0; i < Math.min(count, 900); i++) {
        this.particles.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          life: Math.random() * 200,
          accent: Math.random() < 0.16
        });
      }
    }

    fill(color, a) {
      this.ctx.globalAlpha = a;
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.w, this.h);
      this.ctx.globalAlpha = 1;
    }

    start() {
      if (this.running) return;
      this.running = true;
      const loop = () => {
        if (!this.running) return;
        this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.06;
        this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.06;
        this.frame();
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this._onResize);
    }

    frame() {
      this.t += this._reduced ? 0.0008 : 0.0026;
      const m = this.opts.mode;
      if (m === 'grid') this.drawGrid();
      else if (m === 'plasma') this.drawPlasma();
      else this.drawFlow();
    }

    // ---------------- FLOW FIELD ----------------
    drawFlow() {
      const ctx = this.ctx;
      this.fill(this.opts.bg, 0.045);
      const [ar, ag, ab] = hexToRgb(this.opts.accent);
      const scale = 0.0016;
      const mx = this.mouse.x * this.w, my = this.mouse.y * this.h;
      ctx.lineWidth = 1;
      for (const p of this.particles) {
        const n = this.noise(p.x * scale, p.y * scale + this.t * 0.6);
        let ang = n * Math.PI * 4;
        // gentle pull toward cursor
        const dx = mx - p.x, dy = my - p.y;
        const d = Math.hypot(dx, dy) + 0.001;
        if (d < 260) ang += Math.atan2(dy, dx) * (1 - d / 260) * 0.5;
        const px = p.x, py = p.y;
        const spd = 1.1 * this.opts.intensity;
        p.x += Math.cos(ang) * spd;
        p.y += Math.sin(ang) * spd;
        p.life--;
        if (p.life < 0 || p.x < -10 || p.x > this.w + 10 || p.y < -10 || p.y > this.h + 10) {
          p.x = Math.random() * this.w; p.y = Math.random() * this.h;
          p.life = 120 + Math.random() * 160;
        }
        if (p.accent) {
          ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.6)`;
        } else {
          ctx.strokeStyle = 'rgba(236,234,227,0.22)';
        }
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    // ---------------- WIREFRAME TERRAIN ----------------
    drawGrid() {
      const ctx = this.ctx;
      this.fill(this.opts.bg, 1);
      const [ar, ag, ab] = hexToRgb(this.opts.accent);
      const cols = 26, rows = 18;
      const horizon = this.h * 0.42;
      const t = this.t * 2;
      const mxShift = (this.mouse.x - 0.5) * 80;
      const pts = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        const depth = r / (rows - 1);
        const persp = Math.pow(depth, 1.7);
        const y = horizon + persp * (this.h - horizon) * 1.15;
        const spread = 0.5 + persp * 2.2;
        for (let c = 0; c <= cols; c++) {
          const gx = (c / cols - 0.5);
          const wave =
            Math.sin(gx * 6 + t + r * 0.35) * 14 * persp +
            this.noise(c * 0.25, r * 0.25 + t * 0.5) * 60 * persp;
          const x = this.w / 2 + gx * this.w * spread + mxShift * persp;
          row.push({ x, y: y - wave, depth });
        }
        pts.push(row);
      }
      // lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const a = pts[r][c], b = pts[r][c + 1];
          const alpha = 0.04 + a.depth * 0.5;
          const acc = (r + c) % 9 === 0;
          ctx.strokeStyle = acc
            ? `rgba(${ar},${ag},${ab},${0.12 + a.depth * 0.55})`
            : `rgba(236,234,227,${alpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          if (r < rows - 1) {
            const d = pts[r + 1][c];
            ctx.strokeStyle = `rgba(236,234,227,${alpha * 0.32})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(d.x, d.y); ctx.stroke();
          }
        }
      }
    }

    // ---------------- PLASMA MESH ----------------
    drawPlasma() {
      const ctx = this.ctx;
      this.fill(this.opts.bg, 1);
      const [ar, ag, ab] = hexToRgb(this.opts.accent);
      const t = this.t;
      const blobs = [
        { hue: [ar, ag, ab], ox: 0.30, oy: 0.35, r: 0.55, sp: 1.0, ph: 0 },
        { hue: [236, 234, 227], ox: 0.70, oy: 0.62, r: 0.46, sp: 0.8, ph: 2.1 },
        { hue: [ar, ag, ab], ox: 0.55, oy: 0.20, r: 0.40, sp: 1.3, ph: 4.0 },
        { hue: [120, 130, 140], ox: 0.40, oy: 0.78, r: 0.50, sp: 0.6, ph: 1.0 }
      ];
      ctx.globalCompositeOperation = 'lighter';
      for (const bl of blobs) {
        const cx = (bl.ox + Math.sin(t * bl.sp + bl.ph) * 0.12 + (this.mouse.x - 0.5) * 0.06) * this.w;
        const cy = (bl.oy + Math.cos(t * bl.sp * 0.9 + bl.ph) * 0.12 + (this.mouse.y - 0.5) * 0.06) * this.h;
        const rad = bl.r * Math.max(this.w, this.h) * (0.85 + Math.sin(t * 0.7 + bl.ph) * 0.12);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const isAcc = bl.hue[0] === ar && bl.hue[1] === ag;
        const peak = isAcc ? 0.14 : 0.06;
        g.addColorStop(0, `rgba(${bl.hue[0]},${bl.hue[1]},${bl.hue[2]},${peak})`);
        g.addColorStop(0.5, `rgba(${bl.hue[0]},${bl.hue[1]},${bl.hue[2]},${peak * 0.35})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      // subtle vignette to keep it moody
      const vg = ctx.createRadialGradient(this.w / 2, this.h / 2, this.h * 0.3, this.w / 2, this.h / 2, this.h * 0.85);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, this.w, this.h);
    }
  }

  global.BackgroundField = BackgroundField;
})(window);
