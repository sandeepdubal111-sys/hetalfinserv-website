import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";
import { createLead } from "@/lib/api";
import { SERVICES, SITE } from "@/lib/data";

const EMPTY = { name: "", phone: "", email: "", service: "", message: "" };

export default function ContactForm({ compact = false }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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
            <p className="font-mono-label text-[color:var(--hf-gold)]">— Request a consultation</p>
            <h2
              className="font-display text-ivory mt-6"
              style={{ fontSize: "clamp(2.4rem, 5vw, 5rem)", lineHeight: 0.95 }}
            >
              Begin<br />a conversation.
            </h2>
            <p className="mt-8 text-[color:rgba(244,239,230,0.75)] leading-[1.7] max-w-md">
              Share a few details and a senior advisor will call you within one working day.
              The first meeting is complimentary — and quietly candid.
            </p>

            <div className="mt-12 space-y-6 text-[color:rgba(244,239,230,0.85)]">
              <div>
                <p className="font-mono-label text-[color:var(--hf-gold)] mb-1">Direct line</p>
                <a href={`tel:${SITE.phoneClean}`} className="font-display text-2xl">
                  {SITE.phone}
                </a>
              </div>
              <div>
                <p className="font-mono-label text-[color:var(--hf-gold)] mb-1">Write to us</p>
                <a href={`mailto:${SITE.email}`} className="link-underline">{SITE.email}</a>
              </div>
              <div>
                <p className="font-mono-label text-[color:var(--hf-gold)] mb-1">Practice hours</p>
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
                <p className="font-mono-label text-[color:var(--hf-gold)]">— Received</p>
                <h3
                  className="font-display text-ivory mt-4"
                  style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1 }}
                >
                  Thank you.<br />We'll be in touch shortly.
                </h3>
                <p className="mt-6 text-[color:rgba(244,239,230,0.75)] max-w-md">
                  Your enquiry has been logged. In the meantime, feel free to reach us
                  directly at <a href={`tel:${SITE.phoneClean}`} className="text-ivory link-underline">{SITE.phone}</a>.
                </p>
                <button
                  onClick={() => setDone(false)}
                  className="mt-8 hf-btn-outline"
                  data-testid="lead-send-another"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="grid grid-cols-2 gap-x-8 gap-y-2"
                data-testid="lead-form"
              >
                <div className="col-span-2 md:col-span-1">
                  <label className="font-mono-label text-[color:var(--hf-gold)] block mb-2">
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
                  <label className="font-mono-label text-[color:var(--hf-gold)] block mb-2">
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
                  <label className="font-mono-label text-[color:var(--hf-gold)] block mb-2">
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
                  <label className="font-mono-label text-[color:var(--hf-gold)] block mb-2">
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
                  <label className="font-mono-label text-[color:var(--hf-gold)] block mb-2">
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
                <div className="col-span-2 mt-10 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="hf-btn-gold disabled:opacity-60 disabled:cursor-not-allowed"
                    data-testid="lead-submit"
                  >
                    {loading ? "Sending…" : "Request a Callback"}
                    <ArrowUpRight size={16} strokeWidth={1.5} />
                  </button>
                  <p className="font-mono-label text-[color:rgba(244,239,230,0.55)]">
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
