import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/data";
import SEO from "@/components/SEO";

const SECTIONS = [
  {
    id: "disclaimer",
    title: "Disclaimer",
    body: [
      "Hetal Finserv Pvt. Ltd. is an AMFI Registered Mutual Fund Distributor (ARN-254254). We do not provide investment advice or portfolio management services on this website. The information provided on hetalfinserv.com is for general information only and should not be construed as investment advice, a recommendation or an offer to buy or sell any securities.",
      "All investment decisions should be made after reading the relevant scheme information documents (SID), statement of additional information (SAI) and key information memorandum (KIM). Mutual fund investments are subject to market risks. Past performance is no guarantee of future returns.",
      "We deal exclusively in Regular Plans of mutual funds and earn a trailing commission from the AMCs whose products our clients invest in. This commission is disclosed to clients at the time of investment.",
    ],
  },
  {
    id: "disclosure",
    title: "Disclosure",
    body: [
      "Under SEBI and AMFI guidelines, all Mutual Fund Distributors are required to disclose their commission earnings to clients. Hetal Finserv Pvt. Ltd. makes this disclosure at the time of every investment recommendation.",
      "We are also licensed as a MahaRERA Real Estate Consultant (A52100043460), an IRDAI-registered Insurance Broker (Reg. 00115138383), and hold a PMS Distribution registration (APRN00234). Where applicable, commissions received from insurance and PMS partners are disclosed in the respective proposal documents.",
      "We hold direct distribution empanelment for Alternative Investment Funds (AIF) and Specialized Investment Funds (SIF). Bonds, NCDs, Sovereign Gold Bonds and the National Pension System (NPS) are offered through our empanelled National Distributor partners. As with all our offerings, applicable commissions and fees are disclosed to clients at the time of investment.",
      "Our team members hold the following certifications: Certified Financial Goal Planner (CFGP — NISM & PGP Academy), Investment Foundations® Certificate — CFA Institute, Practising Goal Planner (Advanced) — HSBC & PGP Academy, and Professional Certificate in Global Wealth Management — The Wealth Company.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    body: [
      "Hetal Finserv Pvt. Ltd. respects your privacy. Any personal information you share with us — your name, phone number, email, financial goals or investment history — is used solely to serve you better. We do not sell, rent or share your data with third parties for marketing purposes.",
      "Personal data is stored on secure servers and is accessible only to authorised personnel of Hetal Finserv. Where required by law (SEBI, AMFI, IRDAI, income-tax authorities or law enforcement), we may be obligated to disclose specific information.",
      "You may write to us at info@hetalfinserv.com at any time to review, update or delete your personal information. For questions regarding this policy, please contact us at +91 87670 95307.",
    ],
  },
  {
    id: "risk",
    title: "Risk Factors",
    body: [
      "Investments in Mutual Funds are subject to Market Risks. Read all scheme related documents carefully before investing. Mutual Fund Schemes do not assure or guarantee any returns.",
      "Past performances of any Mutual Fund Scheme may or may not be sustained in future. There is no guarantee that the investment objective of any suggested scheme shall be achieved.",
      "All existing and prospective investors are advised to check and evaluate the Exit loads and other cost structure (TER) applicable at the time of making the investment before finalizing on any investment decision for Mutual Funds schemes.",
      "We deal in Regular Plans only for Mutual Fund Schemes and earn a Trailing Commission on client investments. Disclosure for commission earnings is made to clients at the time of investments.",
    ],
  },
];

export default function LegalPage() {
  return (
    <main data-testid="legal-page" className="bg-ivory pt-40 md:pt-52 pb-28">
      <SEO
        title="Legal, Compliance & Disclosures"
        description="Disclaimer, disclosure, privacy policy and risk factor information for Hetal Finserv Pvt Ltd."
        path="/legal"
        noindex
      />
      <div className="max-w-[1100px] mx-auto px-6 md:px-10">
        <p className="font-mono-label text-mute">— Legal · Compliance · Trust</p>
        <h1
          className="font-display text-obsidian mt-6"
          style={{ fontSize: "clamp(2.4rem, 5vw, 4.6rem)", lineHeight: 0.98 }}
        >
          The fine print,<br />
          <span className="italic" style={{ color: "var(--hf-gold)" }}>plainly written.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-obsidian leading-relaxed">
          Every regulator we're registered with — AMFI, IRDAI, MahaRERA and PMS —
          expects us to publish these disclosures. We've made them readable.
        </p>

        {/* Section nav */}
        <nav className="mt-14 flex flex-wrap gap-3" data-testid="legal-anchors">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 font-mono-label border border-hair rounded-full transition-colors hover:bg-obsidian hover:text-white"
              style={{ fontSize: "0.72rem" }}
            >
              {s.title}
            </a>
          ))}
        </nav>

        {/* Sections */}
        <div className="mt-20 space-y-24">
          {SECTIONS.map((s, i) => (
            <motion.section
              key={s.id}
              id={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="scroll-mt-32"
              data-testid={`legal-section-${s.id}`}
            >
              <div className="grid grid-cols-12 gap-6 md:gap-10">
                <div className="col-span-12 md:col-span-4">
                  <p className="font-mono-label text-mute">
                    — {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2
                    className="font-display text-obsidian mt-4"
                    style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 0.98 }}
                  >
                    {s.title}
                  </h2>
                </div>
                <div className="col-span-12 md:col-span-8 space-y-5">
                  {s.body.map((p, j) => (
                    <p key={j} className="text-obsidian leading-[1.85] text-[1rem]">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer CTA */}
        <div
          className="mt-24 pt-14 border-t border-hair flex flex-wrap items-center gap-6"
          data-testid="legal-cta"
        >
          <Link to="/contact" className="hf-btn-coral">
            Speak to an advisor
            <ArrowUpRight size={16} strokeWidth={1.5} />
          </Link>
          <a
            href={`mailto:${SITE.email}`}
            className="link-underline font-mono-label text-obsidian"
          >
            Or email {SITE.email}
          </a>
        </div>
      </div>
    </main>
  );
}
