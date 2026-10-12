import PageView from '@/components/PageView';
import { defaultPages } from '@/lib/defaultPages';

export const metadata = {
  title: 'La Maison',
  description:
    'Nature et Vie Group est née à Abidjan, fondée sur la foi chrétienne : une maison de bien-être qui travaille sous le regard de Dieu et sert chaque personne avec excellence.',
};

export default function LaMaison() {
  return <PageView slug="la-maison" fallback={defaultPages['la-maison']} />;
}
