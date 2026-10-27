# NATURE & VIE — « Le bien-être en mouvement »

Publicité verticale 1080 × 1920, 30 fps, 24 s, réalisée deux fois avec deux moteurs :

| Version | Moteur | Fichier | Projet source |
|---|---|---|---|
| A | HyperFrames (HTML/CSS/SVG/Canvas + GSAP) | `out/nature-vie-hyperframes.mp4` | `hyperframes/` |
| B | Remotion (React + `spring` / `interpolate`) | `out/nature-vie-remotion.mp4` | `remotion/` |

Même storyboard, mêmes textes, mêmes durées, même bande-son. Chaque vidéo a été rendue par **son propre moteur**.

## Storyboard (identique dans les deux projets)

| Temps | Scène | Contenu |
|---|---|---|
| 0–4 s | L'ouverture | Poussière d'or → pousse dessinée par 236 particules → onde de lumière verte → « LE BIEN-ÊTRE » (masque) puis « EN MOUVEMENT » (tracking, contour → or) |
| 4–9 s | L'univers | Morphing géométrique en pétales → feuilles 2.5D sur 3 plans parallaxe, rubans végétaux, bokeh, rayons → « LA / NATURE / NOUS / INSPIRE », une chorégraphie par mot |
| 9–15 s | La puissance du motion | NATURE (bascule 3D) → ÉNERGIE (balayage en dents de scie, tranches, éclairs) → ÉQUILIBRE (iris losange, disque vert/bordeaux) |
| 15–20 s | La révélation | Tourbillon d'étincelles, ligne lumineuse qui dessine le cadre, « NATURE & VIE », zoom cinématique |
| 20–24 s | Signature | Vrai logo Nature & Vie, anneau d'or, « VIVRE MIEUX, NATURELLEMENT. », rayonnement doré, sortie en fondu |

Les impacts sonores tombent sur 1,7 · 2,8 · 4,05 · 9,0 · 11,0 · 13,0 · 17,2 · 20,4 s (grille 120 BPM).

## Contenu

```
shared/            ressources communes aux deux versions
  fx.js            moteur FX canvas (particules, morphing, anneaux, grain) — fonctions pures de t
  audio/make_audio.py   synthèse de la bande-son (numpy/scipy, 100 % originale, aucun droit à clarifier)
  img/logo-nature-et-vie.png   logo réel (fourni), détouré en disque
  fonts/           Bebas Neue, Montserrat, Cormorant Garamond (OFL)
hyperframes/       index.html (composition unique) + assets/
remotion/          src/ (Main, S1S2, S3, S4S5, lib) + public/
out/               MP4 finaux
```

## Rendu

```bash
# HyperFrames
cd hyperframes && npm run check && npm run render        # ou: npx hyperframes@0.8.207 render --crf 20

# Remotion  (concurrency=1 : le rendu GPU logiciel se bloque avec plusieurs onglets)
cd remotion && npm i && npm run render
# Studio interactif : npm run studio

# Bande-son
cd shared/audio && python3 make_audio.py && ffmpeg -i soundtrack.wav -af loudnorm=I=-15:TP=-1.5 soundtrack-master.wav
```

Dans un environnement sans Chrome installé : définir `--browser-executable` (Remotion) ou lancer `npx hyperframes browser ensure`.

## Ce qui est partagé, ce qui ne l'est pas

* **Partagé** : le canvas `fx.js` (particules, onde verte, bokeh, étincelles, anneaux, flashs, grain, vignette), les polices, le logo, l'audio, la feuille de style.
* **Spécifique à chaque moteur** : toute la typographie animée (GSAP vs `spring`/`interpolate`), les feuilles et rubans, la caméra virtuelle, les masques et les transitions entre scènes.

## Limites connues

* Le logo fourni fait 373 px : il est agrandi (×2 + netteté) et reste un peu doux en plein cadre.
* Pas de vrai motion blur sous-image : les entrées rapides utilisent un flou de vitesse (blur → net). `HtmlInCanvasMotionBlur` de Remotion exige Chrome ≥ 149.
* La bande-son est contrôlée par mesure (−14,4 LUFS, crête −3 dBFS), pas à l'oreille : à écouter avant diffusion.
