import { motion, useAnimationControls } from "motion/react"; // eslint-disable-line no-unused-vars
import { useEffect, useRef } from "react";

export default function Marquee({ items = [], speed = 38 }) {
  const controls = useAnimationControls();
  const trackRef = useRef(null);
  const doubled = [...items, ...items, ...items];

  useEffect(() => {
    controls.start({
      x: ["0%", "-33.333%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: speed,
          ease: "linear",
        },
      },
    });
  }, [controls, speed]);

  const handleHoverStart = () => controls.stop();
  const handleHoverEnd = () => {
    controls.start({
      x: ["0%", "-33.333%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: speed,
          ease: "linear",
        },
      },
    });
  };

  return (
    <div className="marquee">
      <motion.div
        ref={trackRef}
        className="marquee-track"
        animate={controls}
        style={{ display: "flex", width: "max-content" }}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        {doubled.map((item, i) => (
          <span className="marquee-item" key={i}>
            <span className="num">{item.num}</span>
            <span className="text">{item.text}</span>
            <span className="sep" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
