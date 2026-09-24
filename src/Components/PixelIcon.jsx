/**
 * PixelIcon — hand-built 8-bit icon set.
 *
 * Every glyph is drawn on a 24×24 grid using axis-aligned rectangles
 * (2px "pixels") rendered with `shape-rendering: crispEdges`, so icons
 * stay blocky and sharp at any size. Color is inherited via `currentColor`
 * and sizing is controlled by `size` or an external `className` (e.g. Tailwind
 * `w-4 h-4`).
 *
 * Named exports mirror the previous `lucide-react` names to keep call sites
 * readable and the swap mechanical.
 */

const ICONS = {
  search: [
    [4, 4, 12, 2], [4, 14, 12, 2], [4, 4, 2, 12], [14, 4, 2, 12],
    [16, 16, 2, 2], [18, 18, 2, 2], [20, 20, 2, 2],
  ],
  heart: [
    [4, 5, 4, 2], [12, 5, 4, 2],
    [4, 7, 16, 2],
    [6, 9, 12, 2],
    [8, 11, 8, 2],
    [10, 13, 4, 2],
    [11, 15, 2, 2],
  ],
  film: [
    [4, 4, 16, 2], [4, 18, 16, 2], [4, 4, 2, 16], [18, 4, 2, 16],
    [11, 4, 2, 16],
    [6, 7, 3, 3], [6, 14, 3, 3], [15, 7, 3, 3], [15, 14, 3, 3],
  ],
  star: [
    [11, 3, 2, 2], [10, 5, 4, 2],
    [4, 7, 16, 2],
    [6, 9, 12, 2],
    [6, 11, 4, 2], [14, 11, 4, 2],
    [4, 13, 4, 2], [16, 13, 4, 2],
    [4, 15, 2, 2], [18, 15, 2, 2],
  ],
  arrowRight: [
    [4, 11, 12, 2],
    [14, 7, 2, 2], [16, 9, 2, 2], [18, 11, 2, 2], [16, 13, 2, 2], [14, 15, 2, 2],
  ],
  arrowLeft: [
    [8, 11, 12, 2],
    [8, 7, 2, 2], [6, 9, 2, 2], [4, 11, 2, 2], [6, 13, 2, 2], [8, 15, 2, 2],
  ],
  arrowUpRight: [
    [6, 16, 2, 2], [8, 14, 2, 2], [10, 12, 2, 2], [12, 10, 2, 2],
    [12, 6, 6, 2], [16, 6, 2, 6],
  ],
  languages: [
    [4, 4, 16, 2], [4, 18, 16, 2], [4, 4, 2, 16], [18, 4, 2, 16],
    [4, 11, 16, 2], [11, 4, 2, 16],
  ],
  clock: [
    [4, 4, 16, 2], [4, 18, 16, 2], [4, 4, 2, 16], [18, 4, 2, 16],
    [11, 7, 2, 6], [13, 11, 5, 2],
  ],
  sparkles: [
    [9, 4, 2, 14], [3, 10, 14, 2], [8, 9, 4, 4],
    [18, 3, 2, 2], [17, 5, 2, 2], [19, 5, 2, 2], [18, 6, 2, 2],
  ],
  clapperboard: [
    [3, 10, 18, 2], [3, 17, 18, 2], [3, 10, 2, 9], [19, 10, 2, 9],
    [3, 5, 4, 4], [9, 5, 4, 4], [15, 5, 4, 4],
  ],
  eye: [
    [7, 8, 10, 2], [7, 16, 10, 2], [4, 10, 2, 6], [18, 10, 2, 6],
    [10, 11, 4, 4],
  ],
  eyeOff: [
    [7, 8, 10, 2], [7, 16, 10, 2], [4, 10, 2, 6], [18, 10, 2, 6],
    [10, 11, 4, 4],
    [3, 3, 2, 2], [5, 5, 2, 2], [7, 7, 2, 2], [9, 9, 2, 2],
    [13, 13, 2, 2], [15, 15, 2, 2], [17, 17, 2, 2], [19, 19, 2, 2],
  ],
  alertCircle: [
    [4, 4, 16, 2], [4, 18, 16, 2], [4, 4, 2, 16], [18, 4, 2, 16],
    [11, 7, 2, 6], [11, 15, 2, 2],
  ],
  menu: [
    [4, 6, 16, 2], [4, 11, 16, 2], [4, 16, 16, 2],
  ],
  x: [
    [6, 6, 2, 2], [8, 8, 2, 2], [10, 10, 2, 2], [12, 12, 2, 2], [14, 14, 2, 2], [16, 16, 2, 2],
    [16, 6, 2, 2], [14, 8, 2, 2], [12, 10, 2, 2], [10, 12, 2, 2], [8, 14, 2, 2], [6, 16, 2, 2],
  ],
  info: [
    [4, 4, 16, 2], [4, 18, 16, 2], [4, 4, 2, 16], [18, 4, 2, 16],
    [11, 7, 2, 2], [11, 11, 2, 6],
  ],
  calendar: [
    [4, 5, 16, 2], [4, 18, 16, 2], [4, 5, 2, 15], [18, 5, 2, 15],
    [4, 10, 16, 2],
    [7, 3, 2, 3], [15, 3, 2, 3],
    [6, 13, 2, 2], [10, 13, 2, 2], [14, 13, 2, 2],
  ],
  user: [
    [8, 5, 8, 6],
    [11, 11, 2, 2],
    [5, 13, 14, 7],
  ],
  award: [
    [7, 5, 10, 2], [7, 13, 10, 2], [7, 5, 2, 10], [15, 5, 2, 10],
    [11, 8, 2, 2],
    [8, 15, 2, 6], [14, 15, 2, 6],
  ],
};

export default function PixelIcon({ name, size = 24, className = "", style, ...rest }) {
  const rects = ICONS[name] || [];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {rects.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} />
      ))}
    </svg>
  );
}

export const Search = (p) => <PixelIcon name="search" {...p} />;
export const Heart = (p) => <PixelIcon name="heart" {...p} />;
export const Film = (p) => <PixelIcon name="film" {...p} />;
export const Star = (p) => <PixelIcon name="star" {...p} />;
export const ArrowRight = (p) => <PixelIcon name="arrowRight" {...p} />;
export const ArrowLeft = (p) => <PixelIcon name="arrowLeft" {...p} />;
export const ArrowUpRight = (p) => <PixelIcon name="arrowUpRight" {...p} />;
export const Languages = (p) => <PixelIcon name="languages" {...p} />;
export const Clock = (p) => <PixelIcon name="clock" {...p} />;
export const Sparkles = (p) => <PixelIcon name="sparkles" {...p} />;
export const Clapperboard = (p) => <PixelIcon name="clapperboard" {...p} />;
export const Eye = (p) => <PixelIcon name="eye" {...p} />;
export const EyeOff = (p) => <PixelIcon name="eyeOff" {...p} />;
export const AlertCircle = (p) => <PixelIcon name="alertCircle" {...p} />;
export const Menu = (p) => <PixelIcon name="menu" {...p} />;
export const X = (p) => <PixelIcon name="x" {...p} />;
export const Info = (p) => <PixelIcon name="info" {...p} />;
export const Calendar = (p) => <PixelIcon name="calendar" {...p} />;
export const User = (p) => <PixelIcon name="user" {...p} />;
export const Award = (p) => <PixelIcon name="award" {...p} />;
