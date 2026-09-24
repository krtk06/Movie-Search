import React from "react";

// Inline brand SVG icons — clean, recognizable, no external dependencies.
// Sized via .icon { width; height } from CSS.

const baseProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 64 64",
  width: "1em",
  height: "1em",
  "aria-hidden": "true",
};

export function NetflixIcon({ size = 24 }) {
  return (
    <svg {...baseProps} width={size} height={size} style={{ display: "block" }}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#0F1422" />
      <path
        d="M22 10 H28 L36 40 V10 H42 V54 H36 L28 24 V54 H22 Z"
        fill="#E50914"
      />
    </svg>
  );
}

export function PrimeIcon({ size = 24 }) {
  return (
    <svg {...baseProps} width={size} height={size} style={{ display: "block" }}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#0F1422" />
      <text
        x="32"
        y="26"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="13"
        fill="#00A8E1"
        letterSpacing="0.5"
      >
        prime
      </text>
      <path
        d="M14 32 Q22 36 32 36 T52 32"
        stroke="#00A8E1"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M46 30 L52 32 L48 36"
        stroke="#00A8E1"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DisneyIcon({ size = 24 }) {
  return (
    <svg {...baseProps} width={size} height={size} style={{ display: "block" }}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#0F1422" />
      <text
        x="32"
        y="28"
        textAnchor="middle"
        fontFamily="serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="22"
        fill="#FFFFFF"
      >
        D
      </text>
      <path
        d="M40 28 H50"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M46 24 V32"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M14 38 H50"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        opacity="0.4"
      />
      <text
        x="32"
        y="50"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        fontSize="7"
        fill="#FFFFFF"
        letterSpacing="2"
      >
        DISNEY
      </text>
    </svg>
  );
}

export function HuluIcon({ size = 24 }) {
  return (
    <svg {...baseProps} width={size} height={size} style={{ display: "block" }}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#0F1422" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="20"
        fill="#1CE783"
        fontStyle="italic"
      >
        hulu
      </text>
    </svg>
  );
}

export function AppleIcon({ size = 24 }) {
  return (
    <svg {...baseProps} width={size} height={size} style={{ display: "block" }}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#0F1422" />
      <path
        d="M40.5 34.5 c-0.5-4 3-6 3-6-1.5-2.5-4-3-5-3-2-0.2-4 1.2-5 1.2s-3-1.2-4.8-1.1c-2.5 0-4.8 1.4-6 3.7-2.6 4.5-0.7 11 1.9 14.5 1.2 1.7 2.6 3.6 4.5 3.5 1.8-0.1 2.5-1.2 4.6-1.2 2.2 0 2.7 1.2 4.6 1.1 1.9 0 3.1-1.7 4.3-3.4 1.3-1.9 1.9-3.8 1.9-3.9 0 0-3.5-1.4-3.5-5.4 z M37 19.5 c1-1.2 1.6-2.8 1.4-4.5-1.4 0.1-3 0.9-4 2.1-0.9 1-1.6 2.7-1.4 4.3 1.6 0.1 3.1-0.8 4-1.9 z"
        fill="#FFFFFF"
      />
      <text
        x="32"
        y="54"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        fontSize="6.5"
        fill="#FFFFFF"
        letterSpacing="1.5"
      >
        TV+
      </text>
    </svg>
  );
}

export function MaxIcon({ size = 24 }) {
  return (
    <svg {...baseProps} width={size} height={size} style={{ display: "block" }}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#0F1422" />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="serif"
        fontWeight="800"
        fontSize="32"
        fill="#FFFFFF"
        fontStyle="italic"
      >
        M
      </text>
      <path
        d="M18 16 L46 16"
        stroke="#0046FF"
        strokeWidth="2"
        opacity="0.6"
      />
    </svg>
  );
}

export function ParamountIcon({ size = 24 }) {
  return (
    <svg {...baseProps} width={size} height={size} style={{ display: "block" }}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#0F1422" />
      <path
        d="M10 46 L22 22 L32 38 L42 18 L54 46"
        stroke="#0064FF"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 50 L34 50"
        stroke="#0064FF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PeacockIcon({ size = 24 }) {
  return (
    <svg {...baseProps} width={size} height={size} style={{ display: "block" }}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#0F1422" />
      <g transform="translate(32 32)">
        <ellipse cx="0" cy="-8" rx="2.2" ry="6" fill="#FF8A00" />
        <ellipse
          cx="0"
          cy="-8"
          rx="2.2"
          ry="6"
          fill="#FF8A00"
          transform="rotate(45)"
        />
        <ellipse
          cx="0"
          cy="-8"
          rx="2.2"
          ry="6"
          fill="#FF8A00"
          transform="rotate(90)"
        />
        <ellipse
          cx="0"
          cy="-8"
          rx="2.2"
          ry="6"
          fill="#FF8A00"
          transform="rotate(135)"
        />
        <ellipse
          cx="0"
          cy="-8"
          rx="2.2"
          ry="6"
          fill="#FF8A00"
          transform="rotate(180)"
        />
        <ellipse
          cx="0"
          cy="-8"
          rx="2.2"
          ry="6"
          fill="#FF8A00"
          transform="rotate(225)"
        />
        <ellipse
          cx="0"
          cy="-8"
          rx="2.2"
          ry="6"
          fill="#FF8A00"
          transform="rotate(270)"
        />
        <ellipse
          cx="0"
          cy="-8"
          rx="2.2"
          ry="6"
          fill="#FF8A00"
          transform="rotate(315)"
        />
        <circle cx="0" cy="0" r="2.5" fill="#FF8A00" />
      </g>
    </svg>
  );
}

const ICONS = {
  netflix: NetflixIcon,
  prime: PrimeIcon,
  disney: DisneyIcon,
  hulu: HuluIcon,
  apple: AppleIcon,
  max: MaxIcon,
  paramount: ParamountIcon,
  peacock: PeacockIcon,
  hbo: MaxIcon,
};

export default function PlatformIcon({ platform, size = 28 }) {
  const Icon = ICONS[platform] || MaxIcon;
  return <Icon size={size} />;
}
