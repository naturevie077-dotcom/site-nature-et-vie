'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isBuyable, normalizeProduct, staticProducts } from '@/lib/catalog';
import { remoteEnabled, rest } from '@/lib/remote';
import CartDrawer from './CartDrawer';

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

const STORAGE_KEY = 'nv-cart';
const MAX_QTY = 20;

function readStorage() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(raw)
      ? raw
          .filter((l) => l && typeof l.id === 'string')
          .map((l) => ({ id: l.id.slice(0, 60), qty: Math.min(MAX_QTY, Math.max(1, Math.trunc(Number(l.qty)) || 1)) }))
          .slice(0, 50)
      : [];
  } catch {
    return [];
  }
}

// Catalogue + panier pour tout le site. Le panier est gardé dans le navigateur du visiteur.
export default function ShopProvider({ children }) {
  const [products, setProducts] = useState(staticProducts);
  const [lines, setLines] = useState([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLines(readStorage());
    setReady(true);
  }, []);

  // Dès que la base est disponible, ses produits remplacent ceux du fichier.
  useEffect(() => {
    if (!remoteEnabled) return;
    let off = false;
    rest('products?select=*&order=position.asc&limit=200')
      .then((rows) => {
        if (off || !Array.isArray(rows)) return;
        const list = rows.map(normalizeProduct).filter(Boolean);
        if (list.length) setProducts(list);
      })
      .catch(() => {});
    return () => { off = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* stockage indisponible : le panier reste en mémoire pour la visite */
    }
  }, [lines, ready]);

  const add = useCallback((id, qty = 1, openDrawer = true) => {
    setLines((cur) => {
      const found = cur.find((l) => l.id === id);
      if (found) return cur.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      return [...cur, { id, qty: Math.min(MAX_QTY, qty) }];
    });
    if (openDrawer) setOpen(true);
  }, []);
  const setQty = useCallback((id, qty) => {
    setLines((cur) => (qty < 1 ? cur.filter((l) => l.id !== id) : cur.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))));
  }, []);
  const remove = useCallback((id) => setLines((cur) => cur.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const items = useMemo(
    () => lines.map((l) => ({ product: products.find((p) => p.id === l.id), qty: l.qty })).filter((l) => l.product && isBuyable(l.product)),
    [lines, products]
  );
  const count = items.reduce((s, l) => s + l.qty, 0);
  const total = items.reduce((s, l) => s + l.product.price * l.qty, 0);

  const value = { products, items, count, total, open, setOpen, add, setQty, remove, clear };
  return (
    <ShopContext.Provider value={value}>
      {children}
      <CartDrawer />
    </ShopContext.Provider>
  );
}
