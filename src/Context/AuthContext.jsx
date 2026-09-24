import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../lib/firebase";

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

/* Cheap demo-mode credential obfuscation (not real security). */
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}

const FIREBASE_ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/invalid-email": "Please enter a valid email address",
  "auth/weak-password": "Password should be at least 6 characters",
  "auth/user-not-found": "No account found with that email",
  "auth/wrong-password": "Incorrect email or password",
  "auth/invalid-credential": "Incorrect email or password",
  "auth/too-many-requests": "Too many attempts — try again shortly",
  "auth/network-request-failed": "Network error — check your connection",
};

function firebaseMessage(err) {
  const code = err?.code || "";
  if (FIREBASE_ERRORS[code]) return FIREBASE_ERRORS[code];
  return (
    err?.message?.replace(/^Firebase:\s*/, "").replace(/\s*\(auth\/[\w-]+\)\.?/, "") ||
    "Authentication failed"
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const isDemo = !isFirebaseConfigured;

  useEffect(() => {
    if (isFirebaseConfigured) {
      const auth = getFirebaseAuth();
      if (!auth) {
        setLoading(false);
        return;
      }
      const unsubscribe = onAuthStateChanged(
        auth,
        (fbUser) => {
          setUser(fbUser ? { uid: fbUser.uid, email: fbUser.email } : null);
          setLoading(false);
        },
        () => setLoading(false)
      );
      return unsubscribe;
    }

    // Demo mode: restore a local session.
    const savedEmail = localStorage.getItem(SESSION_KEY);
    if (savedEmail) {
      const users = getUsers();
      if (users[savedEmail]) {
        setUser({ uid: savedEmail, email: savedEmail });
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, [isDemo]);

  const login = async (email, password) => {
    const address = email.toLowerCase();
    if (isFirebaseConfigured) {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Authentication is not configured");
      try {
        await signInWithEmailAndPassword(auth, address, password);
      } catch (err) {
        throw new Error(firebaseMessage(err));
      }
      return;
    }
    const users = getUsers();
    const stored = users[address];
    if (!stored || stored.password !== hash(password)) {
      throw new Error("Invalid email or password");
    }
    localStorage.setItem(SESSION_KEY, address);
    setUser({ uid: address, email: address });
  };

  const signup = async (email, password) => {
    const address = email.toLowerCase();
    if (isFirebaseConfigured) {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Authentication is not configured");
      try {
        await createUserWithEmailAndPassword(auth, address, password);
      } catch (err) {
        throw new Error(firebaseMessage(err));
      }
      return;
    }
    const users = getUsers();
    if (users[address]) {
      throw new Error("An account with this email already exists");
    }
    users[address] = { password: hash(password), createdAt: Date.now() };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, address);
    setUser({ uid: address, email: address });
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
      return;
    }
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = { user, loading, login, signup, logout, isDemo };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
