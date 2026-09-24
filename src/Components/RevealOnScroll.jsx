import { useRef } from "react";
import { motion, useInView } from "motion/react"; // eslint-disable-line no-unused-vars

export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  y = 32,
  duration = 0.8,
  once = true,
  ...rest
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    margin: "0px 0px -60px 0px",
    amount: 0.12,
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
