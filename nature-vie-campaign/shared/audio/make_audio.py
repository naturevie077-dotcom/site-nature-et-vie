#!/usr/bin/env python3
"""Bande-son cinématique « Le bien-être en mouvement » — synthèse 100 % procédurale.

Aucune ressource externe : tout est généré par numpy/scipy (pas de droits à clarifier).
Les repères temporels (CUES) sont partagés avec les deux vidéos (HyperFrames et Remotion).
Usage : python3 make_audio.py  ->  soundtrack.wav (48 kHz, stéréo, 24 s)
"""
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 24.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def tt(n):
    return np.arange(n) / SR


def add(sig, t0, pan=0.0, gain=1.0):
    """Mixe `sig` (mono) à t0 secondes, panoramique -1..1."""
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    seg = sig[: N - i0] * gain
    a = (pan + 1) * np.pi / 4
    L[i0 : i0 + len(seg)] += seg * np.cos(a)
    R[i0 : i0 + len(seg)] += seg * np.sin(a)


def add_st(l, r, t0, gain=1.0):
    i0 = int(t0 * SR)
    n = min(len(l), N - i0)
    L[i0 : i0 + n] += l[:n] * gain
    R[i0 : i0 + n] += r[:n] * gain


def swept_noise(dur, f0, f1, q=1.2, seed=0):
    """Bruit passe-bande dont la fréquence centrale glisse exponentiellement f0 -> f1."""
    g = np.random.default_rng(seed)
    n = int(dur * SR)
    x = g.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    zi = None
    for i in range(0, n, blk):
        p = (i + blk / 2) / n
        fc = f0 * (f1 / f0) ** p
        lo = max(fc / (1 + 1 / q), 30) / (SR / 2)
        hi = min(fc * (1 + 1 / q), SR / 2 - 100) / (SR / 2)
        sos = signal.butter(2, [lo, hi], btype="band", output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y, zi = signal.sosfilt(sos, x[i : i + blk], zi=zi)
        out[i : i + blk] = y
    return out / (np.max(np.abs(out)) + 1e-9)


def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc / (SR / 2), "high", output="sos"), x)


def lp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc / (SR / 2), "low", output="sos"), x)


def impact(t0, power=1.0, pan=0.0):
    """Impact cinématique : sub qui plonge + claque + crash + queue."""
    n = int(3.2 * SR)
    t = tt(n)
    f = 38 + 95 * np.exp(-t * 16)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    body = np.sin(2 * np.pi * np.cumsum(70 + 160 * np.exp(-t * 30)) / SR) * np.exp(-t * 9) * 0.6
    click = lp(rng.standard_normal(n), 5000) * np.exp(-t * 55) * 0.8
    crash = hp(rng.standard_normal(n), 2800) * np.exp(-t * 2.3) * 0.22
    boom = lp(rng.standard_normal(n), 220) * np.exp(-t * 3.0) * 0.5
    sig = sub * 0.95 + body + click + crash + boom
    add(sig, t0, pan, 0.8 * power)


def whoosh(t0, dur, rising=True, gain=0.5, pan_from=-0.7, pan_to=0.7, seed=1):
    n = int(dur * SR)
    f0, f1 = (250, 5200) if rising else (5200, 250)
    x = swept_noise(dur, f0, f1, q=1.1, seed=seed)
    t = tt(n) / dur
    env = (t ** 2.2) * np.exp(-((1 - t) * 0.0)) if rising else (1 - t) ** 1.6
    env = env * np.minimum(1, (1 - t) * 40 + 0.0 if rising else t * 40 + 0.0 + 0.0)
    if rising:
        env = (np.sin(np.pi * 0.5 * np.minimum(t * 1.0, 1))) ** 3.0
        env[int(n * 0.93) :] *= np.linspace(1, 0, n - int(n * 0.93))
    pan = np.linspace(pan_from, pan_to, n)
    a = (pan + 1) * np.pi / 4
    sig = x * env
    add_st(sig * np.cos(a), sig * np.sin(a), t0, gain)


def riser(t0, dur, f0=180, f1=1400, gain=0.35, seed=3):
    n = int(dur * SR)
    t = tt(n)
    p = t / dur
    fr = f0 * (f1 / f0) ** p
    tone = np.sin(2 * np.pi * np.cumsum(fr) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(fr * 1.5) / SR)
    nz = swept_noise(dur, 400, 7000, q=0.7, seed=seed)
    env = p ** 2.2
    sig = (tone * 0.45 + nz * 0.9) * env
    sig[-int(0.02 * SR) :] *= np.linspace(1, 0, int(0.02 * SR))
    add(sig, t0, 0, gain)


def bell(t0, f, gain=0.3, dur=4.0, pan=0.0):
    n = int(dur * SR)
    t = tt(n)
    sig = np.zeros(n)
    for r, a, d in [(1, 1.0, 1.6), (2.0, 0.45, 1.2), (2.76, 0.4, 0.9), (4.07, 0.25, 0.6), (5.4, 0.18, 0.45), (8.93, 0.08, 0.3)]:
        sig += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d)
    sig *= np.minimum(1, t * 800)
    add(sig, t0, pan, gain)


def pluck(t0, f, gain=0.18, dur=1.2, pan=0.0):
    n = int(dur * SR)
    t = tt(n)
    sig = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)) * np.exp(-t * 5.5)
    sig *= np.minimum(1, t * 600)
    add(sig, t0, pan, gain)


def tick(t0, gain=0.12, pan=0.3):
    n = int(0.12 * SR)
    t = tt(n)
    sig = hp(rng.standard_normal(n), 7000) * np.exp(-t * 60)
    add(sig, t0, pan, gain)


def kick(t0, gain=0.5):
    n = int(0.5 * SR)
    t = tt(n)
    f = 42 + 90 * np.exp(-t * 28)
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    sig += lp(rng.standard_normal(n), 3000) * np.exp(-t * 120) * 0.4
    add(sig, t0, 0, gain)


def sparkle(t0, f, gain=0.07, pan=0.0):
    n = int(0.9 * SR)
    t = tt(n)
    sig = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 9)
    sig *= np.minimum(1, t * 1500)
    add(sig, t0, pan, gain)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def pad(t0, t1, notes, gain=0.12, cutoff=(500, 2500), fade=1.4):
    """Nappe : sinus/dents-de-scie désaccordés, filtre qui s'ouvre, fondu enchaîné."""
    n = int((t1 - t0 + fade) * SR)
    t = tt(n)
    cut = np.linspace(cutoff[0], cutoff[1], n)
    outL = np.zeros(n)
    outR = np.zeros(n)
    for m in notes:
        f = midi(m)
        for det, pl in ((-0.07, 0.35), (0.0, 0.5), (0.09, 0.65)):
            ph = 2 * np.pi * np.cumsum(np.full(n, f * 2 ** (det / 12))) / SR + rng.uniform(0, 6.28)
            vib = 1 + 0.0015 * np.sin(2 * np.pi * 0.22 * t + rng.uniform(0, 6.28))
            saw = signal.sawtooth(ph * vib) * 0.5 + np.sin(ph * vib)
            outL += saw * (1 - pl)
            outR += saw * pl
    sos = signal.butter(2, 1500 / (SR / 2), "low", output="sos")
    # filtre statique + ouverture simulée par mélange de deux versions
    lo_l, lo_r = lp(outL, cutoff[0] * 1.6), lp(outR, cutoff[0] * 1.6)
    hi_l, hi_r = lp(outL, cutoff[1] * 1.6), lp(outR, cutoff[1] * 1.6)
    mix = np.linspace(0, 1, n)
    l = lo_l * (1 - mix) + hi_l * mix
    r = lo_r * (1 - mix) + hi_r * mix
    env = np.minimum(1, t / fade) * np.minimum(1, (t[-1] - t) / fade)
    add_st(l * env, r * env, t0, gain / max(len(notes), 1) ** 0.6)


# ---------------------------------------------------------------- partition
BEAT = 0.5  # 120 BPM

D = 38  # D2
CUES = {
    # Scène 1
    "riser1": (0.0, 1.7),
    "impact_title1": 1.7,
    "impact_title2": 2.8,
    "whoosh_s2": (3.45, 4.05),
    "impact_morph": 4.05,
    # Scène 2
    "words": [5.0, 5.5, 6.3, 7.0],
    "whoosh_s3": (8.4, 9.0),
    # Scène 3
    "impact_nature": 9.0,
    "impact_energie": 11.0,
    "impact_equilibre": 13.0,
    # Scène 4
    "riser4": (14.9, 17.2),
    "impact_brand": 17.2,
    # Scène 5
    "whoosh_s5": (19.55, 20.25),
    "logo": 20.4,
    "tagline": 21.8,
    "glow": 22.5,
}

# nappes — progression D / Dsus / Bm / G / A / D
pad(0.0, 4.2, [D, D + 7, D + 12, D + 19], 0.55, (350, 1800))
pad(4.0, 9.2, [D + 12, D + 16, D + 19, D + 24], 0.55, (700, 3000))
pad(9.0, 11.0, [D, D + 12, D + 16, D + 19], 0.55, (700, 2800), 0.4)
pad(11.0, 13.0, [D - 3, D + 9, D + 12, D + 15, D + 19], 0.55, (700, 2800), 0.4)  # Bm
pad(13.0, 15.1, [D - 7, D + 5, D + 12, D + 16, D + 19], 0.55, (700, 2800), 0.4)  # G
pad(14.9, 17.4, [D - 7, D + 12, D + 16, D + 19, D + 24], 0.6, (500, 3400))
pad(17.2, 20.4, [D, D + 12, D + 16, D + 19, D + 26], 0.65, (900, 3400))
pad(20.2, 24.0, [D, D + 7, D + 12, D + 16, D + 19, D + 26], 0.7, (700, 2600), 1.0)

# Scène 1 — poussière dorée : scintillements aléatoires qui s'accélèrent
g = np.random.default_rng(11)
t_sp = np.sort(np.concatenate([g.uniform(0.15, 1.65, 26) ** 1.15 * 1.0]))
for i, t in enumerate(t_sp):
    sparkle(t, g.choice([midi(86), midi(90), midi(93), midi(98), midi(102)]), 0.05 + 0.03 * (t / 1.7), g.uniform(-0.8, 0.8))
riser(*CUES["riser1"][:1], CUES["riser1"][1] - CUES["riser1"][0], 150, 1300, 0.34)
impact(CUES["impact_title1"], 0.95)
impact(CUES["impact_title2"], 0.8)
whoosh(*CUES["whoosh_s2"][:1], CUES["whoosh_s2"][1] - CUES["whoosh_s2"][0], True, 0.55)
impact(CUES["impact_morph"], 1.05)
bell(CUES["impact_morph"] + 0.02, midi(86), 0.18)

# Scène 2 — mots : « pop » boisé + scintillement, chacun avec sa couleur
for i, tw in enumerate(CUES["words"]):
    whoosh(tw - 0.28, 0.3, True, 0.22, -0.5 + i * 0.33, -0.2 + i * 0.33, seed=20 + i)
    kick(tw, 0.28)
    pluck(tw, midi([81, 85, 88, 93][i]), 0.22, pan=-0.4 + i * 0.27)
    sparkle(tw + 0.05, midi([98, 102, 105, 110][i]), 0.08, 0.3)
tm = np.arange(5.0, 8.4, BEAT / 2)
for i, t in enumerate(tm):
    pluck(t + 0.02, midi([74, 78, 81, 86][i % 4]), 0.05, 0.6, pan=0.5 * np.sin(i))
whoosh(*CUES["whoosh_s3"][:1], CUES["whoosh_s3"][1] - CUES["whoosh_s3"][0], True, 0.6, seed=31)

# Scène 3 — pulsation 120 BPM + trois impacts majeurs
for k, (name, p) in enumerate([("impact_nature", 1.15), ("impact_energie", 1.2), ("impact_equilibre", 1.25)]):
    t0 = CUES[name]
    impact(t0, p)
    whoosh(t0 - 0.55, 0.55, True, 0.5, -0.8, 0.8, seed=40 + k)
    whoosh(t0 + 0.02, 0.9, False, 0.22, 0.7, -0.7, seed=50 + k)
    root = [D, D - 3, D - 7][k]
    for b in range(4):
        tb = t0 + b * BEAT * 1.0
        if b > 0:
            kick(tb, 0.34)
        tick(tb + BEAT / 2, 0.11, 0.3 if b % 2 else -0.3)
    for j, st in enumerate([0, 12, 7, 12, 16, 12, 19, 12]):
        pluck(t0 + 0.0 + j * BEAT / 2, midi(root + 24 + st % 24), 0.09, 0.5, pan=-0.3 + 0.08 * j)
whoosh(14.45, 0.6, True, 0.55, -0.9, 0.9, seed=60)

# Scène 4 — montée, ligne lumineuse qui se dessine, puis impact de marque
riser(*CUES["riser4"][:1], CUES["riser4"][1] - CUES["riser4"][0], 200, 2200, 0.42)
for i, f in enumerate([86, 90, 93, 98, 102, 105, 110]):
    sparkle(15.3 + i * 0.3, midi(f), 0.07, -0.5 + i * 0.16)
impact(CUES["impact_brand"], 1.35)
bell(CUES["impact_brand"] + 0.03, midi(74), 0.3, pan=-0.2)
bell(CUES["impact_brand"] + 0.35, midi(81), 0.18, pan=0.25)
for j in range(10):
    pluck(17.7 + j * 0.25, midi(D + 36 + [0, 7, 12, 16, 19][j % 5]), 0.05, 0.8, pan=0.6 * np.sin(j))

# Scène 5 — signature : whoosh, cloche dorée, scintillement, résolution
whoosh(*CUES["whoosh_s5"][:1], CUES["whoosh_s5"][1] - CUES["whoosh_s5"][0], True, 0.55, seed=70)
impact(CUES["logo"], 0.75)
bell(CUES["logo"] + 0.02, midi(81), 0.34, 5.0)
bell(CUES["logo"] + 0.02, midi(93), 0.15, 5.0, pan=0.3)
for i, f in enumerate([98, 102, 105, 110, 114]):
    sparkle(CUES["tagline"] + i * 0.09, midi(f), 0.065, -0.3 + 0.15 * i)
bell(CUES["tagline"], midi(86), 0.2, 4.0, pan=-0.2)
riser(CUES["glow"] - 0.3, 0.9, 300, 3000, 0.16, seed=80)
bell(CUES["glow"] + 0.6, midi(88), 0.2, 3.0, pan=0.2)
# fin : aspiration inversée (« reverse crash »)
whoosh(22.9, 1.0, False, 0.18, 0.5, -0.5, seed=90)

# ---------------------------------------------------------------- réverbération + master
t_ir = tt(int(2.6 * SR))
ir = hp(rng.standard_normal(len(t_ir)), 200) * np.exp(-t_ir * 2.1)
ir = lp(ir, 7000)
ir /= np.sum(np.abs(ir)) * 0.18
wetL = signal.fftconvolve(L, ir)[:N]
wetR = signal.fftconvolve(R, ir[::-1])[:N]
mixL = L * 0.82 + wetL * 0.30
mixR = R * 0.82 + wetR * 0.30

# compresseur doux (tanh) + fondu de sortie + normalisation
mix = np.stack([mixL, mixR], 1)
mix = mix / (np.max(np.abs(mix)) + 1e-9)
mix = np.tanh(mix * 1.9) / np.tanh(1.9)
fade_in = np.minimum(1, tt(N) / 0.08)[:, None]
fade_out = np.minimum(1, (DUR - tt(N)) / 0.9)[:, None]
mix *= fade_in * fade_out * 0.94
wavfile.write("soundtrack.wav", SR, (mix * 32767).astype(np.int16))
print("OK soundtrack.wav", mix.shape, "peak", np.abs(mix).max())
