'use client';

import { useCallback, useEffect, useState } from 'react';
import { BlockList } from '../blocks';
import { BLOCKS, BLOCK_TYPES, newBlock, sanitizeBlocks } from '@/lib/blocks';
import { defaultPages, PAGE_LIST } from '@/lib/defaultPages';
import { getSupabase } from '@/lib/supabase';
import { Field } from './fields';

export default function PageEditor() {
  const [slug, setSlug] = useState('accueil');
  const [blocks, setBlocks] = useState(null);
  const [state, setState] = useState({ hasDraft: false, hasPublished: false });
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState(null);
  const [addType, setAddType] = useState('split');
  const [msg, setMsg] = useState(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (s) => {
    setBlocks(null);
    setMsg(null);
    const sb = await getSupabase();
    const [draft, pub] = await Promise.all([
      sb.from('page_drafts').select('blocks').eq('slug', s).maybeSingle(),
      sb.from('pages').select('blocks').eq('slug', s).maybeSingle(),
    ]);
    const source = draft.data?.blocks ?? pub.data?.blocks ?? defaultPages[s];
    setBlocks(sanitizeBlocks(source));
    setState({ hasDraft: Boolean(draft.data), hasPublished: Boolean(pub.data) });
    setDirty(false);
    setOpen(null);
  }, []);
  useEffect(() => { load(slug); }, [slug, load]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const update = (next) => { setBlocks(next); setDirty(true); };
  const setBlock = (i, key, v) => update(blocks.map((b, k) => (k === i ? { ...b, [key]: v } : b)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
    setOpen(j);
  };
  const remove = (i) => {
    if (!window.confirm('Supprimer cette section ?')) return;
    update(blocks.filter((_, k) => k !== i));
    setOpen(null);
  };
  const duplicate = (i) => {
    const copy = { ...structuredClone(blocks[i]), id: Math.random().toString(36).slice(2, 10) };
    const next = [...blocks];
    next.splice(i + 1, 0, copy);
    update(next);
    setOpen(i + 1);
  };
  const add = () => {
    update([...blocks, newBlock(addType)]);
    setOpen(blocks.length);
  };

  async function save(publish) {
    setBusy(true);
    setMsg(null);
    const clean = sanitizeBlocks(blocks);
    const sb = await getSupabase();
    let error = (await sb.from('page_drafts').upsert({ slug, blocks: clean })).error;
    if (!error && publish) error = (await sb.from('pages').upsert({ slug, blocks: clean })).error;
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: "Enregistrement refusé. Vérifiez votre connexion et que votre session est validée (déconnectez-vous puis reconnectez-vous)." });
      return;
    }
    setBlocks(clean);
    setDirty(false);
    setState((s) => ({ hasDraft: true, hasPublished: s.hasPublished || publish }));
    setMsg({ ok: true, text: publish ? 'Publié : la page est à jour sur le site.' : 'Brouillon enregistré (non visible sur le site).' });
  }

  function publish() {
    if (window.confirm('Publier cette page ? Les visiteurs verront immédiatement ces modifications.')) save(true);
  }
  function reset() {
    if (!window.confirm("Revenir au contenu d'origine de cette page ? Vos modifications non publiées seront perdues.")) return;
    setBlocks(sanitizeBlocks(defaultPages[slug]));
    setDirty(true);
    setOpen(null);
  }
  function changePage(s) {
    if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Changer de page quand même ?')) return;
    setSlug(s);
  }

  return (
    <div>
      <div className="ad-head">
        <h2>Pages du site</h2>
        <div className="ad-tabs" role="tablist" aria-label="Pages">
          {PAGE_LIST.map(([s, label]) => (
            <button key={s} role="tab" aria-selected={slug === s} className={`ad-tab${slug === s ? ' is-active' : ''}`} onClick={() => changePage(s)}>{label}</button>
          ))}
        </div>
      </div>

      {blocks === null ? <p className="ad-muted">Chargement…</p> : (
        <>
          <div className="ad-toolbar">
            <span className={`ad-badge${dirty ? ' ad-badge--warn' : ''}`}>
              {dirty ? 'Modifications non enregistrées' : state.hasPublished ? 'Version publiée' : "Contenu d'origine (rien de publié)"}
            </span>
            <span className="ad-toolbar-actions">
              <button className="ad-btn" onClick={() => setPreview((p) => !p)}>{preview ? 'Masquer l’aperçu' : 'Aperçu'}</button>
              <button className="ad-btn" onClick={reset}>Contenu d’origine</button>
              <button className="ad-btn" onClick={() => save(false)} disabled={busy || !dirty}>Enregistrer le brouillon</button>
              <button className="ad-btn ad-btn--primary" onClick={publish} disabled={busy}>Publier</button>
            </span>
          </div>
          {msg && <p className={msg.ok ? 'ad-ok' : 'ad-error'} role="status">{msg.text}</p>}

          <div className={`ad-editor${preview ? ' has-preview' : ''}`}>
            <div className="ad-blocks">
              {blocks.map((b, i) => {
                const def = BLOCKS[b.type];
                const isOpen = open === i;
                return (
                  <section className={`ad-block${isOpen ? ' is-open' : ''}`} key={b.id}>
                    <header className="ad-block-head">
                      <button type="button" className="ad-block-title" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                        <span className="ad-block-type">{def.label}</span>
                        <span className="ad-block-name">{b.title || b.label || b.text?.slice?.(0, 50) || ''}</span>
                      </button>
                      <span>
                        <button type="button" className="ad-icon" onClick={() => move(i, -1)} aria-label="Monter la section" disabled={i === 0}>↑</button>
                        <button type="button" className="ad-icon" onClick={() => move(i, 1)} aria-label="Descendre la section" disabled={i === blocks.length - 1}>↓</button>
                        <button type="button" className="ad-icon" onClick={() => duplicate(i)} aria-label="Dupliquer la section" title="Dupliquer">⧉</button>
                        <button type="button" className="ad-icon ad-icon--danger" onClick={() => remove(i)} aria-label="Supprimer la section">×</button>
                      </span>
                    </header>
                    {isOpen && (
                      <div className="ad-block-body">
                        {def.note && <p className="ad-note">{def.note}</p>}
                        {def.fields.map((f) => (<Field key={f.key} field={f} value={b[f.key]} onChange={(v) => setBlock(i, f.key, v)} />))}
                      </div>
                    )}
                  </section>
                );
              })}

              <div className="ad-add">
                <select value={addType} onChange={(e) => setAddType(e.target.value)} aria-label="Type de section à ajouter">
                  {BLOCK_TYPES.map((t) => (<option key={t} value={t}>{BLOCKS[t].label}</option>))}
                </select>
                <button className="ad-btn" onClick={add}>+ Ajouter une section</button>
              </div>
            </div>

            {preview && (
              <aside className="ad-preview" aria-label="Aperçu de la page">
                <div className="ad-preview-inner">
                  <BlockList blocks={sanitizeBlocks(blocks)} slug={slug} />
                </div>
              </aside>
            )}
          </div>
        </>
      )}
    </div>
  );
}
