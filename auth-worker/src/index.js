const MAX_BODY_BYTES = 8 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_BYTES = 32;
const SESSION_TTL_DAYS_DEFAULT = 30;
const PBKDF2_ITERATIONS_DEFAULT = 100000;
const PBKDF2_ITERATIONS_MAX = 100000;
const LOGIN_RATE_LIMIT_MAX = 5;
const SIGNUP_RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function b64encode(bytes) {
  let value = "";
  const array = new Uint8Array(bytes);
  for (let index = 0; index < array.length; index += 1) {
    value += String.fromCharCode(array[index]);
  }
  return btoa(value);
}

function b64decode(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function b64urlEncode(bytes) {
  return b64encode(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256Hex(input) {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  return crypto.subtle.timingSafeEqual(left, right);
}

function parseIterations(env) {
  const iterations = Number.parseInt(env.PBKDF2_ITERATIONS || "", 10);
  if (!Number.isFinite(iterations) || iterations < 1000) return PBKDF2_ITERATIONS_DEFAULT;
  if (iterations > PBKDF2_ITERATIONS_MAX) {
    throw new Error(
      `PBKDF2_ITERATIONS ${iterations} exceeds the Cloudflare Workers maximum of ${PBKDF2_ITERATIONS_MAX}`
    );
  }
  return iterations;
}

async function derivePassword(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
}

async function hashPassword(password, iterations) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await derivePassword(password, salt, iterations);
  return `pbkdf2-sha256$${iterations}$${b64encode(salt)}$${b64encode(bits)}`;
}

async function verifyPassword(password, stored) {
  const parts = String(stored || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") return false;

  const iterations = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations < 1) return false;

  let salt;
  let expected;
  try {
    salt = b64decode(parts[2]);
    expected = b64decode(parts[3]);
  } catch {
    return false;
  }

  const bits = await derivePassword(password, salt, iterations);
  return constantTimeEqual(new Uint8Array(bits), expected);
}

function dummyPasswordHash(iterations) {
  return `pbkdf2-sha256$${iterations}$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`;
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  return !origin || origin === env.ALLOWED_ORIGIN;
}

function responseHeaders(request, env) {
  const origin = request.headers.get("Origin");
  return {
    ...(origin && origin === env.ALLOWED_ORIGIN
      ? { "Access-Control-Allow-Origin": origin }
      : {}),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
  };
}

function json(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...responseHeaders(request, env),
    },
  });
}

function errorResponse(request, env, code, message, status) {
  return json(request, env, { error: { code, message } }, status);
}

async function readBoundedText(request) {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

async function readJson(request) {
  const contentLength = Number.parseInt(request.headers.get("Content-Length") || "0", 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { tooLarge: true };
  }

  try {
    const text = await readBoundedText(request);
    if (text === null) return { tooLarge: true };
    return { body: text ? JSON.parse(text) : {} };
  } catch {
    return { invalid: true };
  }
}

function bearerToken(request) {
  const header = request.headers.get("Authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  const token = match ? match[1].trim() : "";
  return token.length >= 20 && token.length <= 200 ? token : "";
}

function cleanEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return "";
  return email;
}

function cleanPassword(value) {
  const password = String(value || "");
  if (password.length < 6 || password.length > 128) return "";
  return password;
}

function sessionTtlMs(env) {
  const days = Number.parseInt(env.SESSION_TTL_DAYS || "", 10);
  const safeDays =
    Number.isFinite(days) && days >= 1 && days <= 365 ? days : SESSION_TTL_DAYS_DEFAULT;
  return safeDays * 24 * 60 * 60 * 1000;
}

async function createSession(env, userId) {
  const token = b64urlEncode(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)));
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(await sha256Hex(token), userId, now + sessionTtlMs(env), now)
    .run();
  return token;
}

async function getSessionUser(env, token) {
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT s.user_id AS userId, u.email AS email
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`
  )
    .bind(await sha256Hex(token), Date.now())
    .first();
  return row ? { id: row.userId, email: row.email } : null;
}

async function deleteSession(env, token) {
  if (!token) return;
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
    .bind(await sha256Hex(token))
    .run();
}

async function enforceRateLimit(env, key, limit, windowMs) {
  const now = Date.now();
  const windowStart = now - (now % windowMs);

  const [counted] = await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO rate_limits (key, hits, window_start) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET
         hits = CASE
           WHEN rate_limits.window_start = excluded.window_start
             THEN rate_limits.hits + 1
           ELSE 1
         END,
         window_start = excluded.window_start
       RETURNING hits`
    ).bind(key, windowStart),
    env.DB.prepare(
      `DELETE FROM rate_limits
       WHERE window_start < ?
         AND key IN (SELECT key FROM rate_limits WHERE window_start < ? LIMIT 200)`
    ).bind(windowStart, windowStart),
  ]);

  const row = counted.results[0];
  const hits = row ? Number(row.hits) : 1;
  return hits <= limit;
}

async function handleSignup(request, env) {
  const client = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await enforceRateLimit(
    env,
    await sha256Hex(`signup:${client}`),
    SIGNUP_RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS
  );
  if (!allowed) {
    return errorResponse(
      request,
      env,
      "rate_limited",
      "Too many attempts — try again shortly.",
      429
    );
  }

  const parsed = await readJson(request);
  if (parsed.tooLarge) {
    return errorResponse(request, env, "payload_too_large", "Request body is too large.", 413);
  }
  if (parsed.invalid || !parsed.body) {
    return errorResponse(request, env, "bad_request", "Invalid JSON body.", 400);
  }

  const email = cleanEmail(parsed.body.email);
  if (!email) {
    return errorResponse(request, env, "invalid_email", "Please enter a valid email address.", 400);
  }
  const password = cleanPassword(parsed.body.password);
  if (!password) {
    return errorResponse(
      request,
      env,
      "weak_password",
      "Password should be at least 6 characters.",
      400
    );
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();
  if (existing) {
    return errorResponse(
      request,
      env,
      "email_taken",
      "An account with this email already exists.",
      409
    );
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password, parseIterations(env));
  await env.DB.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)")
    .bind(id, email, passwordHash, Date.now())
    .run();

  const token = await createSession(env, id);
  return json(request, env, { user: { id, email }, token }, 201);
}

async function handleLogin(request, env) {
  const parsed = await readJson(request);
  if (parsed.tooLarge) {
    return errorResponse(request, env, "payload_too_large", "Request body is too large.", 413);
  }
  if (parsed.invalid || !parsed.body) {
    return errorResponse(request, env, "bad_request", "Invalid JSON body.", 400);
  }

  const email = cleanEmail(parsed.body.email);
  const password = String(parsed.body.password || "");
  if (!email || !password) {
    return errorResponse(
      request,
      env,
      "invalid_credentials",
      "Incorrect email or password.",
      401
    );
  }

  const row = await env.DB.prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .bind(email)
    .first();
  const passwordHash = row?.password_hash || dummyPasswordHash(parseIterations(env));
  const valid = await verifyPassword(password, passwordHash);

  if (!row || !valid) {
    const allowed = await enforceRateLimit(
      env,
      await sha256Hex(`login:${email}`),
      LOGIN_RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW_MS
    );
    if (!allowed) {
      return errorResponse(
        request,
        env,
        "rate_limited",
        "Too many attempts — try again shortly.",
        429
      );
    }
    return errorResponse(
      request,
      env,
      "invalid_credentials",
      "Incorrect email or password.",
      401
    );
  }

  const token = await createSession(env, row.id);
  return json(request, env, { user: { id: row.id, email: row.email }, token });
}

async function handleLogout(request, env) {
  await deleteSession(env, bearerToken(request));
  return json(request, env, { ok: true });
}

async function handleMe(request, env) {
  const user = await getSessionUser(env, bearerToken(request));
  if (!user) return errorResponse(request, env, "unauthorized", "Not signed in.", 401);
  return json(request, env, { user });
}

export default {
  async fetch(request, env) {
    try {
      if (!isAllowedOrigin(request, env)) {
        return errorResponse(request, env, "origin_forbidden", "Origin is not allowed.", 403);
      }

      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: responseHeaders(request, env) });
      }

      const url = new URL(request.url);
      if (url.pathname === "/api/health" && request.method === "GET") {
        return json(request, env, { ok: true });
      }
      if (url.pathname === "/api/auth/signup" && request.method === "POST") {
        return await handleSignup(request, env);
      }
      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        return await handleLogin(request, env);
      }
      if (url.pathname === "/api/auth/logout" && request.method === "POST") {
        return await handleLogout(request, env);
      }
      if (url.pathname === "/api/auth/me" && request.method === "GET") {
        return await handleMe(request, env);
      }

      return errorResponse(request, env, "not_found", "Unknown endpoint.", 404);
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          message: "unhandled",
          detail: String(error?.message || error),
        })
      );
      return errorResponse(
        request,
        env,
        "internal",
        "Something went wrong. Please try again.",
        500
      );
    }
  },
};
