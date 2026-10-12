// Client Supabase complet, chargé uniquement dans l'administration.
// Seule la clé publique « anon » est utilisée ici : ne mettez JAMAIS la clé « service_role » dans ce projet.

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(URL_BASE && ANON);

let client;
export async function getSupabase() {
  if (!supabaseConfigured) return null;
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(URL_BASE, ANON, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }
  return client;
}

export const publicMediaUrl = (path) => `${URL_BASE}/storage/v1/object/public/media/${path}`;
