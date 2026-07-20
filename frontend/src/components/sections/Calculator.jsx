import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp, Landmark } from "lucide-react";

/**
 * SIP + EMI calculator — dual mode, Awwwards-editorial.
 * Result is passed to /contact via router `state` so the lead form is prefilled.
 */

// ── Format helpers ──────────────────────────────────────────────
function inr(n) {
  if (!isFinite(n)) return "₹0";
  const rounded = Math.round(n);
  // Indian numbering (12,34,567)
  const s = rounded.toString();
  const last3 = s.slice(-3);
  const other = s.slice(0, -3);
  const withCommas = other
    ? other.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3
    : last3;
  return `₹${withCommas}`;
}

function inrShort(n) {
  if (!isFinite(n)) return "₹0";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return inr(n);
}

// ── Math ────────────────────────────────────────────────────────
function computeSIP({ monthly, years, rate }) {
  const n = years * 12;
  const r = rate / 100 / 12;
  // FV of SIP = P * [((1+r)^n - 1)/r] * (1+r)
  const fv = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthly * n;
  const gains = fv - invested;
  return { fv, invested, gains };
}

function computeEMI({ principal, years, rate }) {
  const n = years * 12;
  const r = rate / 100 / 12;
  const emi = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  const interest = total - principal;
  return { emi, total, interest };
}

// ── Slider input ────────────────────────────────────────────────
function RangeField({ label, unit, value, min, max, step, format, onChange, testid }) {
  return (
    <div data-testid={testid}>
      <div className="flex items-baseline justify-between gap-4">
        <label className="font-mono-label text-[color:var(--hf-gold-soft)]">{label}</label>
        <span
          className="font-display text-on-dark"
          style={{ fontSize: "clamp(1.2rem, 1.6vw, 1.6rem)", lineHeight: 1 }}
        >
          {format ? format(value) : `${value}${unit || ""}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="hf-range mt-4 w-full"
        aria-label={label}
      />
      <div className="mt-1 flex justify-between font-mono-label text-on-dark-mute text-[0.68rem]">
        <span>{format ? format(min) : `${min}${unit || ""}`}</span>
        <span>{format ? format(max) : `${max}${unit || ""}`}</span>
      </div>
    </div>
  );
}

// ── Stat tile ───────────────────────────────────────────────────
function StatTile({ label, value, accent, big }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono-label text-[color:var(--hf-gold-soft)]">— {label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="font-display"
        style={{
          fontSize: big ? "clamp(2.4rem, 5vw, 4.6rem)" : "clamp(1.4rem, 2.4vw, 2rem)",
          lineHeight: 0.95,
          color: accent ? "var(--hf-gold)" : "#f4efe6",
        }}
      >
        {value}
      </motion.span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
export default function Calculator() {
  const [mode, setMode] = useState("sip"); // "sip" | "emi"

  // SIP state
  const [sipMonthly, setSipMonthly] = useState(10000);
  const [sipYears, setSipYears] = useState(15);
  const [sipRate, setSipRate] = useState(12);

  // EMI state
  const [loanPrincipal, setLoanPrincipal] = useState(2500000);
  const [loanYears, setLoanYears] = useState(20);
  const [loanRate, setLoanRate] = useState(8.5);

  const sip = useMemo(
    () => computeSIP({ monthly: sipMonthly, years: sipYears, rate: sipRate }),
    [sipMonthly, sipYears, sipRate]
  );
  const emi = useMemo(
    () => computeEMI({ principal: loanPrincipal, years: loanYears, rate: loanRate }),
    [loanPrincipal, loanYears, loanRate]
  );

  const leadPayload = useMemo(() => {
    if (mode === "sip") {
      return {
        service: "Wealth & Investments",
        message:
          `SIP plan enquiry — ` +
          `Monthly ₹${sipMonthly.toLocaleString("en-IN")} · ` +
          `${sipYears} yrs · ` +
          `${sipRate}% expected. ` +
          `Projected corpus: ${inrShort(sip.fv)} (invested ${inrShort(sip.invested)}, gains ${inrShort(sip.gains)}). ` +
          `Please review and suggest fund options.`,
      };
    }
    return {
      service: "Loan Services",
      message:
        `Loan enquiry — ` +
        `Principal ₹${loanPrincipal.toLocaleString("en-IN")} · ` +
        `${loanYears} yrs · ` +
        `${loanRate}% p.a. ` +
        `EMI ${inrShort(emi.emi)}/mo · total payable ${inrShort(emi.total)} · interest ${inrShort(emi.interest)}. ` +
        `Please help me find the best offer.`,
    };
  }, [mode, sip, emi, sipMonthly, sipYears, sipRate, loanPrincipal, loanYears, loanRate]);

  return (
    <section
      data-testid="calculator-section"
      className="on-dark bg-obsidian text-ivory py-24 md:py-36 border-t border-b border-hair-light"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        {/* Header */}
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end mb-14 md:mb-20">
          <div className="col-span-12 md:col-span-6">
            <p className="font-mono-label text-[color:var(--hf-gold-soft)]">— Numbers, in your favour</p>
            <h2
              className="font-display mt-6"
              style={{
                fontSize: "clamp(2rem, 4.6vw, 4.4rem)",
                lineHeight: 0.96,
                color: "#f4efe6",
              }}
            >
              Model your{" "}
              <span className="italic" style={{ color: "var(--hf-gold)" }}>
                goal
              </span>
              <br />
              in under a minute.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6 md:pl-10">
            <p className="text-on-dark-2 leading-[1.7] max-w-lg">
              A candid, editorial calculator. Draft the SIP that funds your goal, or size the
              EMI that fits your income — then send it to us and we'll return a personalised
              plan within one working day.
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div
          className="inline-flex p-1 rounded-full border border-hair-light mb-10 md:mb-14"
          role="tablist"
          aria-label="Calculator mode"
          data-testid="calculator-mode-toggle"
        >
          {[
            { k: "sip", label: "SIP Calculator", Icon: TrendingUp },
            { k: "emi", label: "EMI Calculator", Icon: Landmark },
          ].map(({ k, label, Icon }) => {
            const active = mode === k;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={active}
                onClick={() => setMode(k)}
                className={`relative px-5 md:px-6 py-2.5 rounded-full flex items-center gap-2 font-mono-label transition-colors ${
                  active ? "text-obsidian" : "text-on-dark-2 hover:text-on-dark"
                }`}
                data-testid={`calculator-mode-${k}`}
              >
                {active && (
                  <motion.span
                    layoutId="calc-mode-pill"
                    className="absolute inset-0 rounded-full -z-0"
                    style={{ background: "var(--hf-gold)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon size={14} strokeWidth={1.6} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {mode === "sip" ? (
            <motion.div
              key="sip"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-12 gap-10 md:gap-16"
              data-testid="calculator-sip"
            >
              {/* Inputs */}
              <div className="col-span-12 md:col-span-6 space-y-10">
                <RangeField
                  label="Monthly SIP"
                  value={sipMonthly}
                  min={500}
                  max={200000}
                  step={500}
                  format={inr}
                  onChange={setSipMonthly}
                  testid="sip-monthly"
                />
                <RangeField
                  label="Time horizon"
                  unit=" yrs"
                  value={sipYears}
                  min={1}
                  max={40}
                  step={1}
                  onChange={setSipYears}
                  testid="sip-years"
                />
                <RangeField
                  label="Expected return (p.a.)"
                  unit="%"
                  value={sipRate}
                  min={4}
                  max={20}
                  step={0.5}
                  onChange={setSipRate}
                  testid="sip-rate"
                />
              </div>

              {/* Results */}
              <div className="col-span-12 md:col-span-6 md:pl-10">
                <div
                  className="p-8 md:p-10 h-full"
                  style={{
                    border: "1px solid rgba(244,239,230,0.14)",
                    background:
                      "linear-gradient(180deg, rgba(244,239,230,0.04), rgba(244,239,230,0.01))",
                  }}
                >
                  <StatTile label="Projected corpus" value={inrShort(sip.fv)} accent big />
                  <div className="mt-10 grid grid-cols-2 gap-8 pt-8 border-t border-hair-light">
                    <StatTile label="You invest" value={inrShort(sip.invested)} />
                    <StatTile label="Wealth gained" value={inrShort(sip.gains)} />
                  </div>
                  <p className="mt-10 font-mono-label text-on-dark-mute leading-relaxed">
                    Assumes monthly compounding. Mutual fund returns are market-linked and
                    not guaranteed — this is an illustrative projection, not advice.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="emi"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-12 gap-10 md:gap-16"
              data-testid="calculator-emi"
            >
              <div className="col-span-12 md:col-span-6 space-y-10">
                <RangeField
                  label="Loan amount"
                  value={loanPrincipal}
                  min={100000}
                  max={30000000}
                  step={50000}
                  format={inrShort}
                  onChange={setLoanPrincipal}
                  testid="emi-principal"
                />
                <RangeField
                  label="Tenure"
                  unit=" yrs"
                  value={loanYears}
                  min={1}
                  max={30}
                  step={1}
                  onChange={setLoanYears}
                  testid="emi-years"
                />
                <RangeField
                  label="Interest rate (p.a.)"
                  unit="%"
                  value={loanRate}
                  min={6}
                  max={18}
                  step={0.05}
                  onChange={setLoanRate}
                  testid="emi-rate"
                />
              </div>

              <div className="col-span-12 md:col-span-6 md:pl-10">
                <div
                  className="p-8 md:p-10 h-full"
                  style={{
                    border: "1px solid rgba(244,239,230,0.14)",
                    background:
                      "linear-gradient(180deg, rgba(244,239,230,0.04), rgba(244,239,230,0.01))",
                  }}
                >
                  <StatTile label="Monthly EMI" value={inrShort(emi.emi)} accent big />
                  <div className="mt-10 grid grid-cols-2 gap-8 pt-8 border-t border-hair-light">
                    <StatTile label="Total interest" value={inrShort(emi.interest)} />
                    <StatTile label="Total payable" value={inrShort(emi.total)} />
                  </div>
                  <p className="mt-10 font-mono-label text-on-dark-mute leading-relaxed">
                    Indicative EMI on reducing balance. Final offers depend on the lender,
                    your credit profile and processing fees — we'll shortlist the best.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="mt-14 md:mt-20 flex flex-wrap items-center gap-6">
          <Link
            to="/contact"
            state={leadPayload}
            className="hf-btn-coral"
            data-testid="calculator-cta-plan"
          >
            Send this to an advisor
            <ArrowUpRight size={16} strokeWidth={1.5} />
          </Link>
          <p className="font-mono-label text-on-dark-mute max-w-md">
            Your numbers pre-fill the enquiry form — one senior advisor replies within a
            working day.
          </p>
        </div>
      </div>
    </section>
  );
}
