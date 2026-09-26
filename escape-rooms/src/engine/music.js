// The gramophone: a slow waltz in D minor for pianoforte, synthesised note by note and
// pushed through a small horn, a wobbling turntable and surface crackle so it sounds
// like a record from another room. The tune is original.

const BPM = 72;
const BEAT = 60 / BPM;
const LOOKAHEAD = 0.8; // seconds of notes scheduled ahead
const TICK_MS = 120;

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, Bb: 10, B: 11 };
const midi = (name) => {
  const [, pitch, octave] = name.match(/^([A-G][#b]?)(\d)$/);
  return 12 * (Number(octave) + 1) + NOTE[pitch];
};
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// Left hand: bass on the first beat, the chord on the second and third.
const CHORDS = {
  Dm: ['D2', ['F3', 'A3', 'D4']],
  DmA: ['A2', ['F3', 'A3', 'D4']],
  Gm: ['G2', ['G3', 'Bb3', 'D4']],
  A7: ['A2', ['G3', 'C#4', 'E4']],
  A: ['A2', ['A3', 'C#4', 'E4']],
  Bb: ['Bb2', ['F3', 'Bb3', 'D4']],
  F: ['F2', ['F3', 'A3', 'C4']],
  C7: ['C3', ['E3', 'G3', 'Bb3']],
  E7: ['E2', ['G#3', 'B3', 'D4']],
};

// Right hand, bar by bar: [note, beats], 'r' for a rest.
const A = {
  chords: ['Dm', 'Dm', 'Gm', 'Gm', 'A7', 'A7', 'Dm', 'Dm', 'Bb', 'Bb', 'Gm', 'Gm', 'DmA', 'A7', 'Dm', 'Dm'],
  tune: [
    [['D5', 2], ['A4', 1]], [['F5', 1.5], ['E5', 0.5], ['D5', 1]], [['G4', 2], ['Bb4', 1]], [['D5', 3]],
    [['C#5', 2], ['E5', 1]], [['G5', 1.5], ['F5', 0.5], ['E5', 1]], [['F5', 2], ['D5', 1]], [['A4', 3]],
    [['D5', 2], ['F5', 1]], [['Bb5', 1.5], ['A5', 0.5], ['G5', 1]], [['G5', 2], ['Bb4', 1]], [['D5', 3]],
    [['F5', 1], ['E5', 1], ['D5', 1]], [['C#5', 1], ['E5', 1], ['A4', 1]], [['D5', 3]], [['r', 3]],
  ],
};
const B = {
  chords: ['F', 'F', 'C7', 'C7', 'Dm', 'Dm', 'E7', 'A', 'Bb', 'Bb', 'Gm', 'A7', 'Dm', 'A7', 'Dm', 'Dm'],
  tune: [
    [['A5', 2], ['F5', 1]], [['C5', 2], ['F5', 1]], [['E5', 1.5], ['G5', 0.5], ['Bb5', 1]], [['A5', 3]],
    [['F5', 2], ['A5', 1]], [['D5', 2], ['F5', 1]], [['G#4', 1], ['B4', 1], ['D5', 1]], [['C#5', 3]],
    [['Bb4', 2], ['D5', 1]], [['F5', 1.5], ['E5', 0.5], ['D5', 1]], [['G4', 2], ['Bb4', 1]], [['C#5', 1], ['E5', 1], ['G5', 1]],
    [['F5', 2], ['E5', 1]], [['E5', 1], ['D5', 1], ['C#5', 1]], [['D5', 3]], [['r', 3]],
  ],
};

// The whole record as [beat, midi, beats held, loudness], then two bars of run-out groove.
function score() {
  const events = [];
  let bar = 0;
  for (const section of [A, B, A]) {
    section.tune.forEach((notes, i) => {
      const start = bar * 3;
      const [bass, chord] = CHORDS[section.chords[i]];
      events.push([start, midi(bass), 2.5, 0.5]);
      for (const beat of [1, 2]) for (const n of chord) events.push([start + beat, midi(n), 0.9, 0.2]);
      let t = start;
      for (const [n, beats] of notes) {
        if (n !== 'r') events.push([t, midi(n), beats, 0.62]);
        t += beats;
      }
      bar++;
    });
  }
  return { events: events.sort((a, b) => a[0] - b[0]), beats: (bar + 2) * 3 };
}

export function createGramophone(ctx, master, reverb) {
  const { events, beats } = score();
  const length = beats * BEAT;

  // Horn: a narrow band with a nasal peak, a little grit, then distance and the room.
  const input = ctx.createGain();
  const wow = ctx.createDelay(0.05);
  wow.delayTime.value = 0.012;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.55;
  const depth = ctx.createGain();
  depth.gain.value = 0.0018;
  lfo.connect(depth).connect(wow.delayTime);
  lfo.start();
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 300;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2800;
  const peak = ctx.createBiquadFilter();
  peak.type = 'peaking';
  peak.frequency.value = 1400;
  peak.Q.value = 1.2;
  peak.gain.value = 5;
  const grit = ctx.createWaveShaper();
  grit.curve = Float32Array.from({ length: 256 }, (_, i) => Math.tanh(((i / 255) * 2 - 1) * 1.6));
  const needle = ctx.createGain(); // up or down
  needle.gain.value = 0;
  const distance = ctx.createGain();
  distance.gain.value = 0.3;
  input.connect(wow).connect(hp).connect(peak).connect(lp).connect(grit).connect(needle).connect(distance);
  distance.connect(master);
  const send = ctx.createGain();
  send.gain.value = 0.5;
  distance.connect(send).connect(reverb);

  // Surface noise: soft hiss with crackles, looped.
  const crackle = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
  const d = crackle.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    d[i] = (Math.random() * 2 - 1) * 0.05;
    if (Math.random() < 0.0009) d[i] += (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.7);
  }
  const surface = ctx.createBufferSource();
  surface.buffer = crackle;
  surface.loop = true;
  const surfaceGain = ctx.createGain();
  surfaceGain.gain.value = 0.35;
  surface.connect(surfaceGain).connect(hp);
  surface.start();

  function play(at, m, beats, loud) {
    const f = hz(m) * (1 + (Math.random() - 0.5) * 0.002);
    const ring = beats * BEAT + (m < 50 ? 1.6 : 1.1);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, at);
    out.gain.linearRampToValueAtTime(loud * (0.85 + Math.random() * 0.3), at + 0.006);
    out.gain.exponentialRampToValueAtTime(loud * 0.35, at + 0.25);
    out.gain.exponentialRampToValueAtTime(0.0008, at + ring);
    out.connect(input);
    [[1, 1], [2, 0.45], [3, 0.2], [4.02, 0.1]].forEach(([mult, amp]) => {
      const o = ctx.createOscillator();
      o.frequency.value = f * mult;
      const g = ctx.createGain();
      g.gain.setValueAtTime(amp * 0.25, at);
      g.gain.exponentialRampToValueAtTime(amp * 0.25 * 0.02 ** (mult / 2), at + ring);
      o.connect(g).connect(out);
      o.start(at);
      o.stop(at + ring + 0.05);
    });
  }

  let playing = false;
  let origin = 0; // context time at which the record's current lap began
  let next = 0; // index of the next event to schedule
  function tick() {
    if (!playing || ctx.state !== 'running') return;
    const horizon = ctx.currentTime + LOOKAHEAD;
    for (;;) {
      if (next >= events.length) {
        next = 0;
        origin += length;
      }
      const [beat, m, held, loud] = events[next];
      const at = origin + beat * BEAT + (Math.random() - 0.5) * 0.02;
      if (at > horizon) break;
      if (at > ctx.currentTime) play(at, m, held, loud);
      next++;
    }
  }
  setInterval(tick, TICK_MS);

  return {
    setPlaying(on) {
      if (on === playing) return;
      playing = on;
      const t = ctx.currentTime;
      needle.gain.setTargetAtTime(on ? 1 : 0, t, on ? 0.3 : 0.08);
      if (on) {
        // Resume from where the needle was lifted, give or take.
        const lap = ((t - origin) % length + length) % length;
        origin = t - lap + 0.3;
        next = events.findIndex((e) => e[0] * BEAT >= lap);
        if (next < 0) next = events.length;
      }
    },
    // Louder the closer you stand, but always faintly there.
    setDistance(dist) {
      distance.gain.setTargetAtTime(Math.min(0.9, 0.12 + 1.1 / Math.max(dist, 0.8) ** 1.3), ctx.currentTime, 0.3);
    },
  };
}
