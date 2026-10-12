'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { cleanSite, cleanTheme, sanitizeBlocks, THEME_DEFAULTS } from '@/lib/blocks';
import { defaultSite } from '@/lib/site';
import { remoteEnabled, rest } from '@/lib/remote';
import { safeMedia, safeUrl, text } from '@/lib/safe';

const SiteContext = createContext({ site: defaultSite, ads: [] });
export const useSite = () => useContext(SiteContext);

const CSS_VARS = {
  ivory: '--ivory', cream: '--cream', greenDeep: '--green-deep', green: '--green', greenDarkest: '--green-darkest',
  gold: '--gold', goldLight: '--gold-light', goldDark: '--gold-dark', text: '--text', textSoft: '--text-soft', border: '--border',
};

function applyTheme(theme) {
  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(CSS_VARS)) root.style.setProperty(cssVar, theme[key] || THEME_DEFAULTS[key]);
}

// Fournit à tout le site : informations de la maison, publicités actives, couleurs.
// Sans base de données (ou en cas d'erreur), le site garde ses valeurs d'origine.
export default function SiteProvider({ children }) {
  const [state, setState] = useState({ site: defaultSite, ads: [] });

  useEffect(() => {
    if (!remoteEnabled) return;
    let off = false;
    (async () => {
      try {
        const [settings, ads] = await Promise.all([
          rest('settings?select=key,value'),
          rest('ads?select=id,title,subtitle,image_url,video_url,link_url,cta_label,position&order=position.asc&limit=12'),
        ]);
        if (off) return;
        const byKey = Object.fromEntries(settings.map((r) => [r.key, r.value]));
        if (byKey.theme) applyTheme(cleanTheme(byKey.theme));
        setState({
          site: byKey.site ? cleanSite(byKey.site, defaultSite) : defaultSite,
          ads: ads.map((a) => ({
            id: String(a.id),
            title: text(a.title, 120),
            subtitle: text(a.subtitle, 240),
            image: safeMedia(a.image_url),
            video: safeMedia(a.video_url),
            link: safeUrl(a.link_url),
            cta: text(a.cta_label, 60),
          })),
        });
      } catch {
        /* le site reste affiché avec son contenu d'origine */
      }
    })();
    return () => { off = true; };
  }, []);

  return <SiteContext.Provider value={state}>{children}</SiteContext.Provider>;
}

// Contenu d'une page : le contenu d'origine d'abord (rendu statique), puis la version publiée.
export function useBlocks(slug, fallback) {
  const [blocks, setBlocks] = useState(fallback);
  useEffect(() => {
    if (!remoteEnabled) return;
    let off = false;
    rest(`pages?select=blocks&slug=eq.${encodeURIComponent(slug)}`)
      .then((rows) => {
        if (off || !rows[0]) return;
        const clean = sanitizeBlocks(rows[0].blocks);
        if (clean.length) setBlocks(clean);
      })
      .catch(() => {});
    return () => { off = true; };
  }, [slug]);
  return blocks;
}
