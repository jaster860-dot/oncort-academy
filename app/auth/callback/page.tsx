"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthPanel } from "../../../components/auth-panel";
import { getAuthCallbackProblem, type AuthCallbackProblem } from "../../../lib/supabase/auth-callback";
import { createBrowserSupabaseClient } from "../../../lib/supabase/browser";

type CallbackState = "loading" | "success" | "error" | AuthCallbackProblem;

export default function AuthCallbackPage() {
  const [state, setState] = useState<CallbackState>("loading");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const params = new URL(window.location.href).searchParams;
    const tokenHash = params.get("token_hash");
    const code = params.get("code");
    const hasImplicitSession = window.location.hash.includes("access_token=");
    const callbackProblem = getAuthCallbackProblem(window.location.href);
    if (!supabase) {
      setState("error");
      return;
    }

    let active = true;
    void (async () => {
      if (callbackProblem) {
        const { data } = await supabase.auth.getUser();
        if (active) setState(data.user ? "success" : callbackProblem);
        return;
      }

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

  const title = state === "loading"
    ? "Connexion en cours…"
    : state === "success"
      ? "Compte connecté."
      : state === "provider_config"
        ? "Configuration Google à corriger."
        : state === "cancelled"
          ? "Connexion Google annulée."
          : "Lien non valide.";
  const description = state === "success"
    ? "Ta progression peut maintenant être synchronisée entre tes appareils."
    : state === "provider_config"
      ? "Google a bien répondu, mais Supabase n’a pas pu valider les identifiants OAuth. Vérifie le Client Secret Google enregistré dans Supabase, puis réessaie."
      : state === "cancelled"
        ? "Aucun compte n’a été connecté. Tu peux relancer Google ou continuer sans compte."
        : state === "loading"
          ? "Nous finalisons la connexion sécurisée."
          : "Le lien a expiré ou a déjà été utilisé. Demande un nouveau lien depuis la page de connexion.";

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="eyebrow">Connexion sécurisée</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {state === "success" && <Link className="button buttonPrimary" href="/">Ouvrir mon espace</Link>}
      </section>
      {state !== "loading" && state !== "success" && <AuthPanel />}
    </main>
  );
}
