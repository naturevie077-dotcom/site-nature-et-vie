// Contenu d'origine des pages, sous forme de blocs.
// Il s'affiche tant que rien n'a été publié dans l'administration (et si la base est injoignable).
// Chaque bloc est décrit dans lib/blocks.js.

const blk = (id, type, props) => ({ id, type, ...props });

const accueil = [
  blk('ac01', 'hero', {
    kind: 'home', image: '/assets/foret.jpg', imageAlt: "Vue aérienne d'une forêt tropicale sous un ciel lumineux",
    imagePosition: 'center 50%', height: '520', label: '',
    title: 'Quand la nature inspire l’excellence', text: 'La nature, à l’état d’excellence',
    buttonLabel: 'Découvrir nos solutions', buttonHref: '/nos-gammes/',
  }),
  blk('ac02', 'ads', { theme: 'cream', label: 'À la une', title: 'Nos actualités', layout: 'grid', tightTop: false }),
  blk('ac03', 'split', {
    theme: 'light', label: 'La Maison', title: 'Le meilleur de la nature, au service de votre vie.',
    paragraphs:
      "Née à Abidjan, Nature et Vie réunit ce que le monde végétal offre de plus précieux : compléments alimentaires, tisanes et cafés nutritifs, choisis pour la pureté de leurs ingrédients et l'exigence de leur fabrication.\n\nIci, un produit ne se vend pas : il se recommande. Chaque personne est écoutée, conseillée, puis accompagnée dans la durée, avec l'attention que l'on doit à un proche.\n\nNous servons sous un regard qui nous oblige à l'excellence.",
    paragraphStyle: 'plain', signature: 'Dieu est le CEO.',
    image: '/assets/direction.jpg', imageAlt: 'Trois hommes en costume sombre, bras croisés, devant une ligne de gratte-ciel',
    imageSide: 'left', frame: 'gold', ratio: '1 / 1', imagePosition: 'center 30%', facts: [], buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('ac04', 'grid', {
    theme: 'light', style: 'pillars', label: '', title: '', intro: 'Notre conviction : prendre soin de la personne tout entière.',
    items: [
      { icon: 'leaf', number: '', title: 'Le corps', text: 'Des solutions naturelles choisies avec exigence, présentées avec une composition claire.', image: '', imageAlt: '', href: '' },
      { icon: 'heart', number: '', title: "L'âme", text: "Une écoute sincère et un conseil personnalisé, avant comme après l'achat.", image: '', imageAlt: '', href: '' },
      { icon: 'cross', number: '', title: "L'esprit", text: 'La Parole et les principes bibliques qui permettent de vivre en paix et en pleine santé.', image: '', imageAlt: '', href: '' },
    ],
    buttonLabel: 'Découvrir la Maison', buttonHref: '/la-maison/', tightTop: true,
  }),
  blk('ac05', 'grid', {
    theme: 'dark', style: 'tiles', label: 'Notre mission', title: 'Restaurer des vies, dans toutes leurs dimensions.', intro: '',
    items: [
      { icon: 'cross', number: '', title: "L'Évangile", text: 'Partager la Bonne Nouvelle de Jésus-Christ, venu nous donner la vie en abondance.', image: '', imageAlt: '', href: '' },
      { icon: 'book', number: '', title: 'La sagesse du bien-être', text: 'Transmettre les principes bibliques qui permettent de vivre en paix, heureux et en bonne santé.', image: '', imageAlt: '', href: '' },
      { icon: 'leaf', number: '', title: "L'excellence naturelle", text: "Proposer des solutions naturelles rigoureusement sélectionnées pour accompagner le corps, l'âme et l'esprit.", image: '', imageAlt: '', href: '' },
    ],
    buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('ac06', 'grid', {
    theme: 'light', style: 'values', label: 'Nos valeurs', title: 'Six engagements, une même exigence.', intro: '',
    items: [
      ['I', 'Performance', "L'excellence dans chaque action, avec rigueur et constance."],
      ['II', 'Intégrité', 'Dire la vérité, tenir nos engagements, agir avec droiture.'],
      ['III', 'Innovation', 'Curiosité, audace et créativité au service de solutions pertinentes.'],
      ['IV', 'Transparence', 'Clarté sur nos prix, nos compositions et nos origines.'],
      ['V', 'Empathie', 'Écouter, comprendre et accueillir chaque personne avec dignité.'],
      ['VI', 'Bienveillance', 'Vouloir le bien réel et durable de chacun de nos clients.'],
    ].map(([number, title, text]) => ({ icon: 'none', number, title, text, image: '', imageAlt: '', href: '' })),
    buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('ac07', 'split', {
    theme: 'cream', label: "L'exigence de qualité", title: "De la source à vos mains, rien n'est laissé au hasard.",
    paragraphs:
      "Chaque solution entre dans notre sélection pour la qualité irréprochable de ses ingrédients. Pour chacun de nos produits, nous affichons sa composition complète et son origine de fabrication.",
    paragraphStyle: 'plain', signature: '',
    image: '/assets/ingredients.jpg', imageAlt: 'Fruits, baies, amandes et feuilles posés sur une table en bois',
    imageSide: 'right', frame: 'plain', ratio: '5 / 4', imagePosition: 'center 50%',
    facts: [
      { title: 'Composition', text: 'affichée en toute transparence' },
      { title: 'Origine', text: 'fabrication en Malaisie et en France' },
      { title: 'Conseil', text: "personnalisé avant et après l'achat" },
    ],
    buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('ac08', 'grid', {
    theme: 'light', style: 'cards', label: 'Nos gammes', title: 'Des solutions choisies avec exigence.', intro: '',
    items: [
      ['Compléments alimentaires', 'complements-alimentaires', 'gamme-complements', 'Capsules, gingembre et citron sur un plan de travail en marbre'],
      ['Tisanes', 'tisanes', 'gamme-tisanes', 'Tasse remplie de plantes séchées pour tisane'],
      ['Cafés nutritifs', 'cafes-nutritifs', 'gamme-cafes', 'Tasse de café blanche entourée de grains et de feuilles'],
      ['Solutions innovantes', 'solutions-innovantes', 'gamme-innovantes', 'Flacon en verre ambré avec pipette, devant des feuillages'],
    ].map(([title, id, file, imageAlt]) => ({ icon: 'none', number: '', title, text: '', image: `/assets/${file}.jpg`, imageAlt, href: `/nos-gammes/#${id}` })),
    buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('ac09', 'grid', {
    theme: 'dark', style: 'topline', label: "L'accompagnement", title: 'Un conseil personnalisé, à chaque étape.', intro: '',
    items: [
      { icon: 'none', number: '', title: 'Sur WhatsApp', text: "Un conseiller vous écoute et vous oriente vers la solution adaptée à votre besoin.", image: '', imageAlt: '', href: '' },
      { icon: 'none', number: '', title: 'En visio', text: 'Des rencontres sur Google Meet pour répondre à vos questions en profondeur.', image: '', imageAlt: '', href: '' },
    ],
    buttonLabel: 'Parler à un conseiller', buttonHref: '/contact/', tightTop: false,
  }),
  blk('ac10', 'tags', {
    theme: 'cream', label: 'Notre rayonnement', title: "D'Abidjan, jusqu'à vous.",
    text: "Livraison à domicile à Abidjan, expédition dans toute la Côte d'Ivoire et au-delà des frontières. Où que vous soyez, la même exigence vous accompagne.",
    items: ["Côte d'Ivoire", 'Gabon', 'Congo', 'Togo', 'Mali', 'Mayotte', 'France'].map((text) => ({ text })), tightTop: false,
  }),
];

const maison = [
  blk('ma01', 'hero', { kind: 'page', image: '/assets/foret.jpg', imageAlt: '', imagePosition: 'center 70%', height: '520', label: 'La Maison', title: "Une maison née de la foi et de l'exigence.", text: '', buttonLabel: '', buttonHref: '' }),
  blk('ma02', 'split', {
    theme: 'light', label: 'Notre histoire', title: 'Une conviction devenue maison.',
    paragraphs:
      "Nature et Vie Group est née à Abidjan d'une vocation claire : rendre accessibles les plus belles ressources du monde végétal, sous la forme de compléments alimentaires, de tisanes, de cafés nutritifs et de solutions naturelles innovantes.\n\nLa nature recèle des trésors d'une richesse rare. Encore faut-il savoir les choisir avec discernement et les transmettre avec soin. C'est à cet art que nous consacrons notre maison, avec la conviction que prendre soin d'une personne, c'est prendre soin de son corps, de son âme et de son esprit.",
    paragraphStyle: 'plain', signature: '',
    image: '/assets/direction.jpg', imageAlt: 'Trois hommes en costume sombre, bras croisés, devant une ligne de gratte-ciel',
    imageSide: 'right', frame: 'plain', ratio: '1 / 1', imagePosition: 'center 30%', facts: [], buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('ma03', 'text', {
    theme: 'dark', label: 'Notre foi', title: 'Dieu est le CEO.', size: 'large',
    paragraphs:
      "Nature et Vie est une entreprise fondée sur la foi chrétienne. Nous croyons en Dieu le Père, Créateur du ciel et de la terre, en Jésus-Christ, notre Sauveur et Seigneur, et au Saint-Esprit, qui nous guide et nous inspire dans chacune de nos décisions.\n\nNous travaillons sous Son regard. C'est pourquoi nous nous devons de donner le meilleur de nous-mêmes, et de servir avec excellence chaque personne placée sur notre chemin.",
    rule: true, buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('ma04', 'grid', {
    theme: 'light', style: 'topline', label: 'Nos engagements', title: 'Nos engagements envers vous.', intro: '',
    items: [
      ['Une qualité vérifiée', 'Des produits soigneusement sélectionnés et rigoureusement vérifiés.'],
      ['Un conseil personnel', "Un accompagnement bienveillant et compétent, avant et après l'achat."],
      ['Une transparence totale', "Sur nos prix, nos compositions et nos origines, sans la moindre zone d'ombre."],
      ['Un service élégant', 'Ponctualité, élégance et respect absolu, à chaque échange.'],
    ].map(([title, text]) => ({ icon: 'none', number: '', title, text, image: '', imageAlt: '', href: '' })),
    buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('ma05', 'quote', { theme: 'cream', text: '« Tout ce que vous faites, faites-le de tout votre cœur, comme pour le Seigneur et non pour des hommes. »', reference: 'Colossiens 3:23', buttonLabel: 'Découvrir notre mission', buttonHref: '/mission/', tightTop: false }),
];

const mission = [
  blk('mi01', 'hero', { kind: 'page', image: '/assets/foret.jpg', imageAlt: '', imagePosition: 'center 30%', height: '520', label: 'Notre mission', title: 'Restaurer des vies, dans toutes leurs dimensions.', text: '', buttonLabel: '', buttonHref: '' }),
  blk('mi02', 'grid', {
    theme: 'light', style: 'steps', label: '', title: '', intro: "Une triple démarche, indissociable : prendre soin du corps, de l'âme et de l'esprit.",
    items: [
      ['01', "L'Évangile", 'Annoncer la Bonne Nouvelle de Jésus-Christ, venu dans ce monde pour nous donner la vie en abondance.'],
      ['02', 'La sagesse du bien-être', 'Partager les conseils bibliques qui permettent de vivre heureux, en paix et en pleine santé.'],
      ['03', "L'excellence naturelle", "Présenter des solutions naturelles innovantes, sélectionnées avec rigueur pour accompagner le corps, l'âme et l'esprit."],
    ].map(([number, title, text]) => ({ icon: 'none', number, title, text, image: '', imageAlt: '', href: '' })),
    buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('mi03', 'split', {
    theme: 'dark', label: 'Notre vision', title: 'Devenir une référence mondiale de la santé et de la spiritualité chrétienne.',
    paragraphs: "Porter un domaine unique, où le soin du corps rejoint celui de l'esprit.\n\nVoir des millions d'hommes et de femmes, à travers le monde, retrouver la joie de vivre pleinement la vie que Dieu leur donne.",
    paragraphStyle: 'bordered', signature: '', image: '', imageAlt: '', imageSide: 'left', frame: 'plain', ratio: '4 / 5', imagePosition: 'center 50%',
    facts: [], buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('mi04', 'grid', {
    theme: 'light', style: 'values', label: 'Nos valeurs', title: 'Le socle de chacune de nos décisions.', intro: '',
    items: [
      ['Performance', "Nous visons l'excellence dans chaque action, avec des objectifs ambitieux et mesurables, atteints avec rigueur et constance."],
      ['Intégrité', 'Nous disons la vérité, tenons nos engagements et agissons avec droiture, devant les hommes comme devant Dieu.'],
      ['Innovation', 'Nous cultivons la curiosité, l’audace et la créativité pour proposer des solutions toujours plus pertinentes.'],
      ['Transparence', "Nous communiquons avec clarté et honnêteté. Rien n'est caché de ce qui doit être dit."],
      ['Empathie', 'Nous écoutons et comprenons les besoins de chacun. Chaque personne est accueillie avec attention, dignité et respect.'],
      ['Bienveillance', 'Nous voulons le bien réel et durable de nos clients. Nos paroles construisent, nos actes encouragent.'],
    ].map(([title, text]) => ({ icon: 'none', number: '', title, text, image: '', imageAlt: '', href: '' })),
    buttonLabel: '', buttonHref: '', tightTop: false,
  }),
  blk('mi05', 'quote', { theme: 'cream', text: '« Que tout ce que vous faites soit fait avec amour. »', reference: '1 Corinthiens 16:14', buttonLabel: 'Découvrir nos gammes', buttonHref: '/nos-gammes/', tightTop: false }),
];

const chapter = (id, anchor, chapterLabel, title, intro, selection, photo, alt, position, message, extra = {}) =>
  blk(id, 'chapter', {
    anchor, chapter: chapterLabel, title, intro, featured: false, featuredName: '', featuredPhoto: '', featuredComposition: [],
    featuredPrice: '', featuredUnit: '', items: [], selection, selectionPhoto: photo, selectionAlt: alt,
    selectionPosition: position, selectionMessage: message, flip: false, ...extra,
  });

const gammes = [
  blk('ga01', 'hero', {
    kind: 'page', image: '/assets/foret.jpg', imageAlt: '', imagePosition: 'center 50%', height: '520', label: 'Nos gammes',
    title: 'Des solutions choisies avec exigence.',
    text: 'Pour chaque produit, nous affichons sa composition et son prix. Nos conseillers vous accompagnent pour choisir ce qui vous convient.',
    buttonLabel: '', buttonHref: '',
  }),
  chapter('ga02', 'complements-alimentaires', 'Chapitre I', 'Compléments alimentaires',
    'Des formules qui réunissent fruits, plantes et extraits végétaux, sélectionnés pour accompagner votre hygiène de vie au quotidien.',
    "Découvrez l'ensemble de nos compléments alimentaires auprès de nos conseillers, qui vous orientent selon vos attentes.",
    '/assets/gamme-complements.jpg', 'Capsules, gingembre et citron sur un plan de travail en marbre', '45% 50%',
    'Bonjour, je souhaite découvrir vos compléments alimentaires.',
    {
      featured: true, featuredSlug: 'sg9-plus-advanced', featuredName: 'SG9 Plus Advanced',
      featuredPhoto: '/assets/sg9-plus-advanced.jpg', featuredPackshot: true,
      featuredComposition: [
        { title: 'Extraits de cellules souches végétales', text: 'sureau, framboise, mûre, myrtille, fraise, pomme, raisin.' },
        { title: 'Autres ingrédients', text: 'feuille de sanna, sacha inchi, fruit kulim, gac fruit, champignon au lait de tigre, moustache de chat, pecah beling, cardamome, gingembre, cassis, maïs, maltodextrine.' },
      ],
      featuredPrice: '35 000 FCFA', featuredUnit: 'la boîte',
    }),
  chapter('ga03', 'tisanes', 'Chapitre II', 'Tisanes',
    'Des infusions de plantes choisies pour habiller les rituels du quotidien : un instant de calme, une saveur, une attention portée à soi.',
    'Notre sélection de tisanes vous est présentée en toute confidentialité par nos conseillers.',
    '/assets/gamme-tisanes.jpg', 'Tasse remplie de plantes séchées pour tisane', '50% 50%', 'Bonjour, je souhaite découvrir vos tisanes.',
    {
      flip: true,
      featured: true, featuredSlug: 'lion-power', featuredName: 'Lion Power',
      featuredPhoto: '/assets/lion-power-face.jpg', featuredPackshot: true,
      featuredComposition: [
        { title: 'Dix plantes', text: 'ginseng, maca, muira puama, tongkat ali, fenugrec, damiana, tribulus, épimédium, mûrier, goji.' },
        { title: 'Format', text: '20 sachets individuels de 2 g, soit 40 g.' },
      ],
      featuredPrice: '', featuredUnit: '',
    }),
  chapter('ga04', 'cafes-nutritifs', 'Chapitre III', 'Cafés nutritifs',
    "Le plaisir intact du café, enrichi d'ingrédients naturels d'exception. Une tasse où le goût et le bien-être se rencontrent.",
    'Nos cafés nutritifs vous sont présentés, un à un, par nos conseillers.',
    '/assets/gamme-cafes.jpg', 'Tasse de café blanche entourée de grains et de feuilles', '50% 50%', 'Bonjour, je souhaite découvrir vos cafés nutritifs.'),
  chapter('ga05', 'solutions-innovantes', 'Chapitre IV', 'Solutions innovantes',
    'Là où la recherche rencontre la nature : des formules nouvelles, sélectionnées pour leur caractère inédit et la rigueur de leur conception.',
    'Nos solutions innovantes vous sont présentées par nos conseillers, au fil de leurs arrivées.',
    '/assets/gamme-innovantes.jpg', 'Flacon en verre ambré avec pipette, devant des feuillages', '62% 50%', 'Bonjour, je souhaite découvrir vos solutions innovantes.', { flip: true }),
  blk('ga06', 'cta', {
    theme: 'dark', title: "Besoin d'être orienté ?",
    text: "Un conseiller prend le temps de comprendre vos attentes avant toute recommandation. Nos solutions s'inscrivent toujours en complément du suivi de votre médecin.",
    buttonLabel: 'Parler à un conseiller', buttonHref: '/contact/', tightTop: false,
  }),
];

const contact = [
  blk('co01', 'hero', { kind: 'page', image: '/assets/foret.jpg', imageAlt: '', imagePosition: 'center 15%', height: '440', label: 'Contact', title: 'Nous sommes à votre écoute.', text: '', buttonLabel: '', buttonHref: '' }),
  blk('co02', 'contact', { lead: "Chaque échange commence par l'écoute. Dites-nous ce que vous recherchez, un conseiller vous répond avec clarté." }),
];

export const defaultPages = { accueil, 'la-maison': maison, mission, 'nos-gammes': gammes, contact };

export const PAGE_LIST = [
  ['accueil', 'Accueil', '/'],
  ['la-maison', 'La Maison', '/la-maison/'],
  ['mission', 'Mission', '/mission/'],
  ['nos-gammes', 'Nos gammes', '/nos-gammes/'],
  ['contact', 'Contact', '/contact/'],
];
