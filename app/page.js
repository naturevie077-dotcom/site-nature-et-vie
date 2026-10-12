import PageView from '@/components/PageView';
import { defaultPages } from '@/lib/defaultPages';

export const metadata = {
  title: { absolute: 'Nature et Vie — Quand la nature inspire l’excellence' },
  description:
    'Nature et Vie Group, Abidjan : compléments alimentaires, tisanes, cafés nutritifs et solutions naturelles sélectionnés avec exigence, avec un conseil personnalisé sur WhatsApp et en visio.',
};

export default function Accueil() {
  return <PageView slug="accueil" fallback={defaultPages.accueil} />;
}
