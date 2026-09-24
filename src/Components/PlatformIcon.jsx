/**
 * PlatformIcon — pixel-art streaming-provider marks.
 *
 * Each brand is a solid colour tile with an axis-aligned 2px-pixel glyph,
 * drawn on a 24×24 grid with `shape-rendering: crispEdges`.
 */

const BRANDS = {
  netflix: {
    bg: "#141414", fg: "#E50914",
    r: [[6, 5, 2, 14], [16, 5, 2, 14], [8, 7, 2, 3], [10, 10, 2, 3], [12, 13, 2, 3], [14, 6, 2, 4]],
  },
  prime: {
    bg: "#0F171E", fg: "#00A8E1",
    r: [[4, 11, 9, 2], [12, 8, 2, 2], [14, 10, 2, 2], [16, 11, 2, 2], [14, 12, 2, 2], [12, 14, 2, 2]],
  },
  disney: {
    bg: "#0B1B3A", fg: "#FFFFFF",
    r: [[5, 6, 2, 12], [7, 6, 2, 2], [7, 16, 2, 2], [9, 8, 2, 8], [16, 7, 2, 6], [14, 9, 6, 2]],
  },
  hulu: {
    bg: "#0B0F14", fg: "#1CE783",
    r: [[5, 7, 2, 10], [11, 7, 2, 10], [5, 11, 8, 2]],
  },
  apple: {
    bg: "#000000", fg: "#FFFFFF",
    r: [[10, 6, 4, 2], [8, 8, 8, 10], [12, 4, 2, 2]],
  },
  max: {
    bg: "#001B3D", fg: "#FFFFFF",
    r: [[5, 7, 2, 10], [17, 7, 2, 10], [7, 9, 2, 2], [9, 11, 2, 2], [11, 11, 2, 2], [13, 9, 2, 2], [15, 7, 2, 4]],
  },
  paramount: {
    bg: "#0064FF", fg: "#FFFFFF",
    r: [[5, 17, 14, 2], [5, 15, 2, 2], [7, 13, 2, 2], [9, 11, 2, 2], [11, 9, 2, 2], [13, 11, 2, 2], [15, 13, 2, 2], [17, 15, 2, 2]],
  },
  peacock: {
    bg: "#0B0F14", fg: "#FF8A00",
    r: [[11, 11, 2, 2], [11, 4, 2, 5], [11, 15, 2, 5], [4, 11, 5, 2], [15, 11, 5, 2], [6, 6, 2, 2], [16, 6, 2, 2], [6, 16, 2, 2], [16, 16, 2, 2]],
  },
};

const ICONS = {
  netflix: BRANDS.netflix,
  prime: BRANDS.prime,
  disney: BRANDS.disney,
  hulu: BRANDS.hulu,
  apple: BRANDS.apple,
  max: BRANDS.max,
  paramount: BRANDS.paramount,
  peacock: BRANDS.peacock,
  hbo: BRANDS.max,
};

export default function PlatformIcon({ platform, size = 24 }) {
  const brand = ICONS[platform] || BRANDS.max;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <rect x="0" y="0" width="24" height="24" fill={brand.bg} />
      {brand.r.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={brand.fg} />
      ))}
      <rect x="0.5" y="0.5" width="23" height="23" fill="none" stroke="rgba(0,0,0,0.5)" />
    </svg>
  );
}
