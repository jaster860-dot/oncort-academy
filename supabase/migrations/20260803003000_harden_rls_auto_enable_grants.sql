-- rls_auto_enable() est une fonction d'event trigger : Postgres l'invoque
-- lui-meme, avec les droits de son proprietaire, lors d'un CREATE TABLE.
-- Les GRANT EXECUTE ne participent donc jamais a son fonctionnement, mais
-- l'exposaient sur /rest/v1/rpc/rls_auto_enable pour anon et authenticated.
--
-- Verifie apres application : la RLS reste activee automatiquement sur une
-- table nouvellement creee, et l'ACL se limite a {postgres, service_role}.
revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;
