import { useEffect } from "react";
import { motion } from "framer-motion";
import { MaskLine } from "@/components/MaskedReveal";
import Leadership from "@/components/sections/Leadership";
import Stats from "@/components/sections/Stats";
import EditorialMarquee from "@/components/sections/EditorialMarquee";
import Testimonials from "@/components/sections/Testimonials";
import ContactForm from "@/components/sections/ContactForm";
import { MANIFESTO } from "@/lib/data";

export default function AboutPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main data-testid="about-page" className="bg-ivory">
      {/* Hero */}
      <section className="pt-40 pb-20 md:pt-52 md:pb-32 border-b border-hair">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono-label text-mute">— About the practice</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1
              className="font-display text-obsidian"
              style={{ fontSize: "clamp(3rem, 8vw, 9rem)", lineHeight: 0.92 }}
            >
              <span className="block"><MaskLine delay={0.15}>One trusted desk.</MaskLine></span>
              <span className="block italic text-[color:var(--hf-gold-2)]"><MaskLine delay={0.35}>For every financial</MaskLine></span>
              <span className="block"><MaskLine delay={0.55}>decision.</MaskLine></span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9 }}
              className="mt-10 max-w-2xl text-lg md:text-xl text-[color:var(--hf-ink)]/80 leading-[1.7]"
            >
              Hetal Finserv Private Limited is a Pune-based financial services company,
              purpose-built to be your one-stop advisor for wealth, protection, credit, and
              real estate. Backed by AMFI, IRDAI and MahaRERA registrations, and a
              SEBI-recognised Portfolio Management Services distribution empanelment, we help
              individuals, families and businesses make informed, confident decisions —
              with the discretion and rigour usually reserved for institutions.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Manifesto chapters */}
      <section className="py-28 md:py-40">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
          <p className="font-mono-label text-mute mb-12">— The way we work</p>
          <div className="space-y-20 md:space-y-28">
            {MANIFESTO.map((c) => (
              <motion.article
                key={c.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-12 gap-6 md:gap-10 items-start"
              >
                <div className="col-span-12 md:col-span-3">
                  <span
                    className="font-display block text-[color:var(--hf-gold-2)] italic"
                    style={{ fontSize: "clamp(4rem, 9vw, 8rem)", lineHeight: 0.85 }}
                  >
                    {c.number}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-9">
                  <p className="font-mono-label text-obsidian">— {c.kicker}</p>
                  <h3
                    className="font-display text-obsidian mt-4"
                    style={{ fontSize: "clamp(1.8rem, 3.4vw, 3.4rem)", lineHeight: 0.98 }}
                  >
                    {c.title}
                  </h3>
                  <p className="mt-6 text-lg leading-[1.75] text-[color:var(--hf-ink)]/85 max-w-3xl">
                    {c.body}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Stats />
      <EditorialMarquee
        variant="dark"
        words={["Trust", "Craft", "Discretion", "Longevity", "Independence", "Care"]}
      />
      <Leadership inline />
      <Testimonials />
      <ContactForm />
    </main>
  );
}
