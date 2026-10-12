'use client';

import { useState } from 'react';
import { hasWhatsapp, whatsappLink } from '@/lib/site';
import { useSite } from './SiteProvider';

// Ouvre WhatsApp avec un message prérempli (aucun envoi côté serveur).
function openWhatsapp(site, message, setStatus) {
  if (!hasWhatsapp(site)) {
    setStatus("L'envoi par WhatsApp sera disponible dès l'activation du numéro de la maison.");
    return;
  }
  window.open(whatsappLink(site, message), '_blank', 'noopener,noreferrer');
  setStatus('WhatsApp s’ouvre avec votre message. Il ne reste qu’à l’envoyer.');
}

const clip = (v, n) => String(v ?? '').slice(0, n);

export function ContactForm() {
  const { site } = useSite();
  const [status, setStatus] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const message = [
      'Bonjour Nature et Vie,',
      '',
      `Nom : ${clip(d.get('nom'), 120)}`,
      `Téléphone WhatsApp : ${clip(d.get('tel'), 40)}`,
      `Ville : ${clip(d.get('ville'), 80)}`,
      `Objet : ${clip(d.get('objet'), 80)}`,
      '',
      clip(d.get('msg'), 1500),
    ].join('\n');
    openWhatsapp(site, message, setStatus);
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>Écrivez-nous</h2>
      <div className="form-row">
        <div className="field">
          <label htmlFor="nom">Nom et prénom</label>
          <input id="nom" name="nom" type="text" autoComplete="name" maxLength={120} required />
        </div>
        <div className="field">
          <label htmlFor="tel">Téléphone WhatsApp</label>
          <input id="tel" name="tel" type="tel" autoComplete="tel" maxLength={40} required />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="ville">Ville</label>
          <input id="ville" name="ville" type="text" autoComplete="address-level2" maxLength={80} />
        </div>
        <div className="field">
          <label htmlFor="objet">Objet</label>
          <select id="objet" name="objet" defaultValue="Conseil sur un produit">
            <option>Conseil sur un produit</option>
            <option>Passer une commande</option>
            <option>Devenir distributeur</option>
            <option>Autre demande</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="msg">Votre message</label>
        <textarea id="msg" name="msg" rows={6} maxLength={1500} required />
      </div>
      <p className="form-note">Vos informations servent exclusivement à vous répondre et restent strictement confidentielles.</p>
      <button type="submit" className="btn--form">Envoyer</button>
      <p className="form-status" role="status" aria-live="polite">{status}</p>
    </form>
  );
}

export function NotifyForm() {
  const { site } = useSite();
  const [status, setStatus] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    const tel = clip(new FormData(e.currentTarget).get('notif'), 40);
    openWhatsapp(
      site,
      `Bonjour Nature et Vie, je souhaite être prévenu(e) de l'ouverture de la boutique en ligne. Mon numéro WhatsApp : ${tel}`,
      setStatus
    );
  }

  return (
    <>
      <form className="notify" onSubmit={onSubmit}>
        <label htmlFor="notif" className="sr-only">Numéro WhatsApp</label>
        <input id="notif" name="notif" type="tel" placeholder="Votre numéro WhatsApp" autoComplete="tel" maxLength={40} required />
        <button type="submit">Me prévenir</button>
      </form>
      <p role="status" aria-live="polite" style={{ margin: 0, fontSize: 13, color: '#e2c98b' }}>{status}</p>
    </>
  );
}
