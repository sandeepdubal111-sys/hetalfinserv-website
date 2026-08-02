import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/data";
import { motion } from "framer-motion";

export default function WhatsAppFloat() {
  const href = `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi Hetal Finserv, I'd like to discuss my financial plan."
  )}`;

  // Hide the floating button while the Hero section is in view. The Hero's
  // CTA buttons are bottom-aligned within a full-viewport-height section, so
  // on shorter/narrower phones they can land in the same on-screen band as
  // this fixed button — content height varies enough across real devices
  // that padding-based spacing isn't reliable. Watching the actual element
  // avoids needing to guess exact pixel clearance for every screen size.
  const [overHero, setOverHero] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('[data-testid="hero-section"]');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.a
      data-testid="whatsapp-float-cta"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: overHero ? 0 : 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed bottom-24 right-6 md:bottom-28 md:right-8 z-50 group ${
        overHero ? "pointer-events-none" : ""
      }`}
    >
      <span className="flex items-center gap-3 pl-4 pr-5 py-3 bg-obsidian text-ivory border border-hair-light shadow-[0_10px_30px_rgba(14,15,12,0.25)] transition-all duration-300 group-hover:bg-[color:var(--hf-emerald)]">
        <span className="h-8 w-8 rounded-full bg-[color:var(--hf-gold)] text-obsidian flex items-center justify-center">
          <MessageCircle size={16} strokeWidth={1.5} />
        </span>
        <span className="font-mono-label text-[0.65rem]">Chat on WhatsApp</span>
      </span>
    </motion.a>
  );
}
