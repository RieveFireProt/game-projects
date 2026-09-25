// Procedural sound: everything is synthesised with WebAudio, so there are no files
// to load. Ambience (wind, a crackling fire) runs continuously once unlocked by a
// user gesture; one-shot effects are played by name.

export function createAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return { unlock() {}, setVolume() {}, play() {}, setFireDistance() {} };

  const ctx = new Ctx();
  const master = ctx.createGain();
  master.connect(ctx.destination);

  // Stone-tower reverb from a synthetic impulse response.
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(2.2, 2.8);
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  reverb.connect(wet).connect(master);
  const out = (node, send = 0.4) => {
    node.connect(master);
    if (send) {
      const s = ctx.createGain();
      s.gain.value = send;
      node.connect(s).connect(reverb);
    }
  };

  const noise = (() => {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  })();

  function impulse(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
    }
    return b;
  }

  // --- Building blocks -----------------------------------------------------------

  function burst({ at = ctx.currentTime, dur = 0.05, type = 'bandpass', freq = 1000, q = 1, gain = 0.3, attack = 0.002, send = 0.3, sweepTo }) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, at);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, at + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(f).connect(g);
    out(g, send);
    src.start(at, Math.random() * 1.5);
    src.stop(at + dur + 0.05);
  }

  function tone({ at = ctx.currentTime, freq = 440, dur = 1, type = 'sine', gain = 0.1, attack = 0.005, send = 0.5, glideTo }) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, at + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g);
    out(g, send);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  const bell = (at, freq, gain = 0.08) => {
    tone({ at, freq, dur: 2.2, gain, send: 0.7 });
    tone({ at, freq: freq * 2.76, dur: 1.2, gain: gain * 0.35, send: 0.7 });
    tone({ at, freq: freq * 5.4, dur: 0.5, gain: gain * 0.12, send: 0.7 });
  };

  // --- One-shot effects ------------------------------------------------------------

  const effects = {
    tick: () => burst({ dur: 0.03, type: 'highpass', freq: 2800, gain: 0.25, send: 0.15 }),
    ratchet: () => {
      const t = ctx.currentTime;
      burst({ at: t, dur: 0.03, type: 'highpass', freq: 2400, gain: 0.22, send: 0.15 });
      burst({ at: t + 0.05, dur: 0.03, type: 'highpass', freq: 2000, gain: 0.16, send: 0.15 });
    },
    clunk: () => {
      tone({ freq: 110, glideTo: 60, dur: 0.3, gain: 0.35, send: 0.4 });
      burst({ dur: 0.12, type: 'lowpass', freq: 600, gain: 0.35 });
    },
    slide: () => burst({ dur: 0.5, type: 'bandpass', freq: 500, sweepTo: 900, q: 0.8, gain: 0.14, attack: 0.08 }),
    creak: () => tone({ freq: 140, glideTo: 95, dur: 0.45, type: 'sawtooth', gain: 0.025, attack: 0.08, send: 0.5 }),
    paper: () => {
      const t = ctx.currentTime;
      for (let i = 0; i < 5; i++) burst({ at: t + i * 0.045 + Math.random() * 0.02, dur: 0.06, type: 'highpass', freq: 2500 + Math.random() * 2000, gain: 0.08, send: 0.2 });
    },
    chime: () => {
      const t = ctx.currentTime;
      bell(t, 659.3);
      bell(t + 0.14, 987.8, 0.06);
    },
    discovery: () => {
      const t = ctx.currentTime;
      [523.3, 659.3, 784, 1046.5, 1318.5].forEach((f, i) => bell(t + i * 0.22, f, 0.07));
    },
    gears: () => {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = 38;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 220;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.4);
      g.gain.setValueAtTime(0.12, t + 2.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      o.connect(f).connect(g);
      out(g, 0.6);
      o.start(t);
      o.stop(t + 3.3);
      for (let i = 0; i < 14; i++) burst({ at: t + 0.3 + i * 0.19, dur: 0.05, type: 'bandpass', freq: 1400, q: 3, gain: 0.12, send: 0.6 });
      tone({ at: t + 3.2, freq: 80, glideTo: 45, dur: 0.8, gain: 0.4, send: 0.8 });
      burst({ at: t + 3.2, dur: 0.3, type: 'lowpass', freq: 400, gain: 0.4, send: 0.8 });
    },
    step: () => {
      tone({ freq: 75 + Math.random() * 20, glideTo: 50, dur: 0.09, gain: 0.07 + Math.random() * 0.03, send: 0.25 });
      burst({ dur: 0.07, type: 'lowpass', freq: 500, gain: 0.05, send: 0.2 });
    },
  };

  // --- Ambience ---------------------------------------------------------------------

  let fireGain = null;
  function startAmbience() {
    // Wind across the open slit: band-passed noise with a slowly wandering pitch.
    const wind = ctx.createBufferSource();
    wind.buffer = noise;
    wind.loop = true;
    const wf = ctx.createBiquadFilter();
    wf.type = 'bandpass';
    wf.frequency.value = 420;
    wf.Q.value = 0.9;
    const wg = ctx.createGain();
    wg.gain.value = 0.05;
    wind.connect(wf).connect(wg);
    out(wg, 0.5);
    wind.start();
    const rumble = ctx.createBufferSource();
    rumble.buffer = noise;
    rumble.loop = true;
    const rf = ctx.createBiquadFilter();
    rf.type = 'lowpass';
    rf.frequency.value = 110;
    const rg = ctx.createGain();
    rg.gain.value = 0.06;
    rumble.connect(rf).connect(rg);
    out(rg, 0);
    rumble.start(0, 0.7);
    const gust = () => {
      const t = ctx.currentTime;
      wf.frequency.setTargetAtTime(280 + Math.random() * 520, t, 1.5);
      wg.gain.setTargetAtTime(0.025 + Math.random() * 0.07, t, 1.8);
      setTimeout(gust, 1800 + Math.random() * 2600);
    };
    gust();

    // The stove: irregular pops and a soft hiss, louder the closer you stand.
    fireGain = ctx.createGain();
    fireGain.gain.value = 0;
    fireGain.connect(master);
    const hiss = ctx.createBufferSource();
    hiss.buffer = noise;
    hiss.loop = true;
    const hf = ctx.createBiquadFilter();
    hf.type = 'bandpass';
    hf.frequency.value = 1800;
    hf.Q.value = 0.5;
    const hg = ctx.createGain();
    hg.gain.value = 0.03;
    hiss.connect(hf).connect(hg).connect(fireGain);
    hiss.start();
    const pop = () => {
      if (ctx.state === 'running') {
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 1200 + Math.random() * 2500;
        const g = ctx.createGain();
        const t = ctx.currentTime;
        const peak = 0.1 + Math.random() * 0.25;
        g.gain.setValueAtTime(peak, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.01 + Math.random() * 0.04);
        src.connect(f).connect(g).connect(fireGain);
        src.start(t, Math.random());
        src.stop(t + 0.08);
      }
      setTimeout(pop, 40 + Math.random() ** 2 * 600);
    };
    pop();
  }

  let started = false;
  return {
    // Must be called from a user gesture (click / key).
    unlock() {
      ctx.resume();
      if (!started) {
        started = true;
        startAmbience();
      }
    },
    setVolume(v) {
      master.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
    },
    play(name) {
      if (ctx.state === 'running') effects[name]?.();
    },
    setFireDistance(d) {
      fireGain?.gain.setTargetAtTime(Math.min(1, 1.2 / Math.max(d, 0.6) ** 1.5), ctx.currentTime, 0.2);
    },
  };
}
