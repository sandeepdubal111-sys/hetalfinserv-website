import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MaskLine } from "@/components/MaskedReveal";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/lib/data";
import AMCPartners from "@/components/sections/AMCPartners";
import ContactForm from "@/components/sections/ContactForm";

export default function ServicesPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <main data-testid="services-page" className="bg-ivory">
      {/* Page hero */}
      <section className="pt-40 pb-20 md:pt-52 md:pb-32 border-b border-hair">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono-label text-mute">— Six practices</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1
              className="font-display text-obsidian"
              style={{ fontSize: "clamp(3rem, 8vw, 9rem)", lineHeight: 0.92 }}
            >
              <span className="block"><MaskLine delay={0.15}>Services,</MaskLine></span>
              <span className="block italic text-[color:var(--hf-gold-2)]">
                <MaskLine delay={0.35}>designed for</MaskLine>
              </span>
              <span className="block"><MaskLine delay={0.55}>long horizons.</MaskLine></span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9 }}
              className="mt-10 max-w-2xl text-lg md:text-xl text-[color:var(--hf-ink)]/80 leading-[1.7]"
            >
              We run six practices under one roof — each led by senior advisors, each accountable
              to a plan you can see. Below is what we do, in the order most families discover us.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Detail sections */}
      {SERVICES.map((s, i) => {
        const reverse = i % 2 === 1;
        return (
          <section
            key={s.id}
            id={s.id}
            data-testid={`service-detail-${s.id}`}
            className="py-24 md:py-36 border-b border-hair"
          >
            <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 grid grid-cols-12 gap-6 md:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={`col-span-12 md:col-span-6 ${reverse ? "md:order-2" : ""}`}
              >
                <div className="framed-img aspect-[4/5] w-full overflow-hidden border border-hair">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`col-span-12 md:col-span-6 ${reverse ? "md:order-1 md:pr-8" : "md:pl-8"}`}
              >
                <p className="font-mono-label text-[color:var(--hf-gold-2)]">— Practice {s.number}</p>
                <h2
                  className="font-display text-obsidian mt-4"
                  style={{ fontSize: "clamp(2.2rem, 4.4vw, 4.4rem)", lineHeight: 0.98 }}
                >
                  {s.title}
                </h2>
                <p
                  className="font-display italic text-[color:var(--hf-gold-2)] mt-4"
                  style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.6rem)" }}
                >
                  {s.tagline}
                </p>
                <ul className="mt-10 space-y-4">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-4 pb-4 border-b border-hair text-[color:var(--hf-ink)]/85"
                    >
                      <span className="font-mono-label text-mute">↳</span>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link
                    to="/contact"
                    state={{ service: s.title }}
                    className="hf-btn-primary"
                    data-testid={`service-book-${s.id}`}
                  >
                    Discuss this practice
                    <ArrowUpRight size={16} strokeWidth={1.5} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        );
      })}

      <AMCPartners />
      <ContactForm />
    </main>
  );
}
