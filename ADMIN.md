# Administration du site — guide d'installation

L'administration vit à l'adresse **https://votre-domaine/admin/** (aucun lien ne mène à elle depuis le site).
Elle permet de modifier les pages (textes, images, vidéos, sections, ordre), de gérer les publicités de la page d'accueil, les couleurs, les informations de la maison, et accueillera plus tard la boutique.

Le site reste un site statique chez LWS ; les contenus et la connexion sont gérés par **Supabase**.

## 1. Créer le projet Supabase (gratuit)

1. Créez un compte sur <https://supabase.com> et **activez la validation à 2 étapes sur ce compte** (Account > Security).
2. « New project » : nom `nature-et-vie`, région **Europe (Paris)** si disponible, mot de passe de base de données **long et unique** (notez-le dans un gestionnaire de mots de passe).
3. **SQL Editor > New query** : collez tout le contenu de `supabase/schema.sql`, cliquez **Run**. Cela crée les tables, les règles de sécurité (RLS) et le stockage des images/vidéos.

## 2. Verrouiller la connexion

Dans Supabase :

1. **Authentication > Sign In / Providers > Email** : désactivez **« Allow new users to sign up »** (personne ne peut se créer de compte).
2. **Authentication > Sign In / Providers** : longueur minimale du mot de passe = **12**.
3. **Authentication > Multi-Factor** : laissez le TOTP activé.
4. **Authentication > URL Configuration** : « Site URL » = `https://votre-domaine`.
5. **Authentication > Users > Add user** : votre e-mail + un mot de passe fort, cochez « Auto Confirm User ».
6. **SQL Editor** : donnez-vous le rôle administrateur (remplacez l'e-mail) :

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'votre-adresse@exemple.com';
```

## 3. Relier le site à Supabase

1. Supabase > **Project Settings > API** : copiez **Project URL** et la clé **anon public**.
2. À la racine du projet, copiez `.env.example` en `.env.local` et collez les deux valeurs.
   **Ne copiez jamais la clé « service_role »** : elle donne tous les pouvoirs et ne doit jamais quitter Supabase.
3. Test en local : `npm.cmd run dev`, puis <http://localhost:3001/admin/>.
4. Mise en ligne : `npm.cmd run build`, puis déposez le contenu de `out/` dans `public_html` (comme pour le site).

## 4. Première connexion

1. Ouvrez `/admin/`, entrez votre e-mail et votre mot de passe.
2. Au premier passage, scannez le **code QR** avec Google Authenticator, Microsoft Authenticator ou Authy, puis saisissez le code à 6 chiffres.
3. À chaque connexion suivante : mot de passe **puis** code à 6 chiffres.

Si vous perdez votre téléphone : dans Supabase > Authentication > Users > votre compte, supprimez le « factor » MFA, puis reconnectez-vous et scannez un nouveau code.

## 5. Utiliser l'administration

- **Pages du site** : choisissez une page, ouvrez une section pour la modifier, utilisez ↑ ↓ pour la déplacer, « Ajouter une section » pour en créer. **Aperçu** montre le résultat. « Enregistrer le brouillon » ne change rien sur le site ; **« Publier »** met le site à jour immédiatement. « Contenu d'origine » restaure le texte de départ.
- **Publicités** : ajoutez une affiche (image, ou vidéo), un lien, des dates de début/fin. Elles apparaissent dans « À la une » sur l'accueil (la section est invisible tant qu'aucune publicité n'est active).
- **Médiathèque** : envoyez vos images (JPG, PNG, WebP, AVIF) et vidéos (MP4, WebM), 50 Mo maximum. Pensez à compresser les images (idéalement moins de 1,5 Mo) pour que le site reste rapide sur téléphone.
- **Apparence** : couleurs de la charte, avec contrôle de lisibilité. Les polices et espacements sont protégés pour garder l'allure luxe.
- **Informations** : numéro WhatsApp, adresse, e-mail, Google Meet, réseaux sociaux.
- **Produits des gammes** : Pages du site > Nos gammes > section « Chapitre de gamme » > « Produits de la gamme ». Dès qu'un produit est ajouté, la grille remplace le bloc « Recevoir la sélection ».

Règles de contenu à garder en tête : aucune promesse de guérison, pas de liste de maladies, pas de prix ni de chiffres inventés.

## 6. Ce qui protège le site

| Protection | Rôle |
|---|---|
| Inscriptions désactivées + liste `admins` | Seul votre compte peut écrire. |
| Code à 2 étapes (TOTP) **exigé par la base elle-même** | Même avec le mot de passe volé, aucune modification n'est possible sans le code (règle RLS `is_admin()`). |
| RLS sur toutes les tables et sur le stockage | Le public peut seulement **lire** le contenu publié ; les brouillons ne sont jamais publics. |
| Contraintes SQL (types, tailles) | Une donnée mal formée est refusée par la base. |
| Nettoyage à l'affichage (`lib/safe.js`, `lib/blocks.js`) | Aucun contenu n'est injecté comme HTML ; les liens et couleurs sont validés. Pas de faille XSS via l'administration. |
| Envoi de fichiers limité | Types contrôlés (images/vidéos), 50 Mo, nom de fichier aléatoire. |
| En-têtes HTTP (`public/.htaccess`) | CSP, HSTS, anti-clickjacking, nosniff, `/admin/` non indexé et non mis en cache. |
| Journal d'audit | Chaque création/modification/suppression est enregistrée (onglet Sécurité). |
| Déconnexion automatique | Après 20 minutes d'inactivité. |
| Clé publique seulement dans le navigateur | La clé « anon » est limitée par les règles RLS ; la clé `service_role` n'est jamais utilisée. |

**À votre charge** (aucune technique ne remplace cela) : mot de passe long, unique et jamais partagé ; 2 étapes sur le compte Supabase ET sur le compte LWS ; ne jamais diffuser `.env.local` ; garder le téléphone d'authentification en sécurité ; sauvegarder régulièrement (Supabase > Database > Backups, ou export SQL) ; activer **Cloudflare** devant le domaine pour une protection anti-attaques supplémentaire.

## 7. Limites à connaître

- Les pages modifiées s'affichent après un très court chargement : le texte d'origine est visible une fraction de seconde puis remplacé par la version publiée. Les moteurs de recherche voient surtout le texte d'origine : pour le référencement, gardez les textes principaux (titres, descriptions) proches de ceux d'origine ou demandez une régénération du site (`npm.cmd run build`).
- La page Boutique (et le futur paiement) viendra à l'étape suivante.
