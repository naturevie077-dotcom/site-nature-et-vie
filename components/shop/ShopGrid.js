'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatPrice, isBuyable, isPriceOnRequest, orderMessage, productUrl } from '@/lib/catalog';
import { whatsappLink } from '@/lib/site';
import { useSite } from '../SiteProvider';
import { useShop } from './ShopProvider';

const HOVER_DELAY = 1800; // le survol prolongé ouvre l'aperçu après ~2 secondes

function Visual({ product }) {
  return product.image ? (
    <img className={`pcard-img${product.packshot ? ' pcard-img--pack' : ''}`} src={product.image} alt={product.name} loading="lazy" />
  ) : (
    <span className="pcard-logo"><img src="/assets/logo.png" alt={product.name} /></span>
  );
}

function ProductCard({ product, onPreview }) {
  const timer = useRef(null);
  const node = useRef(null);
  const soon = product.status === 'soon';
  const stop = () => { clearTimeout(timer.current); timer.current = null; };

  const start = () => {
    if (soon || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    stop();
    timer.current = setTimeout(() => {
      const r = node.current?.getBoundingClientRect();
      onPreview(product, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null);
    }, HOVER_DELAY);
  };
  useEffect(() => stop, []);

  const body = (
    <>
      <div className="pcard-media">
        <Visual product={product} />
        {soon && <span className="pcard-soon">Prochainement</span>}
      </div>
      <div className="pcard-body">
        <span className="pcard-cat">{product.category}</span>
        <h3 className="pcard-name">{product.name}</h3>
        {product.details.length > 0 && (
          <ul className="pcard-details">
            {product.details.slice(0, 5).map((d, i) => (<li key={i}>{d}</li>))}
          </ul>
        )}
        {soon && <p className="pcard-details pcard-details--soon">{product.tagline}</p>}
        {product.price != null && (
          <div className="pcard-price">
            <span className="pcard-rule" aria-hidden="true" />
            <span><strong>{formatPrice(product.price)}</strong> FCFA{product.unit ? <small> · {product.unit}</small> : null}</span>
          </div>
        )}
        {isPriceOnRequest(product) && (
          <div className="pcard-price">
            <span className="pcard-rule" aria-hidden="true" />
            <span className="pcard-ask">Prix sur demande{product.unit ? <small> · {product.unit}</small> : null}</span>
          </div>
        )}
      </div>
    </>
  );

  if (soon) return <article className="pcard pcard--soon">{body}</article>;
  return (
    <article ref={node} className="pcard" onMouseEnter={start} onMouseLeave={stop} onFocus={stop}>
      <Link href={productUrl(product)} className="pcard-link" onClick={stop}>{body}</Link>
    </article>
  );
}

// Aperçu élargi, ouvert par un survol prolongé (ordinateur uniquement).
function QuickView({ product, anchor, onClose }) {
  const shop = useShop();
  const { site } = useSite();
  const buyable = isBuyable(product);
  const wa = whatsappLink(site, orderMessage([{ product, qty: 1 }]));
  const waProps = wa.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="qv-root">
      <div className="qv-backdrop" onClick={onClose} />
      <div
        className="qv"
        role="dialog"
        aria-modal="true"
        aria-label={`Aperçu de ${product.name}`}
        onMouseLeave={onClose}
        style={
          anchor
            ? {
                // Centré sur le produit survolé, sans jamais sortir de l'écran.
                left: `clamp(calc(min(450px, 46vw) + 12px), ${Math.round(anchor.x)}px, calc(100vw - min(450px, 46vw) - 12px))`,
                top: `clamp(44vh, ${Math.round(anchor.y)}px, 56vh)`,
              }
            : undefined
        }
      >
        <button type="button" className="qv-close" onClick={onClose} aria-label="Fermer l'aperçu">×</button>
        <div className="qv-media"><Visual product={product} /></div>
        <div className="qv-body">
          <span className="pcard-cat">{product.category}</span>
          <h3 className="qv-name">{product.name}</h3>
          {product.tagline && <p className="qv-tagline">{product.tagline}</p>}
          {product.price != null && (
            <p className="qv-price"><strong>{formatPrice(product.price)}</strong> FCFA{product.unit ? <small> · {product.unit}</small> : null}</p>
          )}
          {isPriceOnRequest(product) && <p className="qv-price">Prix communiqué par un conseiller{product.unit ? <small> · {product.unit}</small> : null}</p>}
          {product.details.length > 0 && (
            <ul className="qv-list">
              {product.details.map((d, i) => (<li key={i}>{d}</li>))}
            </ul>
          )}
          {product.origin && <p className="qv-origin">{product.origin}</p>}
          <div className="qv-actions">
            <Link href={productUrl(product)} className="btn btn--solid btn--sm">Voir la fiche</Link>
            {buyable && (
              <button type="button" className="btn btn--dark btn--sm" onClick={() => { shop.add(product.id); onClose(); }}>Ajouter au panier</button>
            )}
            <a className="qv-wa" href={wa} {...waProps}>Commander sur WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopGrid() {
  const { products } = useShop();
  const [category, setCategory] = useState('Tous');
  const [preview, setPreview] = useState(null); // { product, anchor }

  const visible = products.filter((p) => p.status !== 'hidden');
  const categories = useMemo(() => ['Tous', ...Array.from(new Set(visible.map((p) => p.category).filter(Boolean)))], [visible]);
  const shown = category === 'Tous' ? visible : visible.filter((p) => p.category === category);

  return (
    <div className="stack" style={{ gap: 48 }}>
      {categories.length > 2 && (
        <div className="shop-filters" role="group" aria-label="Filtrer par gamme">
          {categories.map((c) => (
            <button key={c} type="button" className={`shop-filter${c === category ? ' is-active' : ''}`} aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      )}
      <div className="shop-grid">
        {shown.map((p) => (<ProductCard key={p.id} product={p} onPreview={(product, anchor) => setPreview({ product, anchor })} />))}
      </div>
      {preview && <QuickView product={preview.product} anchor={preview.anchor} onClose={() => setPreview(null)} />}
    </div>
  );
}
