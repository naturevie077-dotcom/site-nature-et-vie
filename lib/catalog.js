// Catalogue de la boutique.
//
// Aujourd'hui : produits écrits ci-dessous (site statique, sans base de données).
// Demain : dès que Supabase est configuré et que la table `products` existe
// (supabase/shop.sql), les produits sont lus depuis la base et remplacent cette liste.
// Les pages de la boutique ne changent pas : elles ne connaissent que ce format.
//
// Format d'un produit :
//   id, slug        identifiant et fin d'adresse (lettres minuscules, chiffres, tirets)
//   name            nom du produit
//   category        gamme (sert aux filtres)
//   tagline         une phrase sous le nom
//   details         3 à 5 courtes lignes affichées discrètement sur la carte
//   description     paragraphe de la fiche produit
//   composition     [{ title, text }] composition détaillée
//   usage           mode d'emploi (une phrase)
//   cautions        précautions d'emploi (liste de phrases)
//   gallery         photos supplémentaires de la fiche (la première = image)
//   packshot        true si la photo est sur fond blanc (le blanc se fond dans la page)
//   origin          origine de fabrication
//   price           prix en FCFA (nombre entier) — null tant qu'il n'est pas fixé
//   unit            « la boîte », « le sachet »…
//   image           adresse de la photo ('' = logo sur fond ivoire)
//   status          'available' (achetable) | 'soon' (bientôt) | 'hidden' (masqué)
//
// Règles de contenu : aucune promesse de guérison, aucune liste de maladies,
// rien d'inventé (chiffres, prix, vertus). Ce qui manque reste vide.

import { oneOf, safeMedia, text } from './safe';

const RAW_PRODUCTS = [
  {
    id: 'sg9-plus-advanced',
    slug: 'sg9-plus-advanced',
    name: 'SG9 Plus Advanced',
    category: 'Compléments alimentaires',
    tagline: 'Mélange de baies et de cassis, 7 cellules souches végétales',
    details: [
      'Extraits de cellules souches végétales de sureau, framboise, mûre, myrtille, fraise, pomme et raisin',
      'Enrichi de feuille de sanna, sacha inchi et gingembre',
      'Fabrication en Malaisie et en France',
      'Boîte de 15 sachets de 3 g',
    ],
    description:
      "SG9 Plus Advanced réunit des extraits de cellules souches végétales et une sélection d'ingrédients naturels. Sa composition complète et son origine de fabrication sont indiquées sur cette fiche.",
    composition: [
      { title: 'Extraits de cellules souches végétales', text: 'sureau, framboise, mûre, myrtille, fraise, pomme, raisin.' },
      { title: 'Autres ingrédients', text: 'feuille de sanna, sacha inchi, fruit kulim, gac fruit, champignon au lait de tigre, moustache de chat, pecah beling, cardamome, gingembre, cassis, maïs, maltodextrine.' },
    ],
    usage: '',
    cautions: [],
    origin: 'Fabrication en Malaisie et en France',
    price: 35000,
    unit: 'la boîte de 15 sachets',
    image: '/assets/sg9-plus-advanced.jpg',
    gallery: ['/assets/sg9-plus-advanced.jpg'],
    packshot: true,
    status: 'available',
  },
  {
    id: 'lion-power',
    slug: 'lion-power',
    name: 'Lion Power',
    category: 'Tisanes',
    tagline: 'La tisane du guerrier',
    details: [
      'Vitalité, force, stamina et endurance au quotidien',
      'Dix plantes : ginseng, maca, muira puama, tongkat ali, fenugrec, damiana, tribulus, épimédium, mûrier, goji',
      '20 sachets individuels de 2 g, soit 40 g',
      '1 sachet dans 200 à 250 ml d’eau chaude, 5 à 8 minutes d’infusion',
      'Sans sucre, sans additif artificiel',
    ],
    description:
      "Il y a des nuits où la ville dort mais où quelque chose en vous reste éveillé. Une tension, une envie, un feu qui refuse de s'éteindre : on l'appelle la force du lion. Elle sommeille en chaque homme, parfois écrasée par la fatigue, le stress, les années qui filent trop vite.\n\n" +
      "Lion Power réunit dix plantes en un seul sachet pour contrer la fatigue, soutenir la vitalité, la force, le stamina et l'endurance, et soutenir la libido. Le ginseng remonte comme une décharge d'énergie pure. La maca, venue des hauteurs des Andes, muscle l'endurance. Le tongkat ali et l'épimédium sont des plantes que les guerriers d'autrefois gardaient comme des secrets de famille. Le tribulus attise le désir, la damiana libère les sens, et le goji blinde votre immunité comme une armure invisible.\n\n" +
      "Un sachet, de l'eau frémissante, cinq minutes de silence : le liquide ambré fume dans votre tasse, les arômes chauds et terreux du ginseng se mêlent à la douceur sucrée du goji. Un rituel simple, qui s'intègre à une routine sportive, professionnelle ou de récupération. Elle s'adresse aux hommes de 25 à 55 ans en quête d'un coup de boost naturel.\n\n" +
      "Dix plantes, une seule mission : vous rendre à vous-même. 100 % naturel, zéro sucre, zéro additif artificiel. Nature et Vie : on ne vous promet pas, on vous le prouve.",
    composition: [
      { title: 'Plantes', text: 'racine de ginseng (Panax), racine de maca, écorce de muira puama, racine de tongkat ali, graine de fenugrec, feuille de damiana, tribulus terrestris, feuille d’épimédium, feuille de mûrier, baie de goji.' },
    ],
    usage: 'Verser 200 à 250 ml d’eau chaude sur 1 sachet, laisser infuser 5 à 8 minutes. À déguster 1 à 2 tasses par jour.',
    cautions: [
      'Ne convient pas aux personnes de moins de 18 ans.',
      'Demandez conseil à votre professionnel de santé en cas de condition médicale ou de traitement en cours.',
      'Ne pas utiliser en cas de grossesse ou d’allaitement.',
      'Tenir hors de portée des enfants. À conserver au sec et au frais.',
    ],
    origin: 'Nature et Vie',
    price: 8000,
    unit: 'les 20 sachets',
    image: '/assets/lion-power-face.jpg',
    gallery: ['/assets/lion-power-face.jpg', '/assets/lion-power-dos.jpg'],
    packshot: true,
    status: 'available',
  },
  { id: 'soon-cafes', slug: 'cafes-nutritifs', name: 'Cafés nutritifs', category: 'Cafés nutritifs', tagline: 'Prochainement', details: [], description: '', composition: [], origin: '', price: null, unit: '', image: '/assets/gamme-cafes.jpg', status: 'soon' },
  { id: 'soon-innovantes', slug: 'solutions-innovantes', name: 'Solutions innovantes', category: 'Solutions innovantes', tagline: 'Prochainement', details: [], description: '', composition: [], origin: '', price: null, unit: '', image: '/assets/gamme-innovantes.jpg', status: 'soon' },
];

// Nettoie un produit venant de la base (ou de l'administration).
export function normalizeProduct(raw) {
  const p = raw && typeof raw === 'object' ? raw : {};
  const slug = /^[a-z0-9-]{1,60}$/.test(p.slug || '') ? p.slug : '';
  if (!slug) return null;
  const price = Number.isFinite(Number(p.price)) && Number(p.price) > 0 ? Math.round(Number(p.price)) : null;
  return {
    id: text(String(p.id ?? slug), 60),
    slug,
    name: text(p.name, 120),
    category: text(p.category, 60),
    tagline: text(p.tagline, 160),
    details: (Array.isArray(p.details) ? p.details : []).slice(0, 5).map((d) => text(d, 200)).filter(Boolean),
    description: text(p.description, 3000),
    composition: (Array.isArray(p.composition) ? p.composition : []).slice(0, 8).map((c) => ({ title: text(c?.title, 120), text: text(c?.text, 800) })),
    usage: text(p.usage, 600),
    cautions: (Array.isArray(p.cautions) ? p.cautions : []).slice(0, 8).map((c) => text(c, 240)).filter(Boolean),
    origin: text(p.origin, 160),
    price,
    unit: text(p.unit, 40),
    image: safeMedia(p.image ?? p.image_url),
    gallery: (Array.isArray(p.gallery) ? p.gallery : []).slice(0, 6).map(safeMedia).filter(Boolean),
    packshot: p.packshot === true,
    status: oneOf(p.status, ['available', 'soon', 'hidden'], 'soon'),
  };
}

// Produits du fichier, passés par le même nettoyage que ceux de la base.
export const staticProducts = RAW_PRODUCTS.map(normalizeProduct).filter(Boolean);

export const isBuyable = (p) => p.status === 'available' && p.price != null;
// Disponible mais prix communiqué par un conseiller (tant que le prix n'est pas renseigné).
export const isPriceOnRequest = (p) => p.status === 'available' && p.price == null;

// 35000 -> « 35 000 » (espace insécable pour éviter les retours à la ligne)
export const formatPrice = (n) => new Intl.NumberFormat('fr-FR').format(n).replace(/[  ]/g, ' ');

export const productUrl = (p) => `/boutique/produit/?p=${encodeURIComponent(p.slug)}`;

// Message WhatsApp pour un produit ou pour tout le panier.
export function orderMessage(lines) {
  if (!lines.length) return 'Bonjour Nature et Vie, je souhaite des renseignements sur vos produits.';
  if (lines.length === 1 && lines[0].product.price == null) {
    return `Bonjour Nature et Vie, je souhaite connaître la disponibilité, le prix et la livraison de : ${lines[0].product.name}.`;
  }
  if (lines.length === 1 && lines[0].qty === 1) {
    const { product } = lines[0];
    return `Bonjour Nature et Vie, je souhaite commander : ${product.name}${product.price ? ` (${formatPrice(product.price)} FCFA)` : ''}. Pouvez-vous me confirmer la disponibilité et la livraison ?`;
  }
  const rows = lines.map(({ product, qty }) => `- ${qty} × ${product.name}${product.price ? ` (${formatPrice(product.price)} FCFA)` : ''}`);
  const total = lines.reduce((s, { product, qty }) => s + (product.price || 0) * qty, 0);
  return ['Bonjour Nature et Vie, je souhaite commander :', ...rows, total ? `Total : ${formatPrice(total)} FCFA` : '', 'Pouvez-vous me confirmer la disponibilité et la livraison ?']
    .filter(Boolean)
    .join('\n');
}
