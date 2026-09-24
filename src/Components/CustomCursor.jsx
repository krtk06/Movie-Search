import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const Motion = motion;

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useSpring(cursorX, { damping: 28, stiffness: 220, mass: 0.6 });
  const ringY = useSpring(cursorY, { damping: 28, stiffness: 220, mass: 0.6 });
  const dotX = useSpring(cursorX, { damping: 50, stiffness: 700, mass: 0.2 });
  const dotY = useSpring(cursorY, { damping: 50, stiffness: 700, mass: 0.2 });

  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState("");
  const [hidden, setHidden] = useState(false);
  const lastRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const move = (e) => {
      const now = performance.now();
      if (now - lastRef.current < 8) return;
      lastRef.current = now;
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    const onEnter = () => setHidden(false);
    const onLeave = () => setHidden(true);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);

    const updateHover = (e) => {
      const t = e.target;
      if (!t) return;
      const interactive = t.closest?.("a, button, [data-cursor]");
      if (interactive) {
        setHover(true);
        const l = interactive.getAttribute("data-cursor");
        setLabel(l || "");
      } else {
        setHover(false);
        setLabel("");
      }
    };
    document.addEventListener("mouseover", updateHover);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", updateHover);
    };
  }, [cursorX, cursorY]);

  if (hidden) return null;

  return (
    <>
      <Motion.div
        className={`cursor-ring ${hover ? "hover" : ""}`}
        style={{
          x: ringX,
          y: ringY,
        }}
      >
        {label && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--accent)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        )}
      </Motion.div>
      <Motion.div
        className={`cursor-dot ${hover ? "hover" : ""}`}
        style={{
          x: dotX,
          y: dotY,
        }}
      />
    </>
  );
}
