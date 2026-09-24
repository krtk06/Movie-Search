import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const Motion = motion;

export default function MagneticButton({
  children,
  className = "",
  strength = 0.4,
  as: Tag = "button", // eslint-disable-line no-unused-vars
  ...rest
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Motion.div style={{ x: sx, y: sy, display: "inline-block" }}>
      <Tag
        ref={ref}
        className={className}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        {...rest}
      >
        {children}
      </Tag>
    </Motion.div>
  );
}
