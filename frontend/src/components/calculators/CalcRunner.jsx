import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/**
 * Schema-driven calculator engine.
 * Consumes a config from lib/calculators.js and renders inputs + live results.
 */

function RangeField({ input, value, onChange }) {
  const { key, label, min, max, step, unit, format } = input;
  const displayValue = format ? format(value) : `${value}${unit || ""}`;
  const displayMin = format ? format(min) : `${min}${unit || ""}`;
  const displayMax = format ? format(max) : `${max}${unit || ""}`;
  return (
    <div data-testid={`calc-input-${key}`}>
      <div className="flex items-baseline justify-between gap-4">
        <label className="font-mono-label text-[color:var(--hf-gold-soft)]">{label}</label>
        <span
          className="font-display text-on-dark"
          style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.4rem)", lineHeight: 1 }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="hf-range mt-3 w-full"
        aria-label={label}
      />
      <div className="mt-1 flex justify-between font-mono-label text-on-dark-mute text-[0.66rem]">
        <span>{displayMin}</span>
        <span>{displayMax}</span>
      </div>
    </div>
  );
}

function ResultTile({ label, value, big, accent }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono-label text-[color:var(--hf-gold-soft)]">— {label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="font-display"
        style={{
          fontSize: big ? "clamp(2rem, 4.4vw, 4rem)" : "clamp(1.2rem, 2vw, 1.6rem)",
          lineHeight: 0.95,
          color: accent === "coral" ? "var(--hf-coral)" : accent === "gold" ? "var(--hf-gold)" : "#f4efe6",
        }}
      >
        {value}
      </motion.span>
    </div>
  );
}

export default function CalcRunner({ config, hideHeader = false }) {
  // seed initial values from schema defaults
  const initial = useMemo(() => {
    const o = {};
    config.inputs.forEach((i) => (o[i.key] = i.default));
    return o;
  }, [config]);
  const [values, setValues] = useState(initial);

  // Re-seed if config changes (switching calculators)
  useEffect(() => setValues(initial), [initial]);

  const setValue = (key) => (v) => setValues((s) => ({ ...s, [key]: v }));
  const result = useMemo(() => config.compute(values), [config, values]);

  const leadPayload = {
    service: config.service,
    message: result.leadMessage,
  };

  return (
    <div className="on-dark text-ivory" data-testid={`calc-${config.slug}`}>
      {!hideHeader && (
        <div className="mb-10 md:mb-14">
          <p className="font-mono-label text-[color:var(--hf-gold-soft)]">— {config.group}</p>
          <h2
            className="font-display mt-4"
            style={{
              fontSize: "clamp(1.8rem, 3.4vw, 3.2rem)",
              lineHeight: 0.98,
              color: "#f4efe6",
            }}
          >
            {config.title}
          </h2>
          <p className="mt-4 max-w-2xl text-on-dark-2 leading-relaxed">{config.tagline}</p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-10 md:gap-16">
        {/* Inputs */}
        <div
          className="col-span-12 md:col-span-6"
          data-testid="calc-inputs"
        >
          <div className="space-y-8">
            {config.inputs.map((inp) => (
              <RangeField
                key={inp.key}
                input={inp}
                value={values[inp.key]}
                onChange={setValue(inp.key)}
              />
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="col-span-12 md:col-span-6 md:pl-6" data-testid="calc-result">
          <div
            className="p-7 md:p-10 h-full"
            style={{
              border: "1px solid rgba(244,239,230,0.14)",
              background:
                "linear-gradient(180deg, rgba(244,239,230,0.045), rgba(244,239,230,0.01))",
            }}
          >
            <ResultTile
              label={result.primary.label}
              value={result.primary.value}
              accent={result.primary.tone || "gold"}
              big
            />
            {result.breakdown && result.breakdown.length > 0 && (
              <div
                className="mt-10 grid grid-cols-2 gap-6 md:gap-8 pt-8"
                style={{ borderTop: "1px solid rgba(244,239,230,0.14)" }}
              >
                {result.breakdown.map((b) => (
                  <ResultTile key={b.label} label={b.label} value={b.value} />
                ))}
              </div>
            )}
            {result.note && (
              <p className="mt-10 font-mono-label text-on-dark-mute leading-relaxed">
                {result.note}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 flex flex-wrap items-center gap-6">
        <Link
          to="/contact"
          state={leadPayload}
          className="hf-btn-coral"
          data-testid="calc-cta-plan"
        >
          Send this to an advisor
          <ArrowUpRight size={16} strokeWidth={1.5} />
        </Link>
        <p className="font-mono-label text-on-dark-mute max-w-md">
          Your numbers pre-fill the enquiry form — a senior advisor replies within one working day.
        </p>
      </div>
    </div>
  );
}
