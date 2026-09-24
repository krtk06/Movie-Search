import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "cinephile_users";
const SESSION_KEY = "cinephile_session";

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

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem(SESSION_KEY);
    if (savedEmail) {
      const users = getUsers();
      if (users[savedEmail]) {
        setUser({ email: savedEmail });
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const users = getUsers();
    const stored = users[email.toLowerCase()];
    if (!stored || stored.password !== hash(password)) {
      throw new Error("Invalid email or password");
    }
    localStorage.setItem(SESSION_KEY, email.toLowerCase());
    setUser({ email: email.toLowerCase() });
  };

  const signup = async (email, password) => {
    const users = getUsers();
    const key = email.toLowerCase();
    if (users[key]) {
      throw new Error("An account with this email already exists");
    }
    users[key] = { password: hash(password), createdAt: Date.now() };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, key);
    setUser({ email: key });
  };

  const logout = async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = { user, loading, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
