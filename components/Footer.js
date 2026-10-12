'use client';

import Link from 'next/link';
import { socialLink, whatsappLink } from '@/lib/site';
import { useSite } from './SiteProvider';

// Pied de page simple (pages intérieures).
export function FooterSimple({ text }) {
  const { site } = useSite();
  return (
    <footer className="site-footer">
      <div className="wrap footer-row">
        <img src="/assets/logo-clair.png" alt="Nature et Vie" />
        <span>{text ?? `© ${site.year} ${site.legalName} · RCCM ${site.rccm} · ${site.address}, ${site.city}`}</span>
      </div>
    </footer>
  );
}

// Pied de page complet (accueil).
export function FooterFull() {
  const { site } = useSite();
  const external = (url) => url.startsWith('http');
  const social = [
    ['Facebook', 'facebook'],
    ['TikTok', 'tiktok'],
    ['Instagram', 'instagram'],
    ['YouTube', 'youtube'],
  ];
  const wa = whatsappLink(site);
  return (
    <footer id="contact" className="footer-full">
      <div className="wrap stack" style={{ gap: 56 }}>
        <div className="footer-cols">
          <div className="footer-col">
            <span className="logo">
              <img src="/assets/logo-clair.png" alt="Nature et Vie" />
            </span>
            <span className="sig">{site.tagline}</span>
          </div>
          <div className="footer-col">
            <h2>Nous rendre visite</h2>
            <span>{site.address}</span>
            <span>
              {site.city}, {site.country}
            </span>
          </div>
          <div className="footer-col">
            <h2>Nous écrire</h2>
            {wa.startsWith('http') ? (
              <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp · {site.whatsappDisplay}</a>
            ) : (
              <Link href={wa}>WhatsApp · {site.whatsappDisplay}</Link>
            )}
            <Link href="/contact/">Prendre rendez-vous</Link>
            {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
          </div>
          <div className="footer-col">
            <h2>Nous suivre</h2>
            {social.map(([label, key]) => {
              const url = socialLink(site, key);
              return external(url) ? (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer">{label}</a>
              ) : (
                <Link key={key} href={url}>{label}</Link>
              );
            })}
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {site.year} {site.legalName} · RCCM {site.rccm}
          </span>
          <span>{site.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
