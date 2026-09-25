import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TOKEN_KEY = "cinephile_cloudflare_session";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function loadClient() {
  return import("./cloudflare-auth.js");
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("VITE_AUTH_API_URL", "https://auth.example.com");
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Cloudflare auth client", () => {
  it("stores a successful signup token separately from demo sessions", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        user: { id: "user-1", email: "member@example.com" },
        token: "a".repeat(43),
      }, 201)
    );
    vi.stubGlobal("fetch", fetchMock);
    const { cloudflareSignup, isCloudflareConfigured } = await loadClient();

    await expect(cloudflareSignup("member@example.com", "secret123")).resolves.toEqual({
      id: "user-1",
      email: "member@example.com",
    });

    expect(isCloudflareConfigured).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://auth.example.com/api/auth/signup",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "member@example.com", password: "secret123" }),
      })
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBe("a".repeat(43));
    expect(localStorage.getItem("cinephile_session")).toBeNull();
  });

  it("rejects malformed signup responses without persisting a token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ user: { id: "user-1", email: "member@example.com" } }))
    );
    const { cloudflareSignup } = await loadClient();

    await expect(cloudflareSignup("member@example.com", "secret123")).rejects.toThrow(
      "Auth service returned an invalid response"
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("clears an unauthorized session", async () => {
    localStorage.setItem(TOKEN_KEY, "expired-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ error: { code: "unauthorized", message: "Not signed in." } }, 401)
      )
    );
    const { cloudflareMe } = await loadClient();

    await expect(cloudflareMe()).resolves.toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("preserves the session when the service is temporarily unavailable", async () => {
    localStorage.setItem(TOKEN_KEY, "valid-token");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    const { cloudflareMe } = await loadClient();

    await expect(cloudflareMe()).rejects.toThrow("Auth service unreachable");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("valid-token");
  });

  it("revokes and clears the stored session on logout", async () => {
    localStorage.setItem(TOKEN_KEY, "valid-token");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { cloudflareLogout } = await loadClient();

    await cloudflareLogout();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://auth.example.com/api/auth/logout",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer valid-token" }),
      })
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
