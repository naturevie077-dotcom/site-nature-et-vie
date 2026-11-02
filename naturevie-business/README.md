# Naturetvie Business — « Recruter, encore recruter… » (52 s, 1080×1920, 30 fps)

Vidéo pour la page Naturetvie Business (Nature & Vie, Abidjan) : modèle partenaire vs plans MLM.

- `src/scenes.js` : les 6 scènes. **Tous les minutages sont dans `CFG`** (en haut du fichier) : pour recaler sur la voix off,
  modifier ces valeurs (apparition des lignes du tableau, coches, photo, « + 2 500 F », numéro, logo).
- `src/engine.js` : primitives (courbes, ressorts, texte Poppins, icônes, coche animée).
- `src/synth.js` : bruitages synthétisés. `audio/make_music.py` : musique originale (108 BPM), sans droits à clarifier.
- `assets/` : logo officiel (tel quel, sur plaque #F7F7F7) et photo du SG9 Plus Advance (recadrage des marges vides uniquement).
- `python3 build.py` → `dist/test.html` ; rendu image par image via Playwright puis ffmpeg (voir historique de la session).
- Aucun mot « WhatsApp » dans la vidéo : seulement le numéro. Aucun nom de marque MLM.
