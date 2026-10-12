'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabase, publicMediaUrl } from '@/lib/supabase';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'];
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' };
const MAX_BYTES = 50 * 1024 * 1024;

const ORIGINALS = [
  ['/assets/foret.jpg', 'Forêt tropicale'],
  ['/assets/direction.jpg', 'La Direction'],
  ['/assets/gamme-complements.jpg', 'Compléments (provisoire)'],
  ['/assets/gamme-tisanes.jpg', 'Tisanes (provisoire)'],
  ['/assets/gamme-cafes.jpg', 'Cafés (provisoire)'],
  ['/assets/gamme-innovantes.jpg', 'Innovantes (provisoire)'],
  ['/assets/ingredients.jpg', 'Ingrédients (provisoire)'],
  ['/assets/logo.png', 'Logo (fond clair)'],
];

const isVideo = (name) => /\.(mp4|webm)$/i.test(name);

/* ───────── Médiathèque (utilisée seule ou comme sélecteur) ───────── */
export function MediaLibrary({ onPick, accept = 'all' }) {
  const [files, setFiles] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  const refresh = useCallback(async () => {
    const sb = await getSupabase();
    const { data, error } = await sb.storage.from('media').list('', { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) return setMessage('Impossible de lire la médiathèque.');
    setFiles((data || []).filter((f) => f.id));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function upload(e) {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length) return;
    setBusy(true);
    setMessage('');
    const sb = await getSupabase();
    for (const file of list) {
      if (!ALLOWED.includes(file.type)) { setMessage(`« ${file.name} » : format refusé (JPG, PNG, WebP, AVIF, MP4 ou WebM uniquement).`); continue; }
      if (file.size > MAX_BYTES) { setMessage(`« ${file.name} » dépasse 50 Mo.`); continue; }
      // Le nom d'origine n'est jamais réutilisé : nom aléatoire + extension déduite du type réel.
      const name = `${crypto.randomUUID()}.${EXT[file.type]}`;
      const { error } = await sb.storage.from('media').upload(name, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
      if (error) setMessage(`Échec de l'envoi de « ${file.name} ».`);
    }
    setBusy(false);
    refresh();
  }

  async function remove(name) {
    if (!window.confirm('Supprimer ce fichier ? S’il est utilisé sur le site, il disparaîtra des pages concernées.')) return;
    const sb = await getSupabase();
    const { error } = await sb.storage.from('media').remove([name]);
    if (error) setMessage('Suppression impossible.');
    refresh();
  }

  const shown = (files || []).filter((f) => accept === 'all' || (accept === 'video' ? isVideo(f.name) : !isVideo(f.name)));

  return (
    <div className="ad-media">
      <div className="ad-media-bar">
        <button type="button" className="ad-btn ad-btn--primary" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? 'Envoi…' : 'Ajouter des fichiers'}
        </button>
        <input ref={input} type="file" hidden multiple accept={ALLOWED.join(',')} onChange={upload} />
        <span className="ad-muted">JPG, PNG, WebP, AVIF, MP4, WebM · 50 Mo maximum · images conseillées : moins de 1,5 Mo</span>
      </div>
      {message && <p className="ad-error" role="alert">{message}</p>}

      {onPick && accept !== 'video' && (
        <>
          <h4>Images d’origine du site</h4>
          <div className="ad-media-grid">
            {ORIGINALS.map(([src, label]) => (
              <button type="button" key={src} className="ad-thumb" onClick={() => onPick(src)}>
                <img src={src} alt="" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <h4>Vos fichiers</h4>
      {files === null ? <p className="ad-muted">Chargement…</p> : shown.length === 0 ? <p className="ad-muted">Aucun fichier pour le moment.</p> : (
        <div className="ad-media-grid">
          {shown.map((f) => {
            const url = publicMediaUrl(f.name);
            return (
              <div key={f.name} className="ad-thumb-wrap">
                <button type="button" className="ad-thumb" onClick={() => (onPick ? onPick(url) : navigator.clipboard?.writeText(url))} title={onPick ? 'Choisir' : "Copier l'adresse"}>
                  {isVideo(f.name) ? <video src={url} muted preload="metadata" /> : <img src={url} alt="" loading="lazy" />}
                  <span>{onPick ? 'Choisir' : 'Copier l’adresse'}</span>
                </button>
                <button type="button" className="ad-thumb-del" onClick={() => remove(f.name)} aria-label="Supprimer ce fichier">×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MediaModal({ accept, onPick, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="ad-modal" role="dialog" aria-modal="true" aria-label="Choisir un fichier">
      <div className="ad-modal-card">
        <div className="ad-modal-head">
          <h3>Choisir un fichier</h3>
          <button type="button" className="ad-btn" onClick={onClose}>Fermer</button>
        </div>
        <MediaLibrary accept={accept} onPick={(u) => { onPick(u); onClose(); }} />
      </div>
    </div>
  );
}

/* ───────── Champs génériques générés depuis lib/blocks.js ───────── */
export function Field({ field, value, onChange }) {
  const [picker, setPicker] = useState(false);
  const id = useRef(`f${Math.random().toString(36).slice(2, 8)}`).current;

  if (field.type === 'bool') {
    return (
      <label className="ad-check">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }

  let control;
  switch (field.type) {
    case 'textarea':
      control = <textarea id={id} rows={field.rows || 4} value={value ?? ''} maxLength={6000} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'select':
      control = (
        <select id={id} value={value ?? field.options[0][0]} onChange={(e) => onChange(e.target.value)}>
          {field.options.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
        </select>
      );
      break;
    case 'image':
    case 'video':
      control = (
        <div className="ad-media-field">
          {value && (field.type === 'video' ? <video src={value} muted preload="metadata" /> : <img src={value} alt="" />)}
          <div className="ad-media-field-actions">
            <input id={id} type="text" value={value ?? ''} maxLength={600} placeholder="Adresse du fichier" onChange={(e) => onChange(e.target.value)} />
            <button type="button" className="ad-btn" onClick={() => setPicker(true)}>Choisir…</button>
            {value && <button type="button" className="ad-btn" onClick={() => onChange('')}>Retirer</button>}
          </div>
          {picker && <MediaModal accept={field.type} onPick={onChange} onClose={() => setPicker(false)} />}
        </div>
      );
      break;
    case 'list':
      return <ListField field={field} value={value} onChange={onChange} />;
    default:
      control = <input id={id} type="text" value={value ?? ''} maxLength={field.type === 'url' ? 600 : 300} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div className="ad-field">
      <label htmlFor={id}>{field.label}</label>
      {control}
      {field.hint && <small className="ad-muted">{field.hint}</small>}
    </div>
  );
}

const emptyItem = (fields) => Object.fromEntries(fields.map((f) => [f.key, f.type === 'select' ? f.options[0][0] : f.type === 'bool' ? false : f.type === 'list' ? [] : '']));

function ListField({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const set = (i, key, v) => onChange(items.map((it, k) => (k === i ? { ...it, [key]: v } : it)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="ad-list">
      <legend>{field.label} ({items.length})</legend>
      {items.map((it, i) => (
        <div className="ad-list-item" key={i}>
          <div className="ad-list-head">
            <strong>{it[field.itemLabel] || `Élément ${i + 1}`}</strong>
            <span>
              <button type="button" className="ad-icon" onClick={() => move(i, -1)} aria-label="Monter" disabled={i === 0}>↑</button>
              <button type="button" className="ad-icon" onClick={() => move(i, 1)} aria-label="Descendre" disabled={i === items.length - 1}>↓</button>
              <button type="button" className="ad-icon ad-icon--danger" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label="Supprimer">×</button>
            </span>
          </div>
          {field.itemFields.map((f) => (<Field key={f.key} field={f} value={it[f.key]} onChange={(v) => set(i, f.key, v)} />))}
        </div>
      ))}
      {items.length < (field.max || 24) && (
        <button type="button" className="ad-btn" onClick={() => onChange([...items, emptyItem(field.itemFields)])}>+ Ajouter</button>
      )}
    </fieldset>
  );
}
