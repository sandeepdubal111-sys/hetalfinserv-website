import { useState } from "react";

/**
 * BrandLogo — resilient real brand logo with 3-tier fallback:
 *  1. logo.dev (returns real official brand logos, 256×256, transparent-safe)
 *  2. icon.horse (hi-res favicon)
 *  3. Beautiful branded text token in brandColor
 *
 * Renders full-bleed inside a rounded chip so the actual brand logo is visible.
 *
 * Props:
 *  - domain: brand root domain (e.g. "sbimf.com")
 *  - name: full brand name (used for initials + alt)
 *  - shortLabel: optional short label (e.g. "SEBI")
 *  - brandColor: hex string for text-token background (defaults to obsidian)
 *  - size: pixel size of chip (default 56)
 *  - shape: "circle" | "rounded" (default "rounded")
 *  - background: chip background color (default "#ffffff")
 */

const LOGO_DEV_TOKEN = "pk_X-1ZO13GSgeOoUrIuJ6GMQ";

export default function BrandLogo({
  domain,
  name = "",
  shortLabel,
  brandColor = "#0E0F0C",
  size = 56,
  shape = "rounded",
  background = "#ffffff",
  logoOverride,
  className = "",
}) {
  const [tier, setTier] = useState(logoOverride ? -1 : 0);

  const src =
    tier === -1
      ? logoOverride
      : tier === 0
      ? `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=256&format=png&retina=true`
      : tier === 1
      ? `https://icon.horse/icon/${domain}`
      : null;

  const initials =
    shortLabel ||
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  const radius = shape === "circle" ? size / 2 : Math.max(10, size * 0.22);

  const baseChipStyle = {
    height: size,
    width: size,
    borderRadius: radius,
    border: "1px solid rgba(14,15,12,0.08)",
    boxShadow: "0 6px 18px -10px rgba(14,15,12,0.35)",
    overflow: "hidden",
  };

  // Text-token fallback (tier 2)
  if (tier >= 2) {
    return (
      <span
        className={`flex items-center justify-center shrink-0 font-display ${className}`}
        style={{
          ...baseChipStyle,
          background: brandColor,
          color: "#ffffff",
          letterSpacing: "-0.005em",
          fontWeight: 500,
        }}
        aria-label={`${name} logo`}
      >
        <span
          style={{
            fontSize:
              initials.length >= 7
                ? size * 0.2
                : initials.length >= 5
                ? size * 0.26
                : initials.length >= 3
                ? size * 0.32
                : size * 0.42,
            lineHeight: 1,
          }}
        >
          {initials}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`flex items-center justify-center shrink-0 ${className}`}
      style={{ ...baseChipStyle, background }}
    >
      <img
        key={tier}
        src={src}
        alt={`${name} logo`}
        loading="lazy"
        className="object-contain"
        style={{
          height: size,
          width: size,
          padding: 0,
        }}
        onError={() => setTier((t) => t + 1)}
      />
    </span>
  );
}
