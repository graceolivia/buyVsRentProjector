# Verification — Rent vs Buy Dashboard

Three worked examples using default inputs. Each value was computed independently using the formulas directly (node -e) and cross-checked against Google Sheets PMT/FV functions.

**Default inputs used throughout:**
- Current monthly rent: $4,200 | Annual rent increase: 3%
- Purchase price: $800,000 | Down payment: $160,000 → Loan: $640,000
- Mortgage rate: 6.5% | Term: 30 years
- Investment return: 7% | Home appreciation: 3%
- Projection: 20 years

---

## Example 1: Nest Egg Comparison at Year 10

**Widget 1, year slider set to 10**

| Path | Formula | Expected | App shows | Pass? |
|---|---|---|---|---|
| Rent path (invested down payment) | $160,000 × 1.07^10 | $314,744 | $314,744 | ✅ |
| Home value at year 10 | $800,000 × 1.03^10 | $1,075,133 | $1,075,133 | ✅ |
| Remaining mortgage balance | Standard amortization, 10 years paid | $542,567 | $542,567 | ✅ |
| Buy path (equity) | $1,075,133 − $542,567 | $532,566 | $532,566 | ✅ |

Google Sheets cross-check:
- Rent path: `=160000*FV(7%,10,0,-1)` → $314,744 ✅
- Remaining balance: `=640000*((1+6.5%/12)^360-(1+6.5%/12)^120)/((1+6.5%/12)^360-1)` → $542,567 ✅

---

## Example 2: Monthly Mortgage Payment

**Widget 2, mortgage line**

| Item | Formula | Expected | App shows | Pass? |
|---|---|---|---|---|
| Monthly P&I | PMT(6.5%/12, 360, 640000) | $4,045.24 | $4,045 | ✅ |

Google Sheets cross-check: `=PMT(6.5%/12, 360, -640000)` → $4,045.24 ✅

---

## Example 3: Rent Escalation at Year 15

**Widget 2, year slider set to 15**

| Item | Formula | Expected | App shows | Pass? |
|---|---|---|---|---|
| Monthly rent, year 15 | $4,200 × 1.03^15 | $6,543.46 | $6,543 | ✅ |
| Mortgage P&I (fixed) | Same as above | $4,045.24 | $4,045 | ✅ |
| Crossover (rent > mortgage) | First year rent exceeds P&I | Year 0 (rent starts above mortgage) | Year 0 | ✅ |

Note: With these default inputs, rent ($4,200) already exceeds mortgage P&I ($4,045) at year 0 — so the crossover message shows immediately. Adjust rent down or mortgage up to see a future crossover.

Google Sheets cross-check: `=4200*(1.03)^15` → $6,543.46 ✅

---

All three examples pass. The math is verified correct.
