const W = 1024;
const H = 768;

export function createPhosphor() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { alpha: false });

  const state = {
    channel: 0,
    glitch: 0,
    degauss: 0,
    contrast: 0.84,
    fineTune: 0,
    flicker: true,
    tracking: true,
    play: 0
  };

  function noise(x, y, t) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + t * 4.1) * 43758.5453;
    return n - Math.floor(n);
  }

  function drawScanlines() {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  }

  function vignette() {
    const g = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 520);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.72)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function osd(t) {
    const tc = Math.floor(t);
    const mm = String(Math.floor(tc / 60) % 60).padStart(2, "0");
    const ss = String(tc % 60).padStart(2, "0");
    const ff = String(Math.floor((t % 1) * 24)).padStart(2, "0");
    ctx.fillStyle = "#10b981";
    ctx.font = "22px JetBrains Mono, monospace";
    ctx.fillText(`● PLAY SP  ${mm}:${ss}:${ff}`, 36, H - 36);
  }

  function prism(t) {
    ctx.save();
    ctx.translate(W - 130, 90);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = t * 1.4 + (i * Math.PI * 2) / 3;
      const x = Math.cos(a) * 38;
      const y = Math.sin(a * 0.8) * 22;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawSynth(t) {
    ctx.fillStyle = "#03140e";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#0f3d2c";
    for (let x = 40; x < W; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 80);
      ctx.lineTo(x, H - 80);
      ctx.stroke();
    }
    for (let y = 80; y < H - 60; y += 48) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(W - 40, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const y =
        H * 0.52 +
        Math.sin(x * 0.018 + t * 4) * 70 +
        Math.sin(x * 0.05 + t * 7) * (28 + state.fineTune * 40);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = "#ffb000";
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const y = H * 0.52 + Math.sin(x * 0.03 - t * 5.2) * 34;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    for (let i = 0; i < 8; i++) {
      const x = 80 + i * 110;
      const on = Math.sin(t * 3 + i) > 0;
      ctx.fillStyle = on ? "#10b981" : "#163226";
      ctx.fillRect(x, 120, 54, 18);
      ctx.strokeStyle = "#ffb000";
      ctx.strokeRect(x, 160, 54, 54);
    }
    ctx.fillStyle = "#ffb000";
    ctx.font = "28px Space Grotesk, sans-serif";
    ctx.fillText("NEO-SYNTH OS  //  PATCH BAY 48K", 40, 56);
  }

  function drawHorizon(t) {
    ctx.fillStyle = "#071018";
    ctx.fillRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0b1c2c");
    sky.addColorStop(0.55, "#12304a");
    sky.addColorStop(1, "#061014");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(56,189,248,0.35)";
    ctx.lineWidth = 1;
    const vanishY = 300 + Math.sin(t * 0.4) * 10;
    for (let i = 0; i < 24; i++) {
      const y = vanishY + i * i * 1.1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.beginPath();
    for (let i = -18; i <= 18; i++) {
      ctx.moveTo(W / 2, vanishY);
      ctx.lineTo(W / 2 + i * 90, H);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(16,185,129,0.15)";
    for (let i = 0; i < 12; i++) {
      const x = (i * 173 + t * 40) % W;
      ctx.fillRect(x, 90, 90, 140);
    }
    ctx.fillStyle = "#38bdf8";
    ctx.font = "28px Space Grotesk, sans-serif";
    ctx.fillText("VIRTUAL HORIZON  //  VOLUMETRIC FOG", 40, 56);
  }

  function drawKinetic(t) {
    ctx.fillStyle = "#140d02";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#3a2a08";
    for (let i = 0; i < 16; i++) {
      ctx.strokeRect(40 + i * 8, 80 + i * 6, W - 80 - i * 16, H - 160 - i * 12);
    }
    for (let i = 0; i < 18; i++) {
      const ang = t * 1.7 + i * 0.7;
      const r = 90 + (i % 5) * 38;
      const x = W / 2 + Math.cos(ang) * r;
      const y = H / 2 + Math.sin(ang * 1.3) * (r * 0.55);
      ctx.fillStyle = i % 2 ? "#ffb000" : "#ef4444";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,176,0,0.35)";
      ctx.beginPath();
      ctx.moveTo(W / 2, H / 2);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.fillStyle = "#ffb000";
    ctx.font = "28px Space Grotesk, sans-serif";
    ctx.fillText("HYPER-KINETIC UI  //  SPRING DYNAMICS", 40, 56);
  }

  function drawRadar(t) {
    ctx.fillStyle = "#03140a";
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H / 2 + 20;
    ctx.strokeStyle = "#0b5c3a";
    for (let r = 50; r <= 280; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - 300, cy);
    ctx.lineTo(cx + 300, cy);
    ctx.moveTo(cx, cy - 300);
    ctx.lineTo(cx, cy + 300);
    ctx.stroke();
    const sweep = (t * 1.2) % (Math.PI * 2);
    const grad = ctx.createConicGradient(sweep, cx, cy);
    grad.addColorStop(0, "rgba(16,185,129,0.55)");
    grad.addColorStop(0.18, "rgba(16,185,129,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 280, sweep - 0.4, sweep);
    ctx.fill();
    const blips = [
      [0.4, 120],
      [1.2, 190],
      [2.4, 80],
      [3.8, 210],
      [5.1, 150]
    ];
    blips.forEach(([a, r], i) => {
      const pulse = 0.4 + Math.abs(Math.sin(t * 3 + i));
      ctx.fillStyle = `rgba(16,185,129,${pulse})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a + t * 0.05) * r, cy + Math.sin(a + t * 0.05) * r, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#10b981";
    ctx.font = "28px Space Grotesk, sans-serif";
    ctx.fillText("CHRONO-PULSE 99  //  RADAR DOPPLER", 40, 56);
  }

  const drawers = [drawSynth, drawHorizon, drawKinetic, drawRadar];

  function render(time) {
    const t = time * 0.001;
    state.play = t;
    ctx.save();
    if (state.glitch > 0) {
      ctx.translate((noise(t, 1, t) - 0.5) * 28 * state.glitch, 0);
    }
    if (state.degauss > 0) {
      const s = 1 + Math.sin(t * 40) * 0.04 * state.degauss;
      ctx.translate(W / 2, H / 2);
      ctx.scale(s, 1 / s);
      ctx.rotate(Math.sin(t * 18) * 0.04 * state.degauss);
      ctx.translate(-W / 2, -H / 2);
    }
    ctx.filter = `contrast(${0.7 + state.contrast * 0.6})`;
    drawers[state.channel](t);
    ctx.filter = "none";
    if (state.glitch > 0) {
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(255,0,80,${0.18 * state.glitch})`;
      ctx.fillRect(8, 0, W, H);
      ctx.fillStyle = `rgba(0,255,180,${0.18 * state.glitch})`;
      ctx.fillRect(-8, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    prism(t);
    drawScanlines();
    if (state.flicker && Math.sin(t * 48) > 0.92) {
      ctx.fillStyle = "rgba(255,255,220,0.05)";
      ctx.fillRect(0, 0, W, H);
    }
    vignette();
    osd(t);
    ctx.restore();
    state.glitch = Math.max(0, state.glitch - 0.045);
    state.degauss = Math.max(0, state.degauss - 0.02);
    return canvas;
  }

  return { canvas, state, render, W, H };
}

export function paintThumb(canvas, kind) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = "#070500";
  ctx.fillRect(0, 0, w, h);
  if (kind === "synth") {
    ctx.strokeStyle = "#10b981";
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin(x * 0.12) * 18 + Math.sin(x * 0.3) * 8;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  } else if (kind === "horizon") {
    ctx.strokeStyle = "#38bdf8";
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 30 + i * 10);
      ctx.lineTo(w, 30 + i * 10);
      ctx.stroke();
    }
  } else if (kind === "kinetic") {
    ctx.strokeStyle = "#ffb000";
    for (let i = 0; i < 6; i++) ctx.strokeRect(12 + i * 6, 12 + i * 6, w - 24 - i * 12, h - 24 - i * 12);
  } else {
    ctx.strokeStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    ctx.lineTo(w / 2 + 36, h / 2 + 10);
    ctx.stroke();
  }
}
