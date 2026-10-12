import './globals.css';
import SiteProvider from '@/components/SiteProvider';
import ShopProvider from '@/components/shop/ShopProvider';

export const metadata = {
  title: {
    default: 'Nature et Vie — La nature, à l’état d’excellence',
    template: '%s — Nature et Vie',
  },
  description:
    'Nature et Vie Group, Abidjan : compléments alimentaires, tisanes, cafés nutritifs et solutions naturelles sélectionnés avec exigence, accompagnés d’un conseil personnalisé.',
  icons: { icon: '/assets/logo.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B3D2E',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Montserrat:wght@300;400;500&display=swap"
        />
      </head>
      <body>
        <SiteProvider>
          <ShopProvider>{children}</ShopProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
