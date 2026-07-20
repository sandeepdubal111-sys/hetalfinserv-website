import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/data";
import { motion } from "framer-motion";

export default function WhatsAppFloat() {
  const href = `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi Hetal Finserv, I'd like to discuss my financial plan."
  )}`;
  return (
    <motion.a
      data-testid="whatsapp-float-cta"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 right-6 z-50 group"
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
