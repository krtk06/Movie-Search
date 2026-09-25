const API_URL = (import.meta.env.VITE_AUTH_API_URL || "").replace(/\/+$/, "");
const TOKEN_KEY = "cinephile_cloudflare_session";

export const isCloudflareConfigured = Boolean(API_URL);

function createAuthError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function request(path, { method = "GET", body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw createAuthError("Auth service unreachable — check your connection.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw createAuthError(
      data?.error?.message || "Authentication failed.",
      response.status
    );
  }

  return data;
}

export function getSessionToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setSessionToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    return;
  }
}

function clearSessionToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
}

function readSession(data) {
  if (
    !data ||
    typeof data.token !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(data.token) ||
    !data.user ||
    typeof data.user.id !== "string" ||
    typeof data.user.email !== "string"
  ) {
    throw createAuthError("Auth service returned an invalid response.");
  }
  return data;
}

export async function cloudflareSignup(email, password) {
  const session = readSession(
    await request("/api/auth/signup", {
      method: "POST",
      body: { email, password },
    })
  );
  setSessionToken(session.token);
  return session.user;
}

export async function cloudflareLogin(email, password) {
  const session = readSession(
    await request("/api/auth/login", {
      method: "POST",
      body: { email, password },
    })
  );
  setSessionToken(session.token);
  return session.user;
}

export async function cloudflareLogout() {
  const token = getSessionToken();
  try {
    if (token) await request("/api/auth/logout", { method: "POST", token });
  } catch {
    return;
  } finally {
    clearSessionToken();
  }
}

export async function cloudflareMe() {
  const token = getSessionToken();
  if (!token) return null;

  let data;
  try {
    data = await request("/api/auth/me", { token });
  } catch (error) {
    if (error.status === 401) {
      clearSessionToken();
      return null;
    }
    throw error;
  }

  if (!data?.user || typeof data.user.id !== "string" || typeof data.user.email !== "string") {
    clearSessionToken();
    throw createAuthError("Auth service returned an invalid response.");
  }

  return data.user;
}
