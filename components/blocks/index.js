'use client';

// Affichage des blocs. Chaque bloc a été nettoyé par sanitizeBlocks (lib/blocks.js) :
// aucun contenu n'est jamais injecté comme HTML, tout est affiché comme du texte.

import Link from 'next/link';
import Header from '../Header';
import { ContactForm } from '../Forms';
import { useSite } from '../SiteProvider';
import { Button, Frame, IconBook, IconCross, IconHeart, IconLeaf, PageHero, Photo, ProductCard, SectionTitle, stagger } from '../ui';
import { resolveHref, safeMedia } from '@/lib/safe';
import { hasWhatsapp, whatsappLink } from '@/lib/site';
import { formatPrice, isPriceOnRequest, productUrl } from '@/lib/catalog';
import { useShop } from '../shop/ShopProvider';

export const ACTIVE = { accueil: '', 'la-maison': '/la-maison/', mission: '/mission/', 'nos-gammes': '/nos-gammes/', contact: '/contact/' };

const THEME_CLASS = { light: '', cream: ' section--cream', dark: ' section--dark on-dark' };
const sectionClass = (b) => `section${THEME_CLASS[b.theme] ?? ''}${b.tightTop ? ' section--tight' : ''}`;
const buttonVariant = (b) => (b.theme === 'dark' ? 'light' : 'dark');
const paras = (s) => (s || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
const icons = { leaf: IconLeaf, heart: IconHeart, cross: IconCross, book: IconBook };

function Cta({ b, site, variant }) {
  const href = resolveHref(b.buttonHref, site);
  if (!b.buttonLabel || !href) return null;
  return <Button href={href} variant={variant ?? buttonVariant(b)}>{b.buttonLabel}</Button>;
}
const CenterButton = ({ b, site }) => {
  const href = resolveHref(b.buttonHref, site);
  if (!b.buttonLabel || !href) return null;
  return (
    <div className="nv-r" style={{ display: 'flex', justifyContent: 'center' }}>
      <Cta b={b} site={site} />
    </div>
  );
};

/* ───────── Bandeau d'ouverture ───────── */
function Hero({ b, slug }) {
  const { site } = useSite();
  const href = resolveHref(b.buttonHref, site);
  const button = b.buttonLabel && href ? <Button href={href}>{b.buttonLabel}</Button> : null;

  if (b.kind === 'home') {
    return (
      <section id="accueil" className="hero hero-home">
        <img className="hero-bg nv-hero-img" src={b.image} alt={b.imageAlt} style={{ objectPosition: b.imagePosition }} />
        <div className="hero-shade" />
        <Header overlay />
        <div className="hero-home-body">
          <span className="rule nv-line" />
          <h1 className="nv-in nv-i1">{b.title}</h1>
          {b.text && <p className="tagline nv-in nv-i2">{b.text}</p>}
          {button && <div className="nv-in nv-i3" style={{ marginTop: 18 }}>{button}</div>}
        </div>
        <div className="nv-cue" aria-hidden="true"><span /></div>
      </section>
    );
  }
  return (
    <PageHero
      active={ACTIVE[slug]}
      label={b.label}
      title={b.title}
      text={b.text}
      image={b.image || '/assets/foret.jpg'}
      imageAlt={b.imageAlt}
      position={b.imagePosition}
      minHeight={Number(b.height) || 520}
    >
      {button}
    </PageHero>
  );
}

/* ───────── Texte et image ───────── */
function Split({ b }) {
  const { site } = useSite();
  const ps = paras(b.paragraphs);
  const bordered = b.paragraphStyle === 'bordered';

  if (!b.image) {
    return (
      <section className={sectionClass(b)}>
        <div className="wrap split">
          <div className="stack" style={{ gap: 22 }}>
            {b.label && <span className="eyebrow nv-r">{b.label}</span>}
            {b.title && <h2 className="h2 nv-r">{b.title}</h2>}
          </div>
          <div className="stack nv-r" style={{ gap: 28 }}>
            {ps.map((p, i) => (<p key={i} className={bordered ? 'bordered-left' : 'p'}>{p}</p>))}
            <div><Cta b={b} site={site} /></div>
          </div>
        </div>
      </section>
    );
  }

  const picture =
    b.frame === 'gold' ? (
      <div className="gold-frame nv-r">
        <div className="gold-frame-inner nv-u" style={{ aspectRatio: b.ratio }}>
          <img src={b.image} alt={b.imageAlt} style={{ objectPosition: b.imagePosition }} loading="lazy" />
        </div>
      </div>
    ) : (
      <Frame src={b.image} alt={b.imageAlt} ratio={b.ratio} position={b.imagePosition} />
    );

  const copy = (
    <div className="stack" style={{ gap: 24 }}>
      {b.label && <span className="eyebrow nv-r">{b.label}</span>}
      {b.title && <h2 className="h2 nv-r">{b.title}</h2>}
      {ps.map((p, i) => (<p key={i} className={bordered ? 'bordered-left nv-r' : 'p nv-r'}>{p}</p>))}
      {b.signature && <p className="signature nv-r">{b.signature}</p>}
      {b.facts?.length > 0 && (
        <div className="facts">
          {b.facts.map((f, i) => (
            <div className={`fact nv-r${stagger(i)}`} key={i}><strong>{f.title}</strong><span>{f.text}</span></div>
          ))}
        </div>
      )}
      {b.buttonLabel && <div className="nv-r" style={{ marginTop: 8 }}><Cta b={b} site={site} /></div>}
    </div>
  );

  return (
    <section className={sectionClass(b)}>
      <div className="wrap split">
        {b.imageSide === 'right' ? (<>{copy}{picture}</>) : (<>{picture}{copy}</>)}
      </div>
    </section>
  );
}

/* ───────── Grille ───────── */
function Grid({ b }) {
  const { site } = useSite();
  const items = b.items || [];
  const Icon = (it, size, color) => {
    const C = icons[it.icon];
    return C ? <C size={size} color={color} /> : null;
  };
  const gap = b.style === 'pillars' ? 40 : 56;

  let body = null;
  if (b.style === 'pillars') {
    body = (
      <div className="pillars">
        {items.map((it, i) => (
          <div className={`pillar nv-r${stagger(i)}`} key={i}>
            {Icon(it, 30)}
            <h3 className="h3">{it.title}</h3>
            {it.text && <p>{it.text}</p>}
          </div>
        ))}
      </div>
    );
  } else if (b.style === 'tiles') {
    body = (
      <div className="tiles">
        {items.map((it, i) => (
          <div className={`tile nv-r${stagger(i)}`} key={i}>
            {Icon(it, 34, '#C9A55A')}
            <h3 className="h3">{it.title}</h3>
            {it.text && <p>{it.text}</p>}
          </div>
        ))}
      </div>
    );
  } else if (b.style === 'values') {
    body = (
      <div className="values">
        {items.map((it, i) =>
          it.number ? (
            <div className={`value nv-r${stagger(i % 3)}`} key={i}>
              <span className="num">{it.number}</span>
              <div><h3>{it.title}</h3>{it.text && <p>{it.text}</p>}</div>
            </div>
          ) : (
            <div className={`value value--block nv-r${stagger(i % 3)}`} key={i}>
              <h3>{it.title}</h3>{it.text && <p>{it.text}</p>}
            </div>
          )
        )}
      </div>
    );
  } else if (b.style === 'steps') {
    body = (
      <div className="cols cols--steps">
        {items.map((it, i) => (
          <div className={`stack nv-r${stagger(i)}`} style={{ gap: 16 }} key={i}>
            {it.number && <span className="numeral">{it.number}</span>}
            <h3 className="h3" style={{ fontSize: 30 }}>{it.title}</h3>
            {it.text && <p className="p p--sm">{it.text}</p>}
          </div>
        ))}
      </div>
    );
  } else if (b.style === 'cards') {
    body = (
      <div className="cols cols--4">
        {items.map((it, i) => {
          const href = resolveHref(it.href, site) || '/nos-gammes/';
          const inner = (
            <>
              {it.image ? <Frame src={it.image} alt={it.imageAlt} ratio="3 / 4" zoom /> : <Photo ratio="3 / 4" caption={it.title} />}
              <h3 className="h3">{it.title}</h3>
              <span className="more">Découvrir</span>
            </>
          );
          return href.startsWith('/') ? (
            <Link key={i} href={href} className={`range-card nv-r${stagger(i)}`}>{inner}</Link>
          ) : (
            <a key={i} href={href} className={`range-card nv-r${stagger(i)}`} target="_blank" rel="noopener noreferrer">{inner}</a>
          );
        })}
      </div>
    );
  } else {
    body = (
      <div className="cols">
        {items.map((it, i) => (
          <div className={`topline nv-r${stagger(i)}`} key={i}>
            <h3>{it.title}</h3>
            {it.text && <p>{it.text}</p>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className={sectionClass(b)}>
      <div className="wrap stack" style={{ gap }}>
        <SectionTitle label={b.label} title={b.title} />
        {b.intro && (
          <p className="lead nv-r" style={{ maxWidth: 720, fontSize: 'clamp(24px, 2.8vw, 34px)' }}>{b.intro}</p>
        )}
        {body}
        <CenterButton b={b} site={site} />
      </div>
    </section>
  );
}

/* ───────── Texte centré, citation, mots, appel ───────── */
function TextBlock({ b }) {
  const { site } = useSite();
  return (
    <section className={sectionClass(b)}>
      <div className="stack center" style={{ maxWidth: 980, margin: '0 auto', gap: 28 }}>
        {b.label && <span className="eyebrow nv-r">{b.label}</span>}
        {b.title && (
          <h2 className="h2 nv-r" style={b.size === 'large' ? { fontSize: 'clamp(40px, 5vw, 68px)', lineHeight: 1.05 } : undefined}>{b.title}</h2>
        )}
        {paras(b.paragraphs).map((p, i) => (<p key={i} className="p nv-r" style={{ lineHeight: 1.9, maxWidth: 720 }}>{p}</p>))}
        {b.rule && <span className="rule nv-l" style={{ marginTop: 8 }} />}
        {b.buttonLabel && <div className="nv-r"><Cta b={b} site={site} /></div>}
      </div>
    </section>
  );
}

function Quote({ b }) {
  const { site } = useSite();
  return (
    <section className={sectionClass(b)}>
      <div className="stack center" style={{ maxWidth: 860, margin: '0 auto', gap: 24 }}>
        <p className="quote nv-r">{b.text}</p>
        {b.reference && <span className="reference">{b.reference}</span>}
        {b.buttonLabel && <div className="nv-r" style={{ marginTop: 16 }}><Cta b={b} site={site} /></div>}
      </div>
    </section>
  );
}

function Tags({ b }) {
  return (
    <section className={sectionClass(b)}>
      <div className="stack center" style={{ maxWidth: 1100, margin: '0 auto', gap: 28 }}>
        {b.label && <span className="eyebrow nv-r">{b.label}</span>}
        {b.title && <h2 className="h2 nv-r">{b.title}</h2>}
        {b.text && <p className="p nv-r" style={{ maxWidth: 640 }}>{b.text}</p>}
        <div className="reach">
          {(b.items || []).map((it, i) => (<span className={`nv-r${stagger(i)}`} key={i}>{it.text}</span>))}
        </div>
      </div>
    </section>
  );
}

function CtaBlock({ b }) {
  const { site } = useSite();
  return (
    <section className={sectionClass(b)} style={{ paddingBlock: 'clamp(72px, 9vw, 110px)' }}>
      <div className="stack center" style={{ maxWidth: 860, margin: '0 auto', gap: 22 }}>
        <h2 className="h2 nv-r" style={{ fontSize: 'clamp(32px, 3.6vw, 46px)', lineHeight: 1.15 }}>{b.title}</h2>
        {b.text && <p className="p p--sm nv-r" style={{ maxWidth: 600 }}>{b.text}</p>}
        {b.buttonLabel && <div className="nv-r" style={{ marginTop: 8 }}><Cta b={b} site={site} /></div>}
      </div>
    </section>
  );
}

/* ───────── Publicités ───────── */
function Ads({ b }) {
  const { site, ads } = useSite();
  if (!ads.length) return null;
  return (
    <section className={sectionClass(b)}>
      <div className="wrap stack" style={{ gap: 48 }}>
        <SectionTitle label={b.label} title={b.title} />
        <div className={b.layout === 'banner' ? 'ads ads--banner' : 'ads'}>
          {ads.map((ad, i) => {
            const href = resolveHref(ad.link, site);
            return (
              <article className={`ad nv-r${stagger(i)}`} key={ad.id}>
                {ad.video ? (
                  <video className="ad-media" src={ad.video} poster={ad.image || undefined} controls playsInline preload="metadata" />
                ) : ad.image ? (
                  <img className="ad-media" src={ad.image} alt={ad.title} loading="lazy" />
                ) : null}
                <div className="ad-body">
                  <h3>{ad.title}</h3>
                  {ad.subtitle && <p>{ad.subtitle}</p>}
                  {href && <Button href={href} variant={b.theme === 'dark' ? 'light' : 'dark'} className="btn--sm">{ad.cta || 'Découvrir'}</Button>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────── Vidéo ───────── */
function VideoBlock({ b }) {
  const src = safeMedia(b.videoUrl);
  if (!src) return null;
  return (
    <section className={sectionClass(b)}>
      <div className="wrap stack" style={{ gap: 40 }}>
        <SectionTitle label={b.label} title={b.title} />
        <div className="nv-r" style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
          <video src={src} poster={b.poster || undefined} controls playsInline preload="metadata" style={{ width: '100%', display: 'block', background: '#000' }} />
          {b.caption && <p className="p p--xs" style={{ marginTop: 14, textAlign: 'center', color: 'var(--text-soft)' }}>{b.caption}</p>}
        </div>
      </div>
    </section>
  );
}

/* ───────── Chapitre de gamme ───────── */
function Chapter({ b }) {
  const { site } = useSite();
  const shop = useShop();
  const id = /^[a-z0-9-]{1,40}$/.test(b.anchor || '') ? b.anchor : undefined;
  const wa = (message) => whatsappLink(site, message);

  // Produit phare : si une fiche de la boutique est liée, elle fait foi (nom, photo, composition, prix).
  const linked = b.featuredSlug ? shop?.products.find((p) => p.slug === b.featuredSlug && p.status !== 'hidden') : null;
  const feat = {
    name: linked?.name || b.featuredName,
    photo: linked ? linked.image : b.featuredPhoto,
    packshot: linked ? linked.packshot : b.featuredPackshot,
    composition: linked?.composition?.length ? linked.composition : b.featuredComposition || [],
    price: linked ? (linked.price != null ? `${formatPrice(linked.price)} FCFA` : '') : b.featuredPrice,
    unit: linked ? linked.unit : b.featuredUnit,
    onRequest: linked ? isPriceOnRequest(linked) : false,
    href: linked ? productUrl(linked) : '/boutique/',
  };
  return (
    <section id={id} className="chapter">
      <div className="wrap stack" style={{ gap: 48 }}>
        <div className="chapter-head">
          <div className="stack" style={{ gap: 14 }}>
            <span className="eyebrow nv-r">{b.chapter}</span>
            <h2 className="h2 nv-r">{b.title}</h2>
          </div>
          <p className="p p--sm nv-r" style={{ lineHeight: 1.85 }}>{b.intro}</p>
        </div>

        {b.featured && (
          <div className="featured">
            {feat.photo ? (
              feat.packshot ? (
                <div className="featured-logo featured-pack nv-u"><img src={feat.photo} alt={feat.name} /></div>
              ) : (
                <Frame src={feat.photo} alt={feat.name} ratio="1 / 1" />
              )
            ) : (
              <div className="featured-logo nv-u"><img src="/assets/logo.png" alt="Nature et Vie" /></div>
            )}
            <div className="stack nv-r" style={{ gap: 20 }}>
              <span className="eyebrow" style={{ letterSpacing: '0.3em' }}>Produit phare</span>
              <h3>{feat.name}</h3>
              {feat.composition.map((c, i) => (
                <p className="p p--xs" key={i}><span style={{ fontWeight: 500 }}>{c.title} :</span> {c.text}</p>
              ))}
              {feat.price && <p className="price">{feat.price} <small>{feat.unit}</small></p>}
              {!feat.price && feat.onRequest && <p className="price price--ask">Prix communiqué par un conseiller</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 6 }}>
                <Button href={wa(`Bonjour, je souhaite un conseil sur ${feat.name}.`)} variant="solid">Demander conseil</Button>
                <Button href={feat.href} variant="dark" className="btn--sm">{linked ? 'Voir la fiche' : 'Commander'}</Button>
              </div>
            </div>
          </div>
        )}

        {b.items?.length > 0 ? (
          <div className="product-grid">
            {b.items.map((p, i) => (<ProductCard produit={p} delay={i % 3} key={i} />))}
          </div>
        ) : (
          b.selection && (
            <div className={`showcase${b.flip ? ' showcase--flip' : ''}`}>
              {b.selectionPhoto && (
                <div className="showcase-photo">
                  <Frame src={b.selectionPhoto} alt={b.selectionAlt} ratio="4 / 3" position={b.selectionPosition} zoom />
                </div>
              )}
              <div className="showcase-text nv-r">
                <p>{b.selection}</p>
                <Button href={wa(b.selectionMessage)} variant="dark" className="btn--sm">Recevoir la sélection</Button>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

/* ───────── Contact ───────── */
function ContactBlock({ b }) {
  const { site } = useSite();
  const meet = site.meetUrl || '/contact/';
  return (
    <section className="section" style={{ paddingBlock: 'clamp(72px, 9vw, 130px)' }}>
      <div className="wrap contact-wrap">
        <div className="contact-info nv-r">
          <p className="lead" style={{ margin: 0, textAlign: 'left', maxWidth: 'none', fontSize: 'clamp(24px, 2.4vw, 30px)', lineHeight: 1.45 }}>{b.lead}</p>
          <div className="contact-block">
            <h2>WhatsApp</h2>
            <p>{site.whatsappDisplay}</p>
            {hasWhatsapp(site) ? (
              <a className="link-gold" href={whatsappLink(site)} target="_blank" rel="noopener noreferrer">Écrire maintenant</a>
            ) : (
              <a className="link-gold" href="#msg">Écrire maintenant</a>
            )}
          </div>
          <div className="contact-block">
            <h2>Rendez-vous en visio</h2>
            <p>Un échange privé sur Google Meet avec un conseiller.</p>
            <a className="link-gold" href={meet} {...(site.meetUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>Réserver un créneau</a>
          </div>
          <div className="contact-block">
            <h2>Nous rendre visite</h2>
            <p>{site.address}</p>
            <p style={{ fontSize: 14, color: 'var(--text-soft)' }}>{site.city}, {site.country}</p>
            {site.hours && <p style={{ fontSize: 14, color: 'var(--text-soft)' }}>{site.hours}</p>}
            {site.email && <p style={{ fontSize: 14 }}><a href={`mailto:${site.email}`}>{site.email}</a></p>}
          </div>
        </div>
        <div className="nv-r nv-o1" style={{ flex: '1.3 1 420px', display: 'flex' }}>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

const RENDERERS = {
  hero: Hero, split: Split, grid: Grid, text: TextBlock, quote: Quote, tags: Tags, cta: CtaBlock,
  ads: Ads, video: VideoBlock, chapter: Chapter, contact: ContactBlock,
};

export function BlockList({ blocks, slug }) {
  return (
    <>
      {blocks.map((b) => {
        const Component = RENDERERS[b.type];
        return Component ? <Component key={b.id} b={b} slug={slug} /> : null;
      })}
    </>
  );
}
