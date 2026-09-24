import { motion, useScroll, useSpring } from "motion/react";

const Motion = motion;

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="scroll-progress">
      <Motion.div
        className="scroll-progress-bar"
        style={{ scaleX }}
      />
    </div>
  );
}
