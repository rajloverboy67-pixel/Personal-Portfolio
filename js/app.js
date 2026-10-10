import { PROJECTS } from "./projects.js";
import { createPhosphor, paintThumb } from "./phosphor.js";
import { createCrtScene } from "./crt-scene.js";
import { createAudio } from "./audio.js";

const phosphor = createPhosphor();
const audio = createAudio();
let channel = 0;
let powered = true;
let autoScan = true;
let lastAuto = 0;
let contrast = 0.84;
let fine = 0;
let flicker = true;
let tracking = true;
let routing = "broadcast";

const els = {
  chBtns: () => [...document.querySelectorAll("[data-channel]")],
  hudCh: document.getElementById("hud-ch"),
  hudSub: document.getElementById("hud-sub"),
  target: document.getElementById("tele-target"),
  engine: document.getElementById("tele-engine"),
  rec: document.getElementById("tele-rec"),
  live: document.getElementById("btn-live"),
  repo: document.getElementById("btn-repo"),
  spec: document.getElementById("btn-spec"),
  smpte: document.getElementById("smpte"),
  uhf: document.getElementById("uhf"),
  clock: document.getElementById("rec-clock"),
  contrastVal: document.getElementById("contrast-val"),
  fineVal: document.getElementById("fine-val"),
  vu: document.getElementById("vu-num"),
  overlay: document.getElementById("overlay"),
  overlayBody: document.getElementById("overlay-body"),
  archive: document.getElementById("archive-grid")
};

function pad(n, w = 2) {
  return String(n).padStart(w, "0");
}

function smpteNow(t) {
  const total = Math.floor(t / 1000) + 6182;
  const ff = Math.floor((t % 1000) / (1000 / 30));
  const ss = total % 60;
  const mm = Math.floor(total / 60) % 60;
  const hh = Math.floor(total / 3600) % 24;
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

function setChannel(index, { fromAuto } = {}) {
  channel = ((index % PROJECTS.length) + PROJECTS.length) % PROJECTS.length;
  const p = PROJECTS[channel];
  phosphor.state.channel = channel;
  phosphor.state.glitch = 1;
  window.crtScene?.setChannel(channel);
  if (!fromAuto) audio.channel();

  els.chBtns().forEach((b) => b.classList.toggle("active", Number(b.dataset.channel) === channel));
  els.hudCh.textContent = `CH-${p.ch} NTSC`;
  els.hudSub.textContent = `${p.subtitle} // ACTIVE`;
  els.target.textContent = `${p.title} ${p.version}`;
  els.engine.textContent = p.engine;
  els.rec.textContent = p.recognition;
  els.live.dataset.href = p.live;
  els.repo.dataset.href = p.repo;
  document.querySelectorAll("[data-tune]").forEach((b) => {
    b.classList.toggle("hot", Number(b.dataset.tune) === channel);
  });
}

window.setTvChannel = (index) => setChannel(index);

function renderArchive() {
  els.archive.innerHTML = PROJECTS.map((p, i) => `
    <article class="card" data-tune="${i}">
      <div class="thumb"><canvas width="320" height="180" data-thumb="${p.thumb}"></canvas></div>
      <div class="card-tags"><span>[${p.sys} // ${p.status}]</span><span>CH-${p.ch}</span></div>
      <h3>${p.title}</h3>
      <p>${p.blurb}</p>
      <div class="badges">${p.badges.map((b) => `<span>${b}</span>`).join("")}</div>
      <div class="card-foot">
        <span>${p.media}</span>
        <button type="button" data-tune="${i}">TUNE IN →</button>
      </div>
    </article>
  `).join("");
  els.archive.querySelectorAll("canvas[data-thumb]").forEach((c) => paintThumb(c, c.dataset.thumb));
}

function openOverlay(title, html) {
  els.overlayBody.innerHTML = `<div class="overlay-card"><button class="ghost-btn" id="close-ov" type="button">CLOSE SIGNAL</button><h2>${title}</h2>${html}</div>`;
  els.overlay.classList.add("open");
  document.getElementById("close-ov").onclick = () => els.overlay.classList.remove("open");
}

function bindUi() {
  document.querySelectorAll("[data-channel]").forEach((b) => {
    b.addEventListener("click", () => setChannel(Number(b.dataset.channel)));
  });
  document.getElementById("auto-scan").addEventListener("click", (e) => {
    autoScan = !autoScan;
    e.currentTarget.textContent = autoScan ? "AUTO-SCAN" : "HOLD";
    audio.click();
  });
  document.querySelectorAll("[data-route]").forEach((b) => {
    b.addEventListener("click", () => {
      routing = b.dataset.route;
      document.querySelectorAll("[data-route]").forEach((x) => x.classList.toggle("active", x === b));
      audio.click();
    });
  });
  document.getElementById("degauss").addEventListener("click", () => {
    phosphor.state.degauss = 1;
    audio.degauss();
  });
  document.getElementById("btn-contrast").addEventListener("click", () => {
    contrast = contrast >= 0.95 ? 0.55 : +(contrast + 0.1).toFixed(2);
    phosphor.state.contrast = contrast;
    els.contrastVal.textContent = `VAL: ${Math.round(contrast * 100)}%`;
    audio.click();
  });
  document.getElementById("btn-fine").addEventListener("click", () => {
    fine = fine >= 0.3 ? -0.2 : +(fine + 0.1).toFixed(2);
    phosphor.state.fineTune = fine;
    els.fineVal.textContent = `DELTA: ${fine >= 0 ? "+" : ""}${fine.toFixed(2)}`;
    audio.click();
  });
  document.getElementById("btn-tracking").addEventListener("click", (e) => {
    tracking = !tracking;
    phosphor.state.tracking = tracking;
    e.currentTarget.classList.toggle("active", tracking);
    audio.click();
  });
  document.getElementById("btn-convergence").addEventListener("click", () => {
    phosphor.state.glitch = 0.8;
    audio.click();
  });
  document.getElementById("btn-flicker").addEventListener("click", (e) => {
    flicker = !flicker;
    phosphor.state.flicker = flicker;
    e.currentTarget.textContent = flicker ? "STATUS: ON" : "STATUS: OFF";
    audio.click();
  });
  document.getElementById("beep-fx").addEventListener("click", (e) => {
    const on = e.currentTarget.getAttribute("aria-pressed") !== "true";
    e.currentTarget.setAttribute("aria-pressed", String(on));
    e.currentTarget.classList.toggle("active", on);
    audio.setEnabled(on);
    audio.toggleWhine(on);
    audio.click();
  });
  document.getElementById("pwr").addEventListener("click", (e) => {
    powered = !powered;
    document.body.classList.toggle("standby", !powered);
    e.currentTarget.classList.toggle("off", !powered);
    audio.click();
  });
  document.querySelectorAll("[data-nav]").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-nav]").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const id = b.dataset.nav;
      if (id === "broadcast") {
        els.overlay.classList.remove("open");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (id === "specs") {
        openOverlay("TECH SPECS / ABOUT", `
          <p>Alex Vance — Creative Technologist, WebGL shader specialist, and design engineer. Based in Tokyo / Berlin. SGI Trinitron engine active.</p>
          <ul>
            <li>Engine: Three.js r160 · WebGL 2.0 with WebGL 1 fallback</li>
            <li>Phosphor pipeline: 1024×768 CanvasTexture · procedural geometry only</li>
            <li>Audio: WebAudio 8-bit relay, degauss hum, optional coil whine</li>
            <li>Target: 60 FPS on integrated GPUs · zero glTF downloads</li>
          </ul>`);
      } else if (id === "contact") {
        openOverlay("TRANSMISSIONS / CONTACT", `
          <p>Open a channel for commissions, talks, and spatial prototypes.</p>
          <p>Signal: <a href="mailto:alex.vance@chroma99.example">alex.vance@chroma99.example</a></p>
          <p>Tokyo · Berlin · 001 Trinitron Engine</p>`);
      } else if (id === "vcr") {
        document.getElementById("archive").scrollIntoView({ behavior: "smooth" });
      }
      audio.click();
    });
  });
  els.live.addEventListener("click", () => window.open(els.live.dataset.href, "_blank", "noopener"));
  els.repo.addEventListener("click", () => window.open(els.repo.dataset.href, "_blank", "noopener"));
  els.spec.addEventListener("click", () => {
    const p = PROJECTS[channel];
    openOverlay("READ SPEC SHEET", `<p>${p.spec}</p><p>${p.long}</p>`);
  });
  els.archive.addEventListener("click", (e) => {
    const t = e.target.closest("[data-tune]");
    if (!t) return;
    setChannel(Number(t.dataset.tune));
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  els.overlay.addEventListener("click", (e) => {
    if (e.target === els.overlay) els.overlay.classList.remove("open");
  });
  window.addEventListener("keydown", (e) => {
    if (["1", "2", "3", "4"].includes(e.key)) setChannel(Number(e.key) - 1);
    if (e.key.toLowerCase() === "d") {
      phosphor.state.degauss = 1;
      audio.degauss();
    }
    if (e.key === "Escape") els.overlay.classList.remove("open");
  });
}

function boot() {
  renderArchive();
  bindUi();
  const canvas = document.getElementById("tv-canvas");
  window.crtScene = createCrtScene(canvas, phosphor);
  setChannel(0, { fromAuto: true });
  phosphor.state.contrast = contrast;

  function loop(t) {
    if (powered) window.crtScene.frame(t);
    els.smpte.textContent = smpteNow(t);
    els.clock.textContent = smpteNow(t).slice(0, 8);
    els.uhf.textContent = (472.2 + channel * 6.3 + Math.sin(t * 0.001) * 0.04).toFixed(2);
    els.vu.textContent = `${(1.8 + Math.abs(Math.sin(t * 0.003)) * 1.4).toFixed(1)} dB`;
    if (autoScan && powered && t - lastAuto > 12000) {
      lastAuto = t;
      setChannel(channel + 1, { fromAuto: true });
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

boot();
