import { FooterSimple } from '@/components/Footer';
import { NotifyForm } from '@/components/Forms';
import ShopGrid from '@/components/shop/ShopGrid';
import { PageHero, stagger } from '@/components/ui';

export const metadata = {
  title: 'Boutique',
  description:
    'La boutique Nature et Vie : compléments alimentaires, tisanes, cafés nutritifs et solutions naturelles. Composition et prix affichés, commande avec un conseiller sur WhatsApp.',
};

const etapes = [
  ['01', 'Choisir', 'Parcourez la boutique et ajoutez vos produits au panier.'],
  ['02', 'Échanger', 'Un conseiller confirme la disponibilité, le prix et la livraison avec vous sur WhatsApp.'],
  ['03', 'Recevoir', 'Votre commande est livrée, puis nous prenons de vos nouvelles.'],
];

const paiements = ['Wave', 'Orange Money', 'MTN Mobile Money', 'Moov Money', 'Visa · Mastercard'];

export default function Boutique() {
  return (
    <main>
      <PageHero
        active="/boutique/"
        label="La Boutique"
        title="Nos solutions, choisies avec exigence."
        text="Composition et prix affichés pour chaque produit. Votre commande est confirmée avec un conseiller."
        position="center 85%"
        minHeight={460}
      />

      <section className="section" style={{ paddingBlock: 'clamp(64px, 8vw, 110px)' }}>
        <div className="wrap">
          <ShopGrid />
        </div>
      </section>

      <section className="section section--cream" style={{ padding: 'clamp(72px, 9vw, 120px) var(--gutter)' }}>
        <div className="wrap stack" style={{ gap: 56 }}>
          <div className="section-title">
            <span className="eyebrow nv-r">Commander</span>
            <h2 className="h2 nv-r">Trois étapes, un accompagnement.</h2>
          </div>
          <div className="cols cols--steps">
            {etapes.map(([num, titre, texte], i) => (
              <div className={`stack nv-r${stagger(i)}`} style={{ gap: 14 }} key={num}>
                <span className="numeral" style={{ fontSize: 60 }}>{num}</span>
                <h3 className="h3">{titre}</h3>
                <p className="p p--sm">{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: 'clamp(72px, 9vw, 120px) var(--gutter)' }}>
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div className="stack" style={{ gap: 20 }}>
            <span className="eyebrow nv-r">Moyens de paiement</span>
            <h2 className="h2 nv-r" style={{ fontSize: 'clamp(32px, 3.8vw, 48px)' }}>Payez comme vous le souhaitez.</h2>
            <ul className="chips nv-r">
              {paiements.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div className="stack" style={{ gap: 20 }}>
            <span className="eyebrow nv-r">Livraison</span>
            <h2 className="h2 nv-r" style={{ fontSize: 'clamp(32px, 3.8vw, 48px)' }}>Chez vous, avec soin.</h2>
            <p className="p p--sm nv-r" style={{ lineHeight: 1.85 }}>[ZONES DESSERVIES] · [DÉLAIS DE LIVRAISON] · [FRAIS DE LIVRAISON]</p>
          </div>
        </div>
      </section>

      <section className="section section--dark on-dark" style={{ padding: 'clamp(72px, 9vw, 110px) var(--gutter)' }}>
        <div className="stack center" style={{ maxWidth: 860, margin: '0 auto', gap: 22 }}>
          <h2 className="h2 nv-r" style={{ fontSize: 'clamp(32px, 3.6vw, 46px)', lineHeight: 1.15 }}>Être prévenu de l'ouverture du paiement en ligne</h2>
          <p className="p p--sm nv-r" style={{ maxWidth: 560, lineHeight: 1.85 }}>
            Laissez votre numéro WhatsApp : nous vous écrirons dès que vous pourrez payer directement sur le site.
          </p>
          <NotifyForm />
        </div>
      </section>

      <FooterSimple />
    </main>
  );
}
