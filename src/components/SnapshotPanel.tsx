import type { Inputs } from '../types';
import { futureValue, remainingBalance, cumulativeBuyCosts, projectedRent, monthlyMortgagePayment } from '../lib/calculations';
import { NumberWithFormula } from './NumberWithFormula';

interface Props {
  inputs: Inputs;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

function fmtDollars(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function SnapshotPanel({ inputs, selectedYear, onYearChange }: Props) {
  const loanAmount = inputs.purchasePrice - inputs.downPayment;
  const y = selectedYear;

  // Nest egg
  const buySavings = Math.max(0, inputs.otherSavings - inputs.renovationCost);
  const otherSavingsRent = futureValue(inputs.otherSavings, inputs.investmentReturnRate, y);
  const otherSavingsBuy = futureValue(buySavings, inputs.investmentReturnRate, y);
  const rentPath = futureValue(inputs.downPayment, inputs.investmentReturnRate, y) + otherSavingsRent;
  const homeValue = futureValue(inputs.purchasePrice, inputs.homeAppreciationRate, y);
  const balance = y <= inputs.mortgageTerm
    ? remainingBalance(loanAmount, inputs.mortgageRate, inputs.mortgageTerm, y)
    : 0;
  const equity = homeValue - balance;
  const costsPaid = cumulativeBuyCosts(inputs.monthlyBuyCosts, inputs.buyCostIncreaseRate, y);
  const buyPathNet = equity - costsPaid + otherSavingsBuy;
  const nestEggDiff = Math.abs(buyPathNet - rentPath);
  const nestEggAhead = buyPathNet > rentPath ? 'Buy path' : 'Rent path';

  // Rent vs mortgage
  const basePayment = y <= inputs.mortgageTerm
    ? monthlyMortgagePayment(loanAmount, inputs.mortgageRate, inputs.mortgageTerm)
    : 0;
  const monthlyRent = projectedRent(inputs.currentMonthlyRent, inputs.annualRentIncrease, y);
  const monthlyCosts = projectedRent(inputs.monthlyBuyCosts, inputs.buyCostIncreaseRate, y);
  const monthlyTotal = basePayment + monthlyCosts;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Year:</label>
        <input
          type="range"
          min={0}
          max={inputs.projectionYears}
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-lg font-bold text-gray-800 w-8">{selectedYear}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
          <div className="font-semibold text-gray-700 mb-2">Nest Egg — Year {y}</div>

          {/* Rent path breakdown */}
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Rent path</div>
          <div className="flex justify-between items-center text-xs text-gray-500 mb-0.5">
            <span>Down payment invested</span>
            <NumberWithFormula
              value={fmtDollars(futureValue(inputs.downPayment, inputs.investmentReturnRate, y))}
              formula={`$${inputs.downPayment.toLocaleString()} × (1 + ${(inputs.investmentReturnRate * 100).toFixed(1)}%)^${y}`}
              result={`= ${fmtDollars(futureValue(inputs.downPayment, inputs.investmentReturnRate, y))}`}
              explanation={`Down payment compounded at ${(inputs.investmentReturnRate * 100).toFixed(1)}%/yr for ${y} years`}
            />
          </div>
          {inputs.otherSavings > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>Other savings invested</span>
              <NumberWithFormula
                value={fmtDollars(otherSavingsRent)}
                formula={`$${inputs.otherSavings.toLocaleString()} × (1 + ${(inputs.investmentReturnRate * 100).toFixed(1)}%)^${y}`}
                result={`= ${fmtDollars(otherSavingsRent)}`}
                explanation={`Other savings compounded at ${(inputs.investmentReturnRate * 100).toFixed(1)}%/yr for ${y} years`}
              />
            </div>
          )}
          <div className="flex justify-between items-center font-semibold text-blue-700 border-t border-gray-200 pt-1 mb-3">
            <span>Total</span>
            <span>{fmtDollars(rentPath)}</span>
          </div>

          {/* Buy path breakdown */}
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Buy path</div>
          <div className="flex justify-between items-center text-xs text-gray-500 mb-0.5">
            <span>Home equity</span>
            <NumberWithFormula
              value={fmtDollars(equity)}
              formula={`${fmtDollars(homeValue)} − ${fmtDollars(balance)}`}
              result={`= ${fmtDollars(equity)}`}
              explanation={`Home value at ${(inputs.homeAppreciationRate * 100).toFixed(1)}%/yr appreciation minus remaining mortgage balance`}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 mb-0.5">
            <span>Minus cumulative carrying costs</span>
            <NumberWithFormula
              value={`−${fmtDollars(costsPaid)}`}
              formula={`$${inputs.monthlyBuyCosts.toLocaleString()}/mo × 12 × [(1+${(inputs.buyCostIncreaseRate*100).toFixed(1)}%)^${y}−1] / ${(inputs.buyCostIncreaseRate*100).toFixed(1)}%`}
              result={`= ${fmtDollars(costsPaid)} total`}
              explanation={`All monthly buy costs paid from year 0–${y}, escalating at ${(inputs.buyCostIncreaseRate * 100).toFixed(1)}%/yr`}
            />
          </div>
          {inputs.otherSavings > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-500 mb-0.5">
              <span>Other savings{inputs.renovationCost > 0 ? ` (after −${fmtDollars(inputs.renovationCost)} reno)` : ''} invested</span>
              <NumberWithFormula
                value={fmtDollars(otherSavingsBuy)}
                formula={`$${buySavings.toLocaleString()} × (1 + ${(inputs.investmentReturnRate * 100).toFixed(1)}%)^${y}`}
                result={`= ${fmtDollars(otherSavingsBuy)}`}
                explanation={`Other savings minus renovation, compounded at ${(inputs.investmentReturnRate * 100).toFixed(1)}%/yr for ${y} years`}
              />
            </div>
          )}
          {inputs.renovationCost > 0 && inputs.otherSavings === 0 && (
            <div className="flex justify-between items-center text-xs text-gray-500 mb-0.5">
              <span>Renovation (lump sum)</span>
              <span className="text-red-500">−{fmtDollars(inputs.renovationCost)}</span>
            </div>
          )}
          <div className="flex justify-between items-center font-semibold text-emerald-700 border-t border-gray-200 pt-1 mb-3">
            <span>Total</span>
            <span>{fmtDollars(buyPathNet)}</span>
          </div>

          <div className="flex justify-between items-center border-t border-gray-200 pt-2 font-semibold">
            <span className="text-gray-600">{nestEggAhead} ahead by</span>
            <span className="text-gray-800">{fmtDollars(nestEggDiff)}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="font-semibold text-gray-700 mb-3">Monthly Cash Out — Year {y}</div>

          <div className="flex gap-3">
            {/* Buy side */}
            <div className={`flex-1 rounded-lg p-3 border ${monthlyTotal <= monthlyRent ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Buy</div>
              <div className="flex justify-between text-gray-500 text-xs mb-1">
                <span>Mortgage P&I</span>
                <NumberWithFormula
                  value={fmtDollars(basePayment)}
                  formula={`PMT(${(inputs.mortgageRate * 100).toFixed(2)}%/12, ${inputs.mortgageTerm * 12}, $${loanAmount.toLocaleString()})`}
                  result={`= ${fmtDollars(basePayment)}/mo (fixed)`}
                  explanation="Principal + interest only. Fixed for the life of the loan."
                />
              </div>
              <div className="flex justify-between text-gray-500 text-xs mb-2">
                <span>Carrying costs</span>
                <NumberWithFormula
                  value={fmtDollars(monthlyCosts)}
                  formula={`$${inputs.monthlyBuyCosts.toLocaleString()} × (1 + ${(inputs.buyCostIncreaseRate * 100).toFixed(1)}%)^${y}`}
                  result={`= ${fmtDollars(monthlyCosts)}/mo`}
                  explanation={`HOA, taxes, maintenance escalating at ${(inputs.buyCostIncreaseRate * 100).toFixed(1)}%/yr`}
                />
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="text-xs text-gray-500 mb-0.5">Total</div>
                <div className="font-semibold text-gray-800">{fmtDollars(monthlyTotal)}/mo</div>
              </div>
            </div>

            {/* Rent side */}
            <div className={`flex-1 rounded-lg p-3 border flex flex-col justify-between ${monthlyRent <= monthlyTotal ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Rent</div>
              <div className="flex-1" />
              <div className="border-t border-gray-200 pt-2">
                <div className="text-xs text-gray-500 mb-0.5">Total</div>
                <NumberWithFormula
                  value={`${fmtDollars(monthlyRent)}/mo`}
                  formula={`$${inputs.currentMonthlyRent.toLocaleString()} × (1 + ${(inputs.annualRentIncrease * 100).toFixed(1)}%)^${y}`}
                  result={`= ${fmtDollars(monthlyRent)}/mo`}
                  explanation={`Starting rent escalating at ${(inputs.annualRentIncrease * 100).toFixed(1)}%/yr for ${y} years`}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-semibold text-gray-700">
            <span>{monthlyRent > monthlyTotal ? 'Renting' : 'Buying'} costs more per month by</span>
            <span className="text-gray-900">{fmtDollars(Math.abs(monthlyRent - monthlyTotal))}/mo</span>
          </div>
        </div>

      </div>
    </div>
  );
}
