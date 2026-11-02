#!/usr/bin/env python3
"""Musique originale « Naturetvie Business » — 52 s, 108 BPM, synthèse numpy/scipy (aucun droit à clarifier).
Rythmée, confiante, business : tension (0-5 s) → groove (5 s+) → montée (38-41,7 s) → final lumineux."""
import numpy as np, sys
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = 52.0; N = int(SR * DUR); BPM = 108; BEAT = 60 / BPM; BAR = BEAT * 4
rng = np.random.default_rng(21); L = np.zeros(N); R = np.zeros(N)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def put(sig, t0, pan=0.0, g=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    s = sig[: N - i] * g; a = (pan + 1) * np.pi / 4; L[i:i + len(s)] += s * np.cos(a); R[i:i + len(s)] += s * np.sin(a)
def tone(f, dur, harm=((1, 1.0),), att=0.005, dec=4.0):
    n = int(dur * SR); t = np.arange(n) / SR; y = sum(a * np.sin(2 * np.pi * f * h * t) for h, a in harm); return y * np.minimum(1, t / att) * np.exp(-t * dec)
def kick(t0, g=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR; f = 46 + 110 * np.exp(-t * 26); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8.5); put(y, t0, 0, 0.9 * g)
def hat(t0, g=1.0, open_=False):
    n = int((0.22 if open_ else 0.05) * SR); x = rng.standard_normal(n); x = signal.sosfilt(signal.butter(2, 7000 / (SR / 2), 'high', output='sos'), x) * np.exp(-np.arange(n) / SR * (22 if open_ else 80)); put(x, t0, 0.25, 0.16 * g)
def clap(t0, g=1.0):
    n = int(0.28 * SR); x = rng.standard_normal(n); x = signal.sosfilt(signal.butter(2, [1200 / (SR / 2), 4800 / (SR / 2)], 'band', output='sos'), x); t = np.arange(n) / SR
    env = np.exp(-t * 16) + 0.6 * np.exp(-((t - 0.012) ** 2) / 1e-5) + 0.5 * np.exp(-((t - 0.024) ** 2) / 1e-5); put(x * env, t0, 0, 0.28 * g)
def bass(f, t0, dur, g=1.0):
    y = tone(f, dur, ((1, 1.0), (2, 0.35), (3, 0.12)), 0.01, 3.2); put(y, t0, 0, 0.5 * g)
def pad(freqs, t0, dur, g=1.0, att=0.5, rel=0.5):
    n = int((dur + rel) * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for f in freqs:
        for det in (-0.05, 0.05): ff = f * 2 ** (det / 12); out += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6.28)) + 0.22 * np.sin(2 * np.pi * 2 * ff * t)
    out *= np.minimum(1, t / att) * np.minimum(1, np.maximum(0, dur + rel - t) / rel) / (len(freqs) * 2); put(out, t0, -0.2, 0.7 * g); put(out, t0 + 0.01, 0.2, 0.7 * g)
def pluck(m, t0, g=1.0, pan=0.0, dec=6.0):
    put(tone(midi(m), 0.9, ((1, 1.0), (2, 0.3), (3, 0.1)), 0.003, dec), t0, pan, 0.32 * g)
def stab(ms, t0, g=1.0):
    for m in ms: put(tone(midi(m), 0.28, ((1, 1.0), (2, 0.4), (3, 0.2)), 0.004, 11.0), t0, 0.1, 0.12 * g)
def noise_riser(t0, dur, g=1.0, f0=300, f1=9000):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); blk = 512; zi = None
    for i in range(0, n, blk):
        p = (i + blk / 2) / n; fc = f0 * (f1 / f0) ** p; sos = signal.butter(2, [fc * 0.6 / (SR / 2), min(0.98, fc * 1.5 / (SR / 2))], 'band', output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        y, zi = signal.sosfilt(sos, x[i:i + blk], zi=zi); out[i:i + blk] = y
    t = np.arange(n) / SR; put(out * (t / dur) ** 2.2, t0, 0, 0.5 * g)
CH = {'C': ([48, 55, 60, 64, 67], 36), 'G': ([43, 50, 59, 62, 67], 43), 'Am': ([45, 52, 57, 60, 64], 45), 'F': ([41, 48, 57, 60, 65], 41)}
prog = ['C', 'G', 'Am', 'F']
def section(t):  # 0 tension, 1 groove, 2 plein, 3 montée
    return 0 if t < 5.0 else 3 if 38.0 <= t < 41.7 else 1 if t < 22.0 else 2
# --- tension 0-5 s : bourdon grave + pouls qui accélère + montée de bruit
put(tone(55, 5.2, ((1, 1.0), (2, 0.25)), 0.5, 0.0), 0, 0, 0.5); put(tone(82.4, 5.2, ((1, 1.0),), 0.8, 0.0), 0, 0, 0.3)
tb = 0.0; step = 0.62
while tb < 4.9:
    kick(tb, 0.55 + 0.3 * tb / 5); tb += step; step = max(0.2, step * 0.93)
noise_riser(0.2, 4.8, 0.7)
# --- groove
nb = int(DUR / BEAT) + 1
for b in range(nb):
    t0 = b * BEAT
    if t0 >= DUR: break
    sec = section(t0)
    bar = int(t0 // BAR); ch = prog[bar % 4]; notes, root = CH[ch]
    if t0 >= 41.7 and t0 < 41.7 + BEAT * 0.5: continue
    if sec in (1, 2, 3) or t0 >= 41.7:
        kick(t0, 0.9)
        hat(t0 + BEAT / 2, 0.9); hat(t0, 0.5)
        if b % 4 == 3: hat(t0 + BEAT / 2, 0.8, True)
        if (sec == 2 or t0 >= 41.7) and b % 2 == 1: clap(t0)
        # basse : fondamentale + syncope
        bass(midi(root), t0, BEAT * 0.9, 1.0); 
        if b % 4 == 2: bass(midi(root + 12), t0 + BEAT * 0.5, BEAT * 0.4, 0.7)
    if b % 4 == 0 and (sec in (1, 2) or t0 >= 41.7) and t0 >= 5.0:
        pad([midi(m) for m in notes[1:]], t0, BAR, 0.8 if sec == 1 else 1.0)
    # arpèges : lumineux dans les parties pleines
    if t0 >= 5.0 and (sec in (1, 2, 3) or t0 >= 41.7):
        ar = notes[1:] + [notes[1] + 12]
        for k in range(2):
            m = ar[(b * 2 + k) % len(ar)] + 12; pluck(m, t0 + k * BEAT / 2, 0.6 if sec == 1 else 0.9, [-0.4, 0.4][k], 7.0)
    if sec == 2 or t0 >= 41.7:
        if b % 4 in (1, 3): stab([n + 12 for n in notes[1:4]], t0 + BEAT * 0.5, 1.0)
# --- scène 5 : montée vers « Point. » (38 → 41,7 s) puis impact
noise_riser(38.0, 3.7, 1.0, 200, 11000)
for k in range(24):  # roulement de caisse claire accéléré
    tt = 38.5 + 3.1 * (1 - (1 - k / 24) ** 1.6); n = int(0.06 * SR); x = rng.standard_normal(n); x = signal.sosfilt(signal.butter(2, 1800 / (SR / 2), 'high', output='sos'), x) * np.exp(-np.arange(n) / SR * 50); put(x, tt, 0, 0.12 + 0.2 * k / 24)
kick(41.7, 1.2); put(tone(48, 1.2, ((1, 1.0),), 0.002, 3.0), 41.7, 0, 0.9)
def bell(t0, f, g):
    n = int(3.0 * SR); t = np.arange(n) / SR; y = sum(a * np.sin(2 * np.pi * midi(f) * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 1.2), (2.76, .35, .7), (5.4, .12, .35)]); put(y, t0, 0.1, g)
bell(41.7, 84, 0.2); bell(48.7, 88, 0.16); bell(6.15, 91, 0.14)
# final : accord tenu qui se résout
pad([midi(m) for m in [48, 55, 60, 64, 67, 72]], 49.6, 2.4, 1.2, 0.3, 0.9); kick(49.6, 1.0); clap(49.6)
# --- réverbération
t = np.arange(int(1.6 * SR)) / SR; ir = rng.standard_normal(len(t)) * np.exp(-t * 2.8); ir = signal.sosfilt(signal.butter(2, 5000 / (SR / 2), 'low', output='sos'), ir); ir /= np.abs(ir).sum() * 0.14
wl = signal.fftconvolve(L, ir)[:N]; wr = signal.fftconvolve(R, ir[::-1])[:N]
m = np.stack([L * 0.85 + wl * 0.28, R * 0.85 + wr * 0.28], 1)
tt = np.arange(N) / SR; m *= (np.minimum(1, tt / 0.3) * np.minimum(1, (DUR - tt) / 1.0))[:, None]
m = np.tanh(m / (np.abs(m).max() + 1e-9) * 1.6) / np.tanh(1.6)
rms = np.sqrt((m ** 2).mean()); m *= (10 ** (-20 / 20)) / rms
pk = np.abs(m).max(); m *= min(1, 0.9 / pk)
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', SR, (np.clip(m, -1, 1) * 32767).astype(np.int16)); print('music ok peak', round(float(np.abs(m).max()), 3))
