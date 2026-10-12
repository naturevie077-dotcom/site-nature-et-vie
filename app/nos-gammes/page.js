import PageView from '@/components/PageView';
import { defaultPages } from '@/lib/defaultPages';

export const metadata = {
  title: 'Nos gammes',
  description:
    'Compléments alimentaires, tisanes, cafés nutritifs et solutions innovantes : pour chaque produit, composition et prix affichés. SG9 Plus Advanced, 35 000 FCFA la boîte.',
};

export default function NosGammes() {
  return <PageView slug="nos-gammes" fallback={defaultPages['nos-gammes']} />;
}
