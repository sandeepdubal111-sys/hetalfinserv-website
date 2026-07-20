// 15 calculator configurations — schema-driven.
// Each config: { slug, group, title, tagline, service, icon, inputs, compute, format }
// `compute(values)` returns { primary: {label, value}, breakdown: [{label, value}], note?, leadMessage }

import {
  fvSIP,
  fvLumpsum,
  computeEMI,
  computeRetirement,
  lifeCoverNeed,
  goalPlan,
  simulateSWP,
  fvSipTopUp,
  fvLimitedSIP,
  costOfDelay,
  homeLoanSip,
  sipForTarget,
} from "./calcMath";

// ── Formatting helpers (INR, Cr/L) ──────────────────────────────
export function inr(n) {
  if (!isFinite(n)) return "₹0";
  const s = Math.round(n).toString();
  const last3 = s.slice(-3);
  const other = s.slice(0, -3);
  const commas = other ? other.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  return `₹${commas}`;
}
export function inrShort(n) {
  if (!isFinite(n)) return "₹0";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return inr(n);
}

const rangeAmt = (extra = {}) => ({ type: "range", format: inr, ...extra });
const rangePct = (extra = {}) => ({ type: "range", unit: "%", ...extra });
const rangeYrs = (extra = {}) => ({ type: "range", unit: " yrs", ...extra });
const rangeAge = (extra = {}) => ({ type: "range", unit: " yrs", ...extra });
const rangeShortAmt = (extra = {}) => ({ type: "range", format: inrShort, ...extra });

// ── Configs ────────────────────────────────────────────────────
export const CALCULATORS = [
  // ─── INVESTMENT ───
  {
    slug: "sip",
    group: "Investment",
    title: "SIP Calculator",
    tagline: "How your monthly SIP compounds over time.",
    service: "Wealth & Investments",
    inputs: [
      { key: "monthly", label: "Monthly SIP", min: 500, max: 200000, step: 500, default: 10000, ...rangeAmt() },
      { key: "years", label: "Time horizon", min: 1, max: 40, step: 1, default: 15, ...rangeYrs() },
      { key: "rate", label: "Expected return (p.a.)", min: 4, max: 20, step: 0.5, default: 12, ...rangePct() },
    ],
    compute: (v) => {
      const invested = v.monthly * v.years * 12;
      const fv = fvSIP(v.monthly, v.years, v.rate);
      return {
        primary: { label: "Projected corpus", value: inrShort(fv) },
        breakdown: [
          { label: "You invest", value: inrShort(invested) },
          { label: "Wealth gained", value: inrShort(fv - invested) },
        ],
        note: "Assumes monthly compounding. Mutual fund returns are market-linked and not guaranteed.",
        leadMessage: `SIP plan — ₹${v.monthly.toLocaleString("en-IN")}/mo · ${v.years} yrs · ${v.rate}% expected → ${inrShort(fv)} corpus (invested ${inrShort(invested)}).`,
      };
    },
  },
  {
    slug: "lumpsum",
    group: "Investment",
    title: "Lumpsum Calculator",
    tagline: "Compound growth on a one-time investment.",
    service: "Wealth & Investments",
    inputs: [
      { key: "principal", label: "Lumpsum amount", min: 10000, max: 20000000, step: 10000, default: 500000, ...rangeShortAmt() },
      { key: "years", label: "Time horizon", min: 1, max: 40, step: 1, default: 10, ...rangeYrs() },
      { key: "rate", label: "Expected return (p.a.)", min: 4, max: 20, step: 0.5, default: 12, ...rangePct() },
    ],
    compute: (v) => {
      const fv = fvLumpsum(v.principal, v.years, v.rate);
      return {
        primary: { label: "Projected corpus", value: inrShort(fv) },
        breakdown: [
          { label: "You invest", value: inrShort(v.principal) },
          { label: "Wealth gained", value: inrShort(fv - v.principal) },
        ],
        note: "Annual compounding. Assumes reinvestment; returns are market-linked.",
        leadMessage: `Lumpsum plan — ${inrShort(v.principal)} · ${v.years} yrs · ${v.rate}% → ${inrShort(fv)}.`,
      };
    },
  },
  {
    slug: "cost-of-delay",
    group: "Investment",
    title: "Cost of Delay",
    tagline: "See what postponing your SIP truly costs.",
    service: "Wealth & Investments",
    inputs: [
      { key: "monthly", label: "Monthly SIP", min: 500, max: 100000, step: 500, default: 10000, ...rangeAmt() },
      { key: "years", label: "Target horizon", min: 5, max: 40, step: 1, default: 20, ...rangeYrs() },
      { key: "rate", label: "Expected return (p.a.)", min: 4, max: 20, step: 0.5, default: 12, ...rangePct() },
      { key: "delayYears", label: "Years you delay by", min: 1, max: 15, step: 1, default: 5, ...rangeYrs() },
    ],
    compute: (v) => {
      const { onTime, late, lost } = costOfDelay({ monthly: v.monthly, years: v.years, ratePct: v.rate, delayYears: v.delayYears });
      return {
        primary: { label: "Cost of delay", value: inrShort(lost), tone: "coral" },
        breakdown: [
          { label: "If you start today", value: inrShort(onTime) },
          { label: `If you delay ${v.delayYears} yrs`, value: inrShort(late) },
        ],
        note: "The single biggest lever in wealth-building is time. Every year matters.",
        leadMessage: `Cost of delay — ₹${v.monthly.toLocaleString("en-IN")}/mo · ${v.years}yr goal · delaying ${v.delayYears} yrs costs ${inrShort(lost)}.`,
      };
    },
  },
  {
    slug: "sip-topup",
    group: "Investment",
    title: "SIP Top-Up",
    tagline: "Increase your SIP each year — the compounding on the increment.",
    service: "Wealth & Investments",
    inputs: [
      { key: "monthly", label: "Starting monthly SIP", min: 500, max: 100000, step: 500, default: 10000, ...rangeAmt() },
      { key: "years", label: "Time horizon", min: 3, max: 40, step: 1, default: 15, ...rangeYrs() },
      { key: "rate", label: "Expected return (p.a.)", min: 4, max: 20, step: 0.5, default: 12, ...rangePct() },
      { key: "topUpPct", label: "Annual top-up", min: 0, max: 30, step: 1, default: 10, ...rangePct() },
    ],
    compute: (v) => {
      const { fv, invested, gains } = fvSipTopUp({ monthly: v.monthly, years: v.years, ratePct: v.rate, topUpPct: v.topUpPct });
      return {
        primary: { label: "Projected corpus", value: inrShort(fv) },
        breakdown: [
          { label: "Total invested", value: inrShort(invested) },
          { label: "Wealth gained", value: inrShort(gains) },
        ],
        note: `Your SIP increases ${v.topUpPct}% every year — mirroring your salary hike.`,
        leadMessage: `SIP Top-Up — start ₹${v.monthly.toLocaleString("en-IN")}/mo · ${v.topUpPct}%/yr top-up · ${v.years} yrs · ${v.rate}% → ${inrShort(fv)}.`,
      };
    },
  },
  {
    slug: "limited-period-sip",
    group: "Investment",
    title: "Limited Period SIP",
    tagline: "Invest for a few years — then let it grow untouched.",
    service: "Wealth & Investments",
    inputs: [
      { key: "monthly", label: "Monthly SIP", min: 500, max: 200000, step: 500, default: 15000, ...rangeAmt() },
      { key: "sipYears", label: "SIP duration", min: 1, max: 25, step: 1, default: 5, ...rangeYrs() },
      { key: "totalYears", label: "Total hold period", min: 2, max: 40, step: 1, default: 20, ...rangeYrs() },
      { key: "rate", label: "Expected return (p.a.)", min: 4, max: 20, step: 0.5, default: 12, ...rangePct() },
    ],
    compute: (v) => {
      const sipYears = Math.min(v.sipYears, v.totalYears);
      const { fv, invested, gains, fvAtSipEnd } = fvLimitedSIP({ monthly: v.monthly, sipYears, totalYears: v.totalYears, ratePct: v.rate });
      return {
        primary: { label: "Final corpus", value: inrShort(fv) },
        breakdown: [
          { label: `Corpus after ${sipYears} yrs of SIP`, value: inrShort(fvAtSipEnd) },
          { label: "You invest", value: inrShort(invested) },
          { label: "Wealth gained", value: inrShort(gains) },
        ],
        note: "You stop investing after the SIP period; the accumulated corpus continues to compound.",
        leadMessage: `Limited SIP — ₹${v.monthly.toLocaleString("en-IN")}/mo for ${sipYears}y, held ${v.totalYears}y total, ${v.rate}% → ${inrShort(fv)}.`,
      };
    },
  },
  {
    slug: "birthday-sip",
    group: "Investment",
    title: "Birthday SIP",
    tagline: "Start on your child's birthday. Compound until they turn 18, 21 or 25.",
    service: "Financial Planning",
    inputs: [
      { key: "childAge", label: "Child's current age", min: 0, max: 17, step: 1, default: 3, ...rangeAge() },
      { key: "targetAge", label: "Target age", min: 15, max: 30, step: 1, default: 21, ...rangeAge() },
      { key: "monthly", label: "Monthly SIP", min: 500, max: 100000, step: 500, default: 5000, ...rangeAmt() },
      { key: "rate", label: "Expected return (p.a.)", min: 4, max: 20, step: 0.5, default: 12, ...rangePct() },
    ],
    compute: (v) => {
      const years = Math.max(1, v.targetAge - v.childAge);
      const fv = fvSIP(v.monthly, years, v.rate);
      const invested = v.monthly * years * 12;
      return {
        primary: { label: `Corpus at age ${v.targetAge}`, value: inrShort(fv) },
        breakdown: [
          { label: "Years of compounding", value: `${years} yrs` },
          { label: "You invest", value: inrShort(invested) },
          { label: "Wealth gained", value: inrShort(fv - invested) },
        ],
        note: "The most powerful gift is early, uninterrupted time in the market.",
        leadMessage: `Birthday SIP — start now for child age ${v.childAge}, target age ${v.targetAge}, ₹${v.monthly.toLocaleString("en-IN")}/mo, ${v.rate}% → ${inrShort(fv)}.`,
      };
    },
  },
  {
    slug: "home-loan-sip",
    group: "Investment",
    title: "Home Loan SIP",
    tagline: "The SIP that offsets your home loan interest.",
    service: "Wealth & Investments",
    inputs: [
      { key: "principal", label: "Loan amount", min: 500000, max: 30000000, step: 100000, default: 5000000, ...rangeShortAmt() },
      { key: "years", label: "Loan tenure", min: 5, max: 30, step: 1, default: 20, ...rangeYrs() },
      { key: "loanRate", label: "Loan rate (p.a.)", min: 6, max: 15, step: 0.05, default: 8.5, ...rangePct() },
      { key: "sipRate", label: "SIP expected return", min: 4, max: 20, step: 0.5, default: 12, ...rangePct() },
    ],
    compute: (v) => {
      const { emi, interest, total, sip } = homeLoanSip({ principal: v.principal, years: v.years, loanRatePct: v.loanRate, sipReturnPct: v.sipRate });
      return {
        primary: { label: "Parallel SIP required", value: inrShort(sip) + "/mo" },
        breakdown: [
          { label: "Monthly EMI", value: inrShort(emi) },
          { label: "Total interest over loan", value: inrShort(interest) },
          { label: "Total repayment", value: inrShort(total) },
        ],
        note: "Run this SIP alongside your EMI — by loan-end, the SIP corpus covers the interest cost.",
        leadMessage: `Home-Loan SIP — ${inrShort(v.principal)} @ ${v.loanRate}% for ${v.years}y (EMI ${inrShort(emi)}). Parallel SIP: ${inrShort(sip)}/mo at ${v.sipRate}%.`,
      };
    },
  },

  // ─── LOAN / WITHDRAWAL ───
  {
    slug: "emi",
    group: "Loan & Withdrawal",
    title: "EMI Calculator",
    tagline: "Monthly EMI on any reducing-balance loan.",
    service: "Loan Services",
    inputs: [
      { key: "principal", label: "Loan amount", min: 100000, max: 30000000, step: 50000, default: 2500000, ...rangeShortAmt() },
      { key: "years", label: "Tenure", min: 1, max: 30, step: 1, default: 20, ...rangeYrs() },
      { key: "rate", label: "Interest rate (p.a.)", min: 6, max: 18, step: 0.05, default: 8.5, ...rangePct() },
    ],
    compute: (v) => {
      const { emi, total, interest } = computeEMI(v.principal, v.years, v.rate);
      return {
        primary: { label: "Monthly EMI", value: inrShort(emi) },
        breakdown: [
          { label: "Total interest", value: inrShort(interest) },
          { label: "Total payable", value: inrShort(total) },
        ],
        note: "Reducing-balance. Final offer depends on the lender, credit profile and processing fees.",
        leadMessage: `Loan enquiry — ${inrShort(v.principal)} · ${v.years}y · ${v.rate}%. EMI ${inrShort(emi)}, interest ${inrShort(interest)}, total ${inrShort(total)}.`,
      };
    },
  },
  {
    slug: "swp",
    group: "Loan & Withdrawal",
    title: "SWP Calculator",
    tagline: "Systematic withdrawal — turn your corpus into a monthly income.",
    service: "Wealth & Investments",
    inputs: [
      { key: "corpus", label: "Starting corpus", min: 100000, max: 100000000, step: 100000, default: 5000000, ...rangeShortAmt() },
      { key: "monthlyWithdraw", label: "Monthly withdrawal", min: 5000, max: 500000, step: 1000, default: 50000, ...rangeAmt() },
      { key: "years", label: "Withdrawal period", min: 1, max: 40, step: 1, default: 20, ...rangeYrs() },
      { key: "rate", label: "Expected return (p.a.)", min: 4, max: 15, step: 0.5, default: 9, ...rangePct() },
    ],
    compute: (v) => {
      const { finalBalance, totalWithdrawn, monthsLasted } = simulateSWP({ corpus: v.corpus, monthlyWithdraw: v.monthlyWithdraw, years: v.years, ratePct: v.rate });
      const runsOutEarly = monthsLasted < v.years * 12;
      return {
        primary: {
          label: runsOutEarly ? "Corpus lasts" : "Corpus at end",
          value: runsOutEarly ? `${Math.floor(monthsLasted / 12)} yrs ${monthsLasted % 12}m` : inrShort(finalBalance),
          tone: runsOutEarly ? "coral" : "gold",
        },
        breakdown: [
          { label: "Total withdrawn", value: inrShort(totalWithdrawn) },
          { label: runsOutEarly ? "Remaining balance" : "Withdrawal duration", value: runsOutEarly ? inrShort(finalBalance) : `${v.years} yrs` },
        ],
        note: "Ideal for retirees — the residual corpus keeps compounding while you draw a monthly income.",
        leadMessage: `SWP — start with ${inrShort(v.corpus)}, withdraw ${inrShort(v.monthlyWithdraw)}/mo at ${v.rate}%. ${runsOutEarly ? `Corpus lasts ~${Math.floor(monthsLasted/12)}y ${monthsLasted%12}m.` : `Corpus at ${v.years}y: ${inrShort(finalBalance)}.`}`,
      };
    },
  },

  // ─── GOAL PLANNING ───
  {
    slug: "retirement",
    group: "Goal Planning",
    title: "Dream Retirement",
    tagline: "The corpus that funds the life you've earned.",
    service: "Financial Planning",
    inputs: [
      { key: "currentAge", label: "Current age", min: 20, max: 60, step: 1, default: 32, ...rangeAge() },
      { key: "retireAge", label: "Retirement age", min: 40, max: 75, step: 1, default: 60, ...rangeAge() },
      { key: "lifeExp", label: "Life expectancy", min: 60, max: 100, step: 1, default: 85, ...rangeAge() },
      { key: "currentMonthlyExpense", label: "Current monthly expense", min: 10000, max: 500000, step: 1000, default: 60000, ...rangeAmt() },
      { key: "preInflPct", label: "Inflation (pre-retirement)", min: 3, max: 12, step: 0.25, default: 6, ...rangePct() },
      { key: "postInflPct", label: "Inflation (post-retirement)", min: 2, max: 10, step: 0.25, default: 5, ...rangePct() },
      { key: "postReturnPct", label: "Post-retirement return", min: 4, max: 12, step: 0.5, default: 7, ...rangePct() },
      { key: "existingCorpus", label: "Existing investments", min: 0, max: 20000000, step: 50000, default: 500000, ...rangeShortAmt() },
      { key: "existingReturnPct", label: "Return on existing", min: 4, max: 15, step: 0.5, default: 10, ...rangePct() },
      { key: "newReturnPct", label: "Return on new SIP", min: 6, max: 18, step: 0.5, default: 12, ...rangePct() },
    ],
    compute: (v) => {
      const r = computeRetirement({
        currentAge: v.currentAge,
        retireAge: v.retireAge,
        lifeExp: v.lifeExp,
        currentMonthlyExpense: v.currentMonthlyExpense,
        preInflPct: v.preInflPct,
        postInflPct: v.postInflPct,
        postReturnPct: v.postReturnPct,
        existingCorpus: v.existingCorpus,
        existingReturnPct: v.existingReturnPct,
        newReturnPct: v.newReturnPct,
      });
      return {
        primary: { label: "Monthly SIP required", value: inrShort(r.monthlySIP) + "/mo" },
        breakdown: [
          { label: "Corpus needed at retirement", value: inrShort(r.corpusNeeded) },
          { label: "Existing corpus at retirement", value: inrShort(r.existingGrown) },
          { label: "Shortfall to fund", value: inrShort(r.shortfall) },
          { label: "Monthly expense at retirement", value: inrShort(r.monthlyExpAtRetire) },
        ],
        note: "Real-return method — pre-retirement growth minus post-retirement inflation shapes the corpus.",
        leadMessage: `Retirement plan — retire at ${v.retireAge}, expenses today ₹${v.currentMonthlyExpense.toLocaleString("en-IN")}/mo. Corpus needed ${inrShort(r.corpusNeeded)}; monthly SIP ${inrShort(r.monthlySIP)}.`,
      };
    },
  },
  {
    slug: "child-education",
    group: "Goal Planning",
    title: "Child's Education",
    tagline: "Inflation-adjusted corpus for the education you want to gift.",
    service: "Financial Planning",
    inputs: [
      { key: "currentCost", label: "Today's education cost", min: 200000, max: 20000000, step: 50000, default: 2500000, ...rangeShortAmt() },
      { key: "years", label: "Years until admission", min: 1, max: 25, step: 1, default: 12, ...rangeYrs() },
      { key: "inflationPct", label: "Education inflation", min: 4, max: 15, step: 0.25, default: 10, ...rangePct() },
      { key: "returnPct", label: "Expected return", min: 6, max: 18, step: 0.5, default: 12, ...rangePct() },
    ],
    compute: (v) => {
      const { futureCost, sip } = goalPlan({ currentCost: v.currentCost, years: v.years, inflationPct: v.inflationPct, returnPct: v.returnPct });
      return {
        primary: { label: "Monthly SIP required", value: inrShort(sip) + "/mo" },
        breakdown: [
          { label: "Future cost of education", value: inrShort(futureCost) },
          { label: "Time available", value: `${v.years} yrs` },
        ],
        note: "Education inflation in India is 8-12% p.a. — historically higher than headline CPI.",
        leadMessage: `Child's education goal — today's cost ${inrShort(v.currentCost)}, in ${v.years}y at ${v.inflationPct}% inflation = ${inrShort(futureCost)}. SIP needed: ${inrShort(sip)}/mo.`,
      };
    },
  },
  {
    slug: "child-marriage",
    group: "Goal Planning",
    title: "Grand Wedding",
    tagline: "Fund your child's wedding without touching your retirement.",
    service: "Financial Planning",
    inputs: [
      { key: "currentCost", label: "Today's wedding cost", min: 500000, max: 50000000, step: 100000, default: 3000000, ...rangeShortAmt() },
      { key: "years", label: "Years until wedding", min: 1, max: 30, step: 1, default: 15, ...rangeYrs() },
      { key: "inflationPct", label: "Inflation", min: 3, max: 12, step: 0.25, default: 7, ...rangePct() },
      { key: "returnPct", label: "Expected return", min: 6, max: 18, step: 0.5, default: 12, ...rangePct() },
    ],
    compute: (v) => {
      const { futureCost, sip } = goalPlan({ currentCost: v.currentCost, years: v.years, inflationPct: v.inflationPct, returnPct: v.returnPct });
      return {
        primary: { label: "Monthly SIP required", value: inrShort(sip) + "/mo" },
        breakdown: [
          { label: "Future cost", value: inrShort(futureCost) },
          { label: "Time available", value: `${v.years} yrs` },
        ],
        note: "Weddings are cultural investments — plan them separately from retirement.",
        leadMessage: `Wedding goal — today's cost ${inrShort(v.currentCost)}, in ${v.years}y = ${inrShort(futureCost)}. SIP needed: ${inrShort(sip)}/mo.`,
      };
    },
  },
  {
    slug: "dream-car",
    group: "Goal Planning",
    title: "Dream Car / Property",
    tagline: "SIP for that upgrade you've been quietly wanting.",
    service: "Wealth & Investments",
    inputs: [
      { key: "currentCost", label: "Today's price", min: 100000, max: 50000000, step: 50000, default: 1500000, ...rangeShortAmt() },
      { key: "years", label: "Years until purchase", min: 1, max: 20, step: 1, default: 5, ...rangeYrs() },
      { key: "inflationPct", label: "Price inflation", min: 3, max: 12, step: 0.25, default: 6, ...rangePct() },
      { key: "returnPct", label: "Expected return", min: 4, max: 18, step: 0.5, default: 10, ...rangePct() },
    ],
    compute: (v) => {
      const { futureCost, sip } = goalPlan({ currentCost: v.currentCost, years: v.years, inflationPct: v.inflationPct, returnPct: v.returnPct });
      return {
        primary: { label: "Monthly SIP required", value: inrShort(sip) + "/mo" },
        breakdown: [
          { label: "Future price", value: inrShort(futureCost) },
          { label: "Time available", value: `${v.years} yrs` },
        ],
        note: "For a big-ticket goal in 3–7 years, a balanced hybrid fund is often the right vehicle.",
        leadMessage: `Car/property goal — today's price ${inrShort(v.currentCost)}, in ${v.years}y = ${inrShort(futureCost)}. SIP needed: ${inrShort(sip)}/mo.`,
      };
    },
  },
  {
    slug: "dream-vacation",
    group: "Goal Planning",
    title: "Dream Vacation",
    tagline: "The trip you've been meaning to take — actually funded.",
    service: "Financial Planning",
    inputs: [
      { key: "currentCost", label: "Today's trip budget", min: 50000, max: 5000000, step: 10000, default: 500000, ...rangeShortAmt() },
      { key: "years", label: "Years until trip", min: 1, max: 10, step: 1, default: 3, ...rangeYrs() },
      { key: "inflationPct", label: "Travel inflation", min: 3, max: 12, step: 0.25, default: 7, ...rangePct() },
      { key: "returnPct", label: "Expected return", min: 4, max: 15, step: 0.5, default: 9, ...rangePct() },
    ],
    compute: (v) => {
      const { futureCost, sip } = goalPlan({ currentCost: v.currentCost, years: v.years, inflationPct: v.inflationPct, returnPct: v.returnPct });
      return {
        primary: { label: "Monthly SIP required", value: inrShort(sip) + "/mo" },
        breakdown: [
          { label: "Future cost", value: inrShort(futureCost) },
          { label: "Time available", value: `${v.years} yrs` },
        ],
        note: "For short horizons, keep it liquid — arbitrage or short-duration funds work well.",
        leadMessage: `Vacation goal — today's budget ${inrShort(v.currentCost)}, in ${v.years}y = ${inrShort(futureCost)}. SIP needed: ${inrShort(sip)}/mo.`,
      };
    },
  },
  {
    slug: "life-insurance",
    group: "Goal Planning",
    title: "Life Insurance Need",
    tagline: "The cover your family needs — Human Life Value method.",
    service: "Insurance Services",
    inputs: [
      { key: "currentAge", label: "Current age", min: 20, max: 60, step: 1, default: 35, ...rangeAge() },
      { key: "retireAge", label: "Working till (age)", min: 40, max: 70, step: 1, default: 60, ...rangeAge() },
      { key: "annualIncome", label: "Current annual income", min: 200000, max: 20000000, step: 50000, default: 1200000, ...rangeShortAmt() },
      { key: "incomeGrowthPct", label: "Income growth (p.a.)", min: 0, max: 15, step: 0.5, default: 8, ...rangePct() },
      { key: "discountPct", label: "Discount rate", min: 4, max: 12, step: 0.5, default: 7, ...rangePct() },
    ],
    compute: (v) => {
      const cover = lifeCoverNeed({
        currentAge: v.currentAge,
        retireAge: v.retireAge,
        annualIncome: v.annualIncome,
        incomeGrowthPct: v.incomeGrowthPct,
        discountPct: v.discountPct,
      });
      const yrs = Math.max(0, v.retireAge - v.currentAge);
      return {
        primary: { label: "Life cover recommended", value: inrShort(cover) },
        breakdown: [
          { label: "Working years remaining", value: `${yrs} yrs` },
          { label: "PV of future incomes", value: inrShort(cover) },
        ],
        note: "Term insurance is the cheapest way to fill this gap — protect your family's future without touching investments.",
        leadMessage: `Life-cover need — HLV ${inrShort(cover)} for age ${v.currentAge}→${v.retireAge}, income ${inrShort(v.annualIncome)}/yr @ ${v.incomeGrowthPct}%. Please suggest term policies.`,
      };
    },
  },
];

export const CALC_GROUPS = [
  { key: "Investment", label: "Investment", tone: "gold" },
  { key: "Loan & Withdrawal", label: "Loan & Withdrawal", tone: "coral" },
  { key: "Goal Planning", label: "Goal Planning", tone: "emerald" },
];

export function getCalculator(slug) {
  return CALCULATORS.find((c) => c.slug === slug) || CALCULATORS[0];
}
