"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthPanel } from "../../../components/auth-panel";
import { createBrowserSupabaseClient } from "../../../lib/supabase/browser";

export default function AuthCallbackPage() {
  const [state, setState] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const params = new URL(window.location.href).searchParams;
    const tokenHash = params.get("token_hash");
    const code = params.get("code");
    const hasImplicitSession = window.location.hash.includes("access_token=");
    if (!supabase) {
      setState("error");
      return;
    }

    let active = true;
    void (async () => {
      // Token-hash links work even when the email is opened in a different
      // browser from the one that requested it. Keep PKCE code support for old
      // links generated before the email-template migration.
      const verification = tokenHash
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" })
        : code
          ? await supabase.auth.exchangeCodeForSession(code)
          : hasImplicitSession
            ? await supabase.auth.getSession()
            : null;

      // Magic links are single-use. If the user reopens an already-consumed
      // link in the same browser, Supabase correctly rejects the token but the
      // existing authenticated session must still be treated as a success.
      if (verification?.error || !verification) {
        const { data } = await supabase.auth.getUser();
        if (active) setState(data.user ? "success" : "error");
        return;
      }

      window.history.replaceState({}, document.title, window.location.pathname);
      if (active) setState("success");
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="eyebrow">Connexion sécurisée</p>
        <h1>{state === "loading" ? "Connexion en cours…" : state === "success" ? "Compte connecté." : "Lien non valide."}</h1>
        <p>{state === "success" ? "Ta progression peut maintenant être synchronisée entre tes appareils." : state === "error" ? "Le lien a expiré ou a déjà été utilisé. Demande un nouveau lien depuis la page de connexion." : "Nous vérifions le lien envoyé par e-mail."}</p>
        {state === "success" && <Link className="button buttonPrimary" href="/">Ouvrir mon espace</Link>}
      </section>
      {state === "error" && <AuthPanel />}
    </main>
  );
}
