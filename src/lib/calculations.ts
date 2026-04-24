/**
 * Future value of a single lump sum with compound growth.
 * Equivalent to Google Sheets: =FV(rate, years, 0, -principal)
 * Formula: principal * (1 + rate)^years
 */
export function futureValue(principal: number, annualRate: number, years: number): number {
  return principal * Math.pow(1 + annualRate, years);
}

/**
 * Rent in a future year, given starting rent and annual increase rate.
 * Equivalent to Google Sheets: =currentRent * (1 + rate)^years
 */
export function projectedRent(currentMonthlyRent: number, annualIncreaseRate: number, years: number): number {
  return currentMonthlyRent * Math.pow(1 + annualIncreaseRate, years);
}

/**
 * Monthly mortgage payment (principal + interest only).
 * Equivalent to Google Sheets: =PMT(rate/12, years*12, -loanAmount)
 * Formula: P * [r(1+r)^n] / [(1+r)^n - 1]
 *   where P = loan amount, r = monthly rate, n = total months
 */
export function monthlyMortgagePayment(loanAmount: number, annualInterestRate: number, termYears: number): number {
  if (annualInterestRate === 0) {
    return loanAmount / (termYears * 12);
  }
  const r = annualInterestRate / 12;
  const n = termYears * 12;
  return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Remaining mortgage balance after yearsElapsed full years of payments.
 * Formula: P * [(1+r)^n - (1+r)^p] / [(1+r)^n - 1]
 *   where P = original loan, r = monthly rate, n = total months, p = months paid
 */
export function remainingBalance(
  loanAmount: number,
  annualInterestRate: number,
  termYears: number,
  yearsElapsed: number,
): number {
  if (annualInterestRate === 0) {
    const monthsPaid = yearsElapsed * 12;
    const totalMonths = termYears * 12;
    return loanAmount * (1 - monthsPaid / totalMonths);
  }
  const r = annualInterestRate / 12;
  const n = termYears * 12;
  const p = yearsElapsed * 12;
  return loanAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Generates a year-by-year array of rent values from year 0 to year N.
 */
export function rentSchedule(
  currentMonthlyRent: number,
  annualIncreaseRate: number,
  years: number,
): Array<{ year: number; monthlyRent: number; annualRent: number }> {
  return Array.from({ length: years + 1 }, (_, i) => {
    const monthly = projectedRent(currentMonthlyRent, annualIncreaseRate, i);
    return { year: i, monthlyRent: monthly, annualRent: monthly * 12 };
  });
}

/**
 * Total buy costs paid from year 0 through end of given year (nominal, not discounted).
 * Each year's costs = monthlyBuyCosts * (1 + rate)^year * 12.
 * Sum is a growing annuity: monthlyBuyCosts * 12 * [(1+rate)^years - 1] / rate  (rate > 0)
 * Equivalent to summing each year's annual cost in Google Sheets.
 */
export function cumulativeBuyCosts(
  monthlyBuyCosts: number,
  annualIncreaseRate: number,
  years: number,
): number {
  if (years === 0) return 0;
  const annualCostYear0 = monthlyBuyCosts * 12;
  if (annualIncreaseRate === 0) return annualCostYear0 * years;
  // growing annuity sum: C * [(1+r)^n - 1] / r
  return annualCostYear0 * (Math.pow(1 + annualIncreaseRate, years) - 1) / annualIncreaseRate;
}

/**
 * Generates a year-by-year investment balance.
 * Principal grows annually at the given rate. Optional annualContribution added each year.
 */
export function investmentSchedule(
  principal: number,
  annualRate: number,
  years: number,
  annualContribution?: number,
): Array<{ year: number; balance: number }> {
  const result: Array<{ year: number; balance: number }> = [];
  let balance = principal;
  result.push({ year: 0, balance });
  for (let i = 1; i <= years; i++) {
    balance = balance * (1 + annualRate) + (annualContribution ?? 0);
    result.push({ year: i, balance });
  }
  return result;
}
