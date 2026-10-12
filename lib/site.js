// Informations par défaut du site. Elles sont modifiables dans l'administration
// (« Informations ») : ce qui est enregistré là-bas remplace ces valeurs.
// Numéro WhatsApp : chiffres uniquement, indicatif inclus, sans « + » ni espaces.

export const defaultSite = {
  name: 'Nature et Vie',
  legalName: 'Nature et Vie Group',
  signature: 'Dieu est le CEO.',
  tagline: 'Vivre mieux, naturellement.',
  rccm: 'CI-ABJ-03-2025-B13-04091',
  year: 2026,

  address: 'Angré, base CEI',
  city: 'Abidjan',
  country: "Côte d'Ivoire",
  hours: '',

  whatsappNumber: '2250787592474',
  whatsappDisplay: '+225 07 87 59 24 74',
  email: '',
  meetUrl: '',

  social: { facebook: '', tiktok: '', instagram: '', youtube: '' },

  disclaimer: 'Nos produits sont des compléments alimentaires et ne remplacent pas un avis médical.',
};

export const nav = [
  { href: '/la-maison/', label: 'La Maison' },
  { href: '/mission/', label: 'Mission' },
  { href: '/nos-gammes/', label: 'Nos gammes' },
  { href: '/contact/', label: 'Contact' },
];

export const hasWhatsapp = (site) => (site.whatsappNumber || '').trim() !== '';

// Lien WhatsApp avec message prérempli. Tant que le numéro est vide : page Contact.
export function whatsappLink(site, message = '') {
  if (!hasWhatsapp(site)) return '/contact/';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${site.whatsappNumber}${text}`;
}

// Lien externe d'un réseau social, ou page Contact tant qu'il n'est pas renseigné.
export const socialLink = (site, key) => site.social?.[key] || '/contact/';
