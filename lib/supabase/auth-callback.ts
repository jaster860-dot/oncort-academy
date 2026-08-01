export type AuthCallbackProblem = "provider_config" | "cancelled" | "invalid_link";

function callbackParameters(url: URL) {
  const params = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
  url.searchParams.forEach((value, key) => params.set(key, value));
  return params;
}

export function getAuthCallbackProblem(href: string): AuthCallbackProblem | null {
  const params = callbackParameters(new URL(href));
  const error = params.get("error")?.toLowerCase() ?? "";
  const code = params.get("error_code")?.toLowerCase() ?? "";
  const description = params.get("error_description")?.toLowerCase() ?? "";

  if (!error && !code && !description) return null;

  if (error === "access_denied" || description.includes("access denied")) {
    return "cancelled";
  }

  if (
    error === "server_error" ||
    code === "unexpected_failure" ||
    description.includes("invalid_client") ||
    description.includes("client secret") ||
    description.includes("external code")
  ) {
    return "provider_config";
  }

  return "invalid_link";
}
