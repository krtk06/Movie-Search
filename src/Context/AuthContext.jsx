import React, { createContext, useContext, useEffect, useState } from "react";
import {
  cloudflareLogin,
  cloudflareLogout,
  cloudflareMe,
  cloudflareSignup,
  isCloudflareConfigured,
} from "../lib/cloudflare-auth";

const AuthContext = createContext(null);
const USERS_KEY = "cinephile_users";
const DEMO_SESSION_KEY = "cinephile_session";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hash(value) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result << 5) - result + value.charCodeAt(index);
    result |= 0;
  }
  return result.toString(36);
}

function getDemoUser() {
  try {
    const email = localStorage.getItem(DEMO_SESSION_KEY);
    const users = getUsers();
    return email && users[email] ? { uid: email, email } : null;
  } catch {
    return null;
  }
}

function normalizeUser(user) {
  return { uid: user.id, email: user.email };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }) {
  const isDemo = !isCloudflareConfigured;
  const [user, setUser] = useState(() => (isDemo ? getDemoUser() : null));
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    let active = true;

    if (isDemo) {
      setLoading(false);
    } else {
      cloudflareMe()
        .then((remoteUser) => {
          if (!active) return;
          setUser(remoteUser ? normalizeUser(remoteUser) : null);
        })
        .catch(() => {
          if (!active) return;
          setUser(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [isDemo]);

  const login = async (email, password) => {
    const address = email.trim().toLowerCase();

    if (!isDemo) {
      const remoteUser = await cloudflareLogin(address, password);
      setUser(normalizeUser(remoteUser));
      return;
    }

    const users = getUsers();
    const stored = users[address];
    if (!stored || stored.password !== hash(password)) {
      throw new Error("Invalid email or password");
    }
    localStorage.setItem(DEMO_SESSION_KEY, address);
    setUser({ uid: address, email: address });
  };

  const signup = async (email, password) => {
    const address = email.trim().toLowerCase();

    if (!isDemo) {
      const remoteUser = await cloudflareSignup(address, password);
      setUser(normalizeUser(remoteUser));
      return;
    }

    const users = getUsers();
    if (users[address]) {
      throw new Error("An account with this email already exists");
    }
    users[address] = { password: hash(password), createdAt: Date.now() };
    saveUsers(users);
    localStorage.setItem(DEMO_SESSION_KEY, address);
    setUser({ uid: address, email: address });
  };

  const logout = async () => {
    if (!isDemo) {
      try {
        await cloudflareLogout();
      } finally {
        setUser(null);
      }
      return;
    }

    localStorage.removeItem(DEMO_SESSION_KEY);
    setUser(null);
  };

  const value = { user, loading, login, signup, logout, isDemo };

  return (
    <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
  );
}
