'use client';

import { useCallback, useEffect, useState } from 'react';
import { cleanSite, cleanTheme, flattenSite, SITE_FIELDS, THEME_DEFAULTS, THEME_FIELDS } from '@/lib/blocks';
import { safeMedia, safeUrl, text } from '@/lib/safe';
import { defaultSite } from '@/lib/site';
import { getSupabase } from '@/lib/supabase';
import { Field } from './fields';

const Msg = ({ m }) => (m ? <p className={m.ok ? 'ad-ok' : 'ad-error'} role="status">{m.text}</p> : null);
const SAVE_ERROR = { ok: false, text: 'Enregistrement refusé. Reconnectez-vous puis réessayez.' };

/* ───────── Publicités ───────── */
const AD_FIELDS = [
  { key: 'title', label: 'Titre', type: 'text' },
  { key: 'subtitle', label: 'Sous-titre', type: 'text' },
  { key: 'image_url', label: 'Affiche (image)', type: 'image' },
  { key: 'video_url', label: 'Vidéo (facultatif)', type: 'video' },
  { key: 'link_url', label: 'Lien du bouton', type: 'url', hint: 'Adresse (https://…), page du site (/nos-gammes/) ou « whatsapp:Votre message ».' },
  { key: 'cta_label', label: 'Texte du bouton', type: 'text' },
  { key: 'active', label: 'Publicité active', type: 'bool' },
];
const toLocal = (iso) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
const fromLocal = (v) => (v ? new Date(v).toISOString() : null);

function adStatus(ad) {
  const now = Date.now();
  if (!ad.active) return ['Désactivée', ''];
  if (ad.starts_at && new Date(ad.starts_at).getTime() > now) return ['Programmée', 'ad-badge--warn'];
  if (ad.ends_at && new Date(ad.ends_at).getTime() < now) return ['Expirée', 'ad-badge--warn'];
  return ['En ligne', 'ad-badge--ok'];
}

export function AdsPanel() {
  const [ads, setAds] = useState(null);
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const sb = await getSupabase();
    const { data } = await sb.from('ads').select('*').order('position', { ascending: true }).order('created_at', { ascending: false });
    setAds(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save() {
    setMsg(null);
    const row = {
      title: text(edit.title, 120).trim(),
      subtitle: text(edit.subtitle, 240).trim() || null,
      image_url: safeMedia(edit.image_url) || null,
      video_url: safeMedia(edit.video_url) || null,
      link_url: safeUrl(edit.link_url) || null,
      cta_label: text(edit.cta_label, 60).trim() || null,
      active: edit.active === true,
      position: Number.isFinite(Number(edit.position)) ? Math.trunc(Number(edit.position)) : 0,
      starts_at: fromLocal(edit.starts_local),
      ends_at: fromLocal(edit.ends_local),
    };
    if (!row.title) return setMsg({ ok: false, text: 'Le titre est obligatoire.' });
    if (!row.image_url && !row.video_url) return setMsg({ ok: false, text: 'Ajoutez une affiche ou une vidéo.' });
    const sb = await getSupabase();
    const { error } = edit.id ? await sb.from('ads').update(row).eq('id', edit.id) : await sb.from('ads').insert(row);
    if (error) return setMsg(SAVE_ERROR);
    setEdit(null);
    setMsg({ ok: true, text: 'Publicité enregistrée.' });
    load();
  }

  async function remove(ad) {
    if (!window.confirm(`Supprimer la publicité « ${ad.title} » ?`)) return;
    const sb = await getSupabase();
    const { error } = await sb.from('ads').delete().eq('id', ad.id);
    if (error) setMsg(SAVE_ERROR);
    load();
  }

  const open = (ad) => setEdit(ad ? { ...ad, starts_local: toLocal(ad.starts_at), ends_local: toLocal(ad.ends_at) } : { title: '', subtitle: '', image_url: '', video_url: '', link_url: '', cta_label: 'Découvrir', active: true, position: (ads?.length || 0) + 1, starts_local: '', ends_local: '' });

  return (
    <div>
      <div className="ad-head">
        <h2>Publicités et affiches</h2>
        {!edit && <button className="ad-btn ad-btn--primary" onClick={() => open(null)}>+ Nouvelle publicité</button>}
      </div>
      <p className="ad-muted">Les publicités actives s’affichent dans la section « À la une » de la page d’accueil. Vous pouvez programmer des dates de début et de fin.</p>
      <Msg m={msg} />

      {edit ? (
        <div className="ad-card">
          <h3>{edit.id ? 'Modifier la publicité' : 'Nouvelle publicité'}</h3>
          {AD_FIELDS.map((f) => (<Field key={f.key} field={f} value={edit[f.key]} onChange={(v) => setEdit({ ...edit, [f.key]: v })} />))}
          <div className="ad-grid-2">
            <label className="ad-field">Début d’affichage (facultatif)
              <input type="datetime-local" value={edit.starts_local} onChange={(e) => setEdit({ ...edit, starts_local: e.target.value })} />
            </label>
            <label className="ad-field">Fin d’affichage (facultatif)
              <input type="datetime-local" value={edit.ends_local} onChange={(e) => setEdit({ ...edit, ends_local: e.target.value })} />
            </label>
          </div>
          <label className="ad-field">Ordre d’affichage (1 = en premier)
            <input type="number" min="0" max="999" value={edit.position} onChange={(e) => setEdit({ ...edit, position: e.target.value })} />
          </label>
          <div className="ad-row">
            <button className="ad-btn ad-btn--primary" onClick={save}>Enregistrer</button>
            <button className="ad-btn" onClick={() => { setEdit(null); setMsg(null); }}>Annuler</button>
          </div>
        </div>
      ) : ads === null ? <p className="ad-muted">Chargement…</p> : ads.length === 0 ? (
        <p className="ad-muted">Aucune publicité pour le moment.</p>
      ) : (
        <div className="ad-list-rows">
          {ads.map((ad) => {
            const [label, cls] = adStatus(ad);
            return (
              <div className="ad-row-card" key={ad.id}>
                {ad.image_url ? <img src={ad.image_url} alt="" /> : <div className="ad-noimg">Vidéo</div>}
                <div className="ad-row-main">
                  <strong>{ad.title}</strong>
                  <span className={`ad-badge ${cls}`}>{label}</span>
                  <small className="ad-muted">Ordre {ad.position}</small>
                </div>
                <div className="ad-row">
                  <button className="ad-btn" onClick={() => open(ad)}>Modifier</button>
                  <button className="ad-btn ad-btn--danger" onClick={() => remove(ad)}>Supprimer</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────── Apparence (couleurs) ───────── */
function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

export function AppearancePanel() {
  const [theme, setTheme] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    (async () => {
      const sb = await getSupabase();
      const { data } = await sb.from('settings').select('value').eq('key', 'theme').maybeSingle();
      setTheme(cleanTheme(data?.value));
    })();
  }, []);

  async function save() {
    const sb = await getSupabase();
    const { error } = await sb.from('settings').upsert({ key: 'theme', value: cleanTheme(theme) });
    setMsg(error ? SAVE_ERROR : { ok: true, text: 'Couleurs enregistrées. Elles s’appliquent à tout le site.' });
  }

  if (!theme) return <p className="ad-muted">Chargement…</p>;
  const checks = [
    ['Texte courant sur fond ivoire', contrast(theme.text, theme.ivory)],
    ['Petits textes dorés sur fond ivoire', contrast(theme.goldDark, theme.ivory)],
    ['Titres verts sur fond ivoire', contrast(theme.green, theme.ivory)],
  ];

  return (
    <div>
      <div className="ad-head"><h2>Apparence</h2></div>
      <p className="ad-muted">Les polices et les espacements restent protégés pour conserver l’allure luxe du site. Seules les couleurs de la charte se modifient.</p>
      <Msg m={msg} />
      <div className="ad-colors">
        {THEME_FIELDS.map(([key, label]) => (
          <label className="ad-color" key={key}>
            <span>{label}</span>
            <span className="ad-color-row">
              <input type="color" value={theme[key]} onChange={(e) => setTheme({ ...theme, [key]: e.target.value.toUpperCase() })} />
              <input type="text" value={theme[key]} maxLength={7} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setTheme({ ...theme, [key]: e.target.value.toUpperCase() })} aria-label={`${label} (code hexadécimal)`} />
            </span>
          </label>
        ))}
      </div>
      <div className="ad-card">
        <h3>Lisibilité</h3>
        {checks.map(([label, ratio]) => (
          <p key={label} className={ratio >= 4.5 ? 'ad-ok' : 'ad-error'}>{ratio >= 4.5 ? '✓' : '⚠'} {label} : contraste {ratio.toFixed(1)}:1 {ratio >= 4.5 ? '' : '(inférieur à 4,5:1, difficile à lire)'}</p>
        ))}
      </div>
      <div className="ad-row">
        <button className="ad-btn ad-btn--primary" onClick={save}>Enregistrer les couleurs</button>
        <button className="ad-btn" onClick={() => setTheme({ ...THEME_DEFAULTS })}>Couleurs d’origine</button>
      </div>
    </div>
  );
}

/* ───────── Informations de la maison ───────── */
export function SettingsPanel() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    (async () => {
      const sb = await getSupabase();
      const { data: row } = await sb.from('settings').select('value').eq('key', 'site').maybeSingle();
      setData(flattenSite(cleanSite(row?.value, defaultSite)));
    })();
  }, []);

  async function save() {
    const clean = flattenSite(cleanSite(data, defaultSite));
    const stored = Object.fromEntries(SITE_FIELDS.map((f) => [f.key, clean[f.key] ?? '']));
    const sb = await getSupabase();
    const { error } = await sb.from('settings').upsert({ key: 'site', value: stored });
    setMsg(error ? SAVE_ERROR : { ok: true, text: 'Informations enregistrées.' });
  }

  if (!data) return <p className="ad-muted">Chargement…</p>;
  return (
    <div>
      <div className="ad-head"><h2>Informations de la maison</h2></div>
      <p className="ad-muted">Coordonnées, numéro WhatsApp et réseaux sociaux : ils s’affichent sur tout le site (pied de page, contact, boutons WhatsApp).</p>
      <Msg m={msg} />
      <div className="ad-card">
        {SITE_FIELDS.map((f) => (<Field key={f.key} field={f} value={data[f.key]} onChange={(v) => setData({ ...data, [f.key]: v })} />))}
      </div>
      <button className="ad-btn ad-btn--primary" onClick={save}>Enregistrer</button>
    </div>
  );
}

/* ───────── Sécurité ───────── */
export function SecurityPanel({ user, onLogout }) {
  const [pwd, setPwd] = useState({ a: '', b: '' });
  const [msg, setMsg] = useState(null);
  const [log, setLog] = useState(null);

  useEffect(() => {
    (async () => {
      const sb = await getSupabase();
      const { data } = await sb.from('audit_log').select('at,action,table_name,row_key').order('at', { ascending: false }).limit(60);
      setLog(data || []);
    })();
  }, []);

  async function changePassword(e) {
    e.preventDefault();
    if (pwd.a.length < 12) return setMsg({ ok: false, text: 'Le mot de passe doit contenir au moins 12 caractères.' });
    if (!/[a-z]/.test(pwd.a) || !/[A-Z]/.test(pwd.a) || !/\d/.test(pwd.a)) return setMsg({ ok: false, text: 'Utilisez des minuscules, des majuscules et des chiffres.' });
    if (pwd.a !== pwd.b) return setMsg({ ok: false, text: 'Les deux mots de passe sont différents.' });
    const sb = await getSupabase();
    const { error } = await sb.auth.updateUser({ password: pwd.a });
    if (error) return setMsg({ ok: false, text: 'Changement refusé. Reconnectez-vous puis réessayez.' });
    setPwd({ a: '', b: '' });
    setMsg({ ok: true, text: 'Mot de passe modifié.' });
  }

  async function everywhere() {
    if (!window.confirm('Déconnecter tous vos appareils, y compris celui-ci ?')) return;
    const sb = await getSupabase();
    await sb.auth.signOut({ scope: 'global' });
    onLogout();
  }

  const ACTION = { INSERT: 'Création', UPDATE: 'Modification', DELETE: 'Suppression' };
  const TABLE = { pages: 'Page', settings: 'Réglage', ads: 'Publicité' };

  return (
    <div>
      <div className="ad-head"><h2>Sécurité</h2></div>
      <div className="ad-card">
        <h3>Votre compte</h3>
        <p>Connecté en tant que <strong>{user?.email}</strong>. Validation à 2 étapes : <span className="ad-badge ad-badge--ok">active</span></p>
        <p className="ad-muted">Déconnexion automatique après 20 minutes d’inactivité.</p>
        <button className="ad-btn" onClick={everywhere}>Déconnecter tous mes appareils</button>
      </div>
      <form className="ad-card ad-form" onSubmit={changePassword}>
        <h3>Changer de mot de passe</h3>
        <label>Nouveau mot de passe (12 caractères minimum)
          <input type="password" autoComplete="new-password" value={pwd.a} onChange={(e) => setPwd({ ...pwd, a: e.target.value })} maxLength={200} />
        </label>
        <label>Confirmer
          <input type="password" autoComplete="new-password" value={pwd.b} onChange={(e) => setPwd({ ...pwd, b: e.target.value })} maxLength={200} />
        </label>
        <Msg m={msg} />
        <button className="ad-btn ad-btn--primary">Modifier</button>
      </form>
      <div className="ad-card">
        <h3>Journal des modifications</h3>
        {log === null ? <p className="ad-muted">Chargement…</p> : log.length === 0 ? <p className="ad-muted">Aucune modification enregistrée.</p> : (
          <table className="ad-table">
            <thead><tr><th>Date</th><th>Action</th><th>Élément</th></tr></thead>
            <tbody>
              {log.map((l, i) => (
                <tr key={i}>
                  <td>{new Date(l.at).toLocaleString('fr-FR')}</td>
                  <td>{ACTION[l.action] || l.action}</td>
                  <td>{TABLE[l.table_name] || l.table_name} {l.row_key ? `· ${String(l.row_key).slice(0, 24)}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ───────── Boutique (prochaine étape) ───────── */
export function ShopPanel() {
  return (
    <div>
      <div className="ad-head"><h2>Boutique</h2></div>
      <div className="ad-card">
        <p><span className="ad-badge ad-badge--warn">Prochaine étape</span></p>
        <p>La gestion de la boutique viendra s’ajouter ici, dans le même espace sécurisé :</p>
        <ul className="ad-bullets">
          <li>catalogue des produits (photos, composition, prix, stock) ;</li>
          <li>commandes et suivi des livraisons ;</li>
          <li>paiements Mobile Money et cartes, avec confirmation automatique ;</li>
          <li>clients et statistiques de ventes.</li>
        </ul>
        <p className="ad-muted">En attendant, les produits des gammes se modifient dans <strong>Pages du site › Nos gammes</strong> (sections « Chapitre de gamme »).</p>
      </div>
    </div>
  );
}
