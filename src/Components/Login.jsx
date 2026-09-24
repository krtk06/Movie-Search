import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "motion/react"; // eslint-disable-line no-unused-vars
import { Eye, EyeOff, AlertCircle, ArrowUpRight } from "./PixelIcon";
import RevealOnScroll from "./RevealOnScroll";
import MagneticButton from "./MagneticButton";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, isDemo } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-side">
        <div className="login-video-bg">
          <video autoPlay muted loop playsInline>
            <source src="/video/login-bg.mp4" type="video/mp4" />
          </video>
          <div className="login-video-overlay" />
        </div>

        <div className="login-side-logo">
          <span className="accent">CINE</span>MART
        </div>

        <div className="login-side-quote">
          <p>“Movies are the closest thing we have to time travel.”</p>
          <span>Welcome to the Collection</span>
        </div>

        <div className="login-side-foot">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <span className="dot" />
            <span>MMXXVI · Vol. 1</span>
          </span>
          <span>
            Now playing: <em>You, entering</em>
          </span>
        </div>
      </div>

      <div className="login-form-side">
        <motion.div
          className="login-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="login-title-block">
            <div className="eyebrow">{isSignup ? "Create Account" : "Welcome Back"}</div>
            <h2>
              {isSignup ? (
                <>
                  Join the <span className="accent">Cinema</span>.
                </>
              ) : (
                <>
                  Step back <span className="accent">in</span>.
                </>
              )}
            </h2>
            <p>
              {isSignup
                ? "Build a personal collection. Track films. Return to scenes."
                : "Continue your journey. Your collection is waiting."}
            </p>
          </div>

          {isDemo && (
            <div className="login-demo-note">
              <AlertCircle className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
              <span>Demo mode — accounts live in this browser until Firebase keys are configured.</span>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                className="login-error"
                role="alert"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <AlertCircle className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate>
            <RevealOnScroll y={16} delay={0.2}>
              <div className="field">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@cinema.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </RevealOnScroll>

            <RevealOnScroll y={16} delay={0.3}>
              <div className="field password-field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="pw-toggle"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </RevealOnScroll>

            <RevealOnScroll y={16} delay={0.4}>
              <MagneticButton
                strength={0.2}
                as="button"
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                <span>{loading ? "…" : isSignup ? "Create Account" : "Enter"}</span>
                <ArrowUpRight className="w-4 h-4" />
              </MagneticButton>
            </RevealOnScroll>
          </form>

          <RevealOnScroll y={10} delay={0.5}>
            <p className="login-toggle">
              {isSignup ? "Already a member?" : "Not yet a member?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
              >
                {isSignup ? "Sign In" : "Create Account"}
              </button>
            </p>
          </RevealOnScroll>
        </motion.div>
      </div>
    </div>
  );
}
