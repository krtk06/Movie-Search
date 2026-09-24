import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

const Motion = motion;

export default function TiltCard({
  children,
  className = "",
  maxTilt = 6,
  glare = true,
  ...rest
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 22, mass: 0.4 });
  const rotY = useTransform(sx, (v) => (v / 100) * maxTilt);
  const rotX = useTransform(sy, (v) => -(v / 100) * maxTilt);
  const glX = useTransform(sx, [-100, 100], ["0%", "100%"]);
  const glY = useTransform(sy, [-100, 100], ["0%", "100%"]);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Motion.div
      ref={ref}
      className={className}
      style={{
        rotateY: rotY,
        rotateX: rotX,
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
        position: "relative",
        willChange: "transform",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
      {glare && (
        <Motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle at ${glX} ${glY}, rgba(234, 227, 210, 0.18), transparent 55%)`,
            mixBlendMode: "overlay",
            zIndex: 5,
            opacity: 0,
            transition: "opacity 0.4s",
          }}
          whileHover={{ opacity: 1 }}
        />
      )}
    </Motion.div>
  );
}
