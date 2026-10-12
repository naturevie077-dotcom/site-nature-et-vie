'use client';

import { usePathname } from 'next/navigation';
import { useShop } from './ShopProvider';

// Icône panier de l'en-tête : visible dans la boutique, ou dès qu'un article a été ajouté.
export default function CartButton() {
  const shop = useShop();
  const pathname = usePathname() || '';
  if (!shop) return null;
  const { count, setOpen } = shop;
  if (!pathname.startsWith('/boutique') && count === 0) return null;

  return (
    <button type="button" className="cart-btn" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 8h14l-1.2 11H6.2L5 8z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      {count > 0 && <span className="cart-count">{count}</span>}
    </button>
  );
}
