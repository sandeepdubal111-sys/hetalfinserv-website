import { useState } from "react";

/**
 * BrandLogo — resilient brand logo with 3-tier fallback:
 *  1. icon.horse (returns hi-res site icons; works for gov + private domains)
 *  2. Google favicon @ 128px
 *  3. Beautiful branded text token (initials or short name on brandColor)
 *
 * Props:
 *  - domain: brand root domain (e.g. "sbimf.com")
 *  - name: full brand name (used for initials + alt)
 *  - shortLabel: optional short label (e.g. "SEBI") — preferred for fallback
 *  - brandColor: hex string for text-token background (defaults to obsidian)
 *  - size: pixel size of the round chip (default 44)
 *  - variant: "chip" (round bg) | "bare" (no chip, just image)
 */
export default function BrandLogo({
  domain,
  name = "",
  shortLabel,
  brandColor = "#0E0F0C",
  size = 44,
  variant = "chip",
  className = "",
}) {
  // 0 = icon.horse, 1 = google, 2 = text token
  const [tier, setTier] = useState(0);

  const src =
    tier === 0
      ? `https://icon.horse/icon/${domain}`
      : tier === 1
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
      : null;

  const initials =
    shortLabel ||
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  const chipStyle = {
    height: size,
    width: size,
    background: "#ffffff",
    border: "1px solid rgba(14,15,12,0.12)",
    boxShadow: "0 4px 12px -4px rgba(14,15,12,0.15)",
  };

  const tokenStyle = {
    height: size,
    width: size,
    background: brandColor,
    color: "#ffffff",
    letterSpacing: "0.04em",
  };

  // Text-token fallback (tier 2)
  if (tier >= 2) {
    return (
      <span
        className={`rounded-full flex items-center justify-center shrink-0 font-display ${className}`}
        style={tokenStyle}
        aria-label={`${name} logo`}
      >
        <span
          style={{
            fontSize: initials.length >= 4 ? size * 0.28 : size * 0.36,
            lineHeight: 1,
          }}
        >
          {initials}
        </span>
      </span>
    );
  }

  const img = (
    <img
      key={tier}
      src={src}
      alt={`${name} logo`}
      loading="lazy"
      className="object-contain"
      style={{
        height: size * 0.72,
        width: size * 0.72,
      }}
      onError={() => setTier((t) => t + 1)}
    />
  );

  if (variant === "bare") {
    return <span className={`shrink-0 ${className}`}>{img}</span>;
  }

  return (
    <span
      className={`rounded-full flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={chipStyle}
    >
      {img}
    </span>
  );
}
