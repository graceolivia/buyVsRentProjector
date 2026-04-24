# Rent vs Buy Dashboard — Spec v1

## Context

This is a personal financial exploration tool for a specific family considering whether to continue renting in NYC or buy a home. It is **not** trying to replace the NYT rent-vs-buy calculator — that tool answers "should we buy?" authoritatively. This tool answers the questions the NYT calculator *doesn't*: what does each path feel like, year by year, given our specific income, savings rate, and rent trajectory?

**Design principle: legibility over sophistication.** Every number on the screen should be derivable from a single simple formula that the user can check against Google Sheets in under a minute. No compound models. No hidden assumptions. When in doubt, show the formula.

## Scope for v1

Two widgets on a single dashboard page. That's it. No saved scenarios, no multi-scenario comparison, no phased inputs yet. Just two simple, trustworthy widgets that teach the user something useful.

**Widget 1: Nest Egg Comparison**
**Widget 2: Rent Escalator vs Fixed Mortgage**

Build these as self-contained React components that share a common inputs panel. Each widget is independently useful and independently verifiable.

---

## Tech stack

- **Framework**: React (with Vite) + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State**: Plain React state (useState/useReducer) — no Zustand for v1, keep it simple
- **No backend**: all computation client-side, no persistence in v1 (refresh = reset is fine)

## File structure

```
src/
  App.tsx                          # Top-level dashboard layout
  components/
    InputsPanel.tsx                # Shared inputs on the left
    NestEggWidget.tsx              # Widget 1
    RentVsMortgageWidget.tsx       # Widget 2
    NumberWithFormula.tsx          # Reusable: click to show derivation
  lib/
    calculations.ts                # All math. Pure functions. Heavily commented.
    calculations.test.ts           # Unit tests with known-good values
  types.ts                         # Shared TypeScript types
```

**Critical**: All math lives in `calculations.ts` as pure functions. No math in components. This makes the math testable and reviewable in isolation.

---

## The math module (build this FIRST)

Before any UI, build `calculations.ts` with these pure functions. Each function should have a doc comment explaining the formula in plain English and citing the equivalent Google Sheets function.

```typescript
/**
 * Future value of a single lump sum with compound growth.
 * Equivalent to Google Sheets: =FV(rate, years, 0, -principal)
 * Formula: principal * (1 + rate)^years
 */
export function futureValue(principal: number, annualRate: number, years: number): number

/**
 * Rent in a future year, given starting rent and annual increase rate.
 * Equivalent to Google Sheets: =currentRent * (1 + rate)^years
 * Formula: identical to futureValue.
 */
export function projectedRent(currentMonthlyRent: number, annualIncreaseRate: number, years: number): number

/**
 * Monthly mortgage payment (principal + interest only, no taxes/insurance).
 * Equivalent to Google Sheets: =PMT(rate/12, years*12, -loanAmount)
 * Formula: P * [r(1+r)^n] / [(1+r)^n - 1]
 *   where P = loan amount, r = monthly rate, n = total months
 */
export function monthlyMortgagePayment(loanAmount: number, annualInterestRate: number, termYears: number): number

/**
 * Generates a year-by-year array of rent values from year 0 to year N.
 * Returns: [{ year: 0, monthlyRent: X, annualRent: Y }, ...]
 */
export function rentSchedule(currentMonthlyRent: number, annualIncreaseRate: number, years: number)

/**
 * Generates a year-by-year array of investment balance values.
 * Principal grows annually at the given rate. Optional annualContribution added each year.
 */
export function investmentSchedule(principal: number, annualRate: number, years: number, annualContribution?: number)
```

### Validation step (DO THIS BEFORE BUILDING UI)

Write `calculations.test.ts` with these test cases. Use Vitest. All must pass before moving on.

```typescript
// futureValue: $100K at 7% for 20 years = $386,968.44
expect(futureValue(100000, 0.07, 20)).toBeCloseTo(386968.44, 2)

// futureValue: $100K at 0% for any years = $100K (no growth)
expect(futureValue(100000, 0, 50)).toBe(100000)

// projectedRent: $4,200/mo at 3% for 17 years = $6,942.35
expect(projectedRent(4200, 0.03, 17)).toBeCloseTo(6942.35, 2)

// monthlyMortgagePayment: $640K at 6.5% for 30 years = $4,045.00 (ish)
// Cross-check against any online mortgage calculator or Sheets PMT.
expect(monthlyMortgagePayment(640000, 0.065, 30)).toBeCloseTo(4045.00, 0)

// monthlyMortgagePayment: 0% interest edge case = loan / months
expect(monthlyMortgagePayment(360000, 0, 30)).toBeCloseTo(1000, 2)
```

**Only proceed to the UI once these tests pass.**

---

## Shared inputs panel

A column on the left with all the inputs that feed both widgets. Use labeled number inputs, not sliders, for v1 — sliders are nice but harder to type exact values into.

Inputs:

| Label | Default | Notes |
|---|---|---|
| Current monthly rent | 4200 | dollars |
| Annual rent increase | 3 | percent |
| Purchase price | 800000 | dollars |
| Down payment | 160000 | dollars (20% default) |
| Mortgage rate | 6.5 | percent, annual |
| Mortgage term | 30 | years |
| Investment return rate | 7 | percent, annual |
| Projection years | 20 | the horizon for both widgets |

Display a small formula preview under each input group where useful (e.g., under purchase price + down payment, show "Loan amount: $640,000" as a computed readout).

---

## Widget 1: Nest Egg Comparison

### What it answers
"If I rent, I keep my down payment in investments. If I buy, that money becomes home equity. How do those two paths compare over time?"

### Simplifying assumptions for v1 (document these in the UI)
- **Rent path**: The down payment sits in investments growing at the investment return rate. No additional contributions in v1. (We can add savings-rate contributions in v2.)
- **Buy path**: The down payment becomes initial equity. Equity grows by (a) the home appreciating at a rate the user sets, and (b) mortgage principal paid down each year.
- **Not modeled in v1**: closing costs, transaction costs on sale, maintenance, property tax, opportunity cost of the monthly payment difference. These belong in a fuller model later; for v1, we're just visualizing the two stores of wealth.

### Additional inputs for this widget
- Home appreciation rate (default 3%)

### Output
A line chart with two lines over the projection years:
- **Line A (Rent path)**: Down payment invested at investment return rate.
  - Formula: `downPayment * (1 + investmentRate)^year`
- **Line B (Buy path)**: Home equity = (current home value) − (remaining mortgage balance).
  - Home value each year: `purchasePrice * (1 + appreciationRate)^year`
  - Remaining balance each year: standard mortgage amortization. Use a helper `remainingBalance(loanAmount, rate, termYears, yearsElapsed)`.
  - Equity: `homeValue - remainingBalance`

Below the chart, a year slider (0 to projection years). When the user drags it:
- Show "Year N" prominently
- Show Line A value at year N, labeled "If you rented: $X in investments"
- Show Line B value at year N, labeled "If you bought: $Y in home equity"
- Show the difference ("Buy path is ahead by $Z" or "Rent path is ahead by $Z")

Each of those numbers is a `<NumberWithFormula>` component — clicking it expands a small panel showing the exact formula with the user's inputs substituted in.

---

## Widget 2: Rent Escalator vs Fixed Mortgage

### What it answers
"Rent goes up every year. A fixed-rate mortgage doesn't. What does that look like over 20 years?"

### Output
A line chart with two lines:
- **Line A (Rent)**: Monthly rent each year, starting at current monthly rent, growing at rent increase rate.
  - Formula per year: `currentRent * (1 + rentRate)^year`
- **Line B (Mortgage P&I)**: Flat horizontal line at the monthly mortgage payment (principal + interest only, computed from the inputs).
  - Formula: `monthlyMortgagePayment(loanAmount, mortgageRate, termYears)` — same value every year.

Below the chart, the same year slider pattern as Widget 1:
- "In year N, your rent would be approximately $X/month, vs your mortgage P&I of $Y/month."
- Show the crossover year if there is one ("Rent exceeds mortgage starting in year K").

Add a small toggle: "Show mortgage as P&I only | Show P&I + estimated taxes & maintenance". When toggled on, add a configurable monthly overhead number (default: 1% of home value per year, divided by 12, for maintenance + property tax rough estimate) to Line B. This makes the comparison more honest. Keep the toggle off by default so the first impression is the clean comparison, but let the user turn on the honest version.

---

## The `<NumberWithFormula>` component

This is load-bearing for trust. Spec:

```tsx
<NumberWithFormula
  value={formattedValue}           // "$6,942"
  formula="$4,200 × (1.03)^17"     // human-readable
  result="= $6,942.35"             // the unrounded result
/>
```

Renders as a clickable number with a subtle underline. On click, a small popover shows:
- The formula with values substituted in
- The exact unrounded result
- A one-line explanation ("This is your current rent compounded at 3% per year for 17 years")

Use this wrapper everywhere numbers are displayed from calculations. It's the trust mechanism.

---

## Layout

Single page, two-column layout on desktop, stacked on mobile.

```
┌─────────────────────────────────────────────────────┐
│  Rent vs Buy — Dashboard                            │
├─────────────┬───────────────────────────────────────┤
│             │                                       │
│  INPUTS     │    WIDGET 1: Nest Egg Comparison      │
│  (panel)    │    [line chart]                       │
│             │    [year slider]                      │
│             │    [snapshot numbers]                 │
│             │                                       │
│             ├───────────────────────────────────────┤
│             │                                       │
│             │    WIDGET 2: Rent vs Mortgage         │
│             │    [line chart]                       │
│             │    [year slider]                      │
│             │    [snapshot numbers]                 │
│             │                                       │
└─────────────┴───────────────────────────────────────┘
```

Use Tailwind defaults. Don't spend time on visual polish for v1 — clean, legible, minimal. We'll style it later.

---

## Out of scope for v1 (do NOT build these)

- Saveable scenarios
- Phased inputs (income changes over time, rent upgrades, etc.)
- Multi-scenario comparison
- Income modeling / savings rate contributions
- Tax treatment (SALT cap, mortgage interest deduction)
- Closing costs / transaction costs
- Inflation adjustment (nominal dollars only for v1)
- Persistence / localStorage
- Mobile-optimized UI polish
- Dark mode
- Export / share

If you find yourself wanting to build any of these, stop and ask first. The whole point of v1 is to ship something small that we trust.

---

## Definition of done

1. All unit tests in `calculations.test.ts` pass.
2. Widget 1 and Widget 2 both render and respond to input changes.
3. Year slider works on both widgets.
4. Every displayed number is wrapped in `<NumberWithFormula>` and its popover shows the correct derivation.
5. A README explains how to run the app locally and how to verify the math against Google Sheets.

When done, produce a one-page `VERIFICATION.md` with 3 worked examples:
- Inputs used
- Expected outputs (computed independently in Google Sheets or a calculator)
- Actual outputs from the app
- Pass/fail for each

This is the handoff artifact that proves the math is right.

---

## Questions to ask the user before starting

None. This spec is intentionally complete. If something is ambiguous, default to the simpler interpretation and document the choice in a code comment. Ship v1, then iterate.
