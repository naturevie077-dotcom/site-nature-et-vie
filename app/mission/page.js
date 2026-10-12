import PageView from '@/components/PageView';
import { defaultPages } from '@/lib/defaultPages';

export const metadata = {
  title: 'Mission',
  description:
    'Notre mission : restaurer des vies dans toutes leurs dimensions, en prenant soin du corps, de l’âme et de l’esprit. Notre vision et nos six valeurs.',
};

export default function Mission() {
  return <PageView slug="mission" fallback={defaultPages.mission} />;
}
