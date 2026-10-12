// Lecture publique des contenus (pages publiées, réglages, publicités actives).
// Utilise uniquement la clé publique « anon » : la base n'autorise que la lecture du contenu publié.
// Si Supabase n'est pas configuré ou ne répond pas, le site garde son contenu d'origine.

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const remoteEnabled = Boolean(URL_BASE && ANON);

export async function rest(path) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Lecture impossible (${res.status})`);
  return res.json();
}
