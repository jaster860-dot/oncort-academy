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
    if (!supabase || (!tokenHash && !code && !hasImplicitSession)) {
      setState("error");
      return;
    }

    // Token-hash links work even when the email is opened in a different
    // browser from the one that requested it. Keep PKCE code support for old
    // links generated before the email-template migration.
    const verification = tokenHash
      ? supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" })
      : code
        ? supabase.auth.exchangeCodeForSession(code)
        : supabase.auth.getSession();
    void verification.then(({ error }) => {
      setState(error ? "error" : "success");
    });
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
