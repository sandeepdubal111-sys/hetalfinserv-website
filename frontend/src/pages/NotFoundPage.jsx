import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

export default function NotFoundPage() {
  return (
    <main data-testid="not-found-page" className="bg-ivory min-h-[70vh] flex items-center">
      <SEO title="Page Not Found" path="/404" noindex />
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 pt-40 pb-24 text-center w-full">
        <p className="font-mono-label text-mute mb-6">— 404</p>
        <h1
          className="font-display text-obsidian mb-8"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)", lineHeight: 1 }}
        >
          This page doesn't exist.
        </h1>
        <p className="text-obsidian/70 max-w-xl mx-auto mb-10">
          The page you're looking for may have moved or the link may be broken.
          Let's get you back on track.
        </p>
        <Link to="/" className="hf-btn-coral" data-testid="404-home-link">
          Back to Home →
        </Link>
      </div>
    </main>
  );
}
