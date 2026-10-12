// Paiement en ligne — PRÉPARÉ, pas encore actif.
//
// Tant que ONLINE_PAYMENT_ENABLED vaut false, le bouton « Passer au paiement » du panier
// reste invisible et la commande se fait par WhatsApp.
//
// À l'étape suivante (compte agrégateur ouvert + Supabase configuré), startCheckout :
//   1. envoie le panier (identifiants + quantités, JAMAIS les prix) à une fonction Supabase ;
//   2. cette fonction recalcule le total depuis la base, garde la clé secrète de l'agrégateur,
//      crée la commande et renvoie l'adresse de la page de paiement ;
//   3. le navigateur y est redirigé ; la confirmation arrive par notification (webhook) côté serveur.

export const ONLINE_PAYMENT_ENABLED = false;

export async function startCheckout(/* lines */) {
  throw new Error("Le paiement en ligne n'est pas encore activé.");
}
