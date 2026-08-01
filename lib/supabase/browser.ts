"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (browserClient) return browserClient;

  // GitHub Pages is a static SPA. PKCE stores a verifier in the browser that
  // requested the email and therefore breaks when the magic link opens in a
  // different browser. The implicit flow returns tokens in the URL fragment
  // (which is not sent to the server) and is the appropriate cross-browser
  // flow for this static deployment.
  browserClient = createClient(url, key, {
    auth: {
      flowType: "implicit",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return browserClient;
}
