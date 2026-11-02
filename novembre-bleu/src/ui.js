/* ============================================================================
 * LECTEUR, SON, VOIX OFF, ENREGISTREMENT
 * ========================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const cv = $("#stage"), g2 = cv.getContext("2d");
const SCENES = ["Accroche", "Surprise", "Vérité", "Danger silencieux", "Signes", "Idées reçues", "Bon réflexe", "Conclusion"];
const S = { t: 0, playing: false, last: 0, k: 1, recording: false, sfx: true, voiceOn: true, speech: false, music: true, bedVol: 1 };
let quality = "hd";

function setQuality(q) {
  quality = q; const w = q === "hd" ? 1080 : 720, h = q === "hd" ? 1920 : 1280; if (cv.width !== w) { cv.width = w; cv.height = h; } S.k = w / 1080;
}
function draw() { g2.setTransform(S.k, 0, 0, S.k, 0, 0); renderFrame(g2, S.t); }

/* ---------- audio : bruitages synthétisés (WebAudio) + voix off importée ---------- */
let actx = null, master = null, rdest = null;
function ensureAudio() {
  if (!actx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false; actx = new AC(); master = actx.createGain(); master.gain.value = 0.9; master.connect(actx.destination); rdest = actx.createMediaStreamDestination(); master.connect(rdest); }
  if (actx.state === "suspended") actx.resume().catch(() => {});
  return true;
}
function noiseBuf(c, dur) { const b = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate), d = b.getChannelData(0); let s = 12345; for (let i = 0; i < d.length; i++) { s = (s * 1664525 + 1013904223) >>> 0; d[i] = (s / 4294967296) * 2 - 1; } return b; }
/** synthèse d'un bruitage ; c = contexte (réel ou hors-ligne), out = nœud de sortie, w = date de début */
function synth(c, out, kind, w, vol = 1) {
  const env = (g, a, pk, d) => { g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, pk * vol), w + a); g.gain.exponentialRampToValueAtTime(0.0001, w + a + d); };
  const osc = (type, f0, f1, a, d, pk) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, w); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), w + a + d); env(g, a, pk, d); o.connect(g); g.connect(out); o.start(w); o.stop(w + a + d + 0.05); };
  const nz = (type, f0, f1, a, d, pk, q = 1) => { const s = c.createBufferSource(); s.buffer = noiseBuf(c, a + d + 0.1); const f = c.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, w); f.frequency.exponentialRampToValueAtTime(f1, w + a + d); const g = c.createGain(); env(g, a, pk, d); s.connect(f); f.connect(g); g.connect(out); s.start(w); };
  if (kind === "pop") { osc("sine", 520, 180, 0.005, 0.12, 0.7); }
  else if (kind === "whoosh") { nz("bandpass", 400, 3800, 0.18, 0.2, 0.5, 0.9); }
  else if (kind === "thud") { osc("sine", 150, 38, 0.004, 0.32, 1.0); nz("lowpass", 900, 120, 0.004, 0.2, 0.5); }
  else if (kind === "ding") { osc("sine", 1318, 1318, 0.004, 1.0, 0.35); osc("sine", 1976, 1976, 0.004, 0.7, 0.18); }
  else if (kind === "tick") { nz("highpass", 3000, 3000, 0.002, 0.03, 0.6); osc("square", 1800, 900, 0.002, 0.02, 0.12); }
  else if (kind === "drip") { osc("sine", 1100, 420, 0.004, 0.11, 0.5); }
  else if (kind === "blip") { osc("triangle", 360, 760, 0.01, 0.16, 0.35); }
  else if (kind === "flip") { nz("bandpass", 1200, 2600, 0.05, 0.12, 0.4, 1.4); }
  else if (kind === "pen") { nz("bandpass", 2200, 1500, 0.01, 0.07, 0.3, 2); }
}
let sfxIdx = 0;
function fireSfx(a, b) {
  if (!S.sfx || !actx || actx.state !== "running") return;
  for (const [ts, k] of SFX) if (ts > a && ts <= b) synth(actx, master, k, actx.currentTime + 0.02, 0.8);
}
const voiceBuf = {}; let voiceSrc = [];
function stopVoice() { voiceSrc.forEach((s) => { try { s.stop(); } catch (e) {} }); voiceSrc = []; }
function startVoice(fromT) {
  stopVoice(); if (!actx || !S.voiceOn) return;
  if (actx.state !== "running") { actx.resume().then(() => { if (S.playing) startVoiceNow(S.t); }).catch(() => {}); return; }
  startVoiceNow(fromT);
}
function startVoiceNow(fromT) {
  stopVoice(); if (!actx || !S.voiceOn || actx.state !== "running") return;
  Object.entries(voiceBuf).forEach(([id, buf]) => {
    const m = VOICE[id], t0 = id === "full" ? 0 : m ? m.cue - m.lead : (VO.find((v) => v.id === id) || {}).t0 ?? 0, end = t0 + buf.duration; if (end <= fromT) return;
    const s = actx.createBufferSource(); s.buffer = buf; s.connect(master); const off = Math.max(0, fromT - t0), delay = Math.max(0, t0 - fromT); s.start(actx.currentTime + 0.03 + delay, off); voiceSrc.push(s);
  });
}
/* ---------- fond musical ---------- */
let bedBuf = null, bedSrc = null, bedGain = null;
function stopBed() { try { bedSrc && bedSrc.stop(); } catch (e) {} bedSrc = null; }
function startBed(fromT) {
  stopBed(); if (!actx || !S.music || !bedBuf) return;
  if (actx.state !== "running") { actx.resume().then(() => { if (S.playing) startBedNow(S.t); }).catch(() => {}); return; }
  startBedNow(fromT);
}
function startBedNow(fromT) {
  stopBed(); if (!actx || !S.music || !bedBuf || actx.state !== "running") return;
  bedGain = actx.createGain(); bedGain.gain.value = S.bedVol; bedGain.connect(master);
  bedSrc = actx.createBufferSource(); bedSrc.buffer = bedBuf; bedSrc.connect(bedGain); bedSrc.start(actx.currentTime + 0.03, clamp(fromT, 0, Math.max(0, bedBuf.duration - 0.05)));
}
/** voix intégrées (Isac pour l'homme, Roger pour le médecin) */
async function loadDefaultVoices() {
  if (!ensureAudio()) return;
  for (const [id, v] of Object.entries(VOICE)) {
    const bin = atob(v.wav), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    try { voiceBuf[id] = await actx.decodeAudioData(u8.buffer); } catch (e) {}
  }
  try { const bin = atob(BED), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); bedBuf = await actx.decodeAudioData(u8.buffer); } catch (e) {}
  if (S.playing) { startVoice(S.t); startBed(S.t); }
}
async function loadVoice(id, file) {
  if (!ensureAudio()) return false; const ab = await file.arrayBuffer(), buf = await actx.decodeAudioData(ab);
  if (id === "full") Object.keys(VOICE).forEach((k) => delete voiceBuf[k]); else { const v = VO.find((x) => x.id === id); if (v && v.clips) v.clips.forEach((c) => delete voiceBuf[c]); }
  voiceBuf[id] = buf; if (S.playing) startVoice(S.t); return true;
}

/* ---------- lecture ---------- */
const ui = { play: $("#bPlay"), restart: $("#bRestart"), seek: $("#seek"), time: $("#time"), sound: $("#bSound"), qual: $("#quality"), start: $("#startVeil") };
function setPlaying(p) {
  S.playing = p; ui.play.setAttribute("aria-pressed", String(p)); ui.play.querySelector("span").textContent = p ? "Pause" : (S.t >= DUR - 0.05 ? "Rejouer" : "Lecture");
  ui.play.dataset.state = p ? "pause" : "play"; if (p) { ensureAudio(); startVoice(S.t); startBed(S.t); } else { stopVoice(); stopBed(); }
}
function seekTo(t, keep) { S.t = clamp(t, 0, DUR); sfxIdx = 0; if (S.playing) { startVoice(S.t); startBed(S.t); } else { stopVoice(); stopBed(); } draw(); sync(); }
function sync() {
  ui.seek.value = String(S.t); ui.time.textContent = S.t.toFixed(1).padStart(4, "0") + " / 45 s";
  const sc = BOUND.findIndex((b, i) => S.t >= b && S.t < BOUND[i + 1]); document.querySelectorAll(".sc").forEach((el, i) => el.setAttribute("aria-current", String(i === sc)));
}
function loop(now) {
  const dt = Math.min(0.1, (now - S.last) / 1000); S.last = now;
  if (S.playing) { const p = S.t; S.t += dt; fireSfx(p, S.t); if (S.speech) speakCues(p, S.t); if (S.t >= DUR) { S.t = DUR; setPlaying(false); onEnded(); } }
  draw(); sync(); requestAnimationFrame(loop);
}
function onEnded() { if (S.recording) stopRecording(); ui.play.querySelector("span").textContent = "Rejouer"; }
function speakCues(a, b) {
  try { VO.forEach((v) => { if (v.t0 > a && v.t0 <= b) { const u = new SpeechSynthesisUtterance(v.text.toLowerCase()); u.lang = "fr-FR"; u.rate = 1.25; speechSynthesis.speak(u); } }); } catch (e) {}
}

/* ---------- enregistrement du rendu (canvas + audio) ---------- */
let rec = null, chunks = [], recMime = "", lastBlob = null;
function pickMime() { const c = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]; return c.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || ""; }
function status(msg, kind) { const el = $("#recStatus"); el.textContent = msg; el.dataset.kind = kind || ""; }
function startRecording() {
  if (!window.MediaRecorder || !cv.captureStream) { status("Ce navigateur ne sait pas enregistrer le canvas. Utilise Chrome ou Edge sur ordinateur.", "err"); return; }
  ensureAudio(); setQuality($("#recQuality").value); $("#quality").value = quality;
  const stream = cv.captureStream(30); if (actx && rdest) rdest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  recMime = pickMime(); chunks = [];
  try { rec = new MediaRecorder(stream, { mimeType: recMime || undefined, videoBitsPerSecond: quality === "hd" ? 9e6 : 5e6, audioBitsPerSecond: 160000 }); } catch (e) { status("Enregistrement impossible : " + e.message, "err"); return; }
  rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
  rec.onstop = () => { const type = (rec.mimeType || recMime || "video/webm").split(";")[0]; lastBlob = new Blob(chunks, { type }); S.recording = false; $("#bRec").disabled = false; showResult(type); };
  S.recording = true; $("#bRec").disabled = true; seekTo(0); rec.start(250); setPlaying(true); status("Enregistrement en cours (45 s, en temps réel). Garde cet onglet visible.", "run");
}
function stopRecording() { try { if (rec && rec.state !== "inactive") rec.stop(); } catch (e) {} }
async function showResult(type) {
  const ext = type.includes("mp4") ? "mp4" : "webm", url = URL.createObjectURL(lastBlob), v = $("#recVideo"); v.src = url; v.hidden = false;
  status(`Enregistrement terminé : ${(lastBlob.size / 1048576).toFixed(1)} Mo (${ext.toUpperCase()}).`, "ok");
  const sv = $("#bSave"); sv.hidden = false; sv.dataset.ext = ext;
  if (ext === "webm") $("#webmNote").hidden = false;
}
async function saveFile() {
  if (!lastBlob) return; const ext = $("#bSave").dataset.ext || "webm", dl = await (window.claude && window.claude.use ? window.claude.use("downloads").catch(() => null) : null);
  if (!dl) { status("Sauvegarde directe indisponible ici : fais un appui long (mobile) ou un clic droit sur la vidéo ci-dessus, puis « Enregistrer la vidéo sous… ».", "err"); return; }
  try { const r = await dl.save({ filename: "novembre-bleu-nature-et-vie." + ext, data: lastBlob }); status(r.status === "saved" ? "Fichier enregistré." : "Fichier envoyé.", "ok"); } catch (e) { status(e && e.code === "declined" ? "Enregistrement annulé." : "Sauvegarde impossible (" + ((e && e.code) || "erreur") + "). Utilise un clic droit sur la vidéo.", "err"); }
}

/* ---------- panneau voix off ---------- */
const fmt = (s) => s.toFixed(1).replace(".", ",") + " s";
function buildVO() {
  const host = $("#voList"); host.innerHTML = "";
  VO.forEach((v) => {
    const li = document.createElement("li"); li.className = "vo-item";
    li.innerHTML = `<div class="vo-head"><span class="vo-sc">S${v.sc}</span><b>${v.who}</b><span class="vo-t">${fmt(v.t0)} → ${fmt(v.t1)}</span></div><p class="vo-tag">${v.tag}</p><p class="vo-text">${v.text}</p><div class="vo-actions"><button type="button" class="btn sm" data-copy="${v.id}">Copier avec balises</button><label class="btn sm file">Remplacer l'audio<input type="file" accept="audio/*" data-vo="${v.id}" /></label><span class="vo-ok" id="ok-${v.id}">Voix intégrée · ${v.who === "Homme" ? "Isac" : v.who === "Les deux" ? "Roger + Isac" : "Roger"}</span></div>`;
    host.appendChild(li);
  });
  host.addEventListener("click", async (e) => { const b = e.target.closest("[data-copy]"); if (!b) return; const v = VO.find((x) => x.id === b.dataset.copy); await copyText(`${v.tag} ${v.text}`, b); });
  host.addEventListener("change", async (e) => { const inp = e.target.closest("[data-vo]"); if (!inp || !inp.files[0]) return; const ok = await loadVoice(inp.dataset.vo, inp.files[0]).catch(() => false); const m = $("#ok-" + inp.dataset.vo); m.textContent = ok ? "Ton audio remplace la voix intégrée" : "Fichier illisible"; m.hidden = false; });
}
async function copyText(txt, btn) {
  const old = btn.textContent; try { await navigator.clipboard.writeText(txt); btn.textContent = "Copié"; } catch (e) { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); btn.textContent = "Copié"; } catch (_) { btn.textContent = "Sélectionne et copie"; } ta.remove(); }
  setTimeout(() => (btn.textContent = old), 1400);
}

/* ---------- initialisation ---------- */
function init() {
  buildVO();
  const sc = $("#scenes"); SCENES.forEach((n, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "sc"; b.innerHTML = `<i>${i + 1}</i><span>${n}</span><small>${BOUND[i]}–${BOUND[i + 1]} s</small>`; b.addEventListener("click", () => { seekTo(BOUND[i] + 0.01); if (!S.playing) setPlaying(true); }); sc.appendChild(b); });
  ui.play.addEventListener("click", () => { if (S.t >= DUR - 0.05) seekTo(0); setPlaying(!S.playing); ui.start.hidden = true; });
  ui.restart.addEventListener("click", () => { seekTo(0); setPlaying(true); ui.start.hidden = true; });
  ui.seek.max = String(DUR); ui.seek.addEventListener("input", () => seekTo(parseFloat(ui.seek.value)));
  ui.sound.addEventListener("click", () => { S.sfx = !S.sfx; S.voiceOn = S.sfx; ui.sound.setAttribute("aria-pressed", String(S.sfx)); ui.sound.querySelector("span").textContent = S.sfx ? "Son activé" : "Son coupé"; if (master) master.gain.value = S.sfx ? 0.9 : 0; if (S.sfx) ensureAudio(); });
  $("#bMusic").addEventListener("click", () => { S.music = !S.music; $("#bMusic").setAttribute("aria-pressed", String(S.music)); $("#bMusic span").textContent = S.music ? "Musique" : "Sans musique"; if (S.music && S.playing) startBed(S.t); else stopBed(); });
  $("#bedVol").addEventListener("input", (e) => { S.bedVol = parseFloat(e.target.value); if (bedGain) bedGain.gain.value = S.bedVol; });
  ui.qual.addEventListener("change", () => { setQuality(ui.qual.value); draw(); });
  ui.start.addEventListener("click", () => { ensureAudio(); ui.start.hidden = true; if (!S.playing) setPlaying(true); else { startVoice(S.t); startBed(S.t); } });
  $("#bRec").addEventListener("click", startRecording); $("#bSave").addEventListener("click", saveFile);
  $("#bCopyAll").addEventListener("click", (e) => copyText(VO.map((v) => `[${v.who}] ${v.tag} ${v.text}`).join("\n\n"), e.currentTarget));
  $("#fullVo").addEventListener("change", async (e) => { const f = e.target.files[0]; if (!f) return; const ok = await loadVoice("full", f).catch(() => false); $("#fullOk").hidden = false; $("#fullOk").textContent = ok ? "Piste complète chargée (remplace les voix intégrées)" : "Fichier illisible"; });
  $("#speechToggle").addEventListener("change", (e) => { S.speech = e.target.checked; });
  $("#logoFile").addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const im = new Image(); im.onload = () => { LOGO_IMG = im; $("#logoState").textContent = "Logo remplacé par ton fichier."; }; im.src = URL.createObjectURL(f); });
  const logo = new Image(); logo.onload = () => { LOGO_IMG = logo; }; logo.src = document.getElementById("logoData").getAttribute("data-src");
  window.addEventListener("keydown", (e) => { if (e.code === "Space" && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)) { e.preventDefault(); ui.play.click(); } });
  document.addEventListener("visibilitychange", () => { if (document.hidden && S.playing && !S.recording) setPlaying(false); });
  setQuality("hd"); draw(); sync(); S.last = performance.now(); requestAnimationFrame(loop); setPlaying(true); loadDefaultVoices(); // lecture automatique (images ; le son démarre au premier appui)
}
window.__nb = { render: (t) => { S.playing = false; S.t = t; draw(); }, SFX, synth, DUR, BOUND, renderTo: (c, t) => renderFrame(c, t), setQuality };
document.fonts.load('48px "NB Lilita"').then(() => document.fonts.load('900 40px "NB Nunito"')).catch(() => {}).then(init);
