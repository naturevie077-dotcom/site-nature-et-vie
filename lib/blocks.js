// Définition des blocs modifiables. Cette description sert à la fois :
//  - à générer les formulaires de l'administration,
//  - à nettoyer chaque bloc avant affichage ou enregistrement (sanitizeBlocks).
// Pour ajouter un type de bloc : le décrire ici, puis l'afficher dans components/blocks/index.js.

import { oneOf, safeColor, safeMedia, safeUrl, text } from './safe';

const THEMES = [['light', 'Ivoire'], ['cream', 'Crème'], ['dark', 'Vert sombre']];
const POSITIONS = [
  ['center 15%', 'Haut'],
  ['center 30%', 'Plutôt haut'],
  ['center 50%', 'Centre'],
  ['center 70%', 'Plutôt bas'],
  ['center 85%', 'Bas'],
];
export const ICONS = [['none', 'Aucune'], ['leaf', 'Feuille'], ['heart', 'Cœur'], ['cross', 'Croix'], ['book', 'Livre']];

const t = (key, label, extra = {}) => ({ key, label, type: 'text', ...extra });
const ta = (key, label, extra = {}) => ({ key, label, type: 'textarea', ...extra });
const img = (key, label) => ({ key, label, type: 'image' });
const url = (key, label, hint) => ({ key, label, type: 'url', hint });
const sel = (key, label, options) => ({ key, label, type: 'select', options });
const bool = (key, label) => ({ key, label, type: 'bool' });
const list = (key, label, itemFields, itemLabel, max = 24) => ({ key, label, type: 'list', itemFields, itemLabel, max });

const BUTTON_HINT = 'Adresse (https://…), page du site (/contact/) ou « whatsapp:Votre message » pour ouvrir WhatsApp.';
const button = () => [t('buttonLabel', 'Texte du bouton'), url('buttonHref', 'Lien du bouton', BUTTON_HINT)];
const common = () => [bool('tightTop', 'Rapprocher de la section précédente')];

export const BLOCKS = {
  hero: {
    label: "Bandeau d'ouverture",
    fields: [
      sel('kind', 'Type', [['page', 'Bandeau de page'], ['home', "Ouverture plein écran (accueil)"]]),
      img('image', 'Image de fond'),
      t('imageAlt', "Description de l'image (accessibilité)"),
      sel('imagePosition', "Cadrage de l'image", POSITIONS),
      sel('height', 'Hauteur (bandeau de page)', [['520', 'Normale'], ['440', 'Compacte'], ['560', 'Haute']]),
      t('label', 'Petit libellé'),
      t('title', 'Titre'),
      t('text', 'Sous-titre'),
      ...button(),
    ],
    defaults: { kind: 'page', image: '/assets/foret.jpg', imageAlt: '', imagePosition: 'center 50%', height: '520', label: '', title: 'Nouveau titre', text: '', buttonLabel: '', buttonHref: '' },
  },

  split: {
    label: 'Texte et image',
    fields: [
      sel('theme', 'Fond', THEMES),
      t('label', 'Petit libellé'),
      t('title', 'Titre'),
      ta('paragraphs', 'Paragraphes (une ligne vide entre chaque paragraphe)', { rows: 8 }),
      sel('paragraphStyle', 'Style des paragraphes', [['plain', 'Normal'], ['bordered', 'Avec filet doré']]),
      t('signature', 'Signature (en italique doré)'),
      img('image', 'Image (laisser vide pour une section sans image)'),
      t('imageAlt', "Description de l'image (accessibilité)"),
      sel('imageSide', "Position de l'image", [['left', 'À gauche'], ['right', 'À droite']]),
      sel('frame', "Cadre de l'image", [['gold', 'Cadre doré décalé'], ['plain', 'Simple']]),
      sel('ratio', "Format de l'image", [['1 / 1', 'Carré'], ['4 / 5', 'Portrait'], ['5 / 4', 'Paysage'], ['4 / 3', 'Paysage large']]),
      sel('imagePosition', "Cadrage de l'image", [['center 15%', 'Haut'], ['center 30%', 'Plutôt haut'], ['center 50%', 'Centre'], ['center 70%', 'Plutôt bas']]),
      list('facts', 'Points clés (sous le texte)', [t('title', 'Titre'), t('text', 'Texte')], 'title', 6),
      ...button(),
      ...common(),
    ],
    defaults: { theme: 'light', label: '', title: 'Nouveau titre', paragraphs: 'Votre texte ici.', paragraphStyle: 'plain', signature: '', image: '', imageAlt: '', imageSide: 'left', frame: 'plain', ratio: '4 / 5', imagePosition: 'center 50%', facts: [], buttonLabel: '', buttonHref: '', tightTop: false },
  },

  grid: {
    label: 'Grille (cartes, colonnes, liste)',
    fields: [
      sel('theme', 'Fond', THEMES),
      sel('style', 'Présentation', [
        ['pillars', 'Piliers avec icônes'],
        ['tiles', 'Cases sur fond sombre'],
        ['values', 'Liste numérotée'],
        ['topline', 'Colonnes avec filet doré'],
        ['steps', 'Grands chiffres'],
        ['cards', 'Cartes photo'],
      ]),
      t('label', 'Petit libellé'),
      t('title', 'Titre'),
      t('intro', "Phrase d'introduction"),
      list('items', 'Éléments', [
        sel('icon', 'Icône', ICONS),
        t('number', 'Numéro ou chiffre (I, 01…)'),
        t('title', 'Titre'),
        ta('text', 'Texte', { rows: 3 }),
        img('image', 'Image (cartes photo)'),
        t('imageAlt', "Description de l'image"),
        url('href', 'Lien (cartes photo)'),
      ], 'title', 12),
      ...button(),
      ...common(),
    ],
    defaults: { theme: 'light', style: 'topline', label: '', title: 'Nouveau titre', intro: '', items: [{ icon: 'none', number: '', title: 'Titre', text: 'Texte', image: '', imageAlt: '', href: '' }], buttonLabel: '', buttonHref: '', tightTop: false },
  },

  text: {
    label: 'Texte centré',
    fields: [
      sel('theme', 'Fond', THEMES),
      t('label', 'Petit libellé'),
      t('title', 'Titre'),
      sel('size', 'Taille du titre', [['normal', 'Normale'], ['large', 'Très grande']]),
      ta('paragraphs', 'Paragraphes (une ligne vide entre chaque paragraphe)', { rows: 8 }),
      bool('rule', 'Filet doré sous le texte'),
      ...button(),
      ...common(),
    ],
    defaults: { theme: 'light', label: '', title: 'Nouveau titre', size: 'normal', paragraphs: 'Votre texte ici.', rule: false, buttonLabel: '', buttonHref: '', tightTop: false },
  },

  quote: {
    label: 'Citation',
    fields: [sel('theme', 'Fond', THEMES), ta('text', 'Citation', { rows: 3 }), t('reference', 'Référence'), ...button(), ...common()],
    defaults: { theme: 'cream', text: 'Votre citation.', reference: '', buttonLabel: '', buttonHref: '', tightTop: false },
  },

  tags: {
    label: 'Liste de mots (zones, pays…)',
    fields: [
      sel('theme', 'Fond', THEMES), t('label', 'Petit libellé'), t('title', 'Titre'), ta('text', 'Texte', { rows: 3 }),
      list('items', 'Mots', [t('text', 'Mot')], 'text', 30), ...common(),
    ],
    defaults: { theme: 'cream', label: '', title: 'Nouveau titre', text: '', items: [{ text: 'Mot' }], tightTop: false },
  },

  cta: {
    label: "Bandeau d'appel",
    fields: [sel('theme', 'Fond', THEMES), t('title', 'Titre'), ta('text', 'Texte', { rows: 3 }), ...button(), ...common()],
    defaults: { theme: 'dark', title: 'Besoin de conseils ?', text: '', buttonLabel: 'Parler à un conseiller', buttonHref: '/contact/', tightTop: false },
  },

  ads: {
    label: 'Publicités et affiches',
    fields: [
      sel('theme', 'Fond', THEMES), t('label', 'Petit libellé'), t('title', 'Titre'),
      sel('layout', 'Présentation', [['grid', 'Grille'], ['banner', 'Bandeau pleine largeur']]),
      ...common(),
    ],
    defaults: { theme: 'cream', label: 'À la une', title: 'Nos actualités', layout: 'grid', tightTop: false },
    note: "Les affiches se gèrent dans « Publicités ». Cette section reste invisible tant qu'aucune publicité n'est active.",
  },

  video: {
    label: 'Vidéo',
    fields: [
      sel('theme', 'Fond', THEMES), t('label', 'Petit libellé'), t('title', 'Titre'),
      { key: 'videoUrl', label: 'Vidéo (MP4 ou WebM)', type: 'video' },
      img('poster', "Image d'aperçu"), t('caption', 'Légende'), ...common(),
    ],
    defaults: { theme: 'light', label: '', title: 'Notre vidéo', videoUrl: '', poster: '', caption: '', tightTop: false },
  },

  chapter: {
    label: 'Chapitre de gamme (produits)',
    fields: [
      t('anchor', "Ancre du lien (lettres minuscules et tirets, ex. tisanes)"),
      t('chapter', 'Libellé du chapitre (ex. Chapitre II)'),
      t('title', 'Titre'),
      ta('intro', 'Introduction', { rows: 3 }),
      bool('featured', 'Afficher un produit phare'),
      t('featuredSlug', "Produit phare : fiche de la boutique (ex. lion-power). Si renseigné, nom, photo, composition et prix sont repris de la boutique."),
      t('featuredName', 'Produit phare : nom'),
      img('featuredPhoto', 'Produit phare : photo (vide = logo)'),
      bool('featuredPackshot', 'Produit phare : photo sur fond blanc (emballage)'),
      list('featuredComposition', 'Produit phare : composition', [t('title', 'Intitulé'), ta('text', 'Ingrédients', { rows: 3 })], 'title', 4),
      t('featuredPrice', 'Produit phare : prix (ex. 35 000 FCFA)'),
      t('featuredUnit', 'Produit phare : unité (ex. la boîte)'),
      list('items', 'Produits de la gamme', [t('nom', 'Nom'), ta('composition', 'Composition', { rows: 3 }), t('prix', 'Prix (en FCFA)'), img('photo', 'Photo')], 'nom', 60),
      ta('selection', 'Phrase « Recevoir la sélection » (affichée si aucun produit)', { rows: 3 }),
      img('selectionPhoto', 'Photo de la sélection'),
      t('selectionAlt', 'Description de la photo'),
      sel('selectionPosition', 'Cadrage de la photo', [['50% 50%', 'Centre'], ['45% 50%', 'Un peu à gauche'], ['62% 50%', 'Un peu à droite'], ['50% 25%', 'Haut'], ['50% 75%', 'Bas']]),
      t('selectionMessage', 'Message WhatsApp du bouton'),
      bool('flip', 'Photo à droite'),
    ],
    defaults: { anchor: '', chapter: 'Chapitre', title: 'Nouvelle gamme', intro: '', featured: false, featuredSlug: '', featuredName: '', featuredPhoto: '', featuredPackshot: false, featuredComposition: [], featuredPrice: '', featuredUnit: '', items: [], selection: '', selectionPhoto: '', selectionAlt: '', selectionPosition: '50% 50%', selectionMessage: '', flip: false },
  },

  contact: {
    label: 'Coordonnées et formulaire de contact',
    fields: [ta('lead', "Phrase d'introduction", { rows: 3 })],
    defaults: { lead: "Chaque échange commence par l'écoute. Dites-nous ce que vous recherchez, un conseiller vous répond avec clarté." },
    note: 'Les coordonnées affichées se modifient dans « Informations ».',
  },
};

export const BLOCK_TYPES = Object.keys(BLOCKS);

const newId = () => Math.random().toString(36).slice(2, 10);
export const newBlock = (type) => ({ id: newId(), type, ...structuredClone(BLOCKS[type].defaults) });

function cleanValue(field, value) {
  switch (field.type) {
    case 'text': return text(value, 300);
    case 'textarea': return text(value, 6000);
    case 'url': return safeUrl(value);
    case 'image':
    case 'video': return safeMedia(value);
    case 'bool': return value === true;
    case 'select': return oneOf(value, field.options.map((o) => o[0]), field.options[0][0]);
    case 'color': return safeColor(value, '#000000');
    case 'list':
      return Array.isArray(value)
        ? value.slice(0, field.max || 24).map((it) => cleanObject(field.itemFields, it))
        : [];
    default: return '';
  }
}

function cleanObject(fields, obj) {
  const src = obj && typeof obj === 'object' ? obj : {};
  const out = {};
  for (const f of fields) out[f.key] = cleanValue(f, src[f.key]);
  return out;
}

// Nettoie un tableau de blocs : types inconnus supprimés, champs inconnus supprimés,
// adresses et choix validés. Utilisé avant affichage ET avant enregistrement.
export function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .slice(0, 60)
    .filter((b) => b && typeof b === 'object' && BLOCKS[b.type])
    .map((b) => ({
      id: /^[a-z0-9]{4,16}$/.test(b.id || '') ? b.id : newId(),
      type: b.type,
      ...cleanObject(BLOCKS[b.type].fields, b),
    }));
}

// Réglages du site et du thème
export const THEME_FIELDS = [
  ['ivory', 'Fond principal (ivoire)'],
  ['cream', 'Fond secondaire (crème)'],
  ['greenDeep', 'Vert sombre (sections)'],
  ['green', 'Vert (titres, boutons)'],
  ['greenDarkest', 'Vert très foncé (pied de page)'],
  ['gold', 'Or (filets, accents)'],
  ['goldLight', 'Or clair (sur fond sombre)'],
  ['goldDark', 'Or foncé (petits textes)'],
  ['text', 'Texte courant'],
  ['textSoft', 'Texte secondaire'],
  ['border', 'Bordures'],
];
export const THEME_DEFAULTS = {
  ivory: '#FAF6EC', cream: '#F1EADA', greenDeep: '#0B3D2E', green: '#0E4D3A', greenDarkest: '#072A20',
  gold: '#C9A55A', goldLight: '#E2C98B', goldDark: '#8A6A22', text: '#1E2A24', textSoft: '#4A5650', border: '#D9CBA6',
};
export const cleanTheme = (v) => {
  const src = v && typeof v === 'object' ? v : {};
  const out = {};
  for (const [k] of THEME_FIELDS) out[k] = safeColor(src[k], THEME_DEFAULTS[k]);
  return out;
};

export const SITE_FIELDS = [
  t('whatsappNumber', 'Numéro WhatsApp (chiffres seulement, avec indicatif, ex. 2250787592474)'),
  t('whatsappDisplay', 'Numéro WhatsApp affiché (ex. +225 07 87 59 24 74)'),
  t('email', 'E-mail professionnel (affiché s\'il est renseigné)'),
  t('address', 'Adresse'),
  t('city', 'Ville'),
  t('country', 'Pays'),
  t('hours', "Horaires d'ouverture (affichés s'ils sont renseignés)"),
  url('meetUrl', 'Lien de rendez-vous Google Meet'),
  url('facebook', 'Facebook'),
  url('tiktok', 'TikTok'),
  url('instagram', 'Instagram'),
  url('youtube', 'YouTube'),
  t('tagline', 'Phrase du pied de page'),
];
const SOCIAL_KEYS = ['facebook', 'tiktok', 'instagram', 'youtube'];

// Les réglages sont stockés « à plat » en base (facebook, tiktok… au premier niveau).
// Cette fonction les fusionne avec les valeurs par défaut du site, après nettoyage.
export const cleanSite = (v, defaults) => {
  const src = v && typeof v === 'object' ? v : {};
  const out = { ...defaults, social: { ...defaults.social } };
  for (const f of SITE_FIELDS) {
    if (!(f.key in src)) continue;
    if (SOCIAL_KEYS.includes(f.key)) out.social[f.key] = safeUrl(src[f.key]);
    else out[f.key] = cleanValue(f, src[f.key]);
  }
  out.whatsappNumber = out.whatsappNumber.replace(/\D/g, '');
  return out;
};

// Passage de l'objet site (social imbriqué) au format plat stocké en base / édité dans l'admin.
export const flattenSite = (site) => ({ ...site, ...site.social, social: undefined });
