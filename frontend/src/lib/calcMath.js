// Shared financial math for calculator suite.
// Every function is pure — takes numbers, returns numbers/objects.

export const monthsIn = (yrs) => yrs * 12;
export const monthlyRate = (annualPct) => annualPct / 100 / 12;

// FV of a monthly SIP (beginning-of-month convention, common in India).
export function fvSIP(monthly, years, ratePct) {
  const n = monthsIn(years);
  const r = monthlyRate(ratePct);
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

// FV of a lumpsum after n years compounded annually.
export function fvLumpsum(principal, years, ratePct) {
  return principal * Math.pow(1 + ratePct / 100, years);
}

// PV of a future value (annual compounding).
export function pv(fv, years, ratePct) {
  return fv / Math.pow(1 + ratePct / 100, years);
}

// EMI on a reducing-balance loan.
export function computeEMI(principal, years, ratePct) {
  const n = monthsIn(years);
  const r = monthlyRate(ratePct);
  if (r === 0) return { emi: principal / n, total: principal, interest: 0 };
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  return { emi, total, interest: total - principal };
}

// Monthly SIP needed to reach a target FV in `years` at `ratePct`.
export function sipForTarget(targetFV, years, ratePct) {
  const n = monthsIn(years);
  const r = monthlyRate(ratePct);
  if (r === 0) return targetFV / n;
  const denom = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return targetFV / denom;
}

// Future cost after n years given current cost & inflation.
export function inflate(current, years, inflationPct) {
  return current * Math.pow(1 + inflationPct / 100, years);
}

// SWP — simulate; returns { finalBalance, totalWithdrawn, monthsLasted }
export function simulateSWP({ corpus, monthlyWithdraw, years, ratePct }) {
  const r = monthlyRate(ratePct);
  const n = monthsIn(years);
  let bal = corpus;
  let withdrawn = 0;
  let monthsLasted = n;
  for (let m = 1; m <= n; m++) {
    bal = bal * (1 + r) - monthlyWithdraw;
    if (bal <= 0) {
      withdrawn += monthlyWithdraw + bal; // partial last withdrawal
      bal = 0;
      monthsLasted = m;
      break;
    }
    withdrawn += monthlyWithdraw;
  }
  return { finalBalance: bal, totalWithdrawn: withdrawn, monthsLasted };
}

// SIP Top-Up — monthly SIP escalates by `topUpPct` every year.
export function fvSipTopUp({ monthly, years, ratePct, topUpPct }) {
  const rMonthly = monthlyRate(ratePct);
  let total = 0;
  let sip = monthly;
  for (let y = 0; y < years; y++) {
    // FV of this year's 12 SIPs at end of year
    const yearFV =
      rMonthly === 0
        ? sip * 12
        : sip * ((Math.pow(1 + rMonthly, 12) - 1) / rMonthly) * (1 + rMonthly);
    // Grow to final year
    const yearsLeft = years - y - 1;
    total += yearFV * Math.pow(1 + ratePct / 100, yearsLeft);
    sip = sip * (1 + topUpPct / 100);
  }
  const invested = (() => {
    let s = monthly;
    let inv = 0;
    for (let y = 0; y < years; y++) {
      inv += s * 12;
      s = s * (1 + topUpPct / 100);
    }
    return inv;
  })();
  return { fv: total, invested, gains: total - invested };
}

// Limited-Period SIP — invest for `sipYears`, hold till `totalYears`.
export function fvLimitedSIP({ monthly, sipYears, totalYears, ratePct }) {
  const fvAtSipEnd = fvSIP(monthly, sipYears, ratePct);
  const holdYears = Math.max(0, totalYears - sipYears);
  const fv = fvLumpsum(fvAtSipEnd, holdYears, ratePct);
  const invested = monthly * monthsIn(sipYears);
  return { fv, invested, gains: fv - invested, fvAtSipEnd };
}

// Cost of Delay — starting X years late.
export function costOfDelay({ monthly, years, ratePct, delayYears }) {
  const onTime = fvSIP(monthly, years, ratePct);
  const late = fvSIP(monthly, Math.max(0, years - delayYears), ratePct);
  return { onTime, late, lost: onTime - late };
}

// Retirement corpus & SIP required.
// Assumes real-return method (Wealth grows at ratePct; PV of expenses uses
// inflation-adjusted post-retirement return).
export function computeRetirement({
  currentAge,
  retireAge,
  lifeExp,
  currentMonthlyExpense,
  preInflPct,
  postInflPct,
  postReturnPct,
  existingCorpus,
  existingReturnPct,
  newReturnPct,
}) {
  const yearsToRetire = Math.max(0, retireAge - currentAge);
  const yearsInRetirement = Math.max(0, lifeExp - retireAge);
  // Monthly expense at retirement
  const monthlyExpAtRetire = currentMonthlyExpense * Math.pow(1 + preInflPct / 100, yearsToRetire);
  const annualExpAtRetire = monthlyExpAtRetire * 12;
  // Real return during retirement (post-return vs post-inflation)
  const realRate = (1 + postReturnPct / 100) / (1 + postInflPct / 100) - 1;
  // Corpus needed = PV of growing annuity at retirement start
  const corpusNeeded =
    realRate === 0
      ? annualExpAtRetire * yearsInRetirement
      : annualExpAtRetire * ((1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate);
  // Existing corpus grown to retirement
  const existingGrown = fvLumpsum(existingCorpus, yearsToRetire, existingReturnPct);
  const shortfall = Math.max(0, corpusNeeded - existingGrown);
  const monthlySIP = sipForTarget(shortfall, yearsToRetire, newReturnPct);
  return {
    corpusNeeded,
    existingGrown,
    shortfall,
    monthlySIP,
    monthlyExpAtRetire,
  };
}

// Life Insurance Need — human life value method.
// Cover = sum of PV of future annual incomes till retirement.
export function lifeCoverNeed({ currentAge, retireAge, annualIncome, incomeGrowthPct, discountPct }) {
  const n = Math.max(0, retireAge - currentAge);
  let cover = 0;
  for (let t = 1; t <= n; t++) {
    const inc = annualIncome * Math.pow(1 + incomeGrowthPct / 100, t - 1);
    cover += inc / Math.pow(1 + discountPct / 100, t);
  }
  return cover;
}

// Home Loan SIP — SIP required to build a corpus equal to your loan's interest cost.
export function homeLoanSip({ principal, years, loanRatePct, sipReturnPct }) {
  const { emi, interest, total } = computeEMI(principal, years, loanRatePct);
  const sip = sipForTarget(interest, years, sipReturnPct);
  return { emi, interest, total, sip };
}

// Goal — future cost + monthly SIP required to reach it.
export function goalPlan({ currentCost, years, inflationPct, returnPct }) {
  const futureCost = inflate(currentCost, years, inflationPct);
  const sip = sipForTarget(futureCost, years, returnPct);
  return { futureCost, sip };
}
