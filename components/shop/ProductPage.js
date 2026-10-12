'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '../Header';
import { FooterSimple } from '../Footer';
import { formatPrice, isBuyable, isPriceOnRequest, orderMessage, productUrl } from '@/lib/catalog';
import { whatsappLink } from '@/lib/site';
import { useSite } from '../SiteProvider';
import { useShop } from './ShopProvider';

function Gallery({ product }) {
  const photos = product.gallery.length ? product.gallery : product.image ? [product.image] : [];
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [product.id]);
  const current = photos[index] || '';

  return (
    <div className="pp-gallery">
      <div className={`pp-media${product.packshot ? ' pp-media--pack' : ''}`}>
        {current ? (
          <img src={current} alt={`${product.name}${photos.length > 1 ? ` — vue ${index + 1} sur ${photos.length}` : ''}`} />
        ) : (
          <span className="pp-logo"><img src="/assets/logo.png" alt={product.name} /></span>
        )}
      </div>
      {photos.length > 1 && (
        <div className="pp-thumbs" role="group" aria-label="Photos du produit">
          {photos.map((src, i) => (
            <button key={src} type="button" className={`pp-thumb${i === index ? ' is-active' : ''}${product.packshot ? ' pp-thumb--pack' : ''}`} onClick={() => setIndex(i)} aria-label={`Voir la photo ${i + 1}`} aria-pressed={i === index}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Fiche produit : une seule page statique, le produit est choisi par l'adresse (?p=nom-du-produit).
// Ainsi un produit ajouté plus tard dans la base apparaît sans reconstruire le site.
export default function ProductPage() {
  const { products, add } = useShop();
  const { site } = useSite();
  const [slug, setSlug] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setSlug(new URLSearchParams(window.location.search).get('p') || '');
  }, []);

  const product = slug ? products.find((p) => p.slug === slug && p.status !== 'hidden') : null;

  useEffect(() => {
    if (product) document.title = `${product.name} — Nature et Vie`;
  }, [product]);

  const related = products.filter((p) => p.status === 'available' && p.slug !== slug).slice(0, 3);

  let content;
  if (slug === null) {
    content = <p className="p" style={{ textAlign: 'center' }}>Chargement…</p>;
  } else if (!product) {
    content = (
      <div className="stack center" style={{ gap: 22 }}>
        <h1 className="h2">Produit introuvable</h1>
        <Link href="/boutique/" className="btn btn--dark">Retour à la boutique</Link>
      </div>
    );
  } else {
    const buyable = isBuyable(product);
    const onRequest = isPriceOnRequest(product);
    const wa = whatsappLink(site, orderMessage([{ product, qty: buyable ? qty : 1 }]));
    const waProps = wa.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    content = (
      <div className="pp">
        <Gallery product={product} />

        <div className="pp-info">
          <nav className="pp-crumbs" aria-label="Fil d'Ariane">
            <Link href="/boutique/">Boutique</Link><span aria-hidden="true">/</span><span>{product.category}</span>
          </nav>
          <h1 className="pp-name">{product.name}</h1>
          {product.tagline && <p className="pp-tagline">{product.tagline}</p>}

          {product.price != null && (
            <p className="pp-price"><strong>{formatPrice(product.price)}</strong> FCFA{product.unit ? <small> · {product.unit}</small> : null}</p>
          )}
          {onRequest && (
            <p className="pp-price pp-price--ask">Prix communiqué par un conseiller{product.unit ? <small> · {product.unit}</small> : null}</p>
          )}

          {product.description &&
            product.description.split(/\n{2,}/).map((para, i) => (<p className="p pp-desc" key={i}>{para}</p>))}

          {product.details.length > 0 && (
            <ul className="qv-list">
              {product.details.map((d, i) => (<li key={i}>{d}</li>))}
            </ul>
          )}

          {buyable && (
            <div className="pp-buy">
              <div className="qty qty--lg" role="group" aria-label="Quantité">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Retirer un">−</button>
                <span aria-live="polite">{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Ajouter un">+</button>
              </div>
              <button type="button" className="btn btn--solid" onClick={() => add(product.id, qty)}>Ajouter au panier</button>
            </div>
          )}
          {product.status === 'soon' && <p className="pp-soon">Ce produit sera bientôt disponible.</p>}
          {product.status !== 'soon' && (
            <a className={`btn ${buyable ? 'btn--dark' : 'btn--solid'} pp-wa`} href={wa} {...waProps}>
              {buyable ? 'Commander sur WhatsApp' : 'Demander le prix sur WhatsApp'}
            </a>
          )}
          <p className="pp-note">Livraison et paiement sont confirmés avec un conseiller.</p>
        </div>

        <div className="pp-extra">
          {product.composition.length > 0 && (
            <section>
              <h2 className="h3">Composition</h2>
              {product.composition.map((c, i) => (
                <p className="p p--xs" key={i}><span style={{ fontWeight: 500 }}>{c.title} :</span> {c.text}</p>
              ))}
            </section>
          )}
          {product.usage && (
            <section>
              <h2 className="h3">Préparation</h2>
              <p className="p p--xs">{product.usage}</p>
            </section>
          )}
          {product.origin && (
            <section>
              <h2 className="h3">Origine</h2>
              <p className="p p--xs">{product.origin}</p>
            </section>
          )}
          <section>
            <h2 className="h3">Précautions</h2>
            {product.cautions.map((c, i) => (<p className="p p--xs" key={i}>{c}</p>))}
            <p className="p p--xs">{site.disclaimer}</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <main>
      <section className="hero hero--slim">
        <Header active="/boutique/" />
      </section>
      <section className="section" style={{ paddingTop: 'clamp(40px, 5vw, 72px)' }}>
        <div className="wrap">{content}</div>
      </section>
      {product && related.length > 0 && (
        <section className="section section--cream" style={{ paddingBlock: 'clamp(56px, 7vw, 96px)' }}>
          <div className="wrap stack" style={{ gap: 36 }}>
            <h2 className="h2" style={{ textAlign: 'center' }}>Vous aimerez aussi</h2>
            <div className="shop-grid">
              {related.map((r) => (
                <Link key={r.id} href={productUrl(r)} className="pcard pcard-link">
                  <div className="pcard-media">
                    {r.image ? <img className={`pcard-img${r.packshot ? ' pcard-img--pack' : ''}`} src={r.image} alt={r.name} loading="lazy" /> : <span className="pcard-logo"><img src="/assets/logo.png" alt={r.name} /></span>}
                  </div>
                  <div className="pcard-body">
                    <span className="pcard-cat">{r.category}</span>
                    <h3 className="pcard-name">{r.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <FooterSimple />
    </main>
  );
}
