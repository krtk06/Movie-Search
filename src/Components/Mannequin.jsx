import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

const Motion = motion;

/* ═══════════════════════════════════════════════════════════════
   FACE GEOMETRY (viewBox 100 × 130)
   ─────────────────────────────────────────
   Face center:      (50, 50),  rx=22, ry=24
   Eyes:             (41, 48)  and  (59, 48)        — symmetric around x=50
   Eye dimensions:   rx=4.5, ry=5.5                  — eye span y=42.5 to y=53.5
   Eyebrows:         width 14, sit at y=37-41        — proper arched shapes
                     Left  brow: x=34 (outer) → x=48 (inner)
                     Right brow: x=52 (inner) → x=66 (outer)
   Nose:             tiny indication at x=50, y=52-58
   Mouth:            center x=50, span x=42-58       — 16 wide
                     y=58-64
═══════════════════════════════════════════════════════════════ */

const BROW_LEFT_PATH = (mode) => {
  switch (mode) {
    case "neutral":  return "M 34 39 Q 41 37 48 39";
    case "sad":      return "M 34 38 Q 41 40 48 41";
    case "crying":   return "M 34 41 Q 41 38 48 36";
    case "happy":    return "M 34 38 Q 41 34 48 37";
    case "serious":  return "M 34 36 L 48 40";
    case "angry":    return "M 34 35 L 48 42";
    default:        return "M 34 39 Q 41 37 48 39";
  }
};
const BROW_RIGHT_PATH = (mode) => {
  switch (mode) {
    case "neutral":  return "M 52 39 Q 59 37 66 39";
    case "sad":      return "M 52 41 Q 59 40 66 38";
    case "crying":   return "M 52 36 Q 59 38 66 41";
    case "happy":    return "M 52 37 Q 59 34 66 38";
    case "serious":  return "M 52 40 L 66 36";
    case "angry":    return "M 52 42 L 66 35";
    default:        return "M 52 39 Q 59 37 66 39";
  }
};

const EXPRESSIONS = {
  neutral: {
    mouth: "M 44 60 Q 50 62 56 60",
    mouthFill: false,
    mouthFillColor: "#FF6B8A",
    eyeOpen: 1,
    blush: 0,
    tears: 0,
    leftEyeClosed: false,
    upperLid: 0,
  },
  sad: {
    mouth: "M 44 62 Q 50 56 56 62",
    mouthFill: false,
    mouthFillColor: "#FF6B8A",
    eyeOpen: 0.9,
    blush: 0.1,
    tears: 0,
    leftEyeClosed: false,
    upperLid: 0.2,
  },
  crying: {
    mouth: "M 43 63 Q 50 56 57 63 Q 50 65 43 63 Z",
    mouthFill: true,
    mouthFillColor: "#3A1A2A",
    eyeOpen: 0.85,
    blush: 0.25,
    tears: 1,
    leftEyeClosed: false,
    upperLid: 0.15,
  },
  happy: {
    mouth: "M 42 58 Q 50 70 58 58",
    mouthFill: true,
    mouthFillColor: "#FF6B8A",
    eyeOpen: 0.45,
    blush: 0.7,
    tears: 0,
    leftEyeClosed: false,
    upperLid: 0.55,
    showTeeth: true,
  },
  serious: {
    mouth: "M 44 60 L 56 60",
    mouthFill: false,
    mouthFillColor: "#FF6B8A",
    eyeOpen: 1,
    blush: 0,
    tears: 0,
    leftEyeClosed: false,
    upperLid: 0.1,
  },
  angry: {
    mouth: "M 44 63 Q 50 60 56 63",
    mouthFill: false,
    mouthFillColor: "#FF6B8A",
    eyeOpen: 0.8,
    blush: 0.2,
    tears: 0,
    leftEyeClosed: false,
    upperLid: 0.25,
  },
};

const ORDER = ["sad", "crying", "happy", "serious", "angry"];

export default function Mannequin() {
  const svgRef = useRef(null);
  const [expression, setExpression] = useState("neutral");
  const [clickCount, setClickCount] = useState(0);
  const [autoResetTimer, setAutoResetTimer] = useState(null);
  const [clickPulse, setClickPulse] = useState(0);
  const [tearKey, setTearKey] = useState(0);

  // Pupil follow
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springPx = useSpring(px, { stiffness: 120, damping: 18, mass: 0.6 });
  const springPy = useSpring(py, { stiffness: 120, damping: 18, mass: 0.6 });

  // Head tilt
  const headTilt = useMotionValue(0);
  const headTiltSpring = useSpring(headTilt, { stiffness: 90, damping: 16 });

  // Blush
  const blushOpacity = useMotionValue(0);
  const blushSpring = useSpring(blushOpacity, { stiffness: 100, damping: 18 });

  // Breathing
  const breath = useMotionValue(0);
  useEffect(() => {
    let t = 0;
    let raf;
    const tick = () => {
      t += 0.012;
      breath.set(Math.sin(t) * 0.5 + 0.5);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [breath]);

  // Eye blink
  const blink = useMotionValue(0);
  useEffect(() => {
    let cancelled = false;
    const schedule = () => {
      if (cancelled) return;
      const wait = 2400 + Math.random() * 3600;
      setTimeout(() => {
        if (cancelled) return;
        blink.set(1);
        setTimeout(() => {
          if (!cancelled) blink.set(0);
        }, 140);
        schedule();
      }, wait);
    };
    schedule();
    return () => {
      cancelled = true;
    };
  }, [blink]);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e) => {
      const el = svgRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const norm = Math.min(1, dist / 500);
      const maxR = 2.4;
      const angle = Math.atan2(dy, dx);
      const r = norm * maxR;
      px.set(Math.cos(angle) * r);
      py.set(Math.sin(angle) * r);
      headTilt.set(((e.clientX - cx) / window.innerWidth) * 0.1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [px, py, headTilt]);

  // Apply expression to motion values
  useEffect(() => {
    const exp = EXPRESSIONS[expression] || EXPRESSIONS.neutral;
    blushOpacity.set(exp.blush);
    if (exp.tears) {
      setTearKey((k) => k + 1);
    }
  }, [expression, blushOpacity]);

  const handleClick = () => {
    const next = ORDER[clickCount % ORDER.length];
    setClickCount((c) => c + 1);
    setExpression(next);
    setClickPulse((p) => p + 1);
    headTilt.set((Math.random() - 0.5) * 0.18);

    if (autoResetTimer) clearTimeout(autoResetTimer);
    const t = setTimeout(() => {
      setExpression("neutral");
    }, 3000);
    setAutoResetTimer(t);
  };

  const exp = EXPRESSIONS[expression] || EXPRESSIONS.neutral;

  // Pupils follow cursor
  const lpX = useTransform(springPx, (v) => 41 + v);
  const lpY = useTransform(springPy, (v) => 48 + v);
  const rpX = useTransform(springPx, (v) => 59 + v);
  const rpY = useTransform(springPy, (v) => 48 + v);

  // Eye openness combines blink, expression, and upper-lid (squint)
  const leftEyeScaleY = useTransform(blink, (b) => {
    if (exp.leftEyeClosed) return 0.08;
    if (b > 0.5) return 0.08;
    return exp.eyeOpen;
  });
  const rightEyeScaleY = useTransform(blink, (b) => {
    if (b > 0.5) return 0.08;
    return exp.eyeOpen;
  });

  const bodyY = useTransform(breath, (b) => b * 1.4 - 0.7);
  const headBob = useTransform(breath, (b) => b * 0.6 - 0.3);
  const hairTilt = useTransform(breath, (b) => (b - 0.5) * 1.2);

  // Render tears
  const renderTears = () => {
    if (!exp.tears) return null;
    const tears = [
      { x: 38, delay: 0 },
      { x: 44, delay: 0.5 },
      { x: 56, delay: 0.25 },
      { x: 62, delay: 0.75 },
    ];
    return tears.map((t, i) => (
      <Motion.g
        key={`${tearKey}-${i}`}
        initial={{ y: 0, opacity: 0, scale: 0.5 }}
        animate={{ y: 18, opacity: [0, 0.95, 0.7, 0], scale: 1 }}
        transition={{ duration: 1.8, delay: t.delay, ease: "easeIn" }}
      >
        <path
          d={`M ${t.x} 51 Q ${t.x - 0.6} 53.5 ${t.x} 54.5 Q ${t.x + 0.6} 53.5 ${t.x} 51 Z`}
          fill="#5B8DEF"
        />
        <circle cx={t.x - 0.2} cy="52.3" r="0.2" fill="#A8C5FF" opacity="0.8" />
      </Motion.g>
    ));
  };

  return (
    <div
      className="mannequin-wrap"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      data-cursor={clickCount === 0 ? "Tap Me" : "Tap Again"}
    >
      <Motion.svg
        ref={svgRef}
        viewBox="0 0 100 130"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient id="faceShade" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#2A3B66" />
            <stop offset="60%" stopColor="#1A2541" />
            <stop offset="100%" stopColor="#0A1020" />
          </radialGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3A4D80" />
            <stop offset="100%" stopColor="#0A1020" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1F3578" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="collarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A1020" />
            <stop offset="100%" stopColor="#1A2541" />
          </linearGradient>
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B8A" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FF6B8A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cheekLight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#5B8DEF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="irisGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7FB3FF" />
            <stop offset="100%" stopColor="#3D6BC7" />
          </linearGradient>
        </defs>

        {/* Floating particles */}
        {[
          { x: 10, y: 20, d: 0 },
          { x: 88, y: 30, d: 0.6 },
          { x: 12, y: 75, d: 1.2 },
          { x: 90, y: 82, d: 0.4 },
          { x: 50, y: 4, d: 0.9 },
          { x: 6, y: 50, d: 1.5 },
          { x: 94, y: 55, d: 0.3 },
        ].map((p, i) => (
          <Motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="0.7"
            fill="#5B8DEF"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -8, -16],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              delay: p.d,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* ═══ BODY / SHOULDERS ═══ */}
        <Motion.g style={{ y: bodyY }}>
          <path
            d="M 18 130 Q 20 100 34 90 L 66 90 Q 80 100 82 130 Z"
            fill="url(#bodyGrad)"
          />
          {/* Collar — turtleneck style */}
          <path
            d="M 34 90 Q 40 84 50 84 Q 60 84 66 90 L 64 96 Q 57 92 50 92 Q 43 92 36 96 Z"
            fill="url(#collarGrad)"
          />
          <path
            d="M 44 92 Q 50 96 56 92"
            stroke="#5B8DEF"
            strokeWidth="0.4"
            fill="none"
            opacity="0.5"
          />
          {/* Small pendant/zipper detail */}
          <circle cx="50" cy="100" r="0.8" fill="#A8C5FF" opacity="0.7" />
        </Motion.g>

        {/* Neck */}
        <rect x="44" y="82" width="12" height="10" fill="#0F1422" />
        <path d="M 44 84 Q 50 87 56 84" stroke="#2A3B66" strokeWidth="0.3" fill="none" opacity="0.4" />

        {/* ═══ HEAD GROUP ═══ */}
        <Motion.g
          style={{
            rotate: headTiltSpring,
            y: headBob,
            transformOrigin: "50px 75px",
          }}
        >
          {/* Hair back / silhouette */}
          <ellipse cx="50" cy="48" rx="27" ry="24" fill="url(#hairGrad)" />

          {/* Face base */}
          <ellipse
            cx="50"
            cy="50"
            rx="22"
            ry="24"
            fill="url(#faceShade)"
          />

          {/* Face highlight (light from upper-left) */}
          <ellipse
            cx="42"
            cy="44"
            rx="8"
            ry="12"
            fill="url(#cheekLight)"
          />

          {/* Hair front (fringe) */}
          <path
            d="M 28 42 Q 35 27 50 25 Q 65 27 72 42 Q 68 35 60 36 Q 50 30 40 36 Q 32 35 28 42 Z"
            fill="url(#hairGrad)"
          />
          {/* Center part highlight */}
          <path
            d="M 50 26 L 49 36"
            stroke="#5B8DEF"
            strokeWidth="0.3"
            opacity="0.3"
          />
          {/* Side hair */}
          <path
            d="M 28 42 Q 25 58 30 74 Q 28 60 28 42 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 72 42 Q 75 58 70 74 Q 72 60 72 42 Z"
            fill="url(#hairGrad)"
          />

          {/* Hair flowing strands */}
          <Motion.g
            style={{ rotate: hairTilt, transformOrigin: "50px 30px" }}
          >
            <path
              d="M 36 30 Q 33 40 35 50"
              stroke="#5B8DEF"
              strokeWidth="0.5"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M 64 30 Q 67 40 65 50"
              stroke="#5B8DEF"
              strokeWidth="0.5"
              fill="none"
              opacity="0.55"
            />
          </Motion.g>

          {/* Ears */}
          <ellipse cx="28" cy="50" rx="2.5" ry="4" fill="#1A2541" />
          <ellipse cx="72" cy="50" rx="2.5" ry="4" fill="#1A2541" />
          <path d="M 28 49 Q 27 50 28 51" stroke="#5B8DEF" strokeWidth="0.3" fill="none" opacity="0.4" />
          <path d="M 72 49 Q 73 50 72 51" stroke="#5B8DEF" strokeWidth="0.3" fill="none" opacity="0.4" />

          {/* Cheek blush */}
          <Motion.ellipse
            cx="35"
            cy="57"
            rx="4.5"
            ry="2.5"
            fill="url(#blushGrad)"
            style={{ opacity: blushSpring }}
          />
          <Motion.ellipse
            cx="65"
            cy="57"
            rx="4.5"
            ry="2.5"
            fill="url(#blushGrad)"
            style={{ opacity: blushSpring }}
          />

          {/* ═══ EYEBROWS — filled arch shapes ═══ */}
          <path
            d={BROW_LEFT_PATH(expression) + " L 47 40 L 47 39 Z"}
            fill="#2A3B66"
            opacity="0.85"
          />
          <path
            d={BROW_RIGHT_PATH(expression) + " L 53 39 L 53 40 Z"}
            fill="#2A3B66"
            opacity="0.85"
          />
          {/* Brow highlight */}
          <path
            d={BROW_LEFT_PATH(expression)}
            stroke="#A8C5FF"
            strokeWidth="0.4"
            fill="none"
            opacity="0.6"
            strokeLinecap="round"
          />
          <path
            d={BROW_RIGHT_PATH(expression)}
            stroke="#A8C5FF"
            strokeWidth="0.4"
            fill="none"
            opacity="0.6"
            strokeLinecap="round"
          />

          {/* ═══ EYES — at y=48, x=41 and x=59 ═══ */}
          {expression === "happy" ? (
            /* Happy: clean upward-curved closed eye (⌒) — no anatomy to misalign */
            <>
              <path
                d="M 36 48.5 Q 41 43.5 46 48.5"
                stroke="#1A2541"
                strokeWidth="1.3"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 54 48.5 Q 59 43.5 64 48.5"
                stroke="#1A2541"
                strokeWidth="1.3"
                fill="none"
                strokeLinecap="round"
              />
              {/* Subtle blush-arc under each happy eye for warmth */}
              <path
                d="M 37 50 Q 41 51 45 50"
                stroke="#FF6B8A"
                strokeWidth="0.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.45"
              />
              <path
                d="M 55 50 Q 59 51 63 50"
                stroke="#FF6B8A"
                strokeWidth="0.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.45"
              />
            </>
          ) : (
            /* All other expressions: full eye anatomy, scaled to eyeOpen */
            <>
              {/* Left Eye */}
              <Motion.g
                style={{
                  scaleY: leftEyeScaleY,
                  transformOrigin: "41px 48px",
                }}
              >
                <ellipse cx="41" cy="48" rx="4.5" ry="5.5" fill="#E6ECF7" />
                <circle cx="41" cy="48" r="3.6" fill="#3D6BC7" />
                <circle cx="41" cy="48" r="3.6" fill="url(#irisGrad)" opacity="0.5" />
                <Motion.circle
                  cx="41"
                  cy="48"
                  r="1.7"
                  fill="#0A1020"
                  style={{ x: lpX, y: lpY }}
                />
                <circle cx="39.5" cy="46.5" r="0.9" fill="#FFFFFF" opacity="0.95" />
                <circle cx="42.5" cy="49.5" r="0.3" fill="#FFFFFF" opacity="0.7" />
                <path
                  d="M 36.5 48 Q 41 42.5 45.5 48"
                  stroke="#1A2541"
                  strokeWidth="0.8"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 45.3 47 L 46 46.5"
                  stroke="#1A2541"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 36.5 49 Q 41 51 45.5 49"
                  stroke="#2A3B66"
                  strokeWidth="0.3"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </Motion.g>

              {/* Right Eye */}
              <Motion.g
                style={{
                  scaleY: rightEyeScaleY,
                  transformOrigin: "59px 48px",
                }}
              >
                <ellipse cx="59" cy="48" rx="4.5" ry="5.5" fill="#E6ECF7" />
                <circle cx="59" cy="48" r="3.6" fill="#3D6BC7" />
                <circle cx="59" cy="48" r="3.6" fill="url(#irisGrad)" opacity="0.5" />
                <Motion.circle
                  cx="59"
                  cy="48"
                  r="1.7"
                  fill="#0A1020"
                  style={{ x: rpX, y: rpY }}
                />
                <circle cx="57.5" cy="46.5" r="0.9" fill="#FFFFFF" opacity="0.95" />
                <circle cx="60.5" cy="49.5" r="0.3" fill="#FFFFFF" opacity="0.7" />
                <path
                  d="M 54.5 48 Q 59 42.5 63.5 48"
                  stroke="#1A2541"
                  strokeWidth="0.8"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 63.3 47 L 64 46.5"
                  stroke="#1A2541"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 54.5 49 Q 59 51 63.5 49"
                  stroke="#2A3B66"
                  strokeWidth="0.3"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </Motion.g>
            </>
          )}

          {/* ═══ TEARS for crying ═══ */}
          {renderTears()}

          {/* ═══ NOSE — centered at x=50, y=52-58 ═══ */}
          <path
            d="M 50 52 Q 49 56 50 57 Q 51 57 51 58"
            stroke="#5B8DEF"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
            strokeLinecap="round"
          />
          {/* Tiny nose highlight */}
          <circle cx="50" cy="54" r="0.3" fill="#A8C5FF" opacity="0.3" />

          {/* ═══ MOUTH — centered at x=50 ═══ */}
          {exp.mouthFill ? (
            <>
              <Motion.path
                d={exp.mouth}
                fill={exp.mouthFillColor}
                stroke="#FF6B8A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ d: exp.mouth }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
              {exp.showTeeth && (
                <path
                  d="M 46 61 Q 50 63 54 61 Q 50 65 46 61 Z"
                  fill="#E6ECF7"
                  opacity="0.9"
                />
              )}
            </>
          ) : (
            <Motion.path
              d={exp.mouth}
              stroke="#FF6B8A"
              strokeWidth="1.7"
              strokeLinecap="round"
              fill="none"
              initial={false}
              animate={{ d: exp.mouth }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
          {/* Subtle lip highlight */}
          <ellipse
            cx="50"
            cy={expression === "happy" ? 60 : 59}
            rx="2"
            ry="0.4"
            fill="#FF6B8A"
            opacity={expression === "happy" ? 0.5 : 0.25}
          />
        </Motion.g>

        {/* Click pulse rings */}
        <Motion.circle
          cx="50"
          cy="55"
          r="38"
          fill="none"
          stroke="#5B8DEF"
          strokeWidth="0.6"
          key={`a-${clickPulse}`}
          initial={{ scale: 0.5, opacity: 0.7 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "50px 55px" }}
        />
        <Motion.circle
          cx="50"
          cy="55"
          r="38"
          fill="none"
          stroke="#A8C5FF"
          strokeWidth="0.4"
          key={`b-${clickPulse}`}
          initial={{ scale: 0.5, opacity: 0.5 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ transformOrigin: "50px 55px" }}
        />
      </Motion.svg>

      {/* Speech bubble */}
      <motion.div
        className="mannequin-bubble"
        key={expression + clickPulse}
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="bubble-eyebrow">
          {expression === "neutral"
            ? clickCount === 0
              ? "Tap me"
              : "Aria · idle"
            : `Aria · ${expression}`}
        </span>
        <span className="bubble-text">
          {expression === "neutral" &&
            (clickCount === 0
              ? "I watch every move you make. Click me."
              : "Still here. Still watching.")}
          {expression === "sad" && "The reel just ended… I miss it already."}
          {expression === "crying" && "Why do all good films end? *sniff*"}
          {expression === "happy" && "Wonderful to see you, friend!"}
          {expression === "serious" && "Let's keep this between us."}
          {expression === "angry" && "Talk. To. The. Hand."}
        </span>
      </motion.div>

      {clickCount === 0 && (
        <div className="mannequin-tap-hint">
          <span className="tap-dot" />
          <span>Click her</span>
        </div>
      )}
    </div>
  );
}
