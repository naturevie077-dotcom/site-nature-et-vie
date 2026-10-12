'use client';

import { BlockList } from './blocks';
import { FooterFull, FooterSimple } from './Footer';
import { useBlocks, useSite } from './SiteProvider';

// Page du site : blocs d'origine d'abord (rendu statique), puis version publiée depuis l'administration.
export default function PageView({ slug, fallback }) {
  const blocks = useBlocks(slug, fallback);
  const { site } = useSite();
  return (
    <main>
      <BlockList blocks={blocks} slug={slug} />
      {slug === 'accueil' ? (
        <FooterFull />
      ) : slug === 'nos-gammes' ? (
        <FooterSimple text={`${site.disclaimer} · RCCM ${site.rccm}`} />
      ) : (
        <FooterSimple />
      )}
    </main>
  );
}
