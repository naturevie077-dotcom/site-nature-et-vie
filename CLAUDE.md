# Site vitrine Nature et Vie — Brief de développement

Ce fichier contient toutes les décisions prises pendant la phase de conception.
Lis-le en entier avant d'écrire du code, puis ouvre les maquettes du dossier `maquettes/`.

## 1. Le projet

**Client :** Nature et Vie Group, Abidjan (Angré), Côte d'Ivoire. RCCM CI-ABJ-03-2025-B13-04091.
**Activité :** importation et vente de produits naturels de santé et de bien-être : compléments alimentaires, tisanes, cafés nutritifs, autres solutions naturelles innovantes.
**Identité :** entreprise fondée sur la foi chrétienne. Signature : « Dieu est le CEO ».
**Positionnement :** luxe, premium, excellence. Référence d'esprit : cartier.com (y compris ses pages de collection). On s'inspire de l'esprit, on ne copie jamais leur identité.

**Phase actuelle : la vitrine uniquement (6 pages).** La boutique en ligne avec paiement viendra dans une phase 2.

## 2. Stack technique (décidée)

- **Next.js** (App Router), en JavaScript ou TypeScript.
- **Export statique** : `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }` dans `next.config`. `npm run build` doit produire un dossier `out/` autonome.
- **Hébergement : LWS** (hébergeur français, serveurs en France). Phase 1 : le dossier `out/` est déposé dans `public_html` d'une offre LWS. Phase 2 (boutique) : offre LWS cPanel avec Node.js.
- Prévoir un fichier `public/.htaccess` (Apache) : page 404 personnalisée, cache long pour les images, polices, CSS et JS, redirection HTTP vers HTTPS.
- Pas de base de données en phase 1. Le formulaire de contact ne peut pas envoyer d'e-mail côté serveur : il ouvre WhatsApp avec un message prérempli (lien `https://wa.me/<numéro>?text=...`).
- Activer Cloudflare plus tard pour accélérer l'affichage en Afrique de l'Ouest (à documenter dans le README, pas à coder).

**Phase 2, pour mémoire (ne pas coder maintenant) :** base Supabase (données + images), paiement via un agrégateur Mobile Money (kkiapay ou CinetPay, choix non arrêté) couvrant Wave, Orange Money, MTN, Moov et Visa/Mastercard, avec confirmation par webhook.

## 3. Charte graphique

| Rôle | Couleur |
|---|---|
| Fond principal (ivoire) | `#FAF6EC` |
| Fond secondaire (crème) | `#F1EADA` |
| Vert émeraude foncé (sections sombres) | `#0B3D2E` |
| Vert émeraude (titres, boutons) | `#0E4D3A` |
| Vert très foncé (pied de page) | `#072A20` |
| Or (filets, accents sur fond sombre) | `#C9A55A` |
| Or clair (textes dorés sur fond sombre) | `#E2C98B` |
| Or foncé (petits textes dorés sur fond clair, contraste suffisant) | `#8A6A22` |
| Texte courant | `#1E2A24` |
| Texte secondaire | `#4A5650` |
| Bordures claires | `#D9CBA6` |

Règles : fond ivoire, vert émeraude et or **en touches**. L'or ne devient jamais une couleur dominante. Le rouge n'apparaît que dans le logo.

**Polices (Google Fonts) :**
- Titres : **Cormorant Garamond** (400, 500, italique 400).
- Textes : **Montserrat** (300, 400, 500).
Deux polices maximum. Petits libellés en Montserrat majuscules avec un grand interlettrage (`letter-spacing: 0.22em à 0.34em`).

**Codes du luxe à respecter :** beaucoup d'espace vide, une grande image par section, peu de mots bien choisis, boutons sobres et cerclés d'or (« Découvrir », jamais « Achetez maintenant ! »), aucun effet criard, aucune promo agressive.

**Logo :** `assets/logo-clair.png` (« Nature » en ivoire, pour les fonds sombres : en-têtes et pieds de page) et `assets/logo.png` (« Nature » en noir, pour les fonds clairs). Les feuilles vertes et le bandeau rouge « ET VIE » gardent leurs couleurs. Le logo seul en haut à gauche, sans texte à côté.

**Images :** `assets/foret.jpg` (vue aérienne de forêt tropicale) sert d'image d'ouverture plein écran sur l'accueil, et de bandeau en haut des autres pages, avec un dégradé vert sombre par-dessus pour la lisibilité. Les emplacements `[PHOTO — …]` restent des cadres crème avec la légende, en attendant les vraies photos.

## 4. Les pages

Les maquettes HTML de référence sont dans `maquettes/`. **Reproduis-les fidèlement** (structure, textes, couleurs, espacements), en découpant en composants réutilisables : en-tête, pied de page, bandeau de page, titre de section, carte produit, emplacement photo, bouton.

| Page | Route | Maquette |
|---|---|---|
| Accueil | `/` | `maquettes/accueil.html` |
| La Maison | `/la-maison/` | `maquettes/la-maison.html` |
| Mission | `/mission/` | `maquettes/mission.html` |
| Nos gammes | `/nos-gammes/` | `maquettes/nos-gammes.html` |
| Contact | `/contact/` | `maquettes/contact.html` |
| Boutique | `/boutique/` | `maquettes/boutique.html` |

Menu : La Maison, Mission, Nos gammes, Contact, puis un bouton cerclé d'or « Boutique ». La page active est soulignée en or.

**Accueil, dans l'ordre :** ouverture plein écran (titre « Quand la nature inspire l'excellence », sous-titre « La nature, à l'état d'excellence », bouton « Découvrir nos solutions ») ; La Maison (photo en cadre doré, texte, signature « Dieu est le CEO. », trois piliers corps, âme, esprit) ; Notre mission (trois blocs qui remplissent toute la largeur) ; Nos valeurs (six) ; L'exigence de qualité ; Nos gammes (quatre cases : Compléments alimentaires, Tisanes, Cafés nutritifs, Solutions innovantes) ; L'accompagnement (WhatsApp et visio uniquement) ; Témoignages ; pied de page.

**Nos gammes :** construite comme une page de collection Cartier, en chapitres. Chaque produit affiche uniquement photo, nom, composition et prix. Mets les produits dans un fichier de données (`data/produits.js`) pour qu'on puisse les compléter sans toucher aux composants.

**Contact :** formulaire (nom, téléphone WhatsApp, ville, objet, message) qui ouvre WhatsApp avec le message prérempli.

**Boutique :** page « Notre boutique en ligne ouvre bientôt », commande via un conseiller, liste des moyens de paiement (Wave, Orange Money, MTN Mobile Money, Moov Money, Visa · Mastercard), champ « Me prévenir » qui ouvre aussi WhatsApp.

## 5. Informations à centraliser

Crée un fichier `lib/site.js` (ou `.ts`) avec : nom, RCCM, adresse, numéro WhatsApp, e-mail, horaires, lien de prise de rendez-vous Google Meet, liens des réseaux (Facebook, TikTok, Instagram, YouTube). Les valeurs inconnues restent entre crochets, par exemple `[NUMÉRO WHATSAPP BUSINESS]`, et tant que le numéro WhatsApp est vide, les boutons WhatsApp mènent à la page Contact.

## 6. Règles de contenu (impératives)

- **Aucune promesse de guérison**, aucune liste de maladies, aucun « ce produit soigne ». Les produits sont présentés par leur composition, leur origine et leur prix.
- Mention en pied de page de la page Nos gammes : « Nos produits sont des compléments alimentaires et ne remplacent pas un avis médical. »
- **Affirmer** ce qui est publié. Pas de formules d'hésitation du type « lorsque c'est vérifié » ou « à confirmer » dans les textes visibles : l'entreprise ne publie que des informations vérifiées. Exemple validé : « Pour chacun de nos produits, nous affichons sa composition complète et son origine de fabrication » ; origine : « fabrication en Malaisie et en France ».
- **N'invente rien** : ni chiffres, ni statistiques, ni noms de produits, ni prix. Ce qui manque reste entre crochets.
- **Témoignages :** les trois de la maquette sont fictifs, pour la mise en page. Ils doivent rester signalés comme tels (bandeau « Témoignages fictifs ») ou être retirés tant que de vrais avis, avec accord écrit des clients, ne sont pas fournis. Ne jamais les mettre en ligne comme des avis réels.
- Ton : élégant, sobre, chaleureux, en français. Vouvoiement.

## 7. Produit déjà renseigné

**SG9 Plus Advanced**, 35 000 FCFA la boîte.
Extraits de cellules souches végétales : sureau, framboise, mûre, myrtille, fraise, pomme, raisin.
Autres ingrédients : feuille de sanna, sacha inchi, fruit kulim, gac fruit, champignon au lait de tigre, moustache de chat, pecah beling, cardamome, gingembre, cassis, maïs, maltodextrine.

## 8. Qualité attendue

- Responsive : parfait sur téléphone (la majorité des visiteurs). Menu replié en bouton sur mobile.
- Accessibilité : vrais `<button>`, `<a>`, `<label>` ; textes alternatifs sur les images ; contrastes suffisants (or foncé `#8A6A22` pour les petits textes dorés sur fond clair).
- Performance : images compressées, polices chargées avec `display=swap`.
- SEO : `<title>` et meta description par page, en français, balise `lang="fr"`.
- Vérifie que `npm run build` réussit et que le dossier `out/` s'ouvre correctement.
- Termine par un `README.md` en français expliquant comment lancer le site en local, modifier les informations dans `lib/site.js`, ajouter un produit, construire et déposer le dossier `out/` sur LWS.
