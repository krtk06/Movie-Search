import { env } from "cloudflare:workers";
import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import worker from "../src/index.js";

const ORIGIN = "http://127.0.0.1:5174";

async function invoke(request, overrides = {}) {
  const context = createExecutionContext();
  const workerEnv = {
    DB: env.DB,
    ALLOWED_ORIGIN: env.ALLOWED_ORIGIN,
    PBKDF2_ITERATIONS: env.PBKDF2_ITERATIONS,
    SESSION_TTL_DAYS: env.SESSION_TTL_DAYS,
    ...overrides,
  };
  const response = await worker.fetch(request, workerEnv, context);
  await waitOnExecutionContext(context);
  return response;
}

function jsonRequest(path, body, origin = ORIGIN, client = body.email || "test-client") {
  return new Request(`https://auth.example.com${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CF-Connecting-IP": client,
      Origin: origin,
    },
    body: JSON.stringify(body),
  });
}

async function responseJson(response) {
  return response.json();
}

beforeEach(async () => {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions"),
    env.DB.prepare("DELETE FROM users"),
    env.DB.prepare("DELETE FROM rate_limits"),
  ]);
});

describe("CINEMART auth Worker", () => {
  it("rejects browser requests from an unapproved origin", async () => {
    const response = await invoke(
      jsonRequest(
        "/api/auth/signup",
        { email: "blocked@example.com", password: "secret123" },
        "https://attacker.example"
      )
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("returns private no-store JSON responses", async () => {
    const response = await invoke(
      jsonRequest("/api/auth/signup", { email: "headers@example.com", password: "secret123" })
    );

    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);
  });

  it("signs up, persists only hashes, and restores the session", async () => {
    const response = await invoke(
      jsonRequest("/api/auth/signup", { email: "member@example.com", password: "secret123" })
    );
    const data = await responseJson(response);

    expect(response.status).toBe(201);
    expect(data.user).toMatchObject({ email: "member@example.com" });
    expect(data.user.id).toBeTruthy();
    expect(data.token).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const user = await env.DB.prepare("SELECT password_hash FROM users WHERE email = ?")
      .bind("member@example.com")
      .first();
    const session = await env.DB.prepare("SELECT token_hash FROM sessions WHERE user_id = ?")
      .bind(data.user.id)
      .first();

    expect(user.password_hash).toMatch(/^pbkdf2-sha256\$/);
    expect(user.password_hash).not.toContain("secret123");
    expect(session.token_hash).toHaveLength(64);
    expect(session.token_hash).not.toBe(data.token);

    const me = await invoke(
      new Request("https://auth.example.com/api/auth/me", {
        headers: { Authorization: `Bearer ${data.token}`, Origin: ORIGIN },
      })
    );
    expect(me.status).toBe(200);
    expect(await responseJson(me)).toEqual({ user: data.user });
  });

  it("uses the same error for unknown accounts and wrong passwords", async () => {
    await invoke(
      jsonRequest("/api/auth/signup", { email: "known@example.com", password: "secret123" })
    );

    const wrongPassword = await invoke(
      jsonRequest("/api/auth/login", { email: "known@example.com", password: "wrongpass" })
    );
    const unknownAccount = await invoke(
      jsonRequest("/api/auth/login", { email: "unknown@example.com", password: "wrongpass" })
    );

    expect(wrongPassword.status).toBe(401);
    expect(unknownAccount.status).toBe(401);
    expect(await responseJson(wrongPassword)).toEqual(await responseJson(unknownAccount));
  });

  it("rejects duplicate accounts and invalid credentials", async () => {
    await invoke(
      jsonRequest("/api/auth/signup", { email: "duplicate@example.com", password: "secret123" })
    );

    const duplicate = await invoke(
      jsonRequest("/api/auth/signup", { email: "DUPLICATE@example.com", password: "secret123" })
    );
    const invalidEmail = await invoke(
      jsonRequest("/api/auth/signup", { email: "not-an-email", password: "secret123" })
    );
    const weakPassword = await invoke(
      jsonRequest("/api/auth/signup", { email: "weak@example.com", password: "123" })
    );

    expect(duplicate.status).toBe(409);
    expect(invalidEmail.status).toBe(400);
    expect(weakPassword.status).toBe(400);
  });

  it("invalidates a session on logout", async () => {
    const signup = await invoke(
      jsonRequest("/api/auth/signup", { email: "logout@example.com", password: "secret123" })
    );
    const { token } = await responseJson(signup);
    const headers = { Authorization: `Bearer ${token}`, Origin: ORIGIN };

    const logout = await invoke(
      new Request("https://auth.example.com/api/auth/logout", { method: "POST", headers })
    );
    const me = await invoke(
      new Request("https://auth.example.com/api/auth/me", { headers })
    );

    expect(logout.status).toBe(200);
    expect(me.status).toBe(401);
  });

  it("stops reading an oversized body when Content-Length is absent", async () => {
    let chunksRead = 0;
    let canceled = false;
    const body = new ReadableStream({
      pull(controller) {
        chunksRead += 1;
        controller.enqueue(new TextEncoder().encode("x".repeat(1024)));
        if (chunksRead >= 20) controller.close();
      },
      cancel() {
        canceled = true;
      },
    });
    const request = new Request("https://auth.example.com/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "oversized-client",
        Origin: ORIGIN,
      },
      body,
    });

    const response = await invoke(request);

    expect(response.status).toBe(413);
    expect(canceled).toBe(true);
    expect(chunksRead).toBeLessThan(20);
  });

  it("blocks signup after 3 attempts from one client", async () => {
    const responses = [];
    for (let attempt = 0; attempt < 4; attempt += 1) {
      responses.push(
        await invoke(
          jsonRequest(
            "/api/auth/signup",
            { email: `signup-limit-${attempt}@example.com`, password: "secret123" },
            ORIGIN,
            "203.0.113.10"
          )
        )
      );
    }

    expect(responses.slice(0, 3).map((response) => response.status)).toEqual([201, 201, 201]);
    expect(responses[3].status).toBe(429);
  });

  it("blocks login after 5 failed attempts for one account", async () => {
    const responses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(
        await invoke(
          jsonRequest("/api/auth/login", {
            email: "brute-force@example.com",
            password: "wrongpass",
          })
        )
      );
    }

    expect(responses.slice(0, 5).map((response) => response.status)).toEqual([
      401, 401, 401, 401, 401,
    ]);
    expect(responses[5].status).toBe(429);
  });

  it("keeps rate limits independent per account", async () => {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await invoke(
        jsonRequest("/api/auth/login", { email: "locked@example.com", password: "wrongpass" })
      );
    }

    const other = await invoke(
      jsonRequest("/api/auth/login", { email: "untouched@example.com", password: "wrongpass" })
    );

    expect(other.status).toBe(401);
  });

  it("rejects a PBKDF2 iteration count above the Workers maximum", async () => {
    const response = await invoke(
      jsonRequest("/api/auth/signup", {
        email: "over-iterations@example.com",
        password: "secret123",
      }),
      { PBKDF2_ITERATIONS: "600000" }
    );

    expect(response.status).toBe(500);
    expect(await responseJson(response)).toMatchObject({
      error: { code: "internal" },
    });
  });
});
