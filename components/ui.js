import Link from 'next/link';
import Header from './Header';

// Décalage d'apparition progressif pour une liste (0 = aucun, puis 1 à 5).
export const stagger = (i) => (i > 0 ? ` nv-o${Math.min(i, 5)}` : '');

// Bandeau de page : forêt + dégradé vert sombre, en-tête, libellé, titre, texte.
export function PageHero({ active, label, title, text, image = '/assets/foret.jpg', imageAlt = '', position = 'center 50%', minHeight = 520, children }) {
  return (
    <section className="hero" style={{ minHeight }}>
      <img className="hero-bg nv-hero-img" src={image} alt={imageAlt} style={{ objectPosition: position }} />
      <div className="hero-shade" />
      <Header active={active} />
      <div className="hero-body">
        <span className="eyebrow eyebrow--light nv-in nv-i1">{label}</span>
        <h1 className="nv-in nv-i2">{title}</h1>
        {text && <p className="hero-text nv-in nv-i3">{text}</p>}
        {children && <div className="nv-in nv-i4" style={{ marginTop: 10 }}>{children}</div>}
      </div>
    </section>
  );
}

export function SectionTitle({ label, title }) {
  if (!label && !title) return null;
  return (
    <div className="section-title">
      {label && <span className="eyebrow nv-r">{label}</span>}
      {title && <h2 className="h2 nv-r">{title}</h2>}
    </div>
  );
}

// variant : 'light' (sur fond sombre) | 'dark' (sur fond clair) | 'solid'
export function Button({ href, variant = 'light', className = '', children, ...rest }) {
  const cls = `btn${variant === 'dark' ? ' btn--dark' : ''}${variant === 'solid' ? ' btn--solid' : ''}${className ? ` ${className}` : ''}`;
  if (/^https?:/.test(href)) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  if (!href.startsWith('/')) {
    return (
      <a className={cls} href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link className={cls} href={href} {...rest}>
      {children}
    </Link>
  );
}

// Image dans un cadre qui se dévoile au défilement ; `zoom` ajoute un léger zoom au survol.
export function Frame({ src, alt = '', ratio, position = 'center', zoom = false, className = '' }) {
  return (
    <div className={`frame nv-u ${className}`} style={{ aspectRatio: ratio }}>
      <img className={zoom ? 'zoom' : undefined} src={src} alt={alt} style={{ objectPosition: position }} loading="lazy" />
    </div>
  );
}

// Emplacement photo : cadre crème avec légende tant que la vraie photo manque.
export function Photo({ src, alt = '', caption, ratio = '4 / 5', wide = false, style }) {
  return (
    <div
      className={`photo${wide ? ' photo--wide' : ''}${src ? ' photo--img' : ''}`}
      style={{ aspectRatio: ratio, ...style }}
      role={src ? undefined : 'img'}
      aria-label={src ? undefined : caption}
    >
      {src ? <img src={src} alt={alt} loading="lazy" /> : caption}
    </div>
  );
}

export function ProductCard({ produit, delay = 0 }) {
  return (
    <div className={`product nv-r${stagger(delay)}`}>
      <Photo src={produit.photo} alt={produit.nom} caption="[PHOTO PRODUIT]" />
      <h3>{produit.nom}</h3>
      <p className="comp">{produit.composition}</p>
      <p className="price">{produit.prix} FCFA</p>
    </div>
  );
}

// Icônes au trait, décoratives.
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};
export const IconLeaf = ({ size = 30, color = '#8A6A22' }) => (
  <svg width={size} height={size} {...iconProps} style={{ color }}>
    <path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z" />
    <path d="M5 19l8-8" />
  </svg>
);
export const IconHeart = ({ size = 30, color = '#8A6A22' }) => (
  <svg width={size} height={size} {...iconProps} style={{ color }}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </svg>
);
export const IconCross = ({ size = 30, color = '#8A6A22' }) => (
  <svg width={size} height={size} {...iconProps} style={{ color }}>
    <path d="M12 3v18M7 8h10" />
  </svg>
);
export const IconBook = ({ size = 34, color = '#C9A55A' }) => (
  <svg width={size} height={size} {...iconProps} style={{ color }}>
    <path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" />
    <path d="M12 6v13.5" />
  </svg>
);
