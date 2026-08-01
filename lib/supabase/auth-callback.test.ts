import { describe, expect, it } from "vitest";
import { getAuthCallbackProblem } from "./auth-callback";

describe("getAuthCallbackProblem", () => {
  it("recognizes a provider code-exchange failure returned in the fragment", () => {
    expect(getAuthCallbackProblem(
      "https://example.test/auth/callback/#error=server_error&error_code=unexpected_failure&error_description=Unable%20to%20exchange%20external%20code",
    )).toBe("provider_config");
  });

  it("recognizes an invalid client secret returned in the query", () => {
    expect(getAuthCallbackProblem(
      "https://example.test/auth/callback/?error=server_error&error_description=The%20provided%20client%20secret%20is%20invalid",
    )).toBe("provider_config");
  });

  it("distinguishes a user cancellation", () => {
    expect(getAuthCallbackProblem(
      "https://example.test/auth/callback/?error=access_denied",
    )).toBe("cancelled");
  });

  it("returns null for a successful implicit callback", () => {
    expect(getAuthCallbackProblem(
      "https://example.test/auth/callback/#access_token=token&refresh_token=refresh&expires_in=3600&token_type=bearer",
    )).toBeNull();
  });
});
