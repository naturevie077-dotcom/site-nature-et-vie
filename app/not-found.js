import Link from 'next/link';

export const metadata = { title: 'Page introuvable' };

export default function NotFound() {
  return (
    <main className="notfound">
      <img src="/assets/logo-clair.png" alt="Nature et Vie" style={{ height: 72, width: 'auto' }} />
      <span className="eyebrow eyebrow--light">Erreur 404</span>
      <h1>Cette page est introuvable.</h1>
      <Link className="btn" href="/">Retour à l’accueil</Link>
    </main>
  );
}
