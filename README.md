# Site vitrine Nature et Vie

Site vitrine (Next.js, export statique) avec une **administration sécurisée** (Supabase) pour modifier les contenus sans toucher au code.

Pages : Accueil `/`, La Maison `/la-maison/`, Mission `/mission/`, Nos gammes `/nos-gammes/`, Contact `/contact/`, Boutique `/boutique/` (à venir), Administration `/admin/`.

## 1. Lancer le site en local

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent.

```bash
npm install          # une seule fois
npm run dev          # puis ouvrir http://localhost:3001
```

Sous PowerShell, si `npm` est bloqué : utilisez `npm.cmd run dev`.
Ne lancez pas `npm run build` pendant que `npm run dev` tourne (cela abîme le cache `.next` ; en cas d'erreur « Cannot find module », arrêtez le serveur, supprimez le dossier `.next`, relancez).

## 2. L'administration

Guide complet d'installation (Supabase, sécurité, première connexion) : **[ADMIN.md](ADMIN.md)**.

Résumé : l'administration est à `/admin/`. Elle permet de modifier les pages (blocs : textes, images, vidéos, ordre des sections), les publicités de l'accueil, les couleurs, les informations de la maison (WhatsApp, adresse, réseaux) et les produits des gammes. La connexion exige un mot de passe **et** un code à 6 chiffres.

Tant que Supabase n'est pas configuré (`.env.local` absent), le site fonctionne avec son contenu d'origine, défini dans `lib/defaultPages.js` et `lib/site.js`.

## 2 bis. La boutique

- **Catalogue** : `lib/catalog.js` (produits, prix en FCFA, lignes de détail, composition, origine, statut `available` / `soon` / `hidden`). Pour ajouter un produit, copiez un bloc de `staticProducts` et remplissez-le ; sa fiche est créée automatiquement.
- **Photo d'un produit** : champ `image` (par exemple `/assets/sg9.jpg` après dépôt du fichier dans `public/assets/`). Sans photo, le logo s'affiche sur fond ivoire.
- **Panier** : gardé dans le navigateur du visiteur. La commande se fait par **WhatsApp** (message préparé avec les produits et le total).
- **Paiement en ligne** : préparé mais invisible (`lib/checkout.js`, `ONLINE_PAYMENT_ENABLED = false`). Il sera branché avec l'agrégateur et Supabase.
- **Base de données** : `supabase/shop.sql` crée la table `products`. Dès qu'elle contient des produits, le site les lit à la place de `lib/catalog.js`, sans changer les pages.
- **Survol** : un léger soulèvement immédiat, puis un aperçu élargi après environ 2 secondes (ordinateur uniquement). Sur téléphone, un appui ouvre la fiche.

## 3. Où est quoi

```
app/                 pages (une par route), styles globaux, /admin
components/blocks/   affichage des blocs (sections) du site
components/admin/    interface d'administration
lib/blocks.js        description des blocs modifiables + nettoyage des données
lib/defaultPages.js  contenu d'origine des pages
lib/site.js          informations par défaut (WhatsApp, adresse…)
lib/safe.js          validation des liens et couleurs
supabase/schema.sql  base de données et règles de sécurité
public/              images, logos, .htaccess (sécurité et cache)
```

## 4. Construire et déposer sur LWS

```bash
npm run build
```

Le dossier **`out/`** contient le site complet.

1. Connectez-vous à LWS (panneau ou FTP, par exemple avec FileZilla).
2. Ouvrez le dossier `public_html` de votre offre.
3. Déposez **tout le contenu** de `out/` dans `public_html` (pas le dossier `out` lui-même), y compris le fichier caché `.htaccess`.
4. Vérifiez que le certificat SSL (HTTPS) est activé dans le panneau LWS : le `.htaccess` redirige automatiquement HTTP vers HTTPS.

Le fichier `.env.local` (clés Supabase) doit exister **au moment du build** : les valeurs sont intégrées au site construit. Il n'est jamais déposé sur le serveur.

## 5. Images provisoires

Les photos des gammes (`gamme-complements.jpg`, `gamme-tisanes.jpg`, `gamme-cafes.jpg`, `gamme-innovantes.jpg`) et `ingredients.jpg` sont des images libres de droits de [Pexels](https://www.pexels.com), prises comme repères. Remplacez-les depuis l'administration (Médiathèque, puis choisissez l'image dans la section concernée) ou en déposant votre fichier dans `public/assets/` sous le même nom puis en reconstruisant le site.

`direction.jpg` est la photo de la Direction (accueil et page La Maison).

## 6. Animations

Sobres et en CSS pur (`app/globals.css`, section « Animations ») : ouverture douce de l'image, apparition des textes au défilement, remplissage doré des boutons au survol. Elles sont désactivées pour les visiteurs qui ont demandé « réduire les animations » dans leur système.

## 7. Plus tard

- **Cloudflare** : activer Cloudflare devant le domaine accélère l'affichage en Afrique de l'Ouest et ajoute une protection anti-attaques (gratuit). Changer les serveurs DNS du domaine vers Cloudflare, puis activer le cache et le HTTPS « Full ».
- **Boutique** : catalogue, commandes et paiement Mobile Money (kkiapay ou CinetPay) avec confirmation par webhook, gérés depuis l'onglet « Boutique » de l'administration. Cette étape demandera une offre LWS cPanel avec Node.js ou des fonctions Supabase.

## Points à fournir

- Adresse complète et horaires, e-mail professionnel, lien Google Meet, liens des réseaux sociaux (onglet « Informations »).
- Récit de la fondation, photos réelles (Direction, locaux, produits).
- Produits, compositions et prix des gammes (Pages du site › Nos gammes).
- Témoignages : à ajouter seulement avec de vrais avis et l'accord écrit des clients.
