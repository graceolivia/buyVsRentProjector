import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Inputs } from '../types';
import { futureValue, remainingBalance, cumulativeBuyCosts } from '../lib/calculations';

interface Props {
  inputs: Inputs;
  selectedYear: number;
}

function fmtDollars(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function fmtShort(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmtDollars(n);
}

export function NestEggWidget({ inputs, selectedYear }: Props) {
  const loanAmount = inputs.purchasePrice - inputs.downPayment;

  const data = useMemo(() => {
    const buySavings = Math.max(0, inputs.otherSavings - inputs.renovationCost);
    return Array.from({ length: inputs.projectionYears + 1 }, (_, year) => {
      const rentPath = futureValue(inputs.downPayment, inputs.investmentReturnRate, year)
        + futureValue(inputs.otherSavings, inputs.investmentReturnRate, year);
      const homeValue = futureValue(inputs.purchasePrice, inputs.homeAppreciationRate, year);
      const balance = year <= inputs.mortgageTerm
        ? remainingBalance(loanAmount, inputs.mortgageRate, inputs.mortgageTerm, year)
        : 0;
      const equity = homeValue - balance;
      const costsPaid = cumulativeBuyCosts(inputs.monthlyBuyCosts, inputs.buyCostIncreaseRate, year);
      const buyPath = equity - costsPaid + futureValue(buySavings, inputs.investmentReturnRate, year);
      return { year, rentPath, buyPath };
    });
  }, [inputs, loanAmount]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Nest Egg Comparison</h2>
      <p className="text-sm text-gray-500 mb-1">
        Down payment invested vs. home equity minus cumulative carrying costs.
      </p>
      <div className="text-xs text-gray-400 mb-3">
        Both paths include other savings compounding at the investment rate. Buy path subtracts renovation from savings on day one. Closing costs not modeled.
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} width={60} />
          <Tooltip formatter={(v: number) => fmtDollars(v)} labelFormatter={(l) => `Year ${l}`} />
          <Legend />
          <ReferenceLine x={selectedYear} stroke="#6b7280" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="rentPath" name="Rent path (invested)" stroke="#3b82f6" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="buyPath" name="Buy path (equity − costs)" stroke="#10b981" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
