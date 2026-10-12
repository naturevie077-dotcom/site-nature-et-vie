'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatPrice, orderMessage, productUrl } from '@/lib/catalog';
import { ONLINE_PAYMENT_ENABLED, startCheckout } from '@/lib/checkout';
import { whatsappLink } from '@/lib/site';
import { useSite } from '../SiteProvider';
import { useShop } from './ShopProvider';

export function Thumb({ product, size = 72 }) {
  return product.image ? (
    <img src={product.image} alt="" width={size} height={size} style={{ objectFit: 'cover' }} />
  ) : (
    <span className="thumb-logo" style={{ width: size, height: size }}>
      <img src="/assets/logo.png" alt="" style={{ width: '62%', height: 'auto' }} />
    </span>
  );
}

// Panneau latéral du panier.
export default function CartDrawer() {
  const { items, total, open, setOpen, setQty, remove } = useShop();
  const { site } = useSite();
  const closeRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const wa = whatsappLink(site, orderMessage(items));
  const waProps = wa.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  async function pay() {
    setError('');
    try {
      await startCheckout(items);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="drawer-root">
      <div className="drawer-backdrop" onClick={() => setOpen(false)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Votre panier">
        <header className="drawer-head">
          <h2>Votre panier</h2>
          <button ref={closeRef} type="button" className="drawer-close" onClick={() => setOpen(false)} aria-label="Fermer le panier">×</button>
        </header>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Votre panier est vide.</p>
            <Link href="/boutique/" className="btn btn--dark btn--sm" onClick={() => setOpen(false)}>Découvrir la boutique</Link>
          </div>
        ) : (
          <>
            <ul className="drawer-list">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="drawer-line">
                  <Link href={productUrl(product)} onClick={() => setOpen(false)} className="drawer-thumb"><Thumb product={product} /></Link>
                  <div className="drawer-line-main">
                    <Link href={productUrl(product)} onClick={() => setOpen(false)} className="drawer-name">{product.name}</Link>
                    <span className="drawer-unit">{formatPrice(product.price)} FCFA{product.unit ? ` · ${product.unit}` : ''}</span>
                    <div className="qty" role="group" aria-label={`Quantité de ${product.name}`}>
                      <button type="button" onClick={() => setQty(product.id, qty - 1)} aria-label="Retirer un">−</button>
                      <span aria-live="polite">{qty}</span>
                      <button type="button" onClick={() => setQty(product.id, qty + 1)} aria-label="Ajouter un">+</button>
                    </div>
                  </div>
                  <div className="drawer-line-side">
                    <strong>{formatPrice(product.price * qty)} FCFA</strong>
                    <button type="button" className="drawer-remove" onClick={() => remove(product.id)}>Retirer</button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="drawer-foot">
              <div className="drawer-total"><span>Total</span><strong>{formatPrice(total)} FCFA</strong></div>
              <p className="drawer-note">Livraison et paiement sont confirmés avec un conseiller.</p>
              <a className="btn btn--solid drawer-cta" href={wa} {...waProps}>Commander sur WhatsApp</a>
              {ONLINE_PAYMENT_ENABLED && (
                <button type="button" className="btn btn--dark drawer-cta" onClick={pay}>Passer au paiement</button>
              )}
              {error && <p className="drawer-note" role="alert">{error}</p>}
              <button type="button" className="drawer-continue" onClick={() => setOpen(false)}>Continuer mes achats</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
