import { useEffect } from "react";
import { motion } from "framer-motion";
import { MaskLine } from "@/components/MaskedReveal";
import ContactForm from "@/components/sections/ContactForm";
import FAQ from "@/components/sections/FAQ";
import { SITE } from "@/lib/data";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import SEO from "@/components/SEO";

export default function ContactPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main data-testid="contact-page" className="bg-ivory">
      <SEO
        title="Contact Us — Book a Free Consultation"
        description="Get in touch with Hetal Finserv for a free financial consultation. Based in Wadgaon Sheri, Pune — serving clients across India for Mutual Funds, PMS, Insurance, Loans and Real Estate."
        path="/contact"
      />
      <section className="pt-40 pb-20 md:pt-52 md:pb-24 border-b border-hair">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono-label text-mute">— Contact</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1
              className="font-display text-obsidian"
              style={{ fontSize: "clamp(3rem, 8vw, 9rem)", lineHeight: 0.92 }}
            >
              <span className="block"><MaskLine delay={0.15}>Let's meet.</MaskLine></span>
              <span className="block italic text-[color:var(--hf-gold-2)]"><MaskLine delay={0.35}>Then plan.</MaskLine></span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9 }}
              className="mt-10 max-w-2xl text-lg md:text-xl text-[color:var(--hf-ink)]/80 leading-[1.7]"
            >
              The first conversation is complimentary. No obligation. No pitch. Just
              a candid look at where you are and what a considered plan might look like.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact detail grid */}
      <section className="py-20 md:py-28 border-b border-hair">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 grid grid-cols-12 gap-6 md:gap-10">
          {[
            { icon: Phone, label: "Call", value: SITE.phone, href: `tel:${SITE.phoneClean}` },
            { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
            { icon: MapPin, label: "Office", value: SITE.address, href: "#map" },
            { icon: Clock, label: "Hours", value: SITE.hours },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 md:col-span-6 lg:col-span-3 border-t border-hair pt-8 pb-4"
              data-testid={`contact-info-${c.label.toLowerCase()}`}
            >
              <c.icon size={22} strokeWidth={1.4} className="text-[color:var(--hf-gold-2)]" />
              <p className="font-mono-label text-mute mt-6">— {c.label}</p>
              {c.href ? (
                <a
                  href={c.href}
                  className="mt-3 block font-display text-obsidian text-xl md:text-2xl leading-tight link-underline"
                >
                  {c.value}
                </a>
              ) : (
                <p className="mt-3 font-display text-obsidian text-xl md:text-2xl leading-tight">
                  {c.value}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <ContactForm compact />

      {/* Map placeholder */}
      <section id="map" className="bg-ivory-2 py-20 md:py-28 border-b border-hair">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
          <p className="font-mono-label text-mute mb-6">— Find us</p>
          <div className="aspect-[16/9] w-full overflow-hidden border border-hair framed-img">
            <iframe
              title="Hetal Finserv office location"
              src="https://www.google.com/maps?q=Wadgaon+Sheri,+Pune+411014&output=embed"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <FAQ />
    </main>
  );
}
