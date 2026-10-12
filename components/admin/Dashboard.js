'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { MediaLibrary } from './fields';
import PageEditor from './PageEditor';
import { AdsPanel, AppearancePanel, SecurityPanel, SettingsPanel, ShopPanel } from './Panels';

const TABS = [
  ['home', 'Tableau de bord'],
  ['pages', 'Pages du site'],
  ['ads', 'Publicités'],
  ['media', 'Médiathèque'],
  ['look', 'Apparence'],
  ['info', 'Informations'],
  ['shop', 'Boutique'],
  ['security', 'Sécurité'],
];

function Home({ go }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    (async () => {
      const sb = await getSupabase();
      const [pages, ads] = await Promise.all([
        sb.from('pages').select('slug', { count: 'exact', head: true }),
        sb.from('ads').select('id', { count: 'exact', head: true }).eq('active', true),
      ]);
      setStats({ pages: pages.count ?? 0, ads: ads.count ?? 0 });
    })();
  }, []);
  return (
    <div>
      <div className="ad-head"><h2>Tableau de bord</h2></div>
      <div className="ad-stats">
        <div className="ad-stat"><strong>{stats?.pages ?? '–'}</strong><span>page(s) personnalisée(s) publiée(s)</span></div>
        <div className="ad-stat"><strong>{stats?.ads ?? '–'}</strong><span>publicité(s) active(s)</span></div>
      </div>
      <div className="ad-cards">
        {[
          ['pages', 'Modifier les pages', 'Textes, images, sections, ordre, vidéos.'],
          ['ads', 'Gérer les publicités', 'Affiches de la page d’accueil, avec dates de début et de fin.'],
          ['look', 'Changer les couleurs', 'Les couleurs de la charte, avec contrôle de lisibilité.'],
          ['info', 'Mettre à jour les informations', 'WhatsApp, adresse, réseaux sociaux.'],
        ].map(([tab, title, text]) => (
          <button key={tab} className="ad-card ad-card--link" onClick={() => go(tab)}>
            <h3>{title}</h3>
            <p>{text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('home');
  const [menu, setMenu] = useState(false);
  const go = (t) => { setTab(t); setMenu(false); };

  return (
    <div className="ad-shell">
      <header className="ad-topbar">
        <button className="ad-btn ad-menu" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>Menu</button>
        <img src="/assets/logo-clair.png" alt="Nature et Vie" />
        <span className="ad-topbar-right">
          <a href="/" target="_blank" rel="noopener noreferrer" className="ad-link">Voir le site</a>
          <button className="ad-btn" onClick={onLogout}>Déconnexion</button>
        </span>
      </header>
      <div className="ad-body">
        <nav className={`ad-nav${menu ? ' is-open' : ''}`} aria-label="Administration">
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? 'is-active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
        <main className="ad-main">
          {tab === 'home' && <Home go={go} />}
          {tab === 'pages' && <PageEditor />}
          {tab === 'ads' && <AdsPanel />}
          {tab === 'media' && (<div><div className="ad-head"><h2>Médiathèque</h2></div><MediaLibrary /></div>)}
          {tab === 'look' && <AppearancePanel />}
          {tab === 'info' && <SettingsPanel />}
          {tab === 'shop' && <ShopPanel />}
          {tab === 'security' && <SecurityPanel user={user} onLogout={onLogout} />}
        </main>
      </div>
    </div>
  );
}
