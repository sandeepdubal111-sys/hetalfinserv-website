import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { createLead } from "@/lib/api";
import { SERVICES, SITE } from "@/lib/data";
const EMPTY = { name: "", phone: "", email: "", service: "", message: "", consent: false };

function buildWhatsAppUrl(lead) {
  const lines = [
    `Hi Hetal Finserv,`,
    ``,
    `I just submitted an enquiry on your website.`,
    ``,
    `• Name: ${lead.name}`,
    `• Phone: ${lead.phone}`,
    lead.email ? `• Email: ${lead.email}` : null,
    lead.service ? `• Interested in: ${lead.service}` : null,
    lead.message ? `• Note: ${lead.message}` : null,
    ``,
    `Please reach out at your convenience.`,
  ].filter(Boolean);
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${text}`;
}

export default function ContactForm({ compact = false }) {
  const location = useLocation();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [lastLead, setLastLead] = useState(null);

  // Prefill from router state (e.g. from Calculator or "Discuss this practice")
  useEffect(() => {
    const s = location.state;
    if (s && (s.service || s.message)) {
      setForm((f) => ({
        ...f,
        service: s.service || f.service,
        message: s.message || f.message,
      }));
    }
  }, [location.state]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please share your name and phone.");
      return;
    }
    try {
      setLoading(true);
      await createLead({ ...form, source: "website-contact-form" });
      setLastLead({ ...form });
      setDone(true);
      setForm(EMPTY);
      toast.success("Received. We'll be in touch shortly.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      data-testid="contact-form-section"
      className={`${compact ? "py-20" : "py-28 md:py-40"} on-dark bg-obsidian text-ivory border-t border-hair-light`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 md:gap-12">
          {/* Left copy */}
          <div className="col-span-12 md:col-span-5">
            <p className="font-mono-label text-[color:var(--hf-gold-soft)]">— Request a consultation</p>
            <h2
              className="font-display mt-6 text-on-dark"
              style={{ fontSize: "clamp(2.4rem, 5vw, 5rem)", lineHeight: 0.95 }}
            >
              Begin<br />a conversation.
            </h2>
            <p className="mt-8 text-on-dark-2 leading-[1.7] max-w-md">
              Share a few details and a senior advisor will call you within one working day.
              The first meeting is complimentary — and quietly candid.
            </p>

            <div className="mt-12 space-y-6 text-on-dark">
              <div>
                <p className="font-mono-label text-[color:var(--hf-gold-soft)] mb-1">Direct line</p>
                <a href={`tel:${SITE.phoneClean}`} className="font-display text-2xl">
                  {SITE.phone}
                </a>
                {SITE.phoneAlt && (
                  <a
                    href={`tel:${(SITE.phoneAlt || "").replace(/\D/g, "")}`}
                    className="block text-on-dark-2 mt-1"
                  >
                    {SITE.phoneAlt}
                  </a>
                )}
              </div>
              <div>
                <p className="font-mono-label text-[color:var(--hf-gold-soft)] mb-1">Write to us</p>
                <a href={`mailto:${SITE.email}`} className="link-underline">{SITE.email}</a>
              </div>
              <div>
                <p className="font-mono-label text-[color:var(--hf-gold-soft)] mb-1">Office</p>
                <span className="leading-relaxed">{SITE.address}</span>
              </div>
              <div>
                <p className="font-mono-label text-[color:var(--hf-gold-soft)] mb-1">Practice hours</p>
                <span>{SITE.hours}</span>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="col-span-12 md:col-span-7 md:pl-8 lg:pl-16">
            {done ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="border border-hair-light p-10"
                data-testid="lead-success-panel"
              >
                <p className="font-mono-label text-[color:var(--hf-gold-soft)]">— Received</p>
                <h3
                  className="font-display mt-4"
                  style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1, color: "#f4efe6" }}
                >
                  Thank you.<br /><span style={{ color: "var(--hf-gold)" }} className="italic">We'll be in touch shortly.</span>
                </h3>
                <p className="mt-6 text-on-dark-2 max-w-md">
                  Your enquiry has been logged. To reach us instantly, forward the same
                  details on WhatsApp — it lands directly with our advisory desk.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {lastLead && (
                    <a
                      href={buildWhatsAppUrl(lastLead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hf-btn-coral"
                      data-testid="lead-success-whatsapp"
                    >
                      <MessageCircle size={16} strokeWidth={1.5} />
                      Continue on WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => setDone(false)}
                    className="hf-btn-outline"
                    data-testid="lead-send-another"
                  >
                    Send another
                  </button>
                </div>
                <p className="mt-6 font-mono-label text-on-dark-mute">
                  Or call us directly at{" "}
                  <a href={`tel:${SITE.phoneClean}`} className="text-on-dark link-underline">
                    {SITE.phone}
                  </a>
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="grid grid-cols-2 gap-x-8 gap-y-2"
                data-testid="lead-form"
              >
                <div className="col-span-2 md:col-span-1">
                  <label className="font-mono-label text-[color:var(--hf-gold-soft)] block mb-2">
                    Full name
                  </label>
                  <input
                    className="hf-input"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={update("name")}
                    required
                    aria-label="Full name"
                    data-testid="lead-input-name"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="font-mono-label text-[color:var(--hf-gold-soft)] block mb-2">
                    Phone
                  </label>
                  <input
                    className="hf-input"
                    placeholder="+91"
                    value={form.phone}
                    onChange={update("phone")}
                    required
                    aria-label="Phone number"
                    data-testid="lead-input-phone"
                  />
                </div>
                <div className="col-span-2 md:col-span-1 mt-6">
                  <label className="font-mono-label text-[color:var(--hf-gold-soft)] block mb-2">
                    Email <span className="opacity-60 normal-case">(optional)</span>
                  </label>
                  <input
                    className="hf-input"
                    type="email"
                    placeholder="you@domain.com"
                    value={form.email}
                    onChange={update("email")}
                    aria-label="Email"
                    data-testid="lead-input-email"
                  />
                </div>
                <div className="col-span-2 md:col-span-1 mt-6">
                  <label className="font-mono-label text-[color:var(--hf-gold-soft)] block mb-2">
                    Interested in
                  </label>
                  <select
                    className="hf-input"
                    value={form.service}
                    onChange={update("service")}
                    aria-label="Service"
                    data-testid="lead-input-service"
                  >
                    <option value="" className="bg-obsidian">Select a practice…</option>
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.title} className="bg-obsidian">
                        {s.title}
                      </option>
                    ))}
                    <option value="General enquiry" className="bg-obsidian">General enquiry</option>
                  </select>
                </div>
                <div className="col-span-2 mt-6">
                  <label className="font-mono-label text-[color:var(--hf-gold-soft)] block mb-2">
                    Tell us a little more <span className="opacity-60 normal-case">(optional)</span>
                  </label>
                  <textarea
                    className="hf-input"
                    rows={3}
                    placeholder="A quick note about your goals or timing…"
                    value={form.message}
                    onChange={update("message")}
                    aria-label="Message"
                    data-testid="lead-input-message"
                  />
                </div>
                <div className="col-span-2 mt-8">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consent || false}
                      onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                      required
                      className="mt-1 shrink-0"
                      data-testid="lead-consent-checkbox"
                    />
                    <span className="text-on-dark-2 text-sm leading-relaxed">
                      I consent to be contacted by Hetal Finserv regarding my enquiry. I understand
                      this website provides education and facilitation, not investment or legal advice.
                    </span>
                  </label>
                </div>
                <div className="col-span-2 mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading || !form.consent}
                    className="hf-btn-coral disabled:opacity-60 disabled:cursor-not-allowed"
                    data-testid="lead-submit"
                  >
                    {loading ? "Sending…" : "Request a Callback"}
                    <ArrowUpRight size={16} strokeWidth={1.5} />
                  </button>
                  <p className="font-mono-label text-on-dark-mute">
                    We reply within 1 working day
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
