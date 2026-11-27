// Ambient soundscapes generated live with the Web Audio API.
// No audio files are needed, so the Music page works offline and on GitHub Pages.

function noiseBuffer(ctx, seconds = 4, color = "white") {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (color === "brown") {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else if (color === "pink") {
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.11;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

function loopNoise(ctx, color) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 4, color);
  src.loop = true;
  src.start();
  return src;
}

function rain(ctx, out) {
  const nodes = [];
  const bed = loopNoise(ctx, "pink");
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 7000;
  const g = ctx.createGain(); g.gain.value = 0.55;
  bed.connect(hp).connect(lp).connect(g).connect(out);
  nodes.push(bed);

  // occasional heavier drops on the glass
  const drops = setInterval(() => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800 + Math.random() * 2200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(env).connect(out);
    osc.start(t); osc.stop(t + 0.12);
  }, 140);
  return { nodes, timers: [drops] };
}

function ocean(ctx, out) {
  const surf = loopNoise(ctx, "brown");
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
  const swell = ctx.createGain(); swell.gain.value = 0.35;
  // a slow LFO makes the waves roll in and out (~9 seconds per wave)
  const lfo = ctx.createOscillator(); lfo.frequency.value = 1 / 9;
  const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 0.3;
  lfo.connect(lfoDepth).connect(swell.gain);
  const lfoF = ctx.createGain(); lfoF.gain.value = 350;
  lfo.connect(lfoF).connect(lp.frequency);
  lfo.start();
  surf.connect(lp).connect(swell).connect(out);
  return { nodes: [surf, lfo], timers: [] };
}

function forest(ctx, out) {
  const wind = loopNoise(ctx, "pink");
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 500; bp.Q.value = 0.6;
  const g = ctx.createGain(); g.gain.value = 0.25;
  wind.connect(bp).connect(g).connect(out);

  const chirp = () => {
    const t = ctx.currentTime;
    const notes = 2 + Math.floor(Math.random() * 4);
    const base = 2600 + Math.random() * 1600;
    for (let n = 0; n < notes; n++) {
      const st = t + n * (0.09 + Math.random() * 0.05);
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(base, st);
      osc.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), st + 0.06);
      env.gain.setValueAtTime(0.0001, st);
      env.gain.exponentialRampToValueAtTime(0.06, st + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, st + 0.08);
      osc.connect(env).connect(out);
      osc.start(st); osc.stop(st + 0.1);
    }
  };
  const timer = setInterval(() => { if (Math.random() < 0.55) chirp(); }, 1400);
  return { nodes: [wind], timers: [timer] };
}

function piano(ctx, out) {
  // soft notes from a pentatonic scale, with a gentle echo
  const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
  const delay = ctx.createDelay(); delay.delayTime.value = 0.45;
  const fb = ctx.createGain(); fb.gain.value = 0.35;
  const wet = ctx.createGain(); wet.gain.value = 0.3;
  delay.connect(fb).connect(delay);
  delay.connect(wet).connect(out);

  const note = () => {
    const t = ctx.currentTime;
    const f = scale[Math.floor(Math.random() * scale.length)] / (Math.random() < 0.3 ? 2 : 1);
    [1, 2].forEach((mult, k) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = k === 0 ? "triangle" : "sine";
      osc.frequency.value = f * mult;
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(k === 0 ? 0.12 : 0.03, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      osc.connect(env);
      env.connect(out); env.connect(delay);
      osc.start(t); osc.stop(t + 3.3);
    });
  };
  note();
  const timer = setInterval(note, 1700);
  return { nodes: [], timers: [timer] };
}

const BUILDERS = { rain, ocean, birds: forest, piano };

export function createAmbientPlayer() {
  let ctx = null;
  let master = null;
  let current = null;

  function stopCurrent() {
    if (!current) return;
    current.timers.forEach(clearInterval);
    current.nodes.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } });
    try { current.out.disconnect(); } catch { /* ignore */ }
    current = null;
  }

  return {
    get supported() {
      return typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext);
    },
    async play(id, volume = 0.7) {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        master = ctx.createGain();
        master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") await ctx.resume();
      stopCurrent();
      master.gain.setValueAtTime(volume, ctx.currentTime);
      const out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, ctx.currentTime);
      out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.5); // fade in
      out.connect(master);
      const built = BUILDERS[id](ctx, out);
      current = { ...built, out };
    },
    stop() {
      if (!current || !ctx) return;
      const c = current;
      c.out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3); // fade out
      current = null;
      setTimeout(() => {
        c.timers.forEach(clearInterval);
        c.nodes.forEach((n) => { try { n.stop(); } catch { /* ignore */ } });
        try { c.out.disconnect(); } catch { /* ignore */ }
      }, 1200);
    },
    setVolume(v) {
      if (master && ctx) master.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
    },
    close() {
      stopCurrent();
      if (ctx) { ctx.close().catch(() => {}); ctx = null; }
    },
  };
}
