// Nettoyage de toutes les valeurs venant de la base ou de l'administration.
// Principe : rien de ce qui est stocké n'est jamais injecté comme HTML ;
// les adresses et les couleurs sont validées avant d'être utilisées.

export const text = (v, max = 4000) => (typeof v === 'string' ? v.replace(/\u0000/g, '').slice(0, max) : '');

// Adresse autorisée : chemin interne, ancre, https, mailto, tel, ou raccourci « whatsapp:message ».
export function safeUrl(v) {
  const s = text(v, 600).trim();
  if (!s) return '';
  if (s.startsWith('//')) return '';
  if (s.startsWith('/') || s.startsWith('#')) return s;
  if (/^whatsapp:/i.test(s)) return s;
  if (/^(mailto|tel):/i.test(s)) return s;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch {
    return '';
  }
}

// Même règle, sans les raccourcis (pour les médias).
export function safeMedia(v) {
  const s = safeUrl(v);
  return /^(whatsapp|mailto|tel):/i.test(s) ? '' : s;
}

export const safeColor = (v, fallback) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback);

export const oneOf = (v, options, fallback) => (options.includes(v) ? v : fallback);

// Résout une adresse de bouton selon les informations du site.
export function resolveHref(href, site) {
  const s = safeUrl(href);
  if (!s) return '';
  if (/^whatsapp:/i.test(s)) {
    const number = (site?.whatsappNumber || '').replace(/\D/g, '');
    if (!number) return '/contact/';
    const msg = s.slice('whatsapp:'.length).trim();
    return `https://wa.me/${number}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
  }
  return s;
}
