'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabase, supabaseConfigured } from '@/lib/supabase';
import Dashboard from './Dashboard';
import './admin.css';

const IDLE_MS = 20 * 60 * 1000; // déconnexion automatique après 20 minutes d'inactivité

function Card({ title, children }) {
  return (
    <main className="ad-auth">
      <div className="ad-auth-card">
        <img src="/assets/logo.png" alt="Nature et Vie" className="ad-auth-logo" />
        <h1>{title}</h1>
        {children}
      </div>
    </main>
  );
}

function Login({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [fails, setFails] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);

  async function submit(e) {
    e.preventDefault();
    if (Date.now() < lockUntil) {
      setError('Trop de tentatives. Patientez une minute avant de réessayer.');
      return;
    }
    setBusy(true);
    setError('');
    const sb = await getSupabase();
    const { error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) {
      const n = fails + 1;
      setFails(n);
      if (n >= 5) { setLockUntil(Date.now() + 60_000); setFails(0); }
      setError('Identifiants incorrects.'); // message volontairement identique quelle que soit la cause
      return;
    }
    setPassword('');
    onDone();
  }

  return (
    <Card title="Espace administrateur">
      <form onSubmit={submit} className="ad-form">
        <label>Adresse e-mail
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} />
        </label>
        <label>Mot de passe
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required maxLength={200} />
        </label>
        {error && <p className="ad-error" role="alert">{error}</p>}
        <button className="ad-btn ad-btn--primary" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
      <p className="ad-muted">Accès réservé à l’équipe de Nature et Vie.</p>
    </Card>
  );
}

function MfaEnroll({ onDone, onLogout }) {
  const [info, setInfo] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const sb = await getSupabase();
      const { data: list } = await sb.auth.mfa.listFactors();
      for (const f of list?.all || []) if (f.status === 'unverified') await sb.auth.mfa.unenroll({ factorId: f.id });
      const { data, error: err } = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Nature et Vie ${Date.now()}` });
      if (err) setError("Impossible de préparer la validation à 2 étapes. Réessayez.");
      else setInfo({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    })();
  }, []);

  async function verify(e) {
    e.preventDefault();
    setError('');
    const sb = await getSupabase();
    const { data: ch, error: e1 } = await sb.auth.mfa.challenge({ factorId: info.id });
    if (e1) return setError('Erreur, réessayez.');
    const { error: e2 } = await sb.auth.mfa.verify({ factorId: info.id, challengeId: ch.id, code: code.trim() });
    if (e2) return setError('Code incorrect ou expiré.');
    onDone();
  }

  return (
    <Card title="Sécurisez votre compte">
      <p>Pour protéger le site, la connexion exige un code à 6 chiffres généré par une application (Google Authenticator, Microsoft Authenticator, Authy…).</p>
      {info ? (
        <>
          <ol className="ad-steps">
            <li>Ouvrez l’application et ajoutez un compte en scannant ce code :</li>
          </ol>
          <img className="ad-qr" src={info.qr} alt="Code QR à scanner avec l’application d’authentification" />
          <p className="ad-muted">Impossible de scanner ? Saisissez cette clé : <code>{info.secret}</code></p>
          <form onSubmit={verify} className="ad-form">
            <label>Code à 6 chiffres
              <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required />
            </label>
            {error && <p className="ad-error" role="alert">{error}</p>}
            <button className="ad-btn ad-btn--primary">Activer et continuer</button>
          </form>
        </>
      ) : (
        <p>{error || 'Préparation…'}</p>
      )}
      <button className="ad-link" onClick={onLogout}>Annuler et se déconnecter</button>
    </Card>
  );
}

function MfaVerify({ onDone, onLogout }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  async function verify(e) {
    e.preventDefault();
    setError('');
    const sb = await getSupabase();
    const { data: list } = await sb.auth.mfa.listFactors();
    const factor = list?.totp?.[0];
    if (!factor) return setError('Aucun appareil de validation enregistré.');
    const { data: ch, error: e1 } = await sb.auth.mfa.challenge({ factorId: factor.id });
    if (e1) return setError('Erreur, réessayez.');
    const { error: e2 } = await sb.auth.mfa.verify({ factorId: factor.id, challengeId: ch.id, code: code.trim() });
    if (e2) return setError('Code incorrect ou expiré.');
    onDone();
  }

  return (
    <Card title="Validation à 2 étapes">
      <p>Saisissez le code à 6 chiffres affiché par votre application d’authentification.</p>
      <form onSubmit={verify} className="ad-form">
        <label>Code
          <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required autoFocus />
        </label>
        {error && <p className="ad-error" role="alert">{error}</p>}
        <button className="ad-btn ad-btn--primary">Valider</button>
      </form>
      <button className="ad-link" onClick={onLogout}>Se déconnecter</button>
    </Card>
  );
}

export default function AdminApp() {
  const [phase, setPhase] = useState('loading');
  const [user, setUser] = useState(null);

  const check = useCallback(async () => {
    const sb = await getSupabase();
    if (!sb) return setPhase('config');
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return setPhase('login');
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') return setPhase('mfa-verify');
    if (aal?.currentLevel !== 'aal2') return setPhase('mfa-enroll');
    const { data: row } = await sb.from('admins').select('user_id').maybeSingle();
    if (!row) {
      await sb.auth.signOut();
      return setPhase('denied');
    }
    setUser(session.user);
    setPhase('ready');
  }, []);

  const logout = useCallback(async () => {
    const sb = await getSupabase();
    await sb?.auth.signOut();
    setUser(null);
    setPhase('login');
  }, []);

  useEffect(() => { check(); }, [check]);

  // Déconnexion automatique après inactivité.
  useEffect(() => {
    if (phase !== 'ready') return;
    let timer;
    const reset = () => { clearTimeout(timer); timer = setTimeout(logout, IDLE_MS); };
    const events = ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => { clearTimeout(timer); events.forEach((ev) => window.removeEventListener(ev, reset)); };
  }, [phase, logout]);

  if (!supabaseConfigured && phase !== 'loading') {
    return (
      <Card title="Administration non configurée">
        <p>La connexion à la base de données n’est pas encore renseignée. Suivez le guide <strong>ADMIN.md</strong> à la racine du projet (création du compte Supabase, puis fichier <code>.env.local</code>).</p>
      </Card>
    );
  }
  if (phase === 'loading') return <Card title="Chargement…"><p className="ad-muted">Vérification de la session…</p></Card>;
  if (phase === 'config') return <Card title="Administration non configurée"><p>Voir le guide <strong>ADMIN.md</strong>.</p></Card>;
  if (phase === 'login') return <Login onDone={check} />;
  if (phase === 'mfa-enroll') return <MfaEnroll onDone={check} onLogout={logout} />;
  if (phase === 'mfa-verify') return <MfaVerify onDone={check} onLogout={logout} />;
  if (phase === 'denied') {
    return (
      <Card title="Accès refusé">
        <p>Ce compte n’est pas autorisé à administrer le site.</p>
        <button className="ad-btn" onClick={() => setPhase('login')}>Retour</button>
      </Card>
    );
  }
  return <Dashboard user={user} onLogout={logout} />;
}
