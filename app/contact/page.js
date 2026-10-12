import PageView from '@/components/PageView';
import { defaultPages } from '@/lib/defaultPages';

export const metadata = {
  title: 'Contact',
  description:
    'Écrivez à un conseiller Nature et Vie sur WhatsApp, prenez rendez-vous en visio ou rendez-nous visite à Angré, Abidjan.',
};

export default function Contact() {
  return <PageView slug="contact" fallback={defaultPages.contact} />;
}
