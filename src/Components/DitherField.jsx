import { useEffect, useRef } from "react";
import { useTheme } from "../Context/ThemeContext";

const BAYER_4X4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

const CELL = 5;
const LEVELS = 5;
const FRAME_MS = 1000 / 24;
const BEAM_X = 0.34;
const BEAM_Y = 0.18;
const BEAM_RADIUS = 1.15;

function hexToRgb(value) {
  const hex = value.trim().replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function readPalette() {
  const styles = getComputedStyle(document.documentElement);
  return Array.from({ length: LEVELS }, (_, index) =>
    hexToRgb(styles.getPropertyValue(`--dither-${index + 1}`) || "#12101c")
  );
}

export default function DitherField() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let image = null;
    let palette = readPalette();
    let cols = 0;
    let rows = 0;
    let last = 0;

    const resize = () => {
      cols = Math.max(1, Math.ceil(window.innerWidth / CELL));
      rows = Math.max(1, Math.ceil(window.innerHeight / CELL));
      canvas.width = cols;
      canvas.height = rows;
      image = ctx.createImageData(cols, rows);
    };

    const draw = (time) => {
      const data = image.data;
      const beamCx = BEAM_X * cols;
      const beamCy = BEAM_Y * rows;
      let offset = 0;

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const wave =
            Math.sin(x * 0.085 + time * 0.00042) +
            Math.sin(y * 0.062 - time * 0.00031) +
            Math.sin((x + y) * 0.041 + time * 0.00023) +
            Math.sin(Math.hypot(x - beamCx, y - beamCy) * 0.075 - time * 0.00037) * 0.9;

          const dx = (x - beamCx) / cols;
          const dy = (y - beamCy) / rows;
          const beam = 1 - Math.min(1, Math.hypot(dx, dy) / BEAM_RADIUS);

          const value = (wave / 3.9 + 1) * 0.5 * 0.55 + beam * beam * 0.45;
          const threshold = (BAYER_4X4[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
          let index = Math.round(value * (LEVELS - 1) + (threshold - 0.5) * 1.15);
          if (index < 0) index = 0;
          else if (index > LEVELS - 1) index = LEVELS - 1;

          const color = palette[index];
          data[offset] = color[0];
          data[offset + 1] = color[1];
          data[offset + 2] = color[2];
          data[offset + 3] = 255;
          offset += 4;
        }
      }

      ctx.putImageData(image, 0, 0);
    };

    const loop = (now) => {
      frame = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      draw(now);
    };

    const start = () => {
      if (reduceMotion.matches) {
        draw(0);
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else {
        start();
      }
    };

    resize();
    palette = readPalette();
    start();

    const onResize = () => {
      resize();
      if (reduceMotion.matches) draw(0);
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", start);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="dither-field" aria-hidden="true" />;
}
