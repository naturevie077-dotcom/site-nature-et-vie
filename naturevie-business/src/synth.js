/* bruitages (WebAudio, aussi utilisé hors-ligne pour le rendu) */
function noiseBuf(c, dur) { const b = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate), d = b.getChannelData(0); let s = 12345; for (let i = 0; i < d.length; i++) { s = (s * 1664525 + 1013904223) >>> 0; d[i] = (s / 4294967296) * 2 - 1; } return b; }
function synth(c, out, kind, w, vol = 1) {
  const env = (g, a, pk, d) => { g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, pk * vol), w + a); g.gain.exponentialRampToValueAtTime(0.0001, w + a + d); };
  const osc = (type, f0, f1, a, d, pk, dt = 0) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, w + dt); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), w + dt + a + d); g.gain.setValueAtTime(0.0001, w + dt); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, pk * vol), w + dt + a); g.gain.exponentialRampToValueAtTime(0.0001, w + dt + a + d); o.connect(g); g.connect(out); o.start(w + dt); o.stop(w + dt + a + d + 0.05); };
  const nz = (type, f0, f1, a, d, pk, q = 1) => { const s = c.createBufferSource(); s.buffer = noiseBuf(c, a + d + 0.1); const f = c.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, w); f.frequency.exponentialRampToValueAtTime(f1, w + a + d); const g = c.createGain(); env(g, a, pk, d); s.connect(f); f.connect(g); g.connect(out); s.start(w); };
  if (kind === "pop") osc("sine", 560, 190, 0.005, 0.12, 0.6);
  else if (kind === "whoosh") nz("bandpass", 400, 3800, 0.18, 0.2, 0.45, 0.9);
  else if (kind === "thud") { osc("sine", 150, 38, 0.004, 0.34, 0.95); nz("lowpass", 900, 120, 0.004, 0.2, 0.45); }
  else if (kind === "ding") { osc("sine", 1318, 1318, 0.004, 1.0, 0.3); osc("sine", 1976, 1976, 0.004, 0.7, 0.16); }
  else if (kind === "tick") { nz("highpass", 3000, 3000, 0.002, 0.03, 0.4); osc("square", 1700, 900, 0.002, 0.02, 0.08); }
  else if (kind === "check") { osc("sine", 880, 880, 0.004, 0.09, 0.4); osc("sine", 1320, 1320, 0.004, 0.18, 0.4, 0.07); }
  else if (kind === "coin") { osc("sine", 1568, 1568, 0.003, 0.5, 0.35); osc("sine", 2093, 2093, 0.003, 0.9, 0.3, 0.09); osc("triangle", 3136, 3136, 0.003, 0.4, 0.12, 0.09); }
  else if (kind === "fall") nz("bandpass", 2600, 300, 0.05, 0.5, 0.3, 0.8);
}
