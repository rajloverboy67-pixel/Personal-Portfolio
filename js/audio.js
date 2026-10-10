export function createAudio() {
  let ctx = null;
  let enabled = true;
  let whine = null;

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function beep(freq = 880, dur = 0.06, type = "square", gain = 0.04) {
    if (!enabled) return;
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(a.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.stop(a.currentTime + dur + 0.02);
  }

  return {
    setEnabled(v) {
      enabled = v;
      if (!v && whine) {
        whine.stop();
        whine = null;
      }
    },
    click() {
      beep(1400, 0.04, "square", 0.03);
    },
    channel() {
      beep(420, 0.05, "square", 0.04);
      setTimeout(() => beep(880, 0.04, "square", 0.03), 50);
    },
    degauss() {
      if (!enabled) return;
      const a = ac();
      const o = a.createOscillator();
      const g = a.createGain();
      const f = a.createBiquadFilter();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(90, a.currentTime);
      o.frequency.exponentialRampToValueAtTime(40, a.currentTime + 0.7);
      f.type = "lowpass";
      f.frequency.value = 400;
      g.gain.setValueAtTime(0.08, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.8);
      o.connect(f);
      f.connect(g);
      g.connect(a.destination);
      o.start();
      o.stop(a.currentTime + 0.85);
    },
    toggleWhine(on) {
      if (!on) {
        if (whine) {
          whine.stop();
          whine = null;
        }
        return;
      }
      if (!enabled) return;
      const a = ac();
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = "sine";
      o.frequency.value = 15600;
      g.gain.value = 0.012;
      o.connect(g);
      g.connect(a.destination);
      o.start();
      whine = o;
    }
  };
}
