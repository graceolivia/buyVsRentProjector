import { describe, it, expect } from 'vitest';
import { futureValue, projectedRent, monthlyMortgagePayment } from './calculations';

describe('futureValue', () => {
  // 100000 * 1.07^20 = 386968.446... (spec says 386968.44, off by rounding)
  it('$100K at 7% for 20 years ≈ $386,968', () => {
    expect(futureValue(100000, 0.07, 20)).toBeCloseTo(386968.44, 0);
  });

  it('$100K at 0% for any years = $100K', () => {
    expect(futureValue(100000, 0, 50)).toBe(100000);
  });
});

describe('projectedRent', () => {
  // 4200 * 1.03^17 = 6941.96... (spec says 6942.35, likely a spec rounding error)
  it('$4,200/mo at 3% for 17 years ≈ $6,942', () => {
    expect(projectedRent(4200, 0.03, 17)).toBeCloseTo(6942, 0);
  });
});

describe('monthlyMortgagePayment', () => {
  it('$640K at 6.5% for 30 years ≈ $4,045', () => {
    expect(monthlyMortgagePayment(640000, 0.065, 30)).toBeCloseTo(4045.00, 0);
  });

  it('0% interest edge case = loan / months', () => {
    expect(monthlyMortgagePayment(360000, 0, 30)).toBeCloseTo(1000, 2);
  });
});
