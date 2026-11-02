#!/usr/bin/env python3
"""Fond musical « Novembre Bleu » — synthèse 100 % originale (numpy/scipy), 45 s, 100 BPM.
Sortie : bed_raw.wav (sans ducking) — le ducking sous les voix est appliqué au mixage."""
import numpy as np, sys
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = 45.0; N = int(SR * DUR); BAR = 2.4; BEAT = 0.6
rng = np.random.default_rng(5)
L = np.zeros(N); R = np.zeros(N)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def put(sig, t0, pan=0.0, g=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    s = sig[: N - i] * g; a = (pan + 1) * np.pi / 4
    L[i:i + len(s)] += s * np.cos(a); R[i:i + len(s)] += s * np.sin(a)
def tone(f, dur, harm=((1, 1.0),), att=0.01, dec=3.0, hold=0.0):
    n = int(dur * SR); t = np.arange(n) / SR; y = sum(a * np.sin(2 * np.pi * f * h * t) for h, a in harm)
    env = np.minimum(1, t / max(att, 1e-4)) * np.exp(-np.maximum(0, t - hold) * dec); return y * env
def pad(freqs, t0, dur, g, att=0.7, rel=0.9):
    n = int((dur + rel) * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for f in freqs:
        for det in (-0.04, 0.04):
            ff = f * 2 ** (det / 12); out += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6.28)) + 0.25 * np.sin(2 * np.pi * 2 * ff * t) + 0.08 * np.sin(2 * np.pi * 3 * ff * t)
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (dur + rel - t)) / rel)
    out *= env / (len(freqs) * 2)
    put(out, t0, -0.2, g); put(out * 0.9, t0 + 0.012, 0.2, g)
TRI = {'C': [60, 64, 67], 'G': [59, 62, 67], 'Am': [57, 60, 64], 'F': [57, 60, 65], 'Dm': [57, 62, 65], 'Em': [59, 64, 67]}
ROOT = {'C': 36, 'G': 43, 'Am': 45, 'F': 41, 'Dm': 38, 'Em': 40}
bars = ['C', 'G', 'Am', 'F', 'Am', 'F', 'C', 'G', 'Am', 'Dm', 'Am', 'Em', 'F', 'F', 'C', 'G', 'Am', 'C', 'C']
def energy(t):  # 0..1 selon la scène
    return 0.85 if t < 10 else 0.55 if t < 19 else 0.38 if t < 31 else 0.62 if t < 41 else 1.0
for bi, ch in enumerate(bars):
    t0 = bi * BAR
    if t0 >= DUR: break
    e = energy(t0); tri = TRI[ch]
    pad([midi(m) for m in tri] + [midi(tri[0] - 12)], t0, BAR, 0.75 * (0.6 + 0.4 * e))
    # basse douce
    put(tone(midi(ROOT[ch]), BAR, ((1, 1.0), (2, 0.2)), att=0.03, dec=0.9), t0, 0, 0.55)
    # arpège (pizzicato) : dense au début/à la fin, clairsemé dans les passages sérieux
    notes = [tri[0] + 12, tri[1] + 12, tri[2] + 12, tri[1] + 12]
    step = BEAT / 2 if e > 0.8 else BEAT if e > 0.5 else BEAT * 2
    k = 0; tt = 0.0
    while tt < BAR - 0.01:
        m = notes[k % 4] + (12 if (k % 8 == 7 and e > 0.8) else 0)
        put(tone(midi(m), 1.4, ((1, 1.0), (2, 0.32), (3, 0.12)), att=0.004, dec=5.0 if e > 0.5 else 2.6), t0 + tt, [-0.35, 0.3, -0.1, 0.4][k % 4], 0.42 * (0.55 + 0.45 * e))
        k += 1; tt += step
    # shaker léger sur les contre-temps (passages dynamiques)
    if e >= 0.6:
        for j in range(int(BAR / (BEAT / 2))):
            if j % 2 == 1:
                n = int(0.05 * SR); x = rng.standard_normal(n); x = signal.sosfilt(signal.butter(2, 6500 / (SR / 2), 'high', output='sos'), x) * np.exp(-np.arange(n) / SR * 70)
                put(x, t0 + j * BEAT / 2, 0.3 if (j // 2) % 2 else -0.3, 0.05 * e)
    # pouls grave dans la partie « signes » (19–31 s)
    if 19.0 <= t0 < 31.2:
        for j in range(2):
            put(tone(55 + 0 * j, 0.5, ((1, 1.0),), att=0.01, dec=8.0), t0 + j * 1.2, 0, 0.45); put(tone(55, 0.4, ((1, 1.0),), att=0.01, dec=9.0), t0 + j * 1.2 + 0.28, 0, 0.3)
# cloches : conclusion et clin d'œil sur le ruban
for tb, f, g in [(41.2, 84, 0.28), (41.2, 91, 0.16), (43.1, 88, 0.2), (31.3, 79, 0.12)]:
    n = int(3.5 * SR); t = np.arange(n) / SR; y = sum(a * np.sin(2 * np.pi * midi(f) * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 1.4), (2.76, .35, .8), (5.4, .15, .4)]); put(y, tb, 0.15, g)
# réverbération douce
t = np.arange(int(1.9 * SR)) / SR; ir = rng.standard_normal(len(t)) * np.exp(-t * 2.4); ir = signal.sosfilt(signal.butter(2, 5000 / (SR / 2), 'low', output='sos'), ir); ir /= np.abs(ir).sum() * 0.12
wl = signal.fftconvolve(L, ir)[:N]; wr = signal.fftconvolve(R, ir[::-1])[:N]
bed = np.stack([L * 0.8 + wl * 0.32, R * 0.8 + wr * 0.32], 1)
# fondus d'entrée/sortie
tt = np.arange(N) / SR; bed *= (np.minimum(1, tt / 1.2) * np.minimum(1, (DUR - tt) / 1.4))[:, None]
bed /= np.abs(bed).max() + 1e-9
rms = np.sqrt((bed ** 2).mean()); bed *= (10 ** (-26 / 20)) / rms   # RMS moyen ≈ -26 dBFS
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'bed_raw.wav', SR, (np.clip(bed, -1, 1) * 32767).astype(np.int16))
print('bed ok, peak', round(float(np.abs(bed).max()), 3))
