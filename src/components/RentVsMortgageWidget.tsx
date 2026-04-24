import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Inputs } from '../types';
import { projectedRent, monthlyMortgagePayment } from '../lib/calculations';

interface Props {
  inputs: Inputs;
  selectedYear: number;
}

function fmtDollars(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function RentVsMortgageWidget({ inputs, selectedYear }: Props) {
  const [showBuyCosts, setShowBuyCosts] = useState(false);

  const loanAmount = inputs.purchasePrice - inputs.downPayment;
  const basePayment = useMemo(
    () => monthlyMortgagePayment(loanAmount, inputs.mortgageRate, inputs.mortgageTerm),
    [loanAmount, inputs.mortgageRate, inputs.mortgageTerm],
  );

  const data = useMemo(() => {
    return Array.from({ length: inputs.projectionYears + 1 }, (_, year) => {
      const monthlyCosts = projectedRent(inputs.monthlyBuyCosts, inputs.buyCostIncreaseRate, year);
      return {
        year,
        monthlyRent: projectedRent(inputs.currentMonthlyRent, inputs.annualRentIncrease, year),
        monthlyMortgage: year <= inputs.mortgageTerm ? basePayment : 0,
        monthlyTotal: year <= inputs.mortgageTerm ? basePayment + monthlyCosts : monthlyCosts,
      };
    });
  }, [inputs, basePayment]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Rent Escalator vs Fixed Mortgage</h2>
      <p className="text-sm text-gray-500 mb-3">
        Rent goes up every year. Mortgage P&I doesn't — but monthly buy costs do.
      </p>

      <div className="flex items-center gap-2 mb-4">
        <input
          id="buycosts-toggle"
          type="checkbox"
          checked={showBuyCosts}
          onChange={(e) => setShowBuyCosts(e.target.checked)}
          className="cursor-pointer"
        />
        <label htmlFor="buycosts-toggle" className="text-sm text-gray-600 cursor-pointer">
          Show P&I + monthly buy costs (HOA, taxes, maintenance)
        </label>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`} tick={{ fontSize: 11 }} width={60} />
          <Tooltip formatter={(v: number) => fmtDollars(v)} labelFormatter={(l) => `Year ${l}`} />
          <Legend />
          <ReferenceLine x={selectedYear} stroke="#6b7280" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="monthlyRent" name="Monthly rent" stroke="#f59e0b" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="monthlyMortgage" name="Mortgage P&I (fixed)" stroke="#ef4444" dot={false} strokeWidth={2} />
          {showBuyCosts && (
            <Line type="monotone" dataKey="monthlyTotal" name="P&I + buy costs" stroke="#7c3aed" dot={false} strokeWidth={2} strokeDasharray="5 3" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
