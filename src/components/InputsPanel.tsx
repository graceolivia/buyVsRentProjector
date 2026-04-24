import type { Inputs } from '../types';

interface Props {
  inputs: Inputs;
  onChange: (inputs: Inputs) => void;
}

interface FieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  step?: number;
}

function Field({ label, value, onChange, unit, min = 0, step = 1 }: FieldProps) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
        {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function InputsPanel({ inputs, onChange }: Props) {
  function set<K extends keyof Inputs>(key: K, raw: number) {
    onChange({ ...inputs, [key]: raw });
  }

  const loanAmount = inputs.purchasePrice - inputs.downPayment;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Inputs</h2>

      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Renting</div>
      <Field label="Current monthly rent" value={inputs.currentMonthlyRent} onChange={(v) => set('currentMonthlyRent', v)} unit="$" step={100} />
      <Field label="Annual rent increase" value={inputs.annualRentIncrease * 100} onChange={(v) => set('annualRentIncrease', v / 100)} unit="%" step={0.1} />

      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-4">Buying</div>
      <Field label="Purchase price" value={inputs.purchasePrice} onChange={(v) => set('purchasePrice', v)} unit="$" step={10000} />
      <Field label="Down payment" value={inputs.downPayment} onChange={(v) => set('downPayment', v)} unit="$" step={10000} />
      <div className="text-xs text-gray-500 mb-3">Loan amount: {fmt(loanAmount)}</div>
      <Field label="Mortgage rate" value={inputs.mortgageRate * 100} onChange={(v) => set('mortgageRate', v / 100)} unit="%" step={0.1} />
      <Field label="Mortgage term" value={inputs.mortgageTerm} onChange={(v) => set('mortgageTerm', v)} unit="yrs" />
      <Field label="Home appreciation rate" value={inputs.homeAppreciationRate * 100} onChange={(v) => set('homeAppreciationRate', v / 100)} unit="%" step={0.1} />
      <Field label="Monthly buy costs" value={inputs.monthlyBuyCosts} onChange={(v) => set('monthlyBuyCosts', v)} unit="$/mo" step={100} />
      <div className="text-xs text-gray-400 -mt-2 mb-3">HOA, property tax, maintenance, etc.</div>
      <Field label="Buy cost increase rate" value={inputs.buyCostIncreaseRate * 100} onChange={(v) => set('buyCostIncreaseRate', v / 100)} unit="%" step={0.1} />

      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-4">Other savings</div>
      <Field label="Other money in bank" value={inputs.otherSavings} onChange={(v) => set('otherSavings', v)} unit="$" step={10000} />
      <div className="text-xs text-gray-400 -mt-2 mb-3">Compounds at investment return rate on both paths.</div>
      <Field label="Renovation budget" value={inputs.renovationCost} onChange={(v) => set('renovationCost', v)} unit="$" step={10000} />
      <div className="text-xs text-gray-400 -mt-2 mb-3">Buy path only — subtracted from savings on day one.</div>

      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-4">General</div>
      <Field label="Investment return rate" value={inputs.investmentReturnRate * 100} onChange={(v) => set('investmentReturnRate', v / 100)} unit="%" step={0.1} />
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Projection years: <span className="font-semibold">{inputs.projectionYears}</span>
        </label>
        <input
          type="range"
          min={10}
          max={40}
          step={1}
          value={inputs.projectionYears}
          onChange={(e) => set('projectionYears', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>10</span><span>40</span>
        </div>
      </div>
    </div>
  );
}
