"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase/browser";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [state, setState] = useState<"idle" | "loading" | "sent" | "unconfigured" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      setConnectedEmail(data.user?.email ?? null);
      setCheckingSession(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setConnectedEmail(session?.user.email ?? null);
      setCheckingSession(false);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    if (!supabase) { setState("unconfigured"); return; }
    setState("loading");
    setErrorMessage("");
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${basePath}/auth/callback/` },
    });
    if (error) {
      setErrorMessage(error.status === 429
        ? "Le quota d’e-mails de connexion est temporairement épuisé. Réessaie dans une heure ; les demandes répétées ne débloqueront pas le service."
        : "L’envoi a échoué. Vérifie l’adresse et réessaie dans quelques instants.");
      setState("error");
      return;
    }
    setState("sent");
    setResendIn(60);
  };

  const signInWithGoogle = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) { setState("unconfigured"); return; }
    setGoogleLoading(true);
    setErrorMessage("");
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${basePath}/auth/callback/` },
    });
    if (error) {
      setErrorMessage("La connexion Google n’a pas pu démarrer. Réessaie dans quelques instants.");
      setState("error");
      setGoogleLoading(false);
    }
  };

  const signOut = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setConnectedEmail(null);
    setState("idle");
  };

  if (checkingSession) {
    return <section className="authCard"><p className="eyebrow">Connexion sécurisée</p><h1>Vérification du compte…</h1></section>;
  }

  if (connectedEmail) {
    return (
      <section className="authCard">
        <p className="eyebrow">Compte connecté</p>
        <h1>La connexion est active.</h1>
        <p><strong>{connectedEmail}</strong><br />Ta progression peut être synchronisée entre tes appareils.</p>
        <div className="authActions">
          <Link className="button buttonPrimary" href="/">Ouvrir mon espace</Link>
          <button className="button buttonGhost" type="button" onClick={signOut}>Se déconnecter</button>
        </div>
        <small>Les données pédagogiques sont isolées par RLS dans Supabase.</small>
      </section>
    );
  }

  return (
    <section className="authCard">
      <p className="eyebrow">Compte facultatif</p>
      <h1>Retrouve ta progression partout.</h1>
      <p>L’application fonctionne immédiatement sans compte. Connecte-toi pour synchroniser les leçons, checkpoints et cas entre tes appareils.</p>
      <button className="authProviderButton" type="button" onClick={signInWithGoogle} disabled={googleLoading}>
        <span className="googleMark" aria-hidden="true">G</span>
        {googleLoading ? "Ouverture de Google…" : "Continuer avec Google"}
      </button>
      <div className="authDivider"><span>ou par e-mail</span></div>
      <form onSubmit={submit}>
        <label>
          <span>Adresse e-mail</span>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="sami@exemple.fr" />
        </label>
        <button className="button buttonPrimary" disabled={state === "loading" || resendIn > 0}>
          {state === "loading" ? "Envoi…" : resendIn > 0 ? `Lien envoyé — ${resendIn} s` : state === "sent" ? "Renvoyer un nouveau lien" : "Recevoir le lien de connexion"}
        </button>
      </form>
      {state === "sent" && <div className="authMessage success" role="status">Lien envoyé. Utilise uniquement le dernier e-mail reçu ; il reste valable une heure.</div>}
      {state === "unconfigured" && <div className="authMessage">Supabase n’est pas encore relié à cet environnement. Ta progression locale continue de fonctionner.</div>}
      {state === "error" && <div className="authMessage error" role="alert">{errorMessage}</div>}
      <small>Google ne partage jamais ton mot de passe avec OncoRT. Les données pédagogiques sont isolées par RLS dans Supabase.</small>
    </section>
  );
}
