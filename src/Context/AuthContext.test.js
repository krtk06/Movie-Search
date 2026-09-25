import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cloudflare = vi.hoisted(() => ({
  configured: false,
  login: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  signup: vi.fn(),
}));

vi.mock("../lib/cloudflare-auth.js", () => ({
  get isCloudflareConfigured() {
    return cloudflare.configured;
  },
  cloudflareLogin: cloudflare.login,
  cloudflareLogout: cloudflare.logout,
  cloudflareMe: cloudflare.me,
  cloudflareSignup: cloudflare.signup,
}));

import { AuthProvider, useAuth } from "./AuthContext.jsx";

const mountedRoots = [];

function consumer(states) {
  return function AuthConsumer() {
    states.push(useAuth());
    return null;
  };
}

async function renderProvider(states) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  await act(async () => {
    root.render(createElement(AuthProvider, null, createElement(consumer(states))));
  });
}

function demoHash(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash.toString(36);
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  cloudflare.configured = false;
  cloudflare.login.mockReset();
  cloudflare.logout.mockReset();
  cloudflare.me.mockReset();
  cloudflare.signup.mockReset();
  localStorage.clear();
});

afterEach(async () => {
  while (mountedRoots.length) {
    const root = mountedRoots.pop();
    await act(async () => root.unmount());
  }
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

describe("AuthProvider", () => {
  it("restores a Cloudflare session before leaving loading state", async () => {
    cloudflare.configured = true;
    cloudflare.me.mockResolvedValue({ id: "user-1", email: "member@example.com" });
    const states = [];

    await renderProvider(states);

    expect(cloudflare.me).toHaveBeenCalledOnce();
    expect(states.at(-1)).toMatchObject({
      loading: false,
      user: { uid: "user-1", email: "member@example.com" },
      isDemo: false,
    });
  });

  it("keeps the app usable when session restoration is temporarily offline", async () => {
    cloudflare.configured = true;
    cloudflare.me.mockRejectedValue(new Error("Auth service unreachable"));
    const states = [];

    await renderProvider(states);

    expect(states.at(-1)).toMatchObject({ loading: false, user: null, isDemo: false });
  });

  it("stores the Cloudflare user returned by login and logout", async () => {
    cloudflare.configured = true;
    cloudflare.me.mockResolvedValue(null);
    cloudflare.login.mockResolvedValue({ id: "user-1", email: "member@example.com" });
    cloudflare.logout.mockResolvedValue();
    const states = [];
    await renderProvider(states);

    await act(async () => states.at(-1).login("member@example.com", "secret123"));
    expect(cloudflare.login).toHaveBeenCalledWith("member@example.com", "secret123");
    expect(states.at(-1).user).toEqual({ uid: "user-1", email: "member@example.com" });

    await act(async () => states.at(-1).logout());
    expect(cloudflare.logout).toHaveBeenCalledOnce();
    expect(states.at(-1).user).toBeNull();
  });

  it("restores demo sessions synchronously", async () => {
    const email = "demo@example.com";
    localStorage.setItem(
      "cinephile_users",
      JSON.stringify({ [email]: { password: demoHash("secret123"), createdAt: 1 } })
    );
    localStorage.setItem("cinephile_session", email);
    const states = [];

    await renderProvider(states);

    expect(states[0]).toMatchObject({
      loading: false,
      user: { uid: email, email },
      isDemo: true,
    });
  });
});
