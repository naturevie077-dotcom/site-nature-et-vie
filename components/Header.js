'use client';

import Link from 'next/link';
import { useState } from 'react';
import { nav } from '@/lib/site';
import CartButton from './shop/CartButton';

// En-tête sur fond sombre. `active` = route de la page courante (soulignée en or).
export default function Header({ active, overlay = false }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`site-header nv-head${overlay ? ' site-header--overlay' : ''}`}>
      <Link href="/" className="logo" onClick={() => setOpen(false)}>
        <img src="/assets/logo-clair.png" alt="Nature et Vie" />
      </Link>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="menu-principal"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Fermer' : 'Menu'}
      </button>
      <nav id="menu-principal" aria-label="Navigation principale" className={`site-nav${open ? ' is-open' : ''}`}>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active === item.href ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/boutique/"
          className="nav-shop"
          aria-current={active === '/boutique/' ? 'page' : undefined}
          onClick={() => setOpen(false)}
        >
          Boutique
        </Link>
      </nav>
      <CartButton />
    </header>
  );
}
