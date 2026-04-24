# Rent vs Buy Dashboard

A personal financial exploration tool for a family considering whether to continue renting in NYC or buy a home.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or the port shown in the terminal).

## Run tests

```bash
npm test
```

All math lives in `src/lib/calculations.ts` as pure functions. Tests are in `src/lib/calculations.test.ts`.

## Verifying the math against Google Sheets

Each calculation has a direct Google Sheets equivalent:

| Function | Sheets formula |
|---|---|
| `futureValue(P, r, n)` | `=P*(1+r)^n` or `=FV(r, n, 0, -P)` |
| `projectedRent(rent, r, n)` | `=rent*(1+r)^n` |
| `monthlyMortgagePayment(loan, r, n)` | `=PMT(r/12, n*12, -loan)` |
| `remainingBalance(loan, r, n, p)` | `=loan*((1+r/12)^(n*12)-(1+r/12)^(p*12))/((1+r/12)^(n*12)-1)` |

Every number displayed in the dashboard has a `<NumberWithFormula>` wrapper — click any underlined blue number to see the formula with your actual inputs substituted in.
